import pytest
from app.services.recommendation import RecommendationEngine


def test_recommendation_generation():
    engine = RecommendationEngine()
    risks = [
        {"risk_type": "WATER_STRESS", "risk_level": "HIGH", "explanation": "Low moisture detected."},
        {"risk_type": "HEAT_STRESS", "risk_level": "MODERATE", "explanation": "High temperature detected."},
    ]
    recs = engine.generate(risks, {})
    assert len(recs) == 2
    assert recs[0]["priority"] == "CRITICAL"
    assert "irrigation" in recs[0]["recommendation"].lower() or "water" in recs[0]["recommendation"].lower()


def test_no_recommendations_for_low_risk():
    engine = RecommendationEngine()
    risks = [{"risk_type": "WATER_STRESS", "risk_level": "LOW", "explanation": "No issue."}]
    recs = engine.generate(risks, {})
    assert len(recs) == 0
