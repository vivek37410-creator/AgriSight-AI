from typing import Optional


def calculate_ndvi(nir_band: Optional[float], red_band: Optional[float]) -> Optional[float]:
    if nir_band is None or red_band is None:
        return None
    denominator = nir_band + red_band
    if denominator == 0:
        return None
    return (nir_band - red_band) / denominator
