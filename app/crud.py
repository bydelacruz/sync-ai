from sqlalchemy.orm import Session
from .models import TaskDB, UserDB
from .schemas import Task, UserCreate
from .auth import get_password_hash, verify_password


def get_user_by_username(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()


def create_user(db: Session, user: UserCreate):
    user.password = get_password_hash(user.password)
    new_user = UserDB(username=user.username, hashed_password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, user: UserCreate):
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()

    if existing_user:
        if verify_password(user.password, existing_user.hashed_password):
            return existing_user
        else:
            return False
    return None


def create_task(db: Session, task: Task, user: UserDB, embeddings: list[float]):
    new_task = TaskDB(**task.model_dump(), owner_id=user.id, embeddings=embeddings)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


def get_tasks(db: Session, user: UserDB, status: str | None = None):
    query = db.query(TaskDB).filter(TaskDB.owner_id == user.id)

    if status:
        query = query.filter(TaskDB.status == status.upper())

    return query.all()


def get_task(db: Session, task_id: int, user: UserDB):
    task = db.get(TaskDB, task_id)

    if not task or task.owner_id != user.id:
        return None

    return task


def delete_task(db: Session, task_id: int, user: UserDB):
    task = get_task(db, task_id, user)

    if not task or not user:
        return None

    if task.owner_id != user.id:
        return None

    deleted_task = Task.model_validate(task)
    db.delete(task)
    db.commit()

    return deleted_task


def mark_complete(db: Session, task_id: int, user: UserDB):
    task = get_task(db, task_id, user)

    if not task or not user:
        return None
    if task.owner_id != user.id:
        return None

    task.status = "COMPLETED"
    db.commit()
    db.refresh(task)

    return task


def search_tasks(db: Session, user: UserDB, query_vector: list[float]):
    # 1. Calculate the distance (0 = identical, 2 = opposite)
    distance = TaskDB.embeddings.cosine_distance(query_vector)

    # 2. Build the query
    # We filter by owner FIRST for security
    # Then we filter by distance < 0.7 to remove irrelevant "noise"
    results = (
        db.query(TaskDB)
        .filter(TaskDB.owner_id == user.id)
        .filter(distance < 0.43)
        .order_by(distance)
        .limit(5)
        .all()
    )

    return results
