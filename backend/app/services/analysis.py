from datetime import datetime, date, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.services.crop_growth import calculate_growth_stage
from app.services.crop_health import CropHealthEngine
from app.services.water_stress import WaterStressEngine
from app.services.heat_stress import HeatStressEngine
from app.services.vegetation_decline import VegetationDeclineEngine
from app.services.disease_risk import DiseaseRiskEngine
from app.services.recommendation import RecommendationEngine
from app.services.ai_explanation import AIExplanationService

from app.models.farm import Farm
from app.models.soil_data import SoilData
from app.models.weather import WeatherObservation, WeatherForecast
from app.models.satellite import SatelliteObservation
from app.models.health import HealthScore
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.models.alert import Alert
from app.models.crop import Crop
from app.providers.weather import MockWeatherProvider
from app.providers.soil import MockSoilProvider


class AnalysisService:
    def analyze_farm(self, farm_id: int, db: Session) -> Dict[str, Any]:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            return {"error": "Farm not found"}

        crop = db.query(Crop).filter(Crop.id == farm.crop_id).first()
        crop_name = crop.name if crop else "Unknown"

        soil = db.query(SoilData).filter(SoilData.farm_id == farm_id).order_by(SoilData.recorded_at.desc()).first()
        weather = db.query(WeatherObservation).filter(WeatherObservation.farm_id == farm_id).order_by(WeatherObservation.recorded_at.desc()).first()
        forecast = db.query(WeatherForecast).filter(WeatherForecast.farm_id == farm_id).limit(3).all()
        forecast_list = [
            {"temperature": f.temperature, "rainfall_probability": f.rainfall_probability, "wind_speed": f.wind_speed}
            for f in forecast
        ]
        satellite = db.query(SatelliteObservation).filter(SatelliteObservation.farm_id == farm_id).order_by(SatelliteObservation.observation_date.desc()).limit(5).all()
        satellite_list = [
            {"ndvi": s.ndvi, "observation_date": s.observation_date.isoformat() if s.observation_date else None}
            for s in satellite
        ]

        latest_sat = satellite[0] if satellite else None
        ndvi_trend = 0.0
        if len(satellite) >= 2:
            ndvi_trend = (satellite[0].ndvi or 0) - (satellite[1].ndvi or 0)

        growth_stage = None
        if farm.sowing_date:
            growth_stage = calculate_growth_stage(farm.crop_id, farm.sowing_date, db)

        moisture = soil.moisture_percent if soil else None
        temperature = weather.temperature if weather else None
        rainfall = weather.rainfall if weather else None
        humidity = weather.humidity if weather else None

        health_engine = CropHealthEngine()
        health = health_engine.calculate(ndvi_trend, moisture, temperature, rainfall, growth_stage, forecast_list)

        water_engine = WaterStressEngine()
        water_stress = water_engine.assess(moisture, forecast_list[0].get("rainfall_probability") if forecast_list else None, temperature, ndvi_trend, growth_stage)

        heat_engine = HeatStressEngine()
        heat_stress = heat_engine.assess(temperature, humidity, growth_stage, forecast_list)

        veg_engine = VegetationDeclineEngine()
        veg_decline = veg_engine.assess(satellite_list)

        disease_engine = DiseaseRiskEngine()
        disease_risk = disease_engine.assess(humidity, rainfall, temperature, growth_stage, ndvi_trend)

        risks = [water_stress, heat_stress, veg_decline, disease_risk]

        rec_engine = RecommendationEngine()
        recommendations = rec_engine.generate(risks, {
            "farm": farm.name,
            "crop": crop_name,
            "soil_type": soil.soil_type if soil else None,
            "weather": {
                "current": {"temperature": weather.temperature, "humidity": weather.humidity, "rainfall": weather.rainfall} if weather else None,
                "forecast": forecast_list,
            } if weather or forecast_list else None,
        })

        weather_source = weather.source if weather else "demo"
        satellite_source = satellite[0].source if satellite else "demo"
        demo = (weather_source == "demo" or satellite_source == "demo")

        for risk in risks:
            risk["demo"] = demo

        for rec in recommendations:
            rec["demo"] = demo

        health_score = HealthScore(
            farm_id=farm_id,
            health_score=health["health_score"],
            moisture_score=health["moisture_score"],
            vegetation_score=health["vegetation_score"],
            weather_score=health["weather_score"],
            stress_score=health["stress_score"],
            calculated_at=datetime.now(timezone.utc),
        )
        db.add(health_score)

        for risk in risks:
            db.add(RiskAssessment(
                farm_id=farm_id,
                risk_type=risk["risk_type"],
                risk_level=risk["risk_level"],
                score=risk["score"],
                explanation=risk["explanation"],
                created_at=datetime.now(timezone.utc),
            ))

        for rec in recommendations:
            db.add(Recommendation(
                farm_id=farm_id,
                risk_id=None,
                priority=rec["priority"],
                recommendation=rec["recommendation"],
                reasoning=rec["reasoning"],
                created_at=datetime.now(timezone.utc),
            ))

        for risk in risks:
            if risk["risk_level"] in ("MODERATE", "HIGH"):
                severity = "MODERATE" if risk["risk_level"] == "MODERATE" else "CRITICAL"
                db.add(Alert(
                    farm_id=farm_id,
                    type=risk["risk_type"],
                    severity=severity,
                    title=f"{risk['risk_type'].replace('_', ' ').title()} Detected",
                    message=risk["explanation"],
                    is_read=False,
                    created_at=datetime.now(timezone.utc),
                ))

        db.commit()

        return {
            "farm_id": farm_id,
            "crop": crop_name,
            "growth_stage": growth_stage,
            "health_score": health["health_score"],
            "scores": health,
            "risks": risks,
            "recommendations": recommendations,
            "satellite_observations": satellite_list,
            "weather": {"current": weather.__dict__ if weather else None, "forecast": forecast_list},
            "soil": soil.__dict__ if soil else None,
            "demo": demo,
        }
