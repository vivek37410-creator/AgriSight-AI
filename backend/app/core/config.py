from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    DATABASE_URL: str = "sqlite:///./AgriSight.db"
    SECRET_KEY: str = "AgriSight-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEMO_MODE: bool = False
    ENVIRONMENT: str = "development"
    WEATHER_PROVIDER: str = "open_meteo"
    SATELLITE_PROVIDER: str = "mock"
    COPERNICUS_CLIENT_ID: str = ""
    COPERNICUS_CLIENT_SECRET: str = ""
    AI_PROVIDER: str = "mock"
    GEMINI_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    PAYMENT_PROVIDER: str = "mock"
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_FARMER: str = ""
    STRIPE_PRICE_PROFESSIONAL: str = ""
    STRIPE_PRICE_ENTERPRISE: str = ""
    APP_URL: str = "http://localhost:3000"
    LEAF_ANALYSIS_MAX_FILE_SIZE_MB: int = 10
    LEAF_ANALYSIS_CONFIDENCE_THRESHOLD: float = 0.5
    LEAF_ANALYSIS_MOCK_INFERENCE: bool = True
    ASSISTANT_CONFIDENCE_THRESHOLD: float = 0.35


settings = Settings()

