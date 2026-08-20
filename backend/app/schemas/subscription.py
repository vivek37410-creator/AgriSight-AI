from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SubscriptionBase(BaseModel):
    plan: str
    status: str
    monthly_limit: int
    used_this_month: int = 0
    created_at: datetime | None = None


class Subscription(SubscriptionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
