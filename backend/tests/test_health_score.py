import pytest
from app.services.crop_health import CropHealthEngine


def test_health_score_good():
    engine = CropHealthEngine()
    result = engine.calculate(ndvi_trend=0.01, moisture=45, temperature=28, rainfall=5, crop_stage="Vegetative", weather_forecast=[])
    assert result["health_score"] >= 70
    assert 0 <= result["health_score"] <= 100


def test_health_score_poor():
    engine = CropHealthEngine()
    result = engine.calculate(ndvi_trend=-0.04, moisture=15, temperature=42, rainfall=0, crop_stage="Flowering", weather_forecast=[])
    assert result["health_score"] <= 50
