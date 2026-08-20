from typing import Dict, Any, Optional


class CropHealthEngine:
    def calculate(self, ndvi_trend: float, moisture: Optional[float], temperature: Optional[float],
                  rainfall: Optional[float], crop_stage: Optional[str], weather_forecast: list) -> Dict[str, Any]:
        estimated_ndvi = self._estimate_ndvi(ndvi_trend)
        vegetation_score = self._score_ndvi(estimated_ndvi)
        moisture_score = self._score_moisture(moisture)
        weather_score = self._score_weather(temperature, rainfall, weather_forecast)
        stress_score = self._score_stress(moisture, temperature, ndvi_trend)
        health_score = (vegetation_score * 0.35 + moisture_score * 0.25 + weather_score * 0.25 + (100 - stress_score) * 0.15)
        health_score = max(0, min(100, round(health_score, 1)))
        return {
            "health_score": health_score,
            "vegetation_score": round(vegetation_score, 1),
            "moisture_score": round(moisture_score, 1),
            "weather_score": round(weather_score, 1),
            "stress_score": round(stress_score, 1),
            "demo": True,
        }

    def _estimate_ndvi(self, ndvi_trend: float) -> float:
        base = 0.6
        adjusted = base + (ndvi_trend * 10)
        return max(0.0, min(1.0, adjusted))

    def _score_ndvi(self, ndvi: float) -> float:
        if ndvi is None:
            return 50.0
        if ndvi >= 0.7:
            return 90.0
        elif ndvi >= 0.5:
            return 70.0
        elif ndvi >= 0.3:
            return 50.0
        else:
            return 30.0

    def _score_moisture(self, moisture: Optional[float]) -> float:
        if moisture is None:
            return 50.0
        if 30 <= moisture <= 60:
            return 85.0
        elif 20 <= moisture < 30:
            return 60.0
        elif moisture < 20:
            return 30.0
        elif moisture > 70:
            return 55.0
        return 70.0

    def _score_weather(self, temp: Optional[float], rainfall: Optional[float], forecast: list) -> float:
        score = 70.0
        if temp is not None:
            if 20 <= temp <= 30:
                score += 15
            elif temp > 35 or temp < 10:
                score -= 20
            else:
                score -= 5
        if rainfall is not None:
            if 5 <= rainfall <= 20:
                score += 10
            elif rainfall > 50:
                score -= 10
        if forecast:
            try:
                avg_rain_prob = sum(f.get("rainfall_probability", 0) for f in forecast[:3]) / min(3, len(forecast))
                if avg_rain_prob > 30:
                    score += 5
            except Exception:
                pass
        return max(0, min(100, score))

    def _score_stress(self, moisture: Optional[float], temp: Optional[float], ndvi_trend: float) -> float:
        score = 20.0
        if moisture is not None and moisture < 25:
            score += 30
        if temp is not None and temp > 35:
            score += 25
        if ndvi_trend < -0.03:
            score += 25
        elif ndvi_trend < -0.01:
            score += 15
        return min(100, score)
