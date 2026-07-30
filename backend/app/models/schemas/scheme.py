from uuid import UUID
from pydantic import BaseModel


class SchemeBase(BaseModel):
    name: str
    description: str | None = None
    category: str
    eligibility: dict | None = None
    documents_required: list[str] | None = None
    featured: bool = False


class SchemeRead(SchemeBase):
    id: UUID

    class Config:
        from_attributes = True

