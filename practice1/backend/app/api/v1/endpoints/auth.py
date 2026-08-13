import random
import string
import jwt
import bcrypt
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.core.database import get_database
from app.models.user import (
    UserCreate,
    UserVerify,
    UserLogin,
    UserForgotPassword,
    UserResetPassword,
    UserOnboarding,
    UserResponse,
    UserResendCode
)

router = APIRouter()
logger = logging.getLogger("nexus.auth")

JWT_SECRET = "NEXUS_SUPER_SECRET_JWT_KEY_2026"
JWT_ALGORITHM = "HS256"

# SECURITY HELPERS
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False

def create_access_token(email: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"email": email}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# DEPENDENCY: GET CURRENT AUTHENTICATED USER
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_database()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ENDPOINT: SIGNUP
@router.post("/signup", status_code=201)
async def signup(user_in: UserCreate):
    db = get_database()
    email_clean = user_in.email.lower().strip()
    
    # Check existing user
    existing_user = await db["users"].find_one({"email": email_clean})
    if existing_user:
        if existing_user.get("is_verified"):
            raise HTTPException(status_code=400, detail="Email is already registered and verified")
        else:
            # Overwrite unverified user or update their verification code
            verification_code = f"{random.randint(100000, 999999)}"
            password_hash = hash_password(user_in.password)
            await db["users"].update_one(
                {"email": email_clean},
                {"$set": {
                    "password_hash": password_hash,
                    "verification_code": verification_code,
                    "created_at": datetime.utcnow()
                }}
            )
            from app.services.email import EmailService
            EmailService.send_verification_code(email_clean, verification_code)
            return {"message": "Verification code resent to your email address"}

    # Generate random 6-digit OTP code
    verification_code = f"{random.randint(100000, 999999)}"
    password_hash = hash_password(user_in.password)

    new_user = {
        "email": email_clean,
        "password_hash": password_hash,
        "is_verified": False,
        "verification_code": verification_code,
        "reset_token": None,
        "reset_token_expires": None,
        "onboarded": False,
        "account_type": None,
        "balance": 0.0,
        "created_at": datetime.utcnow()
    }

    await db["users"].insert_one(new_user)
    
    # Send verification email asynchronously / in-process
    from app.services.email import EmailService
    EmailService.send_verification_code(email_clean, verification_code)

    return {"message": "Verification code sent to your email address"}

# ENDPOINT: RESEND VERIFICATION CODE
@router.post("/resend-code")
async def resend_code(payload: UserResendCode):
    db = get_database()
    email_clean = payload.email.lower().strip()
    
    user = await db["users"].find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=404, detail="Email address not found")
        
    if user.get("is_verified"):
        return {"message": "Email is already verified"}

    verification_code = f"{random.randint(100000, 999999)}"
    await db["users"].update_one(
        {"email": email_clean},
        {"$set": {"verification_code": verification_code}}
    )
    
    from app.services.email import EmailService
    EmailService.send_verification_code(email_clean, verification_code)
    
    return {"message": "New verification code sent"}

# ENDPOINT: VERIFY EMAIL
@router.post("/verify-email")
async def verify_email(verify_in: UserVerify):
    db = get_database()
    email_clean = verify_in.email.lower().strip()

    user = await db["users"].find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    if user.get("is_verified"):
        # Generate token directly
        token = create_access_token(email_clean)
        return {
            "token": token,
            "email": email_clean,
            "onboarded": user.get("onboarded", False)
        }

    stored_code = user.get("verification_code")
    if not stored_code or stored_code != verify_in.code.strip():
        raise HTTPException(status_code=400, detail="Invalid email verification code")

    await db["users"].update_one(
        {"email": email_clean},
        {"$set": {"is_verified": True}, "$unset": {"verification_code": ""}}
    )

    token = create_access_token(email_clean)
    return {
        "token": token,
        "email": email_clean,
        "onboarded": user.get("onboarded", False)
    }

# ENDPOINT: LOGIN
@router.post("/login")
async def login(login_in: UserLogin):
    db = get_database()
    email_clean = login_in.email.lower().strip()

    user = await db["users"].find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email address or password")

    if not verify_password(login_in.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email address or password")

    if not user.get("is_verified"):
        # Send new verification code
        verification_code = f"{random.randint(100000, 999999)}"
        await db["users"].update_one(
            {"email": email_clean},
            {"$set": {"verification_code": verification_code}}
        )
        from app.services.email import EmailService
        EmailService.send_verification_code(email_clean, verification_code)
        raise HTTPException(status_code=403, detail="Email is not verified. A verification code has been sent.")

    token = create_access_token(email_clean)
    return {
        "token": token,
        "email": email_clean,
        "onboarded": user.get("onboarded", False)
    }

# ENDPOINT: FORGOT PASSWORD
@router.post("/forgot-password")
async def forgot_password(forgot_in: UserForgotPassword):
    db = get_database()
    email_clean = forgot_in.email.lower().strip()

    user = await db["users"].find_one({"email": email_clean})
    if not user:
        # Prevent user enumeration attacks
        return {"message": "If the email is registered, a password reset link has been sent"}

    # Generate unique reset token
    reset_token = "".join(random.choices(string.ascii_letters + string.digits, k=32))
    expiry = datetime.utcnow() + timedelta(hours=1)

    await db["users"].update_one(
        {"email": email_clean},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires": expiry
        }}
    )

    from app.services.email import EmailService
    EmailService.send_password_reset(email_clean, reset_token)

    return {"message": "If the email is registered, a password reset link has been sent"}

# ENDPOINT: RESET PASSWORD
@router.post("/reset-password")
async def reset_password(reset_in: UserResetPassword):
    db = get_database()
    user = await db["users"].find_one({
        "reset_token": reset_in.token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token")

    password_hash = hash_password(reset_in.password)

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": password_hash}, "$unset": {"reset_token": "", "reset_token_expires": ""}}
    )

    return {"message": "Password has been successfully updated"}

# ENDPOINT: ONBOARDING (ADD Welcome Credits)
@router.post("/onboarding")
async def onboarding(onboard_in: UserOnboarding, current_user: dict = Depends(get_current_user)):
    if current_user.get("onboarded"):
        return {
            "message": "User has already completed onboarding",
            "balance": current_user.get("balance", 0.0),
            "onboarded": True
        }

    db = get_database()
    
    # Complete onboarding and credit $100 free credit balance
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "onboarded": True,
            "account_type": onboard_in.account_type,
            "balance": 100.00
        }}
    )

    return {
        "message": "Onboarding completed successfully. $100.00 welcome credit has been added.",
        "balance": 100.00,
        "onboarded": True
    }

# ENDPOINT: ME
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ENDPOINT: SAVE API CREDENTIALS
@router.post("/credentials", summary="Save API Credentials")
async def save_credentials(credentials: dict, current_user: dict = Depends(get_current_user)):
    db = get_database()
    existing_credentials = current_user.get("api_credentials", {}) or {}
    for k, v in credentials.items():
        if v == "":
            existing_credentials.pop(k, None)
        else:
            existing_credentials[k] = v

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"api_credentials": existing_credentials}}
    )
    return {"message": "Credentials updated successfully", "api_credentials": existing_credentials}
