import pytest
from app.ml.ndvi import calculate_ndvi


def test_calculate_ndvi_valid():
    assert calculate_ndvi(0.8, 0.2) == pytest.approx(0.6)


def test_calculate_ndvi_zero_denominator():
    assert calculate_ndvi(0, 0) is None


def test_calculate_ndvi_none_inputs():
    assert calculate_ndvi(None, 0.2) is None
    assert calculate_ndvi(0.8, None) is None
