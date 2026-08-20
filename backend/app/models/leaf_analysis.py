from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func

from app.database.session import Base


class LeafAnalysis(Base):
    __tablename__ = "leaf_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    image_url = Column(String, nullable=True)
    crop = Column(String, nullable=True)
    crop_confidence = Column(Float, nullable=True)
    condition = Column(String, nullable=True)
    disease_confidence = Column(Float, nullable=True)
    severity = Column(String, nullable=True)
    health_status = Column(String, nullable=True)
    symptoms = Column(String, nullable=True)
    ndvi = Column(Float, nullable=True)
    ndmi = Column(Float, nullable=True)
    ndwi = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    crop_model_version = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    recommendation_source = Column(String, nullable=True)
    status = Column(String, nullable=False, default="success")
    error_message = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
