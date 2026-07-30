from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..notification import Notification
from ..schemas.notification import NotificationRead
from ..utils.database import get_db
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(notification_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(notification_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.patch("/read-all", response_model=list[NotificationRead])
def mark_all_notifications_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read == False).all()
    for notification in notifications:
        notification.read = True
    db.commit()
    return notifications
