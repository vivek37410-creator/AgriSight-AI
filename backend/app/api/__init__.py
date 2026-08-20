from fastapi import APIRouter, Depends
from app.api import auth, farms, soil, weather, satellite, analysis, alerts, reports, assistant, subscriptions, leaf_analysis, admin, knowledge
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(soil.router, prefix="/farms", tags=["soil"])
api_router.include_router(weather.router, prefix="/farms", tags=["weather"])
api_router.include_router(satellite.router, prefix="/farms", tags=["satellite"])
api_router.include_router(analysis.router, prefix="/farms", tags=["analysis"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reports.router, prefix="/farms", tags=["reports"])
api_router.include_router(assistant.router, prefix="", tags=["assistant"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(leaf_analysis.router, prefix="/leaf", tags=["leaf"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
