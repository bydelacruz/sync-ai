from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from pgvector.sqlalchemy import Vector
from .schemas import TaskStatus
from .database import Base


class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(Enum(TaskStatus))
    summary = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("UserDB", back_populates="tasks")
    embeddings = Column(Vector(768))


class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    tasks = relationship("TaskDB", back_populates="user")
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
