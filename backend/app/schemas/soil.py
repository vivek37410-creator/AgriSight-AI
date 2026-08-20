from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SoilDataBase(BaseModel):
    moisture_percent: float | None = None
    temperature: float | None = None
    soil_type: str | None = None
    ph: float | None = None
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    source: str = "manual"
    recorded_at: datetime | None = None


class SoilDataCreate(SoilDataBase):
    pass


class SoilData(SoilDataBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
