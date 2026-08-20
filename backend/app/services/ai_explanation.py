from typing import Dict, Any, List, Optional

from app.providers.ai import MockAIProvider, LLMProvider
from app.services.excel_recommendation import ExcelRecommendationService
from app.core.config import settings


class AIExplanationService:
    def __init__(self):
        self.provider = LLMProvider() if (settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY) else MockAIProvider()
        self.excel_service = ExcelRecommendationService()

    def explain(self, farm_info: Dict[str, Any], crop: Optional[str], growth_stage: Optional[str],
                weather: Optional[Dict[str, Any]], soil: Optional[Dict[str, Any]],
                satellite_indicators: Optional[Dict[str, Any]], risks: List[Dict[str, Any]],
                leaf_condition: Optional[str] = None, severity: Optional[str] = None) -> Dict[str, Any]:
        health_score = farm_info.get("health_score", 50)
        ndvi_trend = satellite_indicators.get("ndvi_trend", 0) if satellite_indicators else 0
        moisture = soil.get("moisture_percent") if soil else weather.get("humidity") if weather else None
        temperature = weather.get("temperature") if weather else None

        data = {
            "crop": crop or "Unknown",
            "growth_stage": growth_stage or "Unknown",
            "health_score": health_score,
            "ndvi_trend": ndvi_trend,
            "moisture": moisture,
            "temperature": temperature,
            "risks": risks,
            "leaf_condition": leaf_condition,
            "severity": severity,
        }
        ai_result = self.provider.generate_explanation(data)

        excel_text = None
        if crop and leaf_condition and leaf_condition.lower() != "healthy":
            try:
                excel_text = self.excel_service.get_recommendation(crop, leaf_condition)
            except Exception:
                pass
        elif crop:
            try:
                excel_text = self.excel_service.get_recommendation(crop)
            except Exception:
                pass

        if excel_text and not ai_result.get("explanation"):
            ai_result["explanation"] = excel_text
            ai_result["recommendations"] = [excel_text]
            ai_result["confidence_note"] = "Based on AgriSight agricultural knowledge base."

        if not ai_result.get("recommendations"):
            ai_result["recommendations"] = [ai_result.get("explanation", "No specific recommendation available.")]

        return ai_result
