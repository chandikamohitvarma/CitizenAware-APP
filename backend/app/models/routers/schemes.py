from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..scheme import Scheme
from ..schemas.scheme import SchemeRead
from ..utils.database import get_db

router = APIRouter()


@router.get("", response_model=list[SchemeRead])
@router.get("/", response_model=list[SchemeRead])
def list_schemes(db: Session = Depends(get_db)):
    return db.query(Scheme).all()


@router.get("/{scheme_id}", response_model=SchemeRead)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    return db.query(Scheme).filter(Scheme.id == scheme_id).first()
