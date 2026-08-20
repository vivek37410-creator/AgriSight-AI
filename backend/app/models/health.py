from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.session import Base


class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    health_score = Column(Float, nullable=False)
    moisture_score = Column(Float, nullable=False)
    vegetation_score = Column(Float, nullable=False)
    weather_score = Column(Float, nullable=False)
    stress_score = Column(Float, nullable=False)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
