from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RecommendationBase(BaseModel):
    priority: str
    recommendation: str
    reasoning: str
    created_at: datetime | None = None


class RecommendationCreate(BaseModel):
    farm_id: int
    risk_id: int | None = None
    priority: str
    recommendation: str
    reasoning: str


class Recommendation(RecommendationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    risk_id: int | None = None
