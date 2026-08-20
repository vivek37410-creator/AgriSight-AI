from datetime import date
from pydantic import BaseModel, ConfigDict


class SatelliteObservationBase(BaseModel):
    observation_date: date
    cloud_percentage: float | None = None
    ndvi: float | None = None
    ndmi: float | None = None
    ndwi: float | None = None
    source: str
    image_url: str | None = None
    observation_metadata: str | None = None


class SatelliteObservation(SatelliteObservationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
