from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    scheme_id: UUID | None = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

