import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class AffectedFamily(Base):
    __tablename__ = "affected_families"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_head = Column(String, nullable=False)
    members_count = Column(Integer, default=4)
    social_category = Column(String, default="GEN") # SC, ST, OBC, GEN
    livelihood_type = Column(String, default="AGRICULTURE") # AGRICULTURE, AGRICULTURAL_LABOR, SMALL_SHOP, ARTISAN, TENANT
    displacement_status = Column(String, default="NON_DISPLACED") # DISPLACED, NON_DISPLACED, AT_RISK
    contact_masked = Column(String, nullable=True)
    
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rr_case = relationship("RRCase", back_populates="family", uselist=False, cascade="all, delete-orphan")

class RRCase(Base):
    __tablename__ = "rr_cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_id = Column(String, ForeignKey("affected_families.id"), nullable=False, unique=True)
    case_number = Column(String, unique=True, nullable=False)
    
    eligibility_status = Column(String, default="ELIGIBLE") # ELIGIBLE, UNDER_REVIEW, INELIGIBLE
    rehabilitation_status = Column(String, default="IN_PROGRESS") # NOT_STARTED, IN_PROGRESS, ALLOTTED, COMPLETED
    resettlement_status = Column(String, default="NOT_STARTED") # NOT_APPLICABLE, NOT_STARTED, SITE_IDENTIFIED, HOUSE_CONSTRUCTED, RESETTLED
    
    benefits_package = Column(JSON, default=dict) 
    # Example: {
    #   "house_entitlement": "1BHK Resettlement Colony Unit or Cash Grant Rs 1.5L",
    #   "annuity_lump_sum": "Rs 5,00,000 one-time rehabilitation grant",
    #   "subsistence_grant": "Rs 3,000/month for 12 months",
    #   "resettlement_allowance": "Rs 50,000",
    #   "cattle_shed_grant": "Rs 25,000"
    # }
    
    total_assistance_amount = Column(Float, default=0.0)
    disbursed_amount = Column(Float, default=0.0)
    resettlement_colony_site = Column(String, nullable=True)
    
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family = relationship("AffectedFamily", back_populates="rr_case")
