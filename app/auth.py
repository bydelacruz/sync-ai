import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from .models import UserDB
from .database import get_db

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
SECRET_KEY = os.environ.get("SECRET_KEY", "temporarysupersemisecretkey")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")

oauth2_schema = OAuth2PasswordBearer(tokenUrl="users/login")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire

    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


def verify_token(token: str):
    try:
        token_data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return token_data
    except jwt.JWTError:
        return None


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_schema)
):
    verified = verify_token(token)

    if not verified:
        raise HTTPException(status_code=403, detail="access denied")

    user = db.get(UserDB, verified["sub"])

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
