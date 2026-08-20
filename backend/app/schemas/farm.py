from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class FarmBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    description: str | None = None
    boundary_geojson: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    area_hectares: float | None = None
    crop_id: int | None = None
    sowing_date: date | None = None
    soil_type: str | None = None
    irrigation_type: str | None = None
    photo_url: str | None = None


class FarmCreate(FarmBase):
    pass


class Farm(FarmBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class FarmValidationResponse(BaseModel):
    crop: str | None = None
    soil_type: str | None = None
    suitability: str
    explanation: str
    recommended_action: str
    amendments_required: str | None = None
    irrigation_adjustment: str | None = None


class FarmCreateResponse(BaseModel):
    farm: Farm
    validation: FarmValidationResponse | None = None
