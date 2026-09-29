import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Objection(Base):
    __tablename__ = "objections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False)
    filed_by = Column(String, nullable=False)
    filed_at = Column(String, nullable=False) # ISO date string
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="OPEN") # OPEN, IN_HEARING, RESOLVED, REJECTED
    sla_due_date = Column(String, nullable=False)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="objections")

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_name = Column(String, nullable=False)
    citizen_phone_masked = Column(String, nullable=True)
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    category = Column(String, nullable=False) # COMPENSATION, SURVEY, DOCUMENT, GENERAL
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="OPEN") # OPEN, IN_REVIEW, RESOLVED, ESCALATED
    assigned_to = Column(String, nullable=True)
    sla_due_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
