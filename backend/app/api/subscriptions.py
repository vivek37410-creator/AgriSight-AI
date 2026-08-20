from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import Subscription as SubscriptionSchema
from app.api.deps import get_current_user
from app.providers.payment import get_payment_provider, PLAN_MONTHLY_LIMITS
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=SubscriptionSchema)
def get_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        sub = Subscription(user_id=current_user.id, plan="FREE", status="ACTIVE", monthly_limit=1, used_this_month=0)
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@router.post("/upgrade")
def upgrade_subscription(
    plan: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = plan.upper()
    if plan not in PLAN_MONTHLY_LIMITS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown plan: {plan}")

    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        sub = Subscription(user_id=current_user.id, plan="FREE", status="ACTIVE", monthly_limit=1, used_this_month=0)
        db.add(sub)

    provider = get_payment_provider()
    success_url = f"{settings.APP_URL}/billing"
    cancel_url = f"{settings.APP_URL}/billing"
    session = provider.create_checkout_session(current_user.id, plan, success_url, cancel_url)

    if session.get("mock"):
        sub.plan = plan
        sub.status = "ACTIVE"
        sub.monthly_limit = PLAN_MONTHLY_LIMITS.get(plan, sub.monthly_limit)
        db.commit()
        db.refresh(sub)

    return {
        "checkout_url": session["url"],
        "session_id": session["id"],
        "provider": session["provider"],
        "mock": session.get("mock", False),
        "plan": plan,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    provider = get_payment_provider()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        result = provider.handle_webhook(payload, sig_header)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    if result.get("event_type") != "checkout.session.completed":
        return {"detail": "ignored"}

    return {"detail": "processing", "result": result}
