import os
import time
import random
import logging
from typing import Dict, Any

logger = logging.getLogger("otp_service")

def _load_dotenv() -> None:
    """Load .env file into os.environ."""
    try:
        from dotenv import load_dotenv as _ld
        here = os.path.dirname(os.path.abspath(__file__))
        for _ in range(6):
            candidate = os.path.join(here, ".env")
            if os.path.isfile(candidate):
                _ld(candidate, override=False)
                return
            here = os.path.dirname(here)
    except ImportError:
        pass

    here = os.path.dirname(os.path.abspath(__file__))
    for _ in range(6):
        candidate = os.path.join(here, ".env")
        if os.path.isfile(candidate):
            with open(candidate, encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, val = line.partition("=")
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val
            return
        here = os.path.dirname(here)

_load_dotenv()

# In-memory OTP storage
# Schema: { email: { "code": str, "expires_at": float, "attempts": int, "last_sent_at": float } }
OTP_STORE: Dict[str, Dict[str, Any]] = {}

OTP_EXPIRATION_SECONDS = 300      # 5 minutes
MAX_VERIFICATION_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30


class OTPProviderManager:
    """Email-only OTP Provider status manager."""

    @staticmethod
    def detect_providers() -> Dict[str, Any]:
        smtp_user = os.getenv("MAIL_USERNAME", "").strip()
        smtp_pass = os.getenv("MAIL_PASSWORD", "").strip()
        configured = ["SMTP_Email"] if (smtp_user and smtp_pass) else []

        return {
            "configured_providers": configured,
            "has_sms_provider": False,
            "has_email_provider": bool(configured),
            "delivery_channel": "email",
            "note": "OTP delivery uses Gmail SMTP email. SMS providers are not required.",
        }


class OTPService:

    @staticmethod
    def generate_otp(identifier: str) -> Dict[str, Any]:
        """
        Generates a 6-digit OTP with 5-minute expiry and 30-second resend cooldown.
        Sends the OTP exclusively via email using Gmail SMTP.
        """
        clean_id = identifier.strip().lower()
        now = time.time()

        logger.info(f"[OTP] Generate OTP request for email target: {clean_id}")

        if "@" not in clean_id or "." not in clean_id:
            return {"success": False, "message": "A valid email address is required for OTP delivery."}

        # ── Resend Cooldown Check (30 seconds) ────────────────────────────────
        if clean_id in OTP_STORE:
            existing = OTP_STORE[clean_id]
            elapsed = now - existing.get("last_sent_at", 0)
            if elapsed < RESEND_COOLDOWN_SECONDS:
                remaining = int(RESEND_COOLDOWN_SECONDS - elapsed)
                logger.warning(f"[OTP] Cooldown active for {clean_id} — wait {remaining}s")
                return {
                    "success": False,
                    "message": f"Please wait {remaining} seconds before requesting a new OTP.",
                    "cooldown_remaining": remaining,
                }

        # ── Generate 6-Digit OTP ─────────────────────────────────────────────
        code = str(random.randint(100000, 999999))
        expires_at = now + OTP_EXPIRATION_SECONDS

        OTP_STORE[clean_id] = {
            "code": code,
            "expires_at": expires_at,
            "attempts": 0,
            "last_sent_at": now,
        }
        logger.info(f"[OTP] Generated code for {clean_id}: (last 2 digits **{code[-2:]})")

        # ── Dispatch via Gmail SMTP Email ─────────────────────────────────────
        try:
            from app.models.utils.email import send_otp_email
        except ImportError:
            from ..app.models.utils.email import send_otp_email

        logger.info(f"[OTP] Dispatching email OTP to {clean_id}")
        email_ok = send_otp_email(clean_id, code)

        if not email_ok:
            logger.error(f"[OTP] Email dispatch failed for {clean_id}")
            OTP_STORE.pop(clean_id, None)
            return {
                "success": False,
                "message": "Failed to send OTP email via Gmail SMTP. Please verify MAIL_USERNAME and MAIL_PASSWORD in .env.",
            }

        logger.info(f"[OTP] OTP email sent successfully to {clean_id}")
        return {
            "success": True,
            "message": f"Verification code sent to {clean_id}.",
            "expires_in_seconds": OTP_EXPIRATION_SECONDS,
            "resend_cooldown_seconds": RESEND_COOLDOWN_SECONDS,
            "providers_status": OTPProviderManager.detect_providers(),
        }

    @staticmethod
    def verify_otp(identifier: str, input_otp: str) -> Dict[str, Any]:
        """
        Verifies 6-digit OTP against active store.
        Enforces 5-minute expiration and max 5 attempts.
        Deletes the OTP record upon successful verification.
        """
        clean_id   = identifier.strip().lower()
        clean_code = input_otp.strip()
        now        = time.time()

        logger.info(f"[OTP] Verify OTP request for target: {clean_id}")

        if clean_id not in OTP_STORE:
            logger.warning(f"[OTP] Verify failed — no active OTP for {clean_id}")
            return {
                "success": False,
                "message": "No active OTP found. Please request a new verification code.",
            }

        record = OTP_STORE[clean_id]

        # ── 1. Expiration Check (5 minutes) ────────────────────────────────────
        if now > record["expires_at"]:
            OTP_STORE.pop(clean_id, None)
            logger.warning(f"[OTP] Verify failed — OTP expired for {clean_id}")
            return {
                "success": False,
                "message": "OTP verification code has expired after 5 minutes. Please request a new code.",
            }

        # ── 2. Attempts Check (Max 5 attempts) ─────────────────────────────────
        record["attempts"] += 1
        remaining = MAX_VERIFICATION_ATTEMPTS - record["attempts"]

        if record["attempts"] > MAX_VERIFICATION_ATTEMPTS:
            OTP_STORE.pop(clean_id, None)
            logger.warning(f"[OTP] Verify failed — max attempts (5) exceeded for {clean_id}")
            return {
                "success": False,
                "message": "Maximum verification attempts exceeded (5/5). Please request a new OTP.",
            }

        # ── 3. Code Match Check ────────────────────────────────────────────────
        if record["code"] == clean_code:
            OTP_STORE.pop(clean_id, None)  # Delete OTP after successful verification!
            logger.info(f"[OTP] Verification SUCCESS for {clean_id}")
            return {
                "success": True,
                "message": "OTP verified successfully!",
            }

        logger.warning(f"[OTP] Invalid code entered for {clean_id}. Remaining attempts: {remaining}")
        return {
            "success": False,
            "message": f"Incorrect OTP code. {max(remaining, 0)} attempt(s) remaining.",
            "remaining_attempts": max(remaining, 0),
        }
