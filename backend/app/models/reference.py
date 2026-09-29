import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(String, primary_key=True) # e.g. "jharkhand", "maharashtra", "up"
    code = Column(String, unique=True, nullable=False) # e.g. "JH", "MH", "UP"
    name = Column(String, nullable=False)
    local_names = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")

class District(Base):
    __tablename__ = "districts"

    id = Column(String, primary_key=True) # e.g. "ranchi", "pune"
    state_id = Column(String, ForeignKey("states.id"), nullable=False)
    code = Column(String, nullable=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    state = relationship("State", back_populates="districts")
    subdistricts = relationship("Subdistrict", back_populates="district", cascade="all, delete-orphan")
    villages = relationship("Village", back_populates="district", cascade="all, delete-orphan")

class Subdistrict(Base):
    __tablename__ = "subdistricts"

    id = Column(String, primary_key=True)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False)
    code = Column(String, nullable=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    district = relationship("District", back_populates="subdistricts")

class Village(Base):
    __tablename__ = "villages"

    id = Column(String, primary_key=True)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    local_names = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

    district = relationship("District", back_populates="villages")
