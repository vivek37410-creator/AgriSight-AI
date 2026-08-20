import json
import random
import base64
from typing import Dict, Any, List, Optional
import httpx

from app.core.config import settings


class AIProvider:
    def generate_explanation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    def generate_explanation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        risks = data.get("risks", [])
        health_score = data.get("health_score", 50)
        crop = data.get("crop", "Unknown crop")
        stage = data.get("growth_stage", "Unknown")
        ndvi_trend = data.get("ndvi_trend", "stable")
        moisture = data.get("moisture", 50)
        temperature = data.get("temperature", 30)

        if not risks and health_score >= 75:
            main_risk = "None"
            explanation = f"Crop health is good ({health_score}/100). Conditions appear favorable for {crop} during {stage}."
            recommendations = ["Continue current management practices.", "Monitor for any sudden changes."]
        else:
            high_risks = [r for r in risks if r.get("risk_level") == "HIGH"]
            mod_risks = [r for r in risks if r.get("risk_level") == "MODERATE"]

            if high_risks:
                main_risk = high_risks[0].get("risk_type", "Unknown").replace("_", " ").title()
                explanation = high_risks[0].get("explanation", "Elevated risk detected.")
            elif mod_risks:
                main_risk = mod_risks[0].get("risk_type", "Unknown").replace("_", " ").title()
                explanation = mod_risks[0].get("explanation", "Moderate risk detected.")
            else:
                main_risk = "Low overall risk"
                explanation = "No significant risks detected at this time."

            recommendations = []
            for r in high_risks + mod_risks:
                risk_type = r.get("risk_type", "")
                if risk_type == "WATER_STRESS":
                    recommendations.append("Inspect irrigation conditions and prioritize the affected zone within 24-48 hours.")
                elif risk_type == "HEAT_STRESS":
                    recommendations.append("Monitor crop condition during peak heat and review irrigation availability.")
                elif risk_type == "VEGETATION_DECLINE":
                    recommendations.append("Review recent field observations and consider soil testing.")
                elif risk_type == "DISEASE_RISK":
                    recommendations.append("Inspect leaves and affected areas and consult an agronomist before applying treatment.")
                else:
                    recommendations.append(r.get("explanation", "Review conditions."))

            if not recommendations:
                recommendations.append("Continue monitoring and maintain current practices.")

        summary = f"Health score: {health_score}/100. Main concern: {main_risk}."

        return {
            "summary": summary,
            "main_risk": main_risk,
            "explanation": explanation,
            "recommendations": recommendations,
            "confidence_note": "This analysis uses simulated data and deterministic rules. Consult an agronomist for field-verified decisions.",
        }


class GeminiAIProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def generate_explanation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            return MockAIProvider().generate_explanation(data)

        prompt = self._build_prompt(data)
        try:
            with httpx.Client() as client:
                resp = client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json={
                        "contents": [{
                            "parts": [{
                                "text": f"""You are an agricultural assistant. Only use the data provided below. Do not invent measurements.

{prompt}

Format the response as JSON with keys: summary, main_risk, explanation, recommendations (array), confidence_note."""
                            }]
                        }],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 500},
                    },
                    timeout=30,
                )
                if resp.status_code == 200:
                    result = resp.json()
                    content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    try:
                        parsed = json.loads(content)
                        return {
                            "summary": parsed.get("summary", content[:200]),
                            "main_risk": parsed.get("main_risk", data.get("main_risk", "Unknown")),
                            "explanation": parsed.get("explanation", content),
                            "recommendations": parsed.get("recommendations", [content]),
                            "confidence_note": parsed.get("confidence_note", "Generated by Gemini using provided data only."),
                        }
                    except Exception:
                        return {
                            "summary": content[:200],
                            "main_risk": data.get("main_risk", "Unknown"),
                            "explanation": content,
                            "recommendations": [content],
                            "confidence_note": "Generated by Gemini using provided data only.",
                        }
        except Exception:
            pass
        return MockAIProvider().generate_explanation(data)

    def _build_prompt(self, data: Dict[str, Any]) -> str:
        parts = [
            f"Crop: {data.get('crop', 'Unknown')}",
            f"Growth stage: {data.get('growth_stage', 'Unknown')}",
            f"Health score: {data.get('health_score', 'N/A')}/100",
            f"NDVI trend: {data.get('ndvi_trend', 'N/A')}",
            f"Soil moisture: {data.get('moisture', 'N/A')}%",
            f"Temperature: {data.get('temperature', 'N/A')}C",
            f"Risks: {json.dumps(data.get('risks', []))}",
        ]
        return "\n".join(parts)

    def generate_image_explanation(self, image_bytes: bytes, mime_type: str = "image/jpeg", prompt: str = "Identify this plant/leaf and any visible diseases. Provide crop name, condition, and recommendations.") -> Dict[str, Any]:
        if not self.api_key:
            return {
                "summary": "Image analysis unavailable.",
                "main_risk": "Unknown",
                "explanation": "Gemini API key not configured.",
                "recommendations": ["Upload a clear image for better analysis."],
                "confidence_note": "No AI provider available.",
            }

        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        try:
            with httpx.Client() as client:
                resp = client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json={
                        "contents": [{
                            "parts": [
                                {"text": prompt},
                                {"inline_data": {"mime_type": mime_type, "data": base64_image}},
                            ]
                        }],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800},
                    },
                    timeout=60,
                )
                if resp.status_code == 200:
                    result = resp.json()
                    content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    try:
                        parsed = json.loads(content)
                        return {
                            "summary": parsed.get("summary", content[:200]),
                            "main_risk": parsed.get("main_risk", "Unknown"),
                            "explanation": parsed.get("explanation", content),
                            "recommendations": parsed.get("recommendations", [content]),
                            "confidence_note": parsed.get("confidence_note", "Generated by Gemini Vision."),
                        }
                    except Exception:
                        return {
                            "summary": content[:200],
                            "main_risk": "Unknown",
                            "explanation": content,
                            "recommendations": [content],
                            "confidence_note": "Generated by Gemini Vision.",
                        }
        except Exception:
            pass
        return {
            "summary": "Image analysis failed.",
            "main_risk": "Unknown",
            "explanation": "Could not analyze image with Gemini.",
            "recommendations": ["Try again later."],
            "confidence_note": "Error during analysis.",
        }


class LLMProvider(AIProvider):
    def __init__(self):
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            self.provider = GeminiAIProvider()
        else:
            self.provider = MockAIProvider()

    def generate_explanation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self.provider.generate_explanation(data)
