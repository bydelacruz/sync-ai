import os
from dotenv import load_dotenv
from groq import AsyncGroq
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
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
