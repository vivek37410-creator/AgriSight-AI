from typing import Dict, Any, Optional


def calculate_indices_from_bands(bands: Dict[str, Any]) -> Dict[str, Any]:
    nir = bands.get("nir")
    red = bands.get("red")
    swir = bands.get("swir")
    green = bands.get("green")

    ndvi = None
    if nir is not None and red is not None:
        denom = nir + red
        if denom != 0:
            ndvi = (nir - red) / denom

    ndmi = None
    if nir is not None and swir is not None:
        denom = nir + swir
        if denom != 0:
            ndmi = (nir - swir) / denom

    ndwi = None
    if green is not None and nir is not None:
        denom = green + nir
        if denom != 0:
            ndwi = (green - nir) / denom

    return {
        "ndvi": round(ndvi, 3) if ndvi is not None else None,
        "ndmi": round(ndmi, 3) if ndmi is not None else None,
        "ndwi": round(ndwi, 3) if ndwi is not None else None,
    }
