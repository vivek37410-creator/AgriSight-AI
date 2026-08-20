from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.report import Report
from app.models.farm import Farm
from app.schemas.report import Report as ReportSchema
from app.api.deps import get_current_user
from app.models.user import User
from app.services.analysis import AnalysisService

router = APIRouter()


@router.post("/{farm_id}/reports", response_model=ReportSchema)
def generate_report(farm_id: int, report_type: str = "Health Summary", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    analysis = AnalysisService().analyze_farm(farm_id, db)
    report = Report(farm_id=farm_id, report_type=report_type, generated_at=datetime.now(timezone.utc))
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{farm_id}/reports", response_model=List[ReportSchema])
def list_reports(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(Report).filter(Report.farm_id == farm_id).order_by(Report.generated_at.desc()).all()
