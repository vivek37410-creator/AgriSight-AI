from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop
from app.services.excel_assistant import get_assistant_service

router = APIRouter()


class AssistantQuery(BaseModel):
    question: str
    farm_id: Optional[int] = None
    crop: Optional[str] = None
    language: Optional[str] = "en"


class AssistantResponse(BaseModel):
    success: bool
    answer: str
    recommendation: Optional[str]
    category: Optional[str]
    topic: Optional[str]
    crop: Optional[str]
    confidence: float
    severity: Optional[str]
    alternatives: Optional[list] = None


@router.post("/assistant/ask", response_model=AssistantResponse)
def ask_assistant(query: AssistantQuery, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = None
    if query.farm_id:
        farm = db.query(Farm).filter(Farm.id == query.farm_id, Farm.user_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found")

    crop = query.crop
    if not crop and farm:
        if farm.crop_id:
            crop_obj = db.query(Crop).filter(Crop.id == farm.crop_id).first()
            if crop_obj:
                crop = crop_obj.name

    service = get_assistant_service()
    result = service.ask(
        question=query.question,
        crop=crop,
        language=query.language or "en",
    )

    if farm and result.get("success"):
        farm_context = f"\n\nBased on your farm '{farm.name}'"
        if farm.soil_type:
            farm_context += f" with {farm.soil_type} soil"
        if farm.irrigation_type:
            farm_context += f" and {farm.irrigation_type} irrigation"
        result["answer"] = result["answer"] + farm_context

    return result


@router.get("/assistant/status")
def assistant_status(current_user: User = Depends(get_current_user)):
    from app.services.excel_assistant import _assistant_service
    total = len(_assistant_service._entries) if _assistant_service else 0
    return {
        "status": "ok",
        "knowledge_entries": total,
        "provider": "excel_tfidf",
        "model": "TF-IDF + Cosine Similarity",
    }
