import pytest


def _register(client, email, password="testpass"):
    resp = client.post("/api/auth/register", json={"name": "Payer", "email": email, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_subscription_defaults_to_free(client):
    token = _register(client, "free@test.com")
    resp = client.get("/api/subscriptions", headers=_headers(token))
    assert resp.status_code == 200
    sub = resp.json()
    assert sub["plan"] == "FREE"
    assert sub["status"] == "ACTIVE"


def test_upgrade_returns_checkout_and_upgrades_mock(client):
    token = _register(client, "payer1@test.com")
    resp = client.post("/api/subscriptions/upgrade", headers=_headers(token), params={"plan": "FARMER"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["provider"] == "mock"
    assert body["mock"] is True
    assert body["checkout_url"] is not None

    resp = client.get("/api/subscriptions", headers=_headers(token))
    sub = resp.json()
    assert sub["plan"] == "FARMER"
    assert sub["status"] == "ACTIVE"


def test_upgrade_rejects_unknown_plan(client):
    token = _register(client, "payer2@test.com")
    resp = client.post("/api/subscriptions/upgrade", headers=_headers(token), params={"plan": "GOLD"})
    assert resp.status_code == 400
