from pydantic import BaseModel, ConfigDict


class AssistantQuery(BaseModel):
    query: str
    farm_id: int | None = None


class AssistantResponse(BaseModel):
    summary: str
    main_risk: str | None = None
    explanation: str
    recommendations: list[str]
    confidence_note: str | None = None
