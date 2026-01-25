from sqlalchemy import Column, Integer, String, Enum
from .schemas import TaskStatus
from .database import Base


class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(Enum(TaskStatus))
    summary = Column(String, nullable=True)
