import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    state_id = Column(String, ForeignKey("states.id"), nullable=True)
    version = Column(String, default="1.0")
    stages_order = Column(JSON, nullable=False) # List of stage codes
    is_active = Column(String, default="YES")

class AcquisitionCase(Base):
    __tablename__ = "acquisition_cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    current_stage = Column(String, nullable=False, default="SURVEY")
    status = Column(String, nullable=False, default="OPEN") # OPEN, ON_HOLD, COMPLETED, CANCELLED
    opened_at = Column(DateTime, default=datetime.utcnow)
    target_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_to_user_id = Column(String, nullable=True)
    delay_days = Column(Integer, default=0)

class StageEvent(Base):
    __tablename__ = "stage_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False)
    case_id = Column(String, nullable=True)
    stage = Column(String, nullable=False)
    date = Column(String, nullable=False) # ISO formatted date string
    actor = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    immutable_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="timeline")
