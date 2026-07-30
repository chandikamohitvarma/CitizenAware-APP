import uuid
from sqlalchemy import Column, String, Text, Boolean, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID

from .utils.database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    eligibility = Column(JSON)
    documents_required = Column(ARRAY(String), default=[])
    featured = Column(Boolean, default=False)
