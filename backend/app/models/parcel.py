import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class LandParcel(Base):
    __tablename__ = "land_parcels"

    id = Column(String, primary_key=True) # e.g. "IN-JH-RAN-0012"
    national_parcel_id = Column(String, index=True, nullable=True)
    state_ref_no = Column(String, nullable=False) # e.g. "Khesra 1024 / Plot 44"
    state_id = Column(String, ForeignKey("states.id"), nullable=False)
    district_id = Column(String, ForeignKey("districts.id"), nullable=False)
    village_id = Column(String, ForeignKey("villages.id"), nullable=False)
    
    owner_id = Column(String, nullable=True)
    owner_name = Column(String, nullable=False, default="Unknown Owner")
    
    normalized_area_sqm = Column(Float, nullable=False, default=0.0)
    source_area = Column(Float, nullable=False, default=0.0)
    source_area_unit = Column(String, nullable=False, default="Acre")
    
    stage = Column(String, nullable=False, default="SURVEY") # SURVEY, VERIFICATION, NOTIFICATION, OBJECTION, HEARING, VALUATION, AWARD, COMPENSATION, POSSESSION
    risk = Column(String, nullable=False, default="LOW") # LOW, MEDIUM, HIGH
    risk_score = Column(Float, default=10.0)
    risk_reasons = Column(JSON, default=list)
    data_quality_flags = Column(JSON, default=list)
    
    geometry = Column(JSON, nullable=True) # GeoJSON Polygon / MultiPolygon
    centroid = Column(JSON, nullable=True) # [lat, lng]
    
    source_system = Column(String, default="JH-Jharbhoomi")
    source_record_id = Column(String, nullable=True)
    source_updated_at = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("ProjectParcel", back_populates="parcel", cascade="all, delete-orphan")
    timeline = relationship("StageEvent", back_populates="parcel", cascade="all, delete-orphan", order_by="StageEvent.date")
    documents = relationship("DocumentRef", back_populates="parcel", cascade="all, delete-orphan")
    conflicts = relationship("DataConflict", back_populates="parcel", cascade="all, delete-orphan")
    objections = relationship("Objection", back_populates="parcel", cascade="all, delete-orphan")
    financials = relationship("FinancialRecord", back_populates="parcel", uselist=False, cascade="all, delete-orphan")
