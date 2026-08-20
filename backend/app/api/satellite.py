from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database.session import get_db
from app.models.satellite import SatelliteObservation
from app.schemas.satellite import SatelliteObservation as SatObsSchema
from app.providers.satellite import MockSatelliteProvider, CopernicusSatelliteProvider
from app.api.deps import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.geospatial.area import extract_center_and_bbox
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def get_satellite_provider():
    if settings.SATELLITE_PROVIDER == "copernicus" and settings.COPERNICUS_CLIENT_ID and settings.COPERNICUS_CLIENT_SECRET:
        return CopernicusSatelliteProvider()
    return MockSatelliteProvider()


def _resolve_provider():
    """Return the configured provider, with a safe fallback to the mock
    provider if the real (Copernicus) provider is configured but unavailable."""
    provider = get_satellite_provider()
    if isinstance(provider, MockSatelliteProvider):
        return provider, "demo"
    return provider, "copernicus"


@router.get("/{farm_id}/satellite", response_model=List[SatObsSchema])
def get_satellite_observations(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    observations = db.query(SatelliteObservation).filter(SatelliteObservation.farm_id == farm_id).order_by(SatelliteObservation.observation_date.desc()).limit(30).all()
    if not observations:
        bbox = None
        if farm.boundary_geojson:
            _, _, bbox = extract_center_and_bbox(farm.boundary_geojson)
        if not bbox:
            raise HTTPException(status_code=400, detail="Farm boundary is required for satellite data")
        provider, source = _resolve_provider()
        try:
            obs = provider.get_observations(farm_id, bbox=bbox)
        except Exception as e:
            logger.warning("Satellite provider '%s' failed (%s); falling back to mock data.", source, e)
            provider = MockSatelliteProvider()
            obs = provider.get_observations(farm_id, bbox=bbox)
        for o in obs:
            existing = db.query(SatelliteObservation).filter(
                SatelliteObservation.farm_id == farm_id,
                SatelliteObservation.observation_date == o["observation_date"],
            ).first()
            if not existing:
                db.add(SatelliteObservation(**o))
        db.commit()
        observations = db.query(SatelliteObservation).filter(SatelliteObservation.farm_id == farm_id).order_by(SatelliteObservation.observation_date.desc()).limit(30).all()
    return observations


@router.get("/{farm_id}/satellite/latest", response_model=SatObsSchema)
def get_latest_satellite(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    obs = db.query(SatelliteObservation).filter(SatelliteObservation.farm_id == farm_id).order_by(SatelliteObservation.observation_date.desc()).first()
    if not obs:
        bbox = None
        if farm.boundary_geojson:
            _, _, bbox = extract_center_and_bbox(farm.boundary_geojson)
        if not bbox:
            raise HTTPException(status_code=400, detail="Farm boundary is required for satellite data")
        provider, source = _resolve_provider()
        try:
            latest = provider.get_latest(farm_id, bbox=bbox)
        except Exception as e:
            logger.warning("Satellite provider '%s' failed (%s); falling back to mock data.", source, e)
            latest = MockSatelliteProvider().get_latest(farm_id, bbox=bbox)
        if latest:
            db.add(SatelliteObservation(**latest))
            db.commit()
            obs = db.query(SatelliteObservation).filter(SatelliteObservation.farm_id == farm_id).order_by(SatelliteObservation.observation_date.desc()).first()
    if not obs:
        raise HTTPException(status_code=404, detail="No satellite observation available yet")
    return obs
