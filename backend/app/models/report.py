from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.session import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    report_type = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
