from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    report_type: str
    file_url: str | None = None
    generated_at: datetime | None = None


class Report(ReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
