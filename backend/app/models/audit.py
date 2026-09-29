import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Float, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id = Column(String, nullable=False)
    actor_name = Column(String, nullable=True)
    action = Column(String, nullable=False) # STAGE_TRANSITION, PARCEL_UPDATE, DOCUMENT_UPLOAD, GRIEVANCE_STATUS, etc.
    entity_type = Column(String, nullable=False) # PARCEL, PROJECT, ACQUISITION_CASE, DOCUMENT
    entity_id = Column(String, nullable=False)
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
    occurred_at = Column(DateTime, default=datetime.utcnow)

class DataConflict(Base):
    __tablename__ = "data_conflicts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False)
    field = Column(String, nullable=False) # e.g. "Area (Acres)", "Owner Name"
    source_a = Column(JSON, nullable=False) # {"system": "JH-Jharbhoomi", "value": "2.40"}
    source_b = Column(JSON, nullable=False) # {"system": "NHAI CAD/Survey", "value": "2.75"}
    resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="conflicts")

class Bottleneck(Base):
    __tablename__ = "bottlenecks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    type = Column(String, nullable=False) # OWNERSHIP_DISPUTE, COMPENSATION_PENDING, SURVEY_PENDING, LEGAL_STAY
    count = Column(Integer, default=0)
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    affected_parcels = Column(JSON, default=list) # List of parcel IDs
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
