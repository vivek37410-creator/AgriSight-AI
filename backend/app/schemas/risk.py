from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RiskAssessmentBase(BaseModel):
    risk_type: str
    risk_level: str
    score: float
    explanation: str
    created_at: datetime | None = None


class RiskAssessment(RiskAssessmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
