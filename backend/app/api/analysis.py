from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.health import HealthScore
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.models.farm import Farm
from app.schemas.health import HealthScore as HealthScoreSchema
from app.schemas.risk import RiskAssessment as RiskAssessmentSchema
from app.schemas.recommendation import Recommendation as RecommendationSchema
from app.services.analysis import AnalysisService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/{farm_id}/analyze")
def analyze_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    service = AnalysisService()
    result = service.analyze_farm(farm_id, db)
    return result


@router.get("/{farm_id}/health", response_model=HealthScoreSchema)
def get_health(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    health = db.query(HealthScore).filter(HealthScore.farm_id == farm_id).order_by(HealthScore.calculated_at.desc()).first()
    if not health:
        raise HTTPException(status_code=404, detail="No health score available yet")
    return health


@router.get("/{farm_id}/risks", response_model=List[RiskAssessmentSchema])
def get_risks(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(RiskAssessment).filter(RiskAssessment.farm_id == farm_id).order_by(RiskAssessment.created_at.desc()).limit(10).all()


@router.get("/{farm_id}/recommendations", response_model=List[RecommendationSchema])
def get_recommendations(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(Recommendation).filter(Recommendation.farm_id == farm_id).order_by(Recommendation.created_at.desc()).limit(20).all()
