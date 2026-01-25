from pydantic import BaseModel, ConfigDict
from enum import Enum


class TaskStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Task(BaseModel):
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    summary: str | None = None

    model_config = ConfigDict(from_attributes=True)
