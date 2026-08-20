from typing import Dict, Any, Optional


class WaterStressEngine:
    def assess(self, soil_moisture: Optional[float], rainfall_probability: Optional[float],
               temperature: Optional[float], ndvi_trend: float, crop_stage: Optional[str]) -> Dict[str, Any]:
        score = 0.0
        factors = []

        if soil_moisture is not None:
            if soil_moisture < 20:
                score += 40
                factors.append("very low soil moisture")
            elif soil_moisture < 30:
                score += 25
                factors.append("low soil moisture")
            elif soil_moisture > 70:
                score += 5
                factors.append("high soil moisture")

        if rainfall_probability is not None:
            if rainfall_probability < 20:
                score += 25
                factors.append("low near-term rainfall probability")
            elif rainfall_probability > 60:
                score -= 10

        if temperature is not None:
            if temperature > 38:
                score += 25
                factors.append("high temperature")
            elif temperature > 33:
                score += 15
                factors.append("elevated temperature")

        if ndvi_trend < -0.03:
            score += 20
            factors.append("declining vegetation indicators")
        elif ndvi_trend < -0.01:
            score += 10
            factors.append("slightly declining vegetation")

        if crop_stage in ("Flowering", "Pod formation", "Grain filling"):
            score += 5

        if score >= 60:
            level = "HIGH"
        elif score >= 30:
            level = "MODERATE"
        else:
            level = "LOW"

        explanation = "Potential water stress detected because " + ", ".join(factors) + "." if factors else "No significant water stress indicators detected."
        if level == "LOW":
            explanation = "Current conditions do not indicate significant water stress."

        return {
            "risk_type": "WATER_STRESS",
            "risk_level": level,
            "score": round(score, 1),
            "explanation": explanation,
            "demo": True,
        }
