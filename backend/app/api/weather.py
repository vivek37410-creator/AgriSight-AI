from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.weather import WeatherObservation, WeatherForecast
from app.schemas.weather import WeatherObservation as WeatherObsSchema, WeatherForecast as WeatherForecastSchema
from app.providers.weather import MockWeatherProvider, OpenMeteoWeatherProvider
from app.api.deps import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.core.config import settings
from app.geospatial.area import extract_center_and_bbox

router = APIRouter()


def get_weather_provider():
    if settings.WEATHER_PROVIDER == "open_meteo":
        return OpenMeteoWeatherProvider()
    return MockWeatherProvider()


@router.get("/{farm_id}/weather", response_model=List[WeatherObsSchema])
def get_current_weather(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    observations = db.query(WeatherObservation).filter(WeatherObservation.farm_id == farm_id).order_by(WeatherObservation.recorded_at.desc()).limit(30).all()
    if not observations:
        lat = farm.latitude or 0
        lon = farm.longitude or 0
        if farm.boundary_geojson and (not farm.latitude or not farm.longitude):
            lat, lon, _ = extract_center_and_bbox(farm.boundary_geojson) or (farm.latitude or 0, farm.longitude or 0)
        provider = get_weather_provider()
        obs = provider.get_observations(farm_id, lat=lat, lon=lon)
        for o in obs:
            db.add(WeatherObservation(**o))
        db.commit()
        observations = db.query(WeatherObservation).filter(WeatherObservation.farm_id == farm_id).order_by(WeatherObservation.recorded_at.desc()).limit(30).all()
    return observations


@router.get("/{farm_id}/weather/forecast", response_model=List[WeatherForecastSchema])
def get_weather_forecast(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    forecasts = db.query(WeatherForecast).filter(WeatherForecast.farm_id == farm_id).order_by(WeatherForecast.forecast_time).limit(7).all()
    if not forecasts:
        lat = farm.latitude or 0
        lon = farm.longitude or 0
        if farm.boundary_geojson and (not farm.latitude or not farm.longitude):
            lat, lon, _ = extract_center_and_bbox(farm.boundary_geojson) or (farm.latitude or 0, farm.longitude or 0)
        provider = get_weather_provider()
        f = provider.get_forecast(farm_id, lat=lat, lon=lon)
        for item in f:
            db.add(WeatherForecast(**item))
        db.commit()
        forecasts = db.query(WeatherForecast).filter(WeatherForecast.farm_id == farm_id).order_by(WeatherForecast.forecast_time).limit(7).all()
    return forecasts
