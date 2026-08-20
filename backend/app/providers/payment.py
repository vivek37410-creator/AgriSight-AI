from typing import Dict, Any, Optional
import uuid

from app.core.config import settings


PLAN_MONTHLY_LIMITS: Dict[str, int] = {
    "FREE": 1,
    "FARMER": 10,
    "PROFESSIONAL": 100,
    "ENTERPRISE": -1,
}

LEAF_ANALYSIS_MONTHLY_LIMITS: Dict[str, int] = {
    "FREE": 3,
    "FARMER": 20,
    "PROFESSIONAL": 100,
    "ENTERPRISE": -1,
}


class PaymentProvider:
    def create_checkout_session(
        self, user_id: int, plan: str, success_url: str, cancel_url: str
    ) -> Dict[str, Any]:
        raise NotImplementedError

    def handle_webhook(self, payload: bytes, sig_header: Optional[str] = None) -> Dict[str, Any]:
        raise NotImplementedError


class MockPaymentProvider(PaymentProvider):
    PROVIDER = "mock"

    def create_checkout_session(
        self, user_id: int, plan: str, success_url: str, cancel_url: str
    ) -> Dict[str, Any]:
        session_id = "mock_" + uuid.uuid4().hex
        return {
            "id": session_id,
            "url": success_url,
            "provider": self.PROVIDER,
            "mock": True,
            "plan": plan,
            "mock_completed": True,
        }

    def handle_webhook(self, payload: bytes, sig_header: Optional[str] = None) -> Dict[str, Any]:
        import json

        try:
            data = json.loads(payload)
            if isinstance(data, dict) and data.get("type") == "checkout.session.completed":
                obj = data.get("data", {}).get("object", {})
                return {
                    "provider": self.PROVIDER,
                    "event_type": "checkout.session.completed",
                    "plan": obj.get("metadata", {}).get("plan"),
                    "user_id": obj.get("metadata", {}).get("user_id"),
                    "session_id": obj.get("id"),
                }
        except Exception:
            pass
        return {"provider": self.PROVIDER, "event_type": None}


class StripePaymentProvider(PaymentProvider):
    PROVIDER = "stripe"

    def _price_for_plan(self, plan: str) -> Optional[str]:
        return {
            "FARMER": settings.STRIPE_PRICE_FARMER,
            "PROFESSIONAL": settings.STRIPE_PRICE_PROFESSIONAL,
            "ENTERPRISE": settings.STRIPE_PRICE_ENTERPRISE,
        }.get(plan)

    def _stripe(self):
        import stripe

        stripe.api_key = settings.STRIPE_SECRET_KEY
        return stripe

    def create_checkout_session(
        self, user_id: int, plan: str, success_url: str, cancel_url: str
    ) -> Dict[str, Any]:
        stripe = self._stripe()
        price = self._price_for_plan(plan)
        if not price:
            raise ValueError(f"No Stripe price configured for plan '{plan}'.")
        checkout = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price, "quantity": 1}],
            metadata={"user_id": str(user_id), "plan": plan},
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
        )
        return {
            "id": checkout.id,
            "url": checkout.url,
            "provider": self.PROVIDER,
            "mock": False,
            "plan": plan,
            "mock_completed": False,
        }

    def handle_webhook(self, payload: bytes, sig_header: Optional[str] = None) -> Dict[str, Any]:
        stripe = self._stripe()
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        obj = event["data"].get("object", {}) if event.get("data") else {}
        metadata = obj.get("metadata", {}) or {}
        return {
            "provider": self.PROVIDER,
            "event_type": event["type"],
            "plan": metadata.get("plan"),
            "user_id": metadata.get("user_id"),
            "session_id": obj.get("id"),
        }


def get_payment_provider() -> PaymentProvider:
    if settings.PAYMENT_PROVIDER == "stripe" and settings.STRIPE_SECRET_KEY:
        return StripePaymentProvider()
    return MockPaymentProvider()
