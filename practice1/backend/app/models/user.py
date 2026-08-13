from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserVerify(BaseModel):
    email: EmailStr
    code: str

class UserResendCode(BaseModel):
    email: EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserForgotPassword(BaseModel):
    email: EmailStr

class UserResetPassword(BaseModel):
    token: str
    password: str

class UserOnboarding(BaseModel):
    account_type: str  # "startup" or "individual"

class UserResponse(BaseModel):
    email: EmailStr
    is_verified: bool
    onboarded: bool
    account_type: Optional[str] = None
    balance: float
    created_at: datetime
    api_credentials: Optional[dict] = None

    class Config:
        from_attributes = True

class UserInDB(UserBase):
    password_hash: str
    is_verified: bool = False
    verification_code: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    onboarded: bool = False
    account_type: Optional[str] = None
    balance: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    api_credentials: dict = Field(default_factory=dict)

    class Config:
        from_attributes = True
