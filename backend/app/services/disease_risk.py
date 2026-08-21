from typing import Dict, Any, Optional


class DiseaseRiskEngine:
    def assess(self, humidity: Optional[float], rainfall: Optional[float], temperature: Optional[float],
               crop_stage: Optional[str], vegetation_trend: float) -> Dict[str, Any]:
        score = 0.0
        factors = []

        if humidity is not None and humidity > 80:
            score += 25
            factors.append("high humidity")
        elif humidity is not None and humidity > 65:
            score += 10
            factors.append("elevated humidity")

        if rainfall is not None and rainfall > 10:
            score += 20
            factors.append("recent rainfall")
        elif rainfall is not None and rainfall > 5:
            score += 10
            factors.append("moderate rainfall")

        if temperature is not None and 20 <= temperature <= 30:
            score += 15
            factors.append("favorable temperature range")
        elif temperature is not None and 15 <= temperature <= 35:
            score += 5

        if crop_stage in ("Vegetative", "Flowering"):
            score += 10
            factors.append("dense canopy growth stage")

        if vegetation_trend < -0.02:
            score += 10
            factors.append("vegetation stress indicators")

        if score >= 50:
            level = "HIGH"
        elif score >= 25:
            level = "MODERATE"
        else:
            level = "LOW"

        if level in ("MODERATE", "HIGH"):
            explanation = "Potential disease-favorable conditions detected because " + ", ".join(factors) + ". Inspect leaves and affected areas and consult an agronomist before applying treatment."
        else:
            explanation = "Current environmental conditions do not strongly favor disease development."

        return {
            "risk_type": "DISEASE_RISK",
            "risk_level": level,
            "score": round(score, 1),
            "explanation": explanation,
        }
