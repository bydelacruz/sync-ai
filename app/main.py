from fastapi import FastAPI, Depends, HTTPException
from .database import engine, Base, get_db
from .schemas import Task, UserCreate, User
from sqlalchemy.orm import Session
from . import crud
from .services import get_ai_summary
from .auth import create_access_token, get_current_user
from .models import UserDB


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


@app.post("/users/login")
async def user_login(user: UserCreate, db: Session = Depends(get_db)):
    curr_user = crud.authenticate_user(db, user)

    if curr_user:
        token = create_access_token(
            {"sub": str(curr_user.id), "username": curr_user.username}
        )
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Incorrect username/password")


@app.post("/tasks")
async def create_task(
    task: Task,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    ai_summary = await get_ai_summary(task.description)
    task.summary = ai_summary
    new_task = crud.create_task(db, task, current_user)

    return new_task


@app.get("/tasks")
async def read_tasks(
    db: Session = Depends(get_db),
    status: str | None = None,
    current_user: UserDB = Depends(get_current_user),
):
    tasks = crud.get_tasks(db, current_user, status)

    return tasks


@app.get("/tasks/{task_id}")
async def read_one(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = crud.get_task(db, task_id, current_user)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.put("/tasks/{task_id}/complete")
async def mark_complete(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = crud.mark_complete(db, task_id, current_user)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    deleted_task = crud.delete_task(db, task_id, current_user)

    if not deleted_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return deleted_task
