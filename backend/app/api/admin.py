from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.farm import Farm
from app.models.user import User
from app.models.health import HealthScore
from app.models.risk import RiskAssessment
from app.models.crop import Crop
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()


def _is_admin(user: User) -> bool:
    return user.role == "admin"


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    total_farmers = db.query(User).count()
    total_farms = db.query(Farm).count()
    total_area = db.query(func.coalesce(func.sum(Farm.area_hectares), 0)).scalar() or 0.0

    most_grown = (
        db.query(Crop.name, func.count(Farm.id).label("count"))
        .join(Farm, Farm.crop_id == Crop.id)
        .group_by(Crop.name)
        .order_by(func.count(Farm.id).desc())
        .first()
    )
    most_grown_crop = most_grown.name if most_grown else "N/A"

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    high_risk_farms = (
        db.query(func.count(func.distinct(RiskAssessment.farm_id)))
        .filter(RiskAssessment.risk_level == "HIGH", RiskAssessment.created_at >= thirty_days_ago)
        .scalar()
        or 0
    )

    active_farmers = (
        db.query(func.count(func.distinct(Farm.user_id)))
        .filter(Farm.created_at >= thirty_days_ago)
        .scalar()
        or 0
    )

    return {
        "total_farmers": total_farmers,
        "total_farms": total_farms,
        "total_area": round(float(total_area), 2),
        "most_grown_crop": most_grown_crop,
        "high_risk_farms": high_risk_farms,
        "active_farmers": active_farmers,
    }


@router.get("/farms", response_model=List[dict])
def get_all_farms_admin(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not _is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    farms = db.query(Farm).all()
    result = []
    for farm in farms:
        user = db.query(User).filter(User.id == farm.user_id).first()
        crop = db.query(Crop).filter(Crop.id == farm.crop_id).first()
        latest_health = (
            db.query(HealthScore)
            .filter(HealthScore.farm_id == farm.id)
            .order_by(HealthScore.calculated_at.desc())
            .first()
        )
        latest_risk = (
            db.query(RiskAssessment)
            .filter(RiskAssessment.farm_id == farm.id)
            .order_by(RiskAssessment.created_at.desc())
            .first()
        )
        result.append({
            "id": farm.id,
            "name": farm.name,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "crop": crop.name if crop else "Unknown",
            "health_score": latest_health.health_score if latest_health else 0,
            "risk_level": latest_risk.risk_level if latest_risk else "LOW",
            "area": farm.area_hectares or 0,
        })
    return result
