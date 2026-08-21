from typing import Dict, Any, List, Optional


class VegetationDeclineEngine:
    def assess(self, ndvi_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not ndvi_history or len(ndvi_history) < 2:
            return {
                "risk_type": "VEGETATION_DECLINE",
                "risk_level": "LOW",
                "score": 0.0,
                "explanation": "Insufficient satellite observation history to assess vegetation trend.",
            }

        ndvis = [float(h.get("ndvi", 0) or 0) for h in ndvi_history if h.get("ndvi") is not None]
        if len(ndvis) < 2:
            return {
                "risk_type": "VEGETATION_DECLINE",
                "risk_level": "LOW",
                "score": 0.0,
                "explanation": "Insufficient valid NDVI data to assess trend.",
            }

        recent = ndvis[-1]
        previous = ndvis[-2]
        change = recent - previous
        max_ndvi = max(ndvis)
        decline_from_peak = max_ndvi - recent

        score = 0.0
        factors = []

        if change < -0.03:
            score += 40
            factors.append("sharp recent NDVI decline")
        elif change < -0.01:
            score += 20
            factors.append("moderate NDVI decline")

        if decline_from_peak > 0.05:
            score += 20
            factors.append("decline from seasonal peak")

        if recent < 0.4:
            score += 20
            factors.append("low current NDVI value")

        if score >= 60:
            level = "HIGH"
        elif score >= 30:
            level = "MODERATE"
        else:
            level = "LOW"

        explanation = "Vegetation decline detected because " + ", ".join(factors) + "." if factors else "No significant vegetation decline detected."
        if level == "LOW":
            explanation = "Vegetation indicators appear stable based on available observations."

        return {
            "risk_type": "VEGETATION_DECLINE",
            "risk_level": level,
            "score": round(score, 1),
            "explanation": explanation,
        }
