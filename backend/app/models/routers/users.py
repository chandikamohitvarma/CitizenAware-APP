from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..user import User
from ..schemas.user import UserRead
from ..utils.database import get_db
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
