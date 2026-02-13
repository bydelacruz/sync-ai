from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from .database import engine, Base, get_db
from .schemas import Task, UserCreate, User, TaskCreate, SearchRequest
from sqlalchemy.orm import Session
from sqlalchemy import text
from . import crud
from .services import get_ai_summary
from .auth import create_access_token, get_current_user
from .models import UserDB
from .ai import get_embedding
import os
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"starup database error: {e}")

    yield


app = FastAPI(lifespan=lifespan)

# Get the Frontend URL from env, default to localhost for development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    "http://localhost:5173",  # Local development
    FRONTEND_URL,  # Production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "System Operational"}


@app.post("/users", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # check if user already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

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


@app.post("/tasks", response_model=Task)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    ai_summary = await get_ai_summary(task.description)
    task.summary = ai_summary

    combine_text = f"{task.title}: {task.description}"
    embeddings = get_embedding(combine_text)

    new_task = crud.create_task(db, task, current_user, embeddings)

    return new_task


@app.get("/tasks", response_model=list[Task])
async def read_tasks(
    db: Session = Depends(get_db),
    status: str | None = None,
    current_user: UserDB = Depends(get_current_user),
):
    tasks = crud.get_tasks(db, current_user, status)

    return tasks


@app.get("/tasks/{task_id}", response_model=Task)
async def read_one(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = crud.get_task(db, task_id, current_user)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.put("/tasks/{task_id}/complete", response_model=Task)
async def mark_complete(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = crud.mark_complete(db, task_id, current_user)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@app.delete("/tasks/{task_id}", response_model=Task)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    deleted_task = crud.delete_task(db, task_id, current_user)

    if not deleted_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return deleted_task


@app.post("/search", response_model=list[Task])
async def search_tasks(
    search_request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    vectorized = get_embedding(search_request.search_term)
    tasks = crud.search_tasks(db, current_user, vectorized)

    return tasks
