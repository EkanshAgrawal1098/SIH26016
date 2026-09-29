import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from app.core.database import Base

class SourceSystem(Base):
    __tablename__ = "source_systems"

    id = Column(String, primary_key=True) # e.g. "JH-Jharbhoomi", "MH-Mahabhulekh"
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    state_code = Column(String, nullable=False)
    system_type = Column(String, default="LAND_RECORD") # LAND_RECORD, ACQUISITION, REVENUE
    base_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FieldMapping(Base):
    __tablename__ = "field_mappings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_system_id = Column(String, ForeignKey("source_systems.id"), nullable=False)
    schema_version = Column(String, default="1.0")
    source_field = Column(String, nullable=False)
    canonical_field = Column(String, nullable=False)
    transform_rule = Column(String, default="DIRECT") # DIRECT, UNIT_ACRE_TO_SQM, UNIT_HECTARE_TO_SQM, UPPERCASE
    is_required = Column(Boolean, default=False)

class SyncRun(Base):
    __tablename__ = "sync_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_system_id = Column(String, ForeignKey("source_systems.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, default="SUCCESS") # SUCCESS, RUNNING, FAILED
    records_read = Column(Integer, default=0)
    records_written = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    log_summary = Column(Text, nullable=True)
