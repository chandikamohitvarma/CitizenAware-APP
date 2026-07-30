from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..document import Document
from ..schemas.application import ApplicationRead
from ..utils.database import get_db
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[ApplicationRead])
def list_documents(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Document).filter(Document.user_id == current_user.id).all()


@router.get("/{document_id}", response_model=ApplicationRead)
def get_document(document_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
