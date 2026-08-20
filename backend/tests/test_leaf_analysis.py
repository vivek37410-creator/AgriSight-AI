import io
from PIL import Image

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

import main
from app.database.session import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.core.security import get_password_hash


def _make_user(db: Session) -> User:
    user = User(name="Leaf User", email="leaf@test.com", hashed_password=get_password_hash("leafpass"), role="user")
    db.add(user)
    db.flush()
    db.add(Subscription(user_id=user.id, plan="FARMER", status="ACTIVE", monthly_limit=20, used_this_month=0))
    db.commit()
    db.refresh(user)
    return user


def _auth_headers(client: TestClient, user: User) -> dict:
    resp = client.post("/api/auth/login", json={"username": user.email, "password": "leafpass"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _make_image() -> bytes:
    img = Image.new("RGB", (224, 224), color="green")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_analyze_leaf_requires_auth(client: TestClient):
    img = _make_image()
    resp = client.post("/api/leaf/analyze", files={"file": ("test.jpg", img, "image/jpeg")})
    if main.settings.DEMO_MODE:
        assert resp.status_code == 200
    else:
        assert resp.status_code == 401


def test_analyze_leaf_success(client: TestClient, db: Session):
    user = _make_user(db)
    headers = _auth_headers(client, user)
    img = _make_image()
    resp = client.post("/api/leaf/analyze", headers=headers, files={"file": ("test.jpg", img, "image/jpeg")})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "crop" in data
    assert "condition" in data
    assert "model_version" in data


def test_analyze_leaf_with_farm_id(client: TestClient, db: Session):
    user = _make_user(db)
    headers = _auth_headers(client, user)
    img = _make_image()
    resp = client.post("/api/leaf/analyze", headers=headers, params={"farm_id": 1}, files={"file": ("test.jpg", img, "image/jpeg")})
    assert resp.status_code in (200, 404)


def test_analyze_leaf_invalid_file(client: TestClient, db: Session):
    user = _make_user(db)
    headers = _auth_headers(client, user)
    resp = client.post("/api/leaf/analyze", headers=headers, files={"file": ("test.txt", b"hello", "text/plain")})
    assert resp.status_code == 400


def test_leaf_history_empty(client: TestClient, db: Session):
    user = _make_user(db)
    headers = _auth_headers(client, user)
    resp = client.get("/api/leaf/history", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_leaf_history_after_analysis(client: TestClient, db: Session):
    user = _make_user(db)
    headers = _auth_headers(client, user)
    img = _make_image()
    client.post("/api/leaf/analyze", headers=headers, files={"file": ("test.jpg", img, "image/jpeg")})
    resp = client.get("/api/leaf/history", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["status"] == "success"
