import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("nexus.email")

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        if not settings.EMAIL_WORKER or not settings.APP_PASSWORD:
            logger.error("Email service not configured. Missing EMAIL_WORKER or APP_PASSWORD in environment.")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"NEXUS Studio <{settings.EMAIL_WORKER}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        try:
            # Connect to Gmail SMTP SSL Server
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(settings.EMAIL_WORKER, settings.APP_PASSWORD)
                server.sendmail(settings.EMAIL_WORKER, to_email, msg.as_string())
            logger.info(f"Successfully sent email to {to_email} with subject: '{subject}'")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    @classmethod
    def send_verification_code(cls, to_email: str, code: str) -> bool:
        subject = f"{code} is your NEXUS verification code"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0c0a09;
                    color: #e7e5e4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 500px;
                    margin: 40px auto;
                    background-color: #1c1917;
                    border: 1px border #2e2a24;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                }}
                .logo {{
                    font-size: 18px;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 24px;
                    letter-spacing: -0.05em;
                }}
                .logo span {{
                    color: #ef4444;
                }}
                h1 {{
                    font-size: 20px;
                    font-weight: 700;
                    margin-top: 0;
                    color: #ffffff;
                }}
                p {{
                    font-size: 14px;
                    line-height: 1.6;
                    color: #a8a29e;
                }}
                .code-box {{
                    background-color: #292524;
                    border: 1px solid #44403c;
                    border-radius: 8px;
                    text-align: center;
                    padding: 16px;
                    margin: 24px 0;
                }}
                .code {{
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: #ef4444;
                }}
                .footer {{
                    margin-top: 32px;
                    border-t: 1px solid #292524;
                    padding-top: 16px;
                    font-size: 11px;
                    color: #78716c;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">NEXUS<span>STUDIO</span></div>
                <h1>Verify your email address</h1>
                <p>To finish setting up your NEXUS account, please enter the 6-digit verification code below. This code will expire in 30 minutes.</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                </div>
                <p>If you did not request this verification email, you can safely ignore it.</p>
                <div class="footer">
                    &copy; 2026 NEXUS Studio. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        return cls.send_email(to_email, subject, html_content)

    @classmethod
    def send_password_reset(cls, to_email: str, token: str) -> bool:
        # Front-end reset password url
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        subject = "Reset your NEXUS password"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Reset Your Password</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0c0a09;
                    color: #e7e5e4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 500px;
                    margin: 40px auto;
                    background-color: #1c1917;
                    border: 1px border #2e2a24;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                }}
                .logo {{
                    font-size: 18px;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 24px;
                    letter-spacing: -0.05em;
                }}
                .logo span {{
                    color: #ef4444;
                }}
                h1 {{
                    font-size: 20px;
                    font-weight: 700;
                    margin-top: 0;
                    color: #ffffff;
                }}
                p {{
                    font-size: 14px;
                    line-height: 1.6;
                    color: #a8a29e;
                }}
                .button-container {{
                    margin: 28px 0;
                    text-align: center;
                }}
                .button {{
                    background-color: #ef4444;
                    color: #ffffff !important;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 14px;
                    padding: 12px 24px;
                    border-radius: 8px;
                    display: inline-block;
                }}
                .link-text {{
                    font-size: 12px;
                    color: #78716c;
                    word-break: break-all;
                }}
                .footer {{
                    margin-top: 32px;
                    border-t: 1px solid #292524;
                    padding-top: 16px;
                    font-size: 11px;
                    color: #78716c;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">NEXUS<span>STUDIO</span></div>
                <h1>Reset your password</h1>
                <p>We received a request to reset your password for your NEXUS account. Click the button below to set a new password. This link is valid for 1 hour.</p>
                <div class="button-container">
                    <a href="{reset_url}" class="button" target="_blank">Reset Password</a>
                </div>
                <p class="link-text">If the button doesn't work, copy and paste this link in your browser:<br>{reset_url}</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                <div class="footer">
                    &copy; 2026 NEXUS Studio. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        return cls.send_email(to_email, subject, html_content)
