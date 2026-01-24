import os
from dotenv import load_dotenv
from groq import AsyncGroq
from fastapi import FastAPI, Depends, HTTPException
from .database import engine, Base, SessionLocal
from .schemas import Task
from sqlalchemy.orm import Session
from . import crud

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


@app.get("/")
def health_check():
    return {"status": "System Operational"}


@app.post("/tasks")
async def create_task(task: Task, db: Session = Depends(get_db)):
    ai_summary = await get_ai_summary(task.description)
    task.summary = ai_summary
    new_task = crud.create_task(db, task)

    return new_task


@app.get("/tasks")
async def read_tasks(db: Session = Depends(get_db), status: str | None = None):
    tasks = crud.get_tasks(db, status)

    return tasks


@app.get("/tasks/{task_id}")
async def read_one(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.put("/tasks/{task_id}/complete")
async def mark_complete(task_id: int, db: Session = Depends(get_db)):
    task = crud.mark_complete(db, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    deleted_task = crud.delete_task(db, task_id)

    if not deleted_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return deleted_task
