from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..schemas.auth import UserCreate, Token, PasswordResetRequest, PasswordResetConfirm
from ..schemas.user import UserRead
from ..user import User
from ..utils.database import get_db
from ..utils.auth import get_password_hash, verify_password, create_access_token
from ..utils.config import settings

router = APIRouter()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        phone=user.phone,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/register", response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        secret_key=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user:
        # avoid revealing whether the email exists
        return {"message": "If the email is registered, reset instructions have been sent."}

    return {"message": "If the email is registered, reset instructions have been sent."}


@router.post("/password-reset")
def password_reset(reset: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = get_user_by_email(db, reset.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(reset.password)
    db.commit()
    return {"message": "Password has been reset successfully."}
