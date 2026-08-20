from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.crop import CropGrowthStage


def calculate_growth_stage(crop_id: int, sowing_date: date, db: Session) -> Optional[str]:
    stages = db.query(CropGrowthStage).filter(CropGrowthStage.crop_id == crop_id).order_by(CropGrowthStage.min_day).all()
    if not stages:
        return None
    days_since_sowing = (date.today() - sowing_date).days
    for stage in stages:
        if stage.min_day <= days_since_sowing <= stage.max_day:
            return stage.stage_name
    last = stages[-1]
    if days_since_sowing > last.max_day:
        return "Maturity"
    return stages[0].stage_name
