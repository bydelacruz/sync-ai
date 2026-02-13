from .config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# creat the engine
engine = create_engine(settings.DATABASE_URL)
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
