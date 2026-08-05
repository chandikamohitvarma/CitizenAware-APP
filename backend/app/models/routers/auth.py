import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from ..schemas.auth import UserCreate, Token, PasswordResetRequest, PasswordResetConfirm
from ..schemas.user import UserRead
from ..user import User
from ..utils.database import get_db
from ..utils.auth import get_password_hash, verify_password, create_access_token
from ..utils.config import settings

# uvicorn is launched from project/backend/, so 'services' is on sys.path
from services.otp_service import OTPService, OTPProviderManager  # noqa: E402

logger = logging.getLogger("auth_router")

router = APIRouter()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.strip().lower()).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email.strip().lower(),
        name=user.name.strip(),
        phone=user.phone.strip() if user.phone else None,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ─── Standard auth endpoints ───────────────────────────────────────────────────

@router.post("/register", response_model=UserRead)
@router.post("/register/", response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"[Auth] Register attempt for: {user.email}")
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = create_user(db, user)
    logger.info(f"[Auth] Registered user id={db_user.id}")
    return db_user


@router.post("/login", response_model=Token)
@router.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"[Auth] Login attempt for: {form_data.username}")
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"[Auth] Login failed — invalid credentials: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(
        data={"sub": str(user.id)},
        secret_key=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    logger.info(f"[Auth] Login successful for user id={user.id}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    logger.info(f"[Auth] Password-reset-request for: {request.email}")
    result = OTPService.generate_otp(request.email)
    if not result.get("success"):
        logger.error(f"[Auth] Password-reset OTP send failed: {result.get('message')}")
        raise HTTPException(status_code=503, detail=result.get("message", "Failed to send OTP."))
    return {"message": "Verification code sent to email.", "success": True}


@router.post("/password-reset")
def password_reset(reset: PasswordResetConfirm, db: Session = Depends(get_db)):
    logger.info(f"[Auth] Password-reset for: {reset.email}")
    user = get_user_by_email(db, reset.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(reset.password)
    db.commit()
    logger.info(f"[Auth] Password reset complete for user id={user.id}")
    return {"message": "Password has been reset successfully."}


# ─── OTP schemas ──────────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str | None = None
    email: str | None = None


class VerifyOTPRequest(BaseModel):
    phone: str | None = None
    email: str | None = None
    otp: str


# ─── GET /auth/otp-providers-status ───────────────────────────────────────────

@router.get("/otp-providers-status")
def get_otp_providers_status():
    """Returns which OTP providers are currently configured."""
    info = OTPProviderManager.detect_providers()
    logger.info(f"[Auth] OTP providers status: {info['configured_providers']}")
    return info


# ─── POST /auth/send-otp (Email-only delivery via Gmail SMTP) ─────────────────

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    # Requirement: Ignore phone number if email is present
    target_email = (req.email or "").strip().lower()

    if not target_email and req.phone:
        clean_phone = req.phone.strip()
        if "@" in clean_phone:
            target_email = clean_phone.lower()
        else:
            # Look up registered user by phone to obtain their email address
            user = db.query(User).filter(User.phone == clean_phone).first()
            if user and user.email:
                target_email = user.email.strip().lower()

    if not target_email or "@" not in target_email:
        raise HTTPException(
            status_code=400,
            detail="A valid email address is required to send OTP via email.",
        )

    logger.info(f"[Auth] send-otp request for email target: {target_email}")

    result = OTPService.generate_otp(target_email)
    logger.info(f"[Auth] send-otp result for {target_email}: success={result.get('success')}")

    if not result.get("success"):
        http_status = 429 if result.get("cooldown_remaining") else 503
        raise HTTPException(status_code=http_status, detail=result.get("message", "Failed to send OTP."))

    return {
        "success": True,
        "message": result["message"],
        "expires_in_seconds": result.get("expires_in_seconds", 300),
        "resend_cooldown_seconds": result.get("resend_cooldown_seconds", 30),
        "providers_status": result.get("providers_status", {}),
    }


# ─── POST /auth/verify-otp ────────────────────────────────────────────────────

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    target_email = (req.email or "").strip().lower()
    otp_code = (req.otp or "").strip()

    if not target_email and req.phone:
        clean_phone = req.phone.strip()
        if "@" in clean_phone:
            target_email = clean_phone.lower()
        else:
            user = db.query(User).filter(User.phone == clean_phone).first()
            if user and user.email:
                target_email = user.email.strip().lower()
            else:
                target_email = clean_phone.lower()

    if not target_email or not otp_code:
        raise HTTPException(
            status_code=400,
            detail="Both email target and OTP code are required.",
        )

    logger.info(f"[Auth] verify-otp request for: {target_email}")
    val_res = OTPService.verify_otp(target_email, otp_code)

    if not val_res.get("success") and req.phone and req.phone.strip() != target_email:
        alt_res = OTPService.verify_otp(req.phone.strip().lower(), otp_code)
        if alt_res.get("success"):
            val_res = alt_res

    if not val_res.get("success"):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "OTP_INVALID",
                "message": val_res.get("message", "OTP verification failed."),
                "remaining_attempts": val_res.get("remaining_attempts"),
            },
        )

    # Issue JWT token on successful verification
    user = get_user_by_email(db, target_email)
    if not user and req.phone:
        user = db.query(User).filter(User.phone == req.phone.strip()).first()

    sub_val = str(user.id) if user else f"user-{target_email}"

    access_token = create_access_token(
        data={"sub": sub_val},
        secret_key=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    logger.info(f"[Auth] verify-otp JWT issued for {target_email} (sub={sub_val})")

    return {
        "success": True,
        "message": "OTP verified successfully!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": sub_val,
            "email": user.email if user else (target_email if "@" in target_email else None),
            "phone": user.phone if user else (req.phone if req.phone else None),
            "name": user.name if user else target_email.split("@")[0],
        },
    }
