from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LeafAnalysisBase(BaseModel):
    farm_id: int | None = None
    image_url: str | None = None
    crop: str | None = None
    crop_confidence: float | None = None
    condition: str | None = None
    disease_confidence: float | None = None
    severity: str | None = None
    health_status: str | None = None
    symptoms: str | None = None
    ndvi: float | None = None
    ndmi: float | None = None
    ndwi: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None
    risk_score: float | None = None
    risk_level: str | None = None
    model_version: str | None = None
    crop_model_version: str | None = None
    recommendation: str | None = None
    recommendation_source: str | None = None
    status: str
    error_message: str | None = None
    created_at: datetime | None = None
    latitude: float | None = None
    longitude: float | None = None


class LeafAnalysis(LeafAnalysisBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


class LeafAnalysisCreate(BaseModel):
    farm_id: int | None = None
    image_url: str | None = None
