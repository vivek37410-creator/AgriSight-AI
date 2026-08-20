from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.session import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    risk_id = Column(Integer, ForeignKey("risk_assessments.id"), nullable=True)
    priority = Column(String, nullable=False)
    recommendation = Column(String, nullable=False)
    reasoning = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
