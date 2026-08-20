import json
from typing import Optional, Tuple, List
from shapely.geometry import shape
import geopandas as gpd


def calculate_polygon_area(geojson_str: str) -> Optional[float]:
    try:
        geojson = json.loads(geojson_str)
        geom = shape(geojson)
        gdf = gpd.GeoDataFrame(geometry=[geom], crs="EPSG:4326")
        gdf = gdf.to_crs("EPSG:6933")
        area_m2 = float(gdf.geometry[0].area)
        area_hectares = area_m2 / 10000
        return round(area_hectares, 2)
    except Exception:
        return None


def extract_center_and_bbox(geojson_str: str) -> Tuple[Optional[float], Optional[float], Optional[List[float]]]:
    try:
        geojson = json.loads(geojson_str)
        geom = shape(geojson)
        centroid = geom.centroid
        longitude = round(centroid.x, 6)
        latitude = round(centroid.y, 6)
        minx, miny, maxx, maxy = geom.bounds
        bbox = [round(minx, 6), round(miny, 6), round(maxx, 6), round(maxy, 6)]
        return latitude, longitude, bbox
    except Exception:
        return None, None, None
