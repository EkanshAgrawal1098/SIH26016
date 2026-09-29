import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True) # e.g. "PRJ-NH-33"
    project_code = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # HIGHWAY / RAIL / INDUSTRIAL
    department = Column(String, default="MoRTH / NHAI")
    state_ids = Column(JSON, nullable=False, default=list) # e.g. ["jharkhand"]
    total_land_required_sqm = Column(Float, nullable=False, default=0.0)
    corridor = Column(JSON, nullable=True) # GeoJSON LineString
    description = Column(Text, nullable=True)
    target_date = Column(DateTime, nullable=True)
    status = Column(String, default="IN_PROGRESS")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parcels = relationship("ProjectParcel", back_populates="project", cascade="all, delete-orphan")

class ProjectParcel(Base):
    __tablename__ = "project_parcels"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False)
    impact_type = Column(String, default="DIRECT_CORRIDOR")
    priority = Column(String, default="HIGH")
    criticality_score = Column(Float, default=50.0)
    acquisition_required = Column(String, default="YES")

    project = relationship("Project", back_populates="parcels")
    parcel = relationship("LandParcel", back_populates="projects")
