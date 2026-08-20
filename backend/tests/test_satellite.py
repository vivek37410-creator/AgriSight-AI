import pytest
from app.providers.satellite import MockSatelliteProvider, _decode_tiff_indices
from app.geospatial.area import calculate_polygon_area


@pytest.fixture
def mock_provider():
    return MockSatelliteProvider()


def test_mock_provider_returns_structured_observations():
    obs = mock_provider = MockSatelliteProvider().get_observations(farm_id=1, days=5, bbox=[0, 0, 1, 1])
    assert len(obs) <= 5
    sample = obs[0]
    assert sample["source"] == "demo"
    assert 0 <= sample["ndvi"] <= 1
    assert 0 <= sample["ndmi"] <= 1
    assert 0 <= sample["ndwi"] <= 1
    assert 0 <= sample["cloud_percentage"] <= 100
    assert "observation_metadata" in sample


def test_mock_latest_returns_last():
    latest = MockSatelliteProvider().get_latest(farm_id=1, bbox=[0, 0, 1, 1])
    assert latest is not None
    assert "ndvi" in latest


def test_decode_tiff_indices_handles_four_bands():
    import io
    import numpy as np
    import rasterio

    ndvi = np.array([[0.4, 0.4], [0.4, 0.4]], dtype="float32")
    ndmi = np.array([[0.2, 0.2], [0.2, 0.2]], dtype="float32")
    ndwi = np.array([[0.1, 0.1], [0.1, 0.1]], dtype="float32")
    cloud = np.array([[0.0, 1.0], [0.0, 0.0]], dtype="float32")
    arr = np.stack([ndvi, ndmi, ndwi, cloud])

    buf = io.BytesIO()
    with rasterio.open(buf, "w", driver="GTiff", height=2, width=2, count=4, dtype="float32") as dst:
        dst.write(arr)
    buf.seek(0)

    result = _decode_tiff_indices(buf.read())
    assert result["ndvi"] == pytest.approx(0.4, abs=0.01)
    assert result["ndmi"] == pytest.approx(0.2, abs=0.01)
    assert result["ndwi"] == pytest.approx(0.1, abs=0.01)
    assert result["cloud"] == pytest.approx(25.0, abs=0.1)


def test_decode_tiff_indices_skips_cloud_only_scene():
    import io
    import numpy as np
    import rasterio

    ndvi = np.full((2, 2), np.nan, dtype="float32")
    ndmi = np.full((2, 2), np.nan, dtype="float32")
    ndwi = np.full((2, 2), np.nan, dtype="float32")
    cloud = np.full((2, 2), 1.0, dtype="float32")  # every pixel clouded
    arr = np.stack([ndvi, ndmi, ndwi, cloud])

    buf = io.BytesIO()
    with rasterio.open(buf, "w", driver="GTiff", height=2, width=2, count=4, dtype="float32") as dst:
        dst.write(arr)
    buf.seek(0)

    assert _decode_tiff_indices(buf.read()) is None


def test_geodesic_area_is_sensible():
    geojson = '{"type":"Polygon","coordinates":[[[78.12,18.50],[78.13,18.50],[78.13,18.51],[78.12,18.51],[78.12,18.50]]]}'
    area = calculate_polygon_area(geojson)
    assert area is not None
    assert 50 < area < 200
