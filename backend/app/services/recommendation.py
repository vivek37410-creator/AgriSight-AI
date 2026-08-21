from typing import List, Dict, Any


class RecommendationEngine:
    def generate(self, risk_assessments: List[Dict[str, Any]], farm_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        recommendations = []
        priority_map = {"HIGH": "CRITICAL", "MODERATE": "MEDIUM", "LOW": "LOW"}

        for risk in risk_assessments:
            risk_type = risk.get("risk_type", "")
            level = risk.get("risk_level", "LOW")
            explanation = risk.get("explanation", "")
            condition = risk.get("condition")

            if level in ("HIGH", "MODERATE"):
                rec = self._build_recommendation(risk_type, level, explanation, condition=condition)
                recommendations.append(rec)

        recommendations.sort(key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(x["priority"], 4))
        return recommendations

    def _build_recommendation(self, risk_type: str, level: str, explanation: str, condition: str | None = None) -> Dict[str, Any]:
        if risk_type == "WATER_STRESS":
            return {
                "priority": "CRITICAL" if level == "HIGH" else "MEDIUM",
                "title": "Irrigation Review Required",
                "recommendation": "Inspect irrigation conditions and prioritize the affected farm zone within the next 24-48 hours.",
                "reasoning": explanation,
            }
        elif risk_type == "HEAT_STRESS":
            return {
                "priority": "CRITICAL" if level == "HIGH" else "MEDIUM",
                "title": "Heat Stress Alert",
                "recommendation": "Monitor crop condition during peak heat hours and review irrigation availability where applicable.",
                "reasoning": explanation,
            }
        elif risk_type == "VEGETATION_DECLINE":
            return {
                "priority": "MEDIUM",
                "title": "Vegetation Health Review",
                "recommendation": "Review recent field observations and consider soil testing or agronomic consultation.",
                "reasoning": explanation,
            }
        elif risk_type == "DISEASE_RISK":
            return {
                "priority": "MEDIUM",
                "title": "Disease Risk Advisory",
                "recommendation": "Inspect crop leaves for symptoms and consult an agronomist before applying treatment.",
                "reasoning": explanation,
            }
        elif risk_type == "LEAF_DISEASE_RISK":
            cond = (condition or "").replace("_", " ").title()
            return {
                "priority": "CRITICAL" if level == "HIGH" else "MEDIUM" if level == "MODERATE" else "LOW",
                "title": f"Leaf Disease Advisory: {cond}" if cond else "Leaf Disease Advisory",
                "recommendation": f"Inspect leaves for {cond.lower() if cond else 'symptoms'} and consult an agronomist before applying any treatment. Remove heavily infected leaves if safe to do so.",
                "reasoning": explanation,
            }
        else:
            return {
                "priority": "MEDIUM",
                "title": "General Advisory",
                "recommendation": "Review farm conditions and consult an agronomist if needed.",
                "reasoning": explanation,
            }
