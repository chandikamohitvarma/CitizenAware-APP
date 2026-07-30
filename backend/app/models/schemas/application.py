from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ApplicationBase(BaseModel):
    scheme_id: UUID
    personal_data: dict | None = None
    address_data: dict | None = None
    bank_data: dict | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: UUID
    user_id: UUID
    status: str
    current_step: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

