import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("email_service")


def _load_dotenv() -> None:
    """Ensure .env is loaded into os.environ."""
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


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP verification code to the target email via Gmail SMTP.
    Returns True on success, False on failure.
    """
    mail_username = os.getenv("MAIL_USERNAME", "").strip()
    mail_password = os.getenv("MAIL_PASSWORD", "").strip().replace(" ", "")
    mail_from     = os.getenv("MAIL_FROM", mail_username).strip() or mail_username
    mail_server   = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
    
    try:
        mail_port = int(os.getenv("MAIL_PORT", "465").strip())
    except ValueError:
        mail_port = 465

    if not mail_username or not mail_password:
        logger.error(
            "[Email] MAIL_USERNAME or MAIL_PASSWORD not set in .env — cannot send OTP email."
        )
        return False

    logger.info(f"[Email] Sending OTP email to {to_email} via {mail_server}:{mail_port}")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"CitizenAware — Your Verification Code: {otp_code}"
    msg["From"]    = f"CitizenAware <{mail_from}>"
    msg["To"]      = to_email

    html_content = f"""
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #1E293B; background-color: #F8FAFC;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px;
                    padding: 36px; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1A3DA8, #2563EB);
                        border-radius: 50%; width: 64px; height: 64px; line-height: 64px;
                        font-size: 24px; font-weight: 800; color: white;">CA</div>
            <h2 style="color: #1E293B; margin: 12px 0 4px; font-size: 22px;">CitizenAware</h2>
            <p style="color: #64748B; font-size: 13px; margin: 0;">Government Schemes Portal</p>
          </div>

          <p style="font-size: 15px; color: #334155; margin-bottom: 8px;">Hello,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            Your one-time verification code for <strong>{to_email}</strong> is:
          </p>

          <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #2563EB;
                      background: #EFF6FF; padding: 20px; text-align: center; border-radius: 12px;
                      margin: 24px 0; border: 2px solid #BFDBFE;">
            {otp_code}
          </div>

          <p style="font-size: 13px; color: #64748B; line-height: 1.6;">
            This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
          </p>
          <p style="font-size: 13px; color: #64748B; line-height: 1.6;">
            If you did not request this code, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
            CitizenAware 2026 &bull; Secure &bull; Reliable &bull; Government Portal
          </p>
        </div>
      </body>
    </html>
    """
    
    plain_content = f"CitizenAware Verification Code\n\nYour OTP for {to_email} is: {otp_code}\nValid for 5 minutes."

    msg.attach(MIMEText(plain_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if mail_port == 465:
            server = smtplib.SMTP_SSL(mail_server, 465, timeout=15)
        else:
            server = smtplib.SMTP(mail_server, mail_port, timeout=15)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(mail_username, mail_password)
        server.sendmail(mail_from, [to_email], msg.as_string())
        server.quit()
        logger.info(f"[Email] OTP email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"[Email] SMTP authentication failed for {mail_username}: {e}")
        return False
    except Exception as e:
        logger.error(f"[Email] Error sending OTP email to {to_email}: {e}")
        return False
