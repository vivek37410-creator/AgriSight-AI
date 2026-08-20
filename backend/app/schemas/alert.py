from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    type: str
    severity: str
    title: str
    message: str
    is_read: bool = False
    created_at: datetime | None = None


class Alert(AlertBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    farm_name: str | None = None
