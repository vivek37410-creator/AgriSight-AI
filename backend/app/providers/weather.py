import random
import datetime
from typing import List, Dict, Any, Optional
import httpx

from app.providers.base import BaseProvider
from app.core.config import settings


class WeatherProvider(BaseProvider):
    pass


class MockWeatherProvider(WeatherProvider):
    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        observations = []
        base_temp = random.uniform(25, 32)
        for i in range(days):
            date = datetime.date.today() - datetime.timedelta(days=days - i)
            temp = base_temp + random.uniform(-3, 3)
            humidity = random.uniform(40, 80)
            rainfall = random.uniform(0, 20) if random.random() > 0.7 else 0.0
            wind_speed = random.uniform(5, 25)
            pressure = random.uniform(1000, 1020)
            observations.append({
                "farm_id": farm_id,
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "rainfall": round(rainfall, 1),
                "wind_speed": round(wind_speed, 1),
                "pressure": round(pressure, 1),
                "recorded_at": datetime.datetime.combine(date, datetime.time(hour=12)),
                "source": "demo",
            })
        return observations

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        obs = self.get_observations(farm_id, days=1)
        return obs[0] if obs else None

    def get_forecast(self, farm_id: int, days: int = 7, **kwargs) -> List[Dict[str, Any]]:
        forecasts = []
        for i in range(days):
            date = datetime.date.today() + datetime.timedelta(days=i + 1)
            temp = random.uniform(26, 34)
            humidity = random.uniform(35, 75)
            rain_prob = random.uniform(10, 60)
            rain_amt = random.uniform(0, 15) if rain_prob > 30 else 0.0
            wind_speed = random.uniform(5, 20)
            forecasts.append({
                "farm_id": farm_id,
                "forecast_time": datetime.datetime.combine(date, datetime.time(hour=12)),
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "rainfall_probability": round(rain_prob, 1),
                "rainfall_amount": round(rain_amt, 1),
                "wind_speed": round(wind_speed, 1),
                "source": "demo",
            })
        return forecasts

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"demo": True}


class OpenMeteoWeatherProvider(WeatherProvider):
    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        lat = kwargs.get("lat", 0)
        lon = kwargs.get("lon", 0)
        if not lat or not lon:
            return MockWeatherProvider().get_observations(farm_id, days=days)
        try:
            observations = []
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=days - 1)
            with httpx.Client() as client:
                resp = client.get(
                    "https://archive-api.open-meteo.com/v1/archive",
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                        "daily": ["temperature_2m_mean", "relative_humidity_2m_mean", "precipitation_sum", "wind_speed_10m_mean"],
                        "timezone": "auto",
                    },
                    timeout=30,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    daily = data.get("daily", {})
                    dates = daily.get("time", [])
                    temps = daily.get("temperature_2m_mean", [])
                    humidities = daily.get("relative_humidity_2m_mean", [])
                    rains = daily.get("precipitation_sum", [])
                    winds = daily.get("wind_speed_10m_mean", [])
                    for i, date_str in enumerate(dates):
                        observations.append({
                            "farm_id": farm_id,
                            "temperature": round(temps[i], 1) if i < len(temps) and temps[i] is not None else None,
                            "humidity": round(humidities[i], 1) if i < len(humidities) and humidities[i] is not None else None,
                            "rainfall": round(rains[i], 1) if i < len(rains) and rains[i] is not None else 0.0,
                            "wind_speed": round(winds[i], 1) if i < len(winds) and winds[i] is not None else None,
                            "pressure": None,
                            "recorded_at": datetime.datetime.combine(datetime.datetime.strptime(date_str, "%Y-%m-%d").date(), datetime.time(hour=12)),
                            "source": "open_meteo",
                        })
                    return observations
        except Exception:
            pass
        return MockWeatherProvider().get_observations(farm_id, days=days)

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        obs = self.get_observations(farm_id, days=1, **kwargs)
        return obs[0] if obs else None

    def get_forecast(self, farm_id: int, days: int = 7, **kwargs) -> List[Dict[str, Any]]:
        lat = kwargs.get("lat", 0)
        lon = kwargs.get("lon", 0)
        if not lat or not lon:
            return MockWeatherProvider().get_forecast(farm_id, days=days)
        try:
            forecasts = []
            with httpx.Client() as client:
                resp = client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "daily": ["temperature_2m_max", "relative_humidity_2m_mean", "precipitation_probability_mean", "precipitation_sum", "wind_speed_10m_mean"],
                        "timezone": "auto",
                        "forecast_days": days,
                    },
                    timeout=30,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    daily = data.get("daily", {})
                    dates = daily.get("time", [])
                    temps = daily.get("temperature_2m_max", [])
                    humidities = daily.get("relative_humidity_2m_mean", [])
                    rain_probs = daily.get("precipitation_probability_mean", [])
                    rains = daily.get("precipitation_sum", [])
                    winds = daily.get("wind_speed_10m_mean", [])
                    for i, date_str in enumerate(dates):
                        forecasts.append({
                            "farm_id": farm_id,
                            "forecast_time": datetime.datetime.combine(datetime.datetime.strptime(date_str, "%Y-%m-%d").date(), datetime.time(hour=12)),
                            "temperature": round(temps[i], 1) if i < len(temps) and temps[i] is not None else None,
                            "humidity": round(humidities[i], 1) if i < len(humidities) and humidities[i] is not None else None,
                            "rainfall_probability": round(rain_probs[i], 1) if i < len(rain_probs) and rain_probs[i] is not None else 0.0,
                            "rainfall_amount": round(rains[i], 1) if i < len(rains) and rains[i] is not None else 0.0,
                            "wind_speed": round(winds[i], 1) if i < len(winds) and winds[i] is not None else None,
                            "source": "open_meteo",
                        })
                    return forecasts
        except Exception:
            pass
        return MockWeatherProvider().get_forecast(farm_id, days=days)

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"demo": False}


class RealWeatherProvider(WeatherProvider):
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1"

    def get_observations(self, farm_id: int, days: int = 30, **kwargs) -> List[Dict[str, Any]]:
        return OpenMeteoWeatherProvider().get_observations(farm_id, days=days, **kwargs)

    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        return OpenMeteoWeatherProvider().get_latest(farm_id, **kwargs)

    def get_forecast(self, farm_id: int, days: int = 7, **kwargs) -> List[Dict[str, Any]]:
        return OpenMeteoWeatherProvider().get_forecast(farm_id, days=days, **kwargs)

    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"demo": False}
