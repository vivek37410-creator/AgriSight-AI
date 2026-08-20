from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HealthScoreBase(BaseModel):
    health_score: float
    moisture_score: float
    vegetation_score: float
    weather_score: float
    stress_score: float
    calculated_at: datetime | None = None


class HealthScore(HealthScoreBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
