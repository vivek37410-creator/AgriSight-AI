import math
import json
from typing import List, Dict, Any
from shapely.geometry import shape, Polygon, box
from shapely.ops import split


def generate_grid_zones(boundary_geojson: str, grid_size_m: float = 50) -> List[Dict[str, Any]]:
    try:
        geom = shape(json.loads(boundary_geojson))
        minx, miny, maxx, maxy = geom.bounds
        zones = []
        zone_id = 1
        x = minx
        while x < maxx:
            y = miny
            while y < maxy:
                cell = box(x, y, x + grid_size_m / 111320, y + grid_size_m / 111320)
                if geom.intersects(cell):
                    intersection = geom.intersection(cell)
                    if not intersection.is_empty:
                        zones.append({
                            "id": zone_id,
                            "geometry": json.loads(json.dumps(intersection.__geo_interface__)),
                            "center": [intersection.centroid.x, intersection.centroid.y],
                            "health_score": None,
                            "moisture_score": None,
                            "vegetation_score": None,
                            "risk_level": "UNKNOWN",
                        })
                        zone_id += 1
                y += grid_size_m / 111320
            x += grid_size_m / 111320
        return zones
    except Exception:
        return []
