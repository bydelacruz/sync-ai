import os
from dotenv import load_dotenv
from groq import AsyncGroq
from fastapi import FastAPI
from pydantic import BaseModel

# load environment variables from .env file
load_dotenv()

# create the Async Groq client
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

app = FastAPI()
tasks_db = []


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
async def create_task(task: Task):
    ai_summary = await get_ai_summary(task.description)
    task.summary = ai_summary
    tasks_db.append(task)
    return task
