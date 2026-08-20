from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import uuid
import os

from app.database.session import get_db
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, Farm as FarmSchema, FarmValidationResponse, FarmCreateResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.supabase_client import get_supabase_service_client
from app.geospatial.area import calculate_polygon_area, extract_center_and_bbox
from app.services.farm_validation import FarmValidationService

router = APIRouter()


def _supabase_enabled() -> bool:
    return get_supabase_service_client() is not None


def _farm_from_supabase_row(row: dict) -> FarmSchema:
    return FarmSchema(
        id=row["id"],
        user_id=row["user_id"],
        name=row["name"],
        description=row.get("description"),
        boundary_geojson=row.get("boundary_geojson"),
        latitude=row.get("latitude"),
        longitude=row.get("longitude"),
        area_hectares=row.get("area_hectares"),
        crop_id=row.get("crop_id"),
        sowing_date=row.get("sowing_date"),
        soil_type=row.get("soil_type"),
        irrigation_type=row.get("irrigation_type"),
        photo_url=row.get("photo_url"),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def _ensure_farm_photo_url_column(db: Session) -> None:
    try:
        db.execute(text("ALTER TABLE farms ADD COLUMN photo_url VARCHAR"))
        db.commit()
    except Exception:
        db.rollback()


@router.post("", response_model=FarmCreateResponse)
def create_farm(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validation_service = FarmValidationService()
    crop_name = None
    soil_type = farm_in.soil_type
    if farm_in.crop_id:
        from app.models.crop import Crop
        crop = db.query(Crop).filter(Crop.id == farm_in.crop_id).first()
        if crop:
            crop_name = crop.name
    validation = validation_service.validate(crop_name, soil_type)

    if _supabase_enabled():
        client = get_supabase_service_client()
        payload = farm_in.model_dump()
        payload["user_id"] = current_user.id
        result = client.table("farms").insert(payload).execute()
        data = result.data
        if not data:
            raise HTTPException(status_code=500, detail="Failed to create farm in Supabase")
        farm = _farm_from_supabase_row(data[0])
    else:
        _ensure_farm_photo_url_column(db)
        payload = farm_in.model_dump()
        farm = Farm(**payload, user_id=current_user.id)
        if farm.boundary_geojson:
            area = calculate_polygon_area(farm.boundary_geojson)
            if area is not None:
                farm.area_hectares = area
            latitude, longitude, bbox = extract_center_and_bbox(farm.boundary_geojson)
            if latitude is not None and longitude is not None:
                farm.latitude = latitude
                farm.longitude = longitude
        db.add(farm)
        db.commit()
        db.refresh(farm)

    validation_service.record_validation(
        user_id=current_user.id,
        farm_name=farm.name,
        crop=crop_name or "",
        soil_type=soil_type or "",
        result=validation,
    )

    return FarmCreateResponse(farm=farm, validation=FarmValidationResponse(**validation))


@router.post("/validate", response_model=FarmValidationResponse)
def validate_farm(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crop_id = payload.get("crop_id")
    soil_type = payload.get("soil_type")
    crop_name = None
    if crop_id:
        from app.models.crop import Crop
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if crop:
            crop_name = crop.name
    validation_service = FarmValidationService()
    result = validation_service.validate(crop_name, soil_type)
    return FarmValidationResponse(**result)


@router.post("/upload-photo", response_model=dict)
async def upload_farm_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    client = get_supabase_service_client()
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid image type. Use JPG, PNG, or WebP.")

    if client:
        ext = os.path.splitext(file.filename or "")[1] or ".jpg"
        storage_path = f"farm-photos/{current_user.id}/{uuid.uuid4().hex}{ext}"
        file_bytes = await file.read()
        upload_result = client.storage.from_("farm-photos").upload(storage_path, file_bytes, {"content-type": file.content_type})
        if upload_result.get("error"):
            raise HTTPException(status_code=500, detail="Failed to upload photo")
        public_url = client.storage.from_("farm-photos").get_public_url(storage_path)
        return {"photo_url": public_url}

    upload_dir = os.path.join("uploads", "farm-photos", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    photo_url = f"/static/farm-photos/{current_user.id}/{filename}"
    return {"photo_url": photo_url}


@router.get("", response_model=List[FarmSchema])
def list_farms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if _supabase_enabled():
        client = get_supabase_service_client()
        result = client.table("farms").select("*").eq("user_id", current_user.id).execute()
        return [_farm_from_supabase_row(row) for row in result.data]

    return db.query(Farm).filter(Farm.user_id == current_user.id).all()


@router.get("/{farm_id}", response_model=FarmSchema)
def get_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if _supabase_enabled():
        client = get_supabase_service_client()
        result = client.table("farms").select("*").eq("id", farm_id).eq("user_id", current_user.id).execute()
        rows = result.data
        if not rows:
            raise HTTPException(status_code=404, detail="Farm not found")
        return _farm_from_supabase_row(rows[0])

    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


@router.put("/{farm_id}", response_model=FarmSchema)
def update_farm(farm_id: int, farm_in: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if _supabase_enabled():
        client = get_supabase_service_client()
        payload = farm_in.model_dump(exclude_unset=True)
        result = client.table("farms").update(payload).eq("id", farm_id).eq("user_id", current_user.id).execute()
        rows = result.data
        if not rows:
            raise HTTPException(status_code=404, detail="Farm not found")
        return _farm_from_supabase_row(rows[0])

    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    for field, value in farm_in.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
    if farm.boundary_geojson:
        area = calculate_polygon_area(farm.boundary_geojson)
        if area is not None:
            farm.area_hectares = area
        latitude, longitude, bbox = extract_center_and_bbox(farm.boundary_geojson)
        if latitude is not None and longitude is not None:
            farm.latitude = latitude
            farm.longitude = longitude
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}")
def delete_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if _supabase_enabled():
        client = get_supabase_service_client()
        result = client.table("farms").delete().eq("id", farm_id).eq("user_id", current_user.id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Farm not found")
        return {"detail": "Farm deleted"}

    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(farm)
    db.commit()
    return {"detail": "Farm deleted"}
