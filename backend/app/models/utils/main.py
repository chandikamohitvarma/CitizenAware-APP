from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..routers import auth, users, schemes, applications, documents, notifications, ai
from .database import engine
from .. import application as application_model, scheme as scheme_model, user as user_model

app = FastAPI(title="CitizenAware Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


def create_tables() -> None:
    application_model.Base.metadata.create_all(bind=engine)
    scheme_model.Base.metadata.create_all(bind=engine)
    user_model.Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def startup_event() -> None:
    create_tables()
