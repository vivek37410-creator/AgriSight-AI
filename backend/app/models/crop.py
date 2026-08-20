from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.session import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    scientific_name = Column(String, nullable=True)
    growth_duration_days = Column(Integer, nullable=True)
    description = Column(String, nullable=True)


class CropGrowthStage(Base):
    __tablename__ = "crop_growth_stages"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    stage_name = Column(String, nullable=False)
    min_day = Column(Integer, nullable=False)
    max_day = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
