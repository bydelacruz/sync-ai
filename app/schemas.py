from pydantic import BaseModel, ConfigDict


class Task(BaseModel):
    title: str
    description: str
    status: str = "pending"
    summary: str | None = None

    model_config = ConfigDict(from_attributes=True)
