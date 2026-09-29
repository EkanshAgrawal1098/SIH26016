from typing import Optional, List, Union
from pydantic import BaseModel

class LoginRequest(BaseModel):
    # For officials: username / password
    # For landowners: owner_ref_id or phone or username
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    mode: Optional[str] = "official" # "official" or "landowner"
    owner_ref_id: Optional[str] = None
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    role: str
    user_mode: str
    jurisdiction: Optional[str] = None
    owner_ref_id: Optional[str] = None
    phone_masked: Optional[str] = None
    avatar_initials: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
