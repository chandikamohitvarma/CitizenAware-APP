from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..application import Application
from ..schemas.application import ApplicationCreate, ApplicationRead
from ..utils.database import get_db
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=ApplicationRead)
@router.post("/", response_model=ApplicationRead)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_application = Application(
        user_id=current_user.id,
        scheme_id=application.scheme_id,
        personal_data=application.personal_data,
        address_data=application.address_data,
        bank_data=application.bank_data,
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("", response_model=list[ApplicationRead])
@router.get("/", response_model=list[ApplicationRead])
def list_applications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Application).filter(Application.user_id == current_user.id).all()


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = db.query(Application).filter(Application.id == application_id, Application.user_id == current_user.id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
