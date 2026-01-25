import os
from dotenv import load_dotenv
import pytest
from app.database import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db
from fastapi.testclient import TestClient


load_dotenv()

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


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


@pytest.fixture(scope="function", autouse=True)
def clean_db():
    # SETUP: Create all tables to ensure they exist
    Base.metadata.create_all(bind=test_engine)

    yield  # This pauses execution while the test runs

    # TEARDOWN: Drop all tables to wipe the data
    Base.metadata.drop_all(bind=test_engine)
