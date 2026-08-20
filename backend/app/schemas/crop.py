from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CropBase(BaseModel):
    name: str
    scientific_name: str | None = None
    growth_duration_days: int | None = None
    description: str | None = None


class Crop(CropBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CropGrowthStageBase(BaseModel):
    stage_name: str
    min_day: int
    max_day: int
    notes: str | None = None


class CropGrowthStage(CropGrowthStageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    crop_id: int
