from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.alert import Alert
from app.models.farm import Farm
from app.schemas.alert import Alert as AlertSchema
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[AlertSchema])
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    alerts = db.query(Alert).filter(Alert.farm_id.in_(farm_ids)).order_by(Alert.created_at.desc()).all()
    farm_map = {f.id: f.name for f in farms}
    result = []
    for alert in alerts:
        data = AlertSchema(
            id=alert.id,
            farm_id=alert.farm_id,
            type=alert.type,
            severity=alert.severity,
            title=alert.title,
            message=alert.message,
            is_read=alert.is_read,
            created_at=alert.created_at,
            farm_name=farm_map.get(alert.farm_id),
        )
        result.append(data)
    return result


@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    if alert.farm_id not in farm_ids:
        raise HTTPException(status_code=403, detail="Not authorized")
    alert.is_read = True
    db.commit()
    return {"detail": "Alert marked as read"}
