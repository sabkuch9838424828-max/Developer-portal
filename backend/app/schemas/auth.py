from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    role: str
    talent_type: Optional[str] = None
    name: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RecruiterRegisterRequest(BaseModel):
    full_name: str
    work_email: EmailStr
    password: str
    company_name: str
    designation: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = "11-50"
    company_description: Optional[str] = None
    industry: Optional[str] = "Technology"
    location: Optional[str] = None

class TalentRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    account_type: str = "developer"  # "developer", "student", "team"
    primary_specialization: Optional[str] = "Full-Stack Development"
    headline: Optional[str] = None
