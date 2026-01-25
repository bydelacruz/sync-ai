from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# connection String
DATABASE_URL = "postgresql://user:password@localhost/sync_ai_db"
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
