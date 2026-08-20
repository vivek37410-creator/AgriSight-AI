import pytest
from app.services.water_stress import WaterStressEngine


def test_water_stress_high():
    engine = WaterStressEngine()
    result = engine.assess(soil_moisture=15, rainfall_probability=10, temperature=40, ndvi_trend=-0.04, crop_stage="Flowering")
    assert result["risk_level"] == "HIGH"
    assert result["risk_type"] == "WATER_STRESS"


def test_water_stress_low():
    engine = WaterStressEngine()
    result = engine.assess(soil_moisture=50, rainfall_probability=70, temperature=25, ndvi_trend=0.01, crop_stage="Vegetative")
    assert result["risk_level"] == "LOW"
