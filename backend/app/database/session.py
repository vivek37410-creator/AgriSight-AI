import os
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from contextlib import contextmanager

from app.core.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    import app.models.user  # noqa: F401
    import app.models.farm  # noqa: F401
    import app.models.crop  # noqa: F401
    import app.models.soil_data  # noqa: F401
    import app.models.weather  # noqa: F401
    import app.models.satellite  # noqa: F401
    import app.models.health  # noqa: F401
    import app.models.risk  # noqa: F401
    import app.models.recommendation  # noqa: F401
    import app.models.alert  # noqa: F401
    import app.models.report  # noqa: F401
    import app.models.subscription  # noqa: F401
    import app.models.leaf_analysis  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_demo_data(db):
    from app.models.user import User
    from app.models.subscription import Subscription
    from app.models.crop import Crop
    from app.models.crop import CropGrowthStage
    from app.models.farm import Farm
    from app.core.security import get_password_hash

    ADMIN_EMAIL = "31241580@vupune.ac.in"
    ADMIN_PASSWORD = "vivek@1234"
    ADMIN_NAME = "Vivek"

    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        db.flush()
        subscription = Subscription(
            user_id=admin.id,
            plan="PROFESSIONAL",
            status="ACTIVE",
            monthly_limit=100,
            used_this_month=0,
        )
        db.add(subscription)
    else:
        admin.role = "admin"
        db.commit()

    crops = [
        Crop(id=1, name="Pigeon Pea", scientific_name="Cajanus cajan", growth_duration_days=120, description="Drought-resistant legume"),
        Crop(id=2, name="Cotton", scientific_name="Gossypium hirsutum", growth_duration_days=150, description="Major fiber crop"),
        Crop(id=3, name="Wheat", scientific_name="Triticum aestivum", growth_duration_days=120, description="Common wheat"),
        Crop(id=4, name="Rice", scientific_name="Oryza sativa", growth_duration_days=120, description="Staple food crop"),
        Crop(id=5, name="Maize", scientific_name="Zea mays", growth_duration_days=90, description="Versatile cereal crop"),
        Crop(id=6, name="Soybean", scientific_name="Glycine max", growth_duration_days=100, description="High-protein legume"),
    ]
    for crop in crops:
        existing = db.query(Crop).filter(Crop.id == crop.id).first()
        if not existing:
            db.add(crop)
    db.flush()

    for crop in crops:
        stages = [
            CropGrowthStage(crop_id=crop.id, stage_name="Germination", min_day=0, max_day=14, notes="Seedling emergence"),
            CropGrowthStage(crop_id=crop.id, stage_name="Vegetative", min_day=15, max_day=45, notes="Leaf development"),
            CropGrowthStage(crop_id=crop.id, stage_name="Flowering", min_day=46, max_day=70, notes="Reproductive stage"),
            CropGrowthStage(crop_id=crop.id, stage_name="Maturity", min_day=71, max_day=120, notes="Harvest ready"),
        ]
        for stage in stages:
            existing = db.query(CropGrowthStage).filter(CropGrowthStage.crop_id == stage.crop_id, CropGrowthStage.stage_name == stage.stage_name).first()
            if not existing:
                db.add(stage)

    farm = Farm(
        user_id=admin.id,
        name="Demo Farm",
        description="A demonstration farm for testing",
        boundary_geojson="{\"type\":\"Polygon\",\"coordinates\":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}",
        latitude=40.7128,
        longitude=-74.0060,
        area_hectares=50.0,
        crop_id=crops[0].id,
        sowing_date=date(2024, 3, 15),
        soil_type="Loam",
        irrigation_type="Drip",
    )
    existing_farm = db.query(Farm).filter(Farm.user_id == admin.id, Farm.name == "Demo Farm").first()
    if not existing_farm:
        db.add(farm)

    db.commit()

