from sqlalchemy.orm import Session
from .models import TaskDB, UserDB
from .schemas import Task, UserCreate
from .auth import pwd_context


def create_user(db: Session, user: UserCreate):
    user.password = pwd_context.hash(user.password)
    new_user = UserDB(username=user.username, hashed_password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def create_task(db: Session, task: Task):
    new_task = TaskDB(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


def get_tasks(db: Session, status: str | None = None):
    query = db.query(TaskDB)

    if status:
        query = query.filter(TaskDB.status == status.upper())

    return query.all()


def get_task(db: Session, task_id: int):
    task = db.get(TaskDB, task_id)

    return task


def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)

    if not task:
        return None

    deleted_task = Task.model_validate(task)
    db.delete(task)
    db.commit()

    return deleted_task


def mark_complete(db: Session, task_id: int):
    task = get_task(db, task_id)

    if not task:
        return None

    task.status = "COMPLETED"
    db.commit()
    db.refresh(task)

    return task
