import os
from dotenv import load_dotenv
import pytest
from app.database import Base
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from fastapi.testclient import TestClient
from unittest.mock import patch


load_dotenv()

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture(autouse=True)
def mock_ai_embedding():
    with patch("app.ai.get_embedding") as mock:
        mock.return_value = [0.0] * 768
        yield mock


@pytest.fixture
def client():
    # 1. Define the override function inner function
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    # 2. Apply the override to the app
    app.dependency_overrides[get_db] = override_get_db

    # 3. Create the TestClient(app) and yield it
    yield TestClient(app)

    # 4. Cleanup: Remove the override (optional but good practice)
    app.dependency_overrides.clear()


@pytest.fixture
def test_task(client, token):
    res = client.post(
        "/tasks",
        json={"title": "groceries", "description": "get milk when i get out of work"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    yield res.json()


@pytest.fixture(scope="function", autouse=True)
def clean_db():
    with test_engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.commit()

    # SETUP: Create all tables to ensure they exist
    Base.metadata.create_all(bind=test_engine)

    yield  # This pauses execution while the test runs

    # TEARDOWN: Drop all tables to wipe the data
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def token(client):
    user = {"username": "benny", "password": "password123"}
    res = client.post("/users", json=user)
    assert res.status_code == 200

    res2 = client.post("/users/login", json=user)
    assert res2.status_code == 200

    yield res2.json()["access_token"]


@pytest.fixture
def attacker_token(client):
    user = {"username": "evilbenny", "password": "password123"}
    res = client.post("/users", json=user)
    assert res.status_code == 200

    res2 = client.post("/users/login", json=user)
    assert res2.status_code == 200

    yield res2.json()["access_token"]
