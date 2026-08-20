from typing import Dict, Any, Optional


class HeatStressEngine:
    def assess(self, temperature: Optional[float], humidity: Optional[float],
               crop_stage: Optional[str], weather_forecast: list) -> Dict[str, Any]:
        score = 0.0
        factors = []

        if temperature is not None:
            if temperature > 40:
                score += 40
                factors.append("extreme temperature")
            elif temperature > 35:
                score += 25
                factors.append("high temperature")
            elif temperature > 30:
                score += 10
                factors.append("elevated temperature")

        if humidity is not None:
            if humidity < 25 and temperature is not None and temperature > 30:
                score += 20
                factors.append("low humidity with high temperature")
            elif humidity > 80 and temperature is not None and temperature > 28:
                score += 15
                factors.append("high humidity with warm temperature")

        if crop_stage in ("Flowering", "Pod formation"):
            score += 10
            factors.append("sensitive growth stage")

        if weather_forecast:
            try:
                max_temp = max(f.get("temperature", 0) for f in weather_forecast[:3])
                if max_temp > 38:
                    score += 15
                    factors.append("forecasted extreme heat")
                elif max_temp > 33:
                    score += 8
            except Exception:
                pass

        if score >= 60:
            level = "HIGH"
        elif score >= 30:
            level = "MODERATE"
        else:
            level = "LOW"

        explanation = "Potential heat stress detected because " + ", ".join(factors) + "." if factors else "No significant heat stress indicators detected."
        if level == "LOW":
            explanation = "Current conditions do not indicate significant heat stress."

        return {
            "risk_type": "HEAT_STRESS",
            "risk_level": level,
            "score": round(score, 1),
            "explanation": explanation,
            "demo": True,
        }
