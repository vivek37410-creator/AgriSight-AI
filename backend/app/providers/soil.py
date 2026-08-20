from typing import List, Dict, Any, Optional
import random
import datetime

from app.providers.base import BaseProvider


class SoilProvider(BaseProvider):
    pass


class MockSoilProvider(SoilProvider):
    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        observations = []
        base_moisture = random.uniform(25, 45)
        base_ph = random.uniform(6.0, 7.5)
        base_n = random.uniform(20, 60)
        base_p = random.uniform(10, 40)
        base_k = random.uniform(100, 250)
        for i in range(days):
            date = datetime.date.today() - datetime.timedelta(days=days - i)
            moisture = max(5, min(60, base_moisture + random.uniform(-5, 5)))
            temp = random.uniform(20, 32)
            ph = max(5.0, min(8.5, base_ph + random.uniform(-0.3, 0.3)))
            n = max(0, base_n + random.uniform(-10, 10))
            p = max(0, base_p + random.uniform(-5, 5))
            k = max(0, base_k + random.uniform(-30, 30))
            observations.append({
                "farm_id": farm_id,
                "moisture_percent": round(moisture, 1),
                "temperature": round(temp, 1),
                "soil_type": kwargs.get("soil_type", "Loam"),
                "ph": round(ph, 2),
                "nitrogen": round(n, 1),
                "phosphorus": round(p, 1),
                "potassium": round(k, 1),
                "source": "demo",
                "recorded_at": datetime.datetime.combine(date, datetime.time(hour=8)).isoformat(),
            })
        return observations

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        obs = self.get_observations(farm_id, days=1)
        return obs[0] if obs else None

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"demo": True}
