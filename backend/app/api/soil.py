from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.soil_data import SoilData
from app.models.farm import Farm
from app.schemas.soil import SoilDataCreate, SoilData as SoilDataSchema
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/{farm_id}/soil", response_model=List[SoilDataSchema])
def get_soil_data(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(SoilData).filter(SoilData.farm_id == farm_id).order_by(SoilData.recorded_at.desc()).all()


@router.post("/{farm_id}/soil", response_model=SoilDataSchema)
def add_soil_data(farm_id: int, soil_in: SoilDataCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    soil = SoilData(**soil_in.model_dump(), farm_id=farm_id, source="manual")
    db.add(soil)
    db.commit()
    db.refresh(soil)
    return soil
