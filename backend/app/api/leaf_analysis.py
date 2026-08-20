from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.leaf_analysis import LeafAnalysis
from app.schemas.leaf_analysis import LeafAnalysis as LeafAnalysisSchema
from app.services.leaf_analysis import LeafAnalysisService

router = APIRouter()


@router.post("/analyze", response_model=dict)
def analyze_leaf(
    farm_id: Optional[int] = Form(None),
    crop_override: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith(("image/",)):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    try:
        file_bytes = file.file.read()
    finally:
        file.file.close()

    service = LeafAnalysisService()
    result = service.analyze_leaf(
        user=current_user,
        file_bytes=file_bytes,
        filename=file.filename or "upload.jpg",
        farm_id=farm_id,
        crop_override=crop_override,
        latitude=latitude,
        longitude=longitude,
        db=db,
    )

    if "detail" in result:
        raise HTTPException(status_code=403, detail=result["detail"])
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message", "Invalid image."))

    return result


@router.get("/history", response_model=list[LeafAnalysisSchema])
def get_leaf_history(
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(LeafAnalysis).filter(LeafAnalysis.user_id == current_user.id)
    if farm_id is not None:
        query = query.filter(LeafAnalysis.farm_id == farm_id)
    return query.order_by(LeafAnalysis.created_at.desc()).limit(50).all()


@router.get("/{analysis_id}", response_model=LeafAnalysisSchema)
def get_leaf_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(LeafAnalysis).filter(LeafAnalysis.id == analysis_id, LeafAnalysis.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return record
