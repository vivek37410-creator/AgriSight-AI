from typing import Dict, Any, List


def calculate_composite_risk(risks: List[Dict[str, Any]]) -> float:
    if not risks:
        return 0.0
    total = 0.0
    for risk in risks:
        level = risk.get("risk_level", "LOW")
        score = risk.get("score", 0)
        weight = 1.0 if level == "HIGH" else 0.6 if level == "MODERATE" else 0.2
        total += score * weight
    return round(total / len(risks), 1)
