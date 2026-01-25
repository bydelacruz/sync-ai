from fastapi import FastAPI, Depends, HTTPException
from .database import engine, Base, get_db
from .schemas import Task, UserCreate, User
from sqlalchemy.orm import Session
from . import crud
from .services import get_ai_summary


# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def health_check():
    return {"status": "System Operational"}


@app.post("/users", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = crud.create_user(db, user)

    return new_user


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
