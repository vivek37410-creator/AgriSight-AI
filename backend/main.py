import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database.session import create_all_tables, seed_demo_data
from app.api import api_router

app = FastAPI(title="AgriSight AI", description="From satellite data to smarter farming decisions.", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

os.makedirs("uploads/leaf", exist_ok=True)
app.mount("/static/leaf", StaticFiles(directory="uploads/leaf"), name="leaf-uploads")
os.makedirs("uploads/farm-photos", exist_ok=True)
app.mount("/static/farm-photos", StaticFiles(directory="uploads/farm-photos"), name="farm-photos")
os.makedirs("uploads/profile-photos", exist_ok=True)
app.mount("/static/profile-photos", StaticFiles(directory="uploads/profile-photos"), name="profile-photos")


@app.get("/health")
def health():
    weather_demo = settings.WEATHER_PROVIDER not in ("open_meteo",)
    satellite_demo = settings.SATELLITE_PROVIDER not in ("copernicus",)
    return {
        "status": "ok",
        "app": "AgriSight AI",
        "demo": settings.DEMO_MODE or weather_demo or satellite_demo,
    }


@app.on_event("startup")
def startup():
    create_all_tables()
    from app.database.session import SessionLocal
    from app.models.farm import Farm
    from sqlalchemy import text
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE farms ADD COLUMN IF NOT EXISTS photo_url VARCHAR"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    db = SessionLocal()
    try:
        cols = [r[1] for r in db.execute(text("PRAGMA table_info(leaf_analyses)")).fetchall()]
        if "latitude" not in cols:
            db.execute(text("ALTER TABLE leaf_analyses ADD COLUMN latitude FLOAT"))
        if "longitude" not in cols:
            db.execute(text("ALTER TABLE leaf_analyses ADD COLUMN longitude FLOAT"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()

