import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# connection String
DATABASE_URL = os.environ.get("DATABASE_URL")
# creat the engine
engine = create_engine(DATABASE_URL)
# create the session local class
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
# create the base class
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
