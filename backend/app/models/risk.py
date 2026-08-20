from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.session import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    risk_type = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    explanation = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
