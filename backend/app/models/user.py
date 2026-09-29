import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="OFFICIAL") # NATIONAL_ADMIN, STATE_OFFICER, DISTRICT_OFFICER, FIELD_OFFICER, PROJECT_OFFICER, CITIZEN
    user_mode = Column(String, nullable=False, default="official") # official / landowner
    jurisdiction = Column(String, nullable=True) # e.g. "Jharkhand > Ranchi"
    owner_ref_id = Column(String, nullable=True) # For landowner
    phone_masked = Column(String, nullable=True)
    avatar_initials = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
