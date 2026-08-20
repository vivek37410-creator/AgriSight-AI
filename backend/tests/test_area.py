import pytest
from app.geospatial.area import calculate_polygon_area, extract_center_and_bbox


def test_calculate_polygon_area_valid():
    # A ~0.01 x 0.01 degree box straddling the equator. Geodesic area at the
    # equator is approximately R^2 * (sin lat2 - sin lat1) * (lon2 - lon1)
    # ~= 123.9 ha.
    geojson = '{"type":"Polygon","coordinates":[[[0,0],[0.01,0],[0.01,0.01],[0,0.01],[0,0]]]}'
    area = calculate_polygon_area(geojson)
    assert area is not None
    assert area == pytest.approx(123.9, rel=0.05)


def test_calculate_polygon_area_invalid():
    assert calculate_polygon_area("not json") is None


def test_extract_center_and_bbox_valid():
    geojson = '{"type":"Polygon","coordinates":[[[78.123,21.456],[78.124,21.456],[78.124,21.457],[78.123,21.457],[78.123,21.456]]]}'
    latitude, longitude, bbox = extract_center_and_bbox(geojson)
    assert latitude is not None
    assert longitude is not None
    assert bbox is not None
    assert latitude == pytest.approx(21.4565)
    assert longitude == pytest.approx(78.1235)
    assert bbox == [78.123, 21.456, 78.124, 21.457]


def test_extract_center_and_bbox_invalid():
    assert extract_center_and_bbox("not json") == (None, None, None)
