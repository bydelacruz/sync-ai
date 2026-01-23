import os
from dotenv import load_dotenv
from groq import AsyncGroq
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from database import engine, Base, TaskDB, SessionLocal
from sqlalchemy.orm import Session

# load environment variables from .env file
load_dotenv()

# create the Async Groq client
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

# Dependency


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


async def get_ai_summary(text: str):
    res = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "Summarize the following task description in 5 words or less",
            },
            {"role": "user", "content": text},
        ],
        model="llama-3.1-8b-instant",
    )

    return res.choices[0].message.content


class Task(BaseModel):
    title: str
    description: str
    status: str = "pending"
    summary: str | None = None

    model_config = ConfigDict(from_attributes=True)


@app.get("/")
def health_check():
    return {"status": "System Operational"}


@app.post("/tasks")
async def create_task(task: Task, db: Session = Depends(get_db)):
    ai_summary = await get_ai_summary(task.description)
    task.summary = ai_summary
    new_task = TaskDB(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.get("/tasks")
async def read_tasks(db: Session = Depends(get_db)):
    tasks = db.query(TaskDB).all()

    return tasks


@app.put("/tasks/{task_id}/complete")
async def mark_complete(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).get(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).get(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    deleted_task = Task.model_validate(task)
    db.delete(task)
    db.commit()

    return deleted_task
