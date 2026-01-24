from sqlalchemy import Column, Integer, String
from database import Base


class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="pending")
    summary = Column(String, nullable=True)
