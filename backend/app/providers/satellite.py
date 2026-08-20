import datetime
from typing import List, Dict, Any, Optional, Tuple
import json
import httpx
import numpy as np

from app.providers.base import BaseProvider
from app.core.config import settings


class SatelliteProvider(BaseProvider):
    pass


# Evalscript for Sentinel-2 L2A that returns real vegetation indices plus a
# cloud mask derived from the scene classification (SCL) band. The result is
# delivered as a 4-band float32 GeoTIFF:
#   band 0 -> NDVI  (nir - red)  / (nir + red)
#   band 1 -> NDMI  (nir - swir1) / (nir + swir1)
#   band 2 -> NDWI  (nir - swir2) / (nir + swir2)
#   band 3 -> cloud mask (1.0 where the pixel is cloud, 0.0 otherwise)
EVALSCRIPT_INDICES = """
    // Sentinel-2 L2A: NDVI, NDMI, NDWI + cloud mask from SCL
    // SCL classes: 8 = clouds low prob, 9 = clouds medium prob,
    // 10 = clouds high prob, 11 = cirrus, 12 = snow
    function setup() {
        return {
            input: [{
                bands: ["B04", "B08", "B11", "B12", "SCL"],
                units: "DN"
            }],
            output: {
                id: "default",
                bands: 4,
                sampleType: "FLOAT32"
            }
        };
    }
    function evaluatePixel(sample) {
        var nir = sample.B08;
        var red = sample.B04;
        var swir1 = sample.B11;
        var swir2 = sample.B12;
        var scl = sample.SCL;
        var ndvi = (nir + red) !== 0 ? (nir - red) / (nir + red) : NaN;
        var ndmi = (nir + swir1) !== 0 ? (nir - swir1) / (nir + swir1) : NaN;
        var ndwi = (nir + swir2) !== 0 ? (nir - swir2) / (nir + swir2) : NaN;
        var isCloud = (scl === 8 || scl === 9 || scl === 10 || scl === 11 || scl === 12) ? 1.0 : 0.0;
        return [ndvi, ndmi, ndwi, isCloud];
    }
"""


def _decode_tiff_indices(content: bytes) -> Optional[Dict[str, float]]:
    """Decode a 4-band float32 GeoTIFF (NDVI, NDMI, NDWI, cloud mask) into
    mean statistics for non-cloud, valid pixels. Returns None when the scene
    contains no valid (cloud-free) pixels (e.g. no Sentinel-2 coverage)."""
    import rasterio
    from io import BytesIO

    with rasterio.open(BytesIO(content)) as src:
        arr = src.read()

    if arr.shape[0] < 4:
        return None

    ndvi = arr[0]
    ndmi = arr[1]
    ndwi = arr[2]
    cloud_mask = arr[3]

    valid = (
        (cloud_mask == 0.0)
        & np.isfinite(ndvi)
        & np.isfinite(ndmi)
        & np.isfinite(ndwi)
    )

    if not valid.any():
        return None

    def mean_valid(band: np.ndarray) -> float:
        return float(np.mean(band[valid]))

    cloud_pct = float(np.mean(cloud_mask)) * 100.0

    return {
        "ndvi": mean_valid(ndvi),
        "ndmi": mean_valid(ndmi),
        "ndwi": mean_valid(ndwi),
        "cloud": cloud_pct,
    }


class CopernicusSatelliteProvider(SatelliteProvider):
    def __init__(self):
        self.client_id = settings.COPERNICUS_CLIENT_ID
        self.client_secret = settings.COPERNICUS_CLIENT_SECRET
        self.token_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
        self.process_url = "https://sh.dataspace.copernicus.eu/api/v1/process"

    def _get_token(self) -> Optional[str]:
        if not self.client_id or not self.client_secret:
            raise ValueError("Copernicus credentials are missing. Set COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET.")
        try:
            resp = httpx.post(self.token_url, data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            }, timeout=30)
            if resp.status_code == 200:
                return resp.json().get("access_token")
            raise ValueError(f"Copernicus auth failed: {resp.status_code} {resp.text}")
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Copernicus auth error: {e}")

    def _fetch_date(self, client: httpx.Client, token: str, farm_id: int, date: datetime.date, bbox: List[float]) -> Optional[Dict[str, Any]]:
        resp = client.post(self.process_url, json={
            "input": {
                "bounds": {"bbox": bbox},
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": date.isoformat() + "T00:00:00Z",
                            "to": date.isoformat() + "T23:59:59Z",
                        },
                        "maxCloudCoverage": 30,
                    }
                }]
            },
            "output": {
                "width": 256,
                "height": 256,
                "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}],
            },
            "evalscript": EVALSCRIPT_INDICES,
        }, headers={"Authorization": f"Bearer {token}"}, timeout=60)

        if resp.status_code != 200:
            return None

        try:
            indices = _decode_tiff_indices(resp.content)
        except Exception:
            return None

        if indices is None:
            return None

        return {
            "farm_id": farm_id,
            "observation_date": date,
            "cloud_percentage": round(indices["cloud"], 1),
            "ndvi": round(indices["ndvi"], 3),
            "ndmi": round(indices["ndmi"], 3),
            "ndwi": round(indices["ndwi"], 3),
            "source": "copernicus",
            "image_url": None,
            "observation_metadata": json.dumps({"demo": False, "provider": "copernicus"}),
        }

    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        token = self._get_token()
        bbox = kwargs.get("bbox")
        if not bbox:
            raise ValueError("Farm boundary/bbox is required for satellite observations. Create a farm with a GeoJSON polygon.")

        observations: List[Dict[str, Any]] = []
        with httpx.Client() as client:
            for i in range(min(days, 30)):
                date = datetime.date.today() - datetime.timedelta(days=days - i)
                obs = self._fetch_date(client, token, farm_id, date, bbox)
                if obs:
                    observations.append(obs)

        if not observations:
            raise ValueError("Copernicus returned no observations for the given farm and date range.")
        return observations

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        obs = self.get_observations(farm_id, days=2, **kwargs)
        return obs[-1] if obs else None

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ndvi": data.get("ndvi"),
            "ndmi": data.get("ndmi"),
            "ndwi": data.get("ndwi"),
            "cloud_percentage": data.get("cloud_percentage"),
            "demo": False,
        }


class MockSatelliteProvider(SatelliteProvider):
    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        observations = []
        for i in range(min(days, 30)):
            date = datetime.date.today() - datetime.timedelta(days=days - i)
            ndvi = max(0, min(1, 0.6 + (hash(str(farm_id) + date.isoformat()) % 1000) / 10000 - 0.05))
            ndmi = max(0, min(1, ndvi * 0.5 + (hash(str(farm_id) + date.isoformat() + "x") % 1000) / 10000 - 0.05))
            ndwi = max(0, min(1, ndvi * 0.3 + (hash(str(farm_id) + date.isoformat() + "y") % 1000) / 10000 - 0.05))
            observations.append({
                "farm_id": farm_id,
                "observation_date": date,
                "cloud_percentage": round((hash(str(farm_id) + date.isoformat() + "c") % 300) / 10, 1),
                "ndvi": round(ndvi, 3),
                "ndmi": round(ndmi, 3),
                "ndwi": round(ndwi, 3),
                "source": "demo",
                "image_url": None,
                "observation_metadata": '{"demo": true}',
            })
        return observations

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        obs = self.get_observations(farm_id, days=1)
        return obs[0] if obs else None

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ndvi": data.get("ndvi"),
            "ndmi": data.get("ndmi"),
            "ndwi": data.get("ndwi"),
            "demo": True,
        }


class SentinelSatelliteProvider(SatelliteProvider):
    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        return CopernicusSatelliteProvider().get_observations(farm_id, days=days, **kwargs)

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        return CopernicusSatelliteProvider().get_latest(farm_id, **kwargs)

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return CopernicusSatelliteProvider().calculate_indices(data)
