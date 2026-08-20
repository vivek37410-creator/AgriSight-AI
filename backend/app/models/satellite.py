from datetime import date
from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from app.database.session import Base


class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    observation_date = Column(Date, nullable=False)
    cloud_percentage = Column(Float, nullable=True)
    ndvi = Column(Float, nullable=True)
    ndmi = Column(Float, nullable=True)
    ndwi = Column(Float, nullable=True)
    source = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    observation_metadata = Column("metadata", String, nullable=True)
