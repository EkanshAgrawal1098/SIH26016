import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class DocumentRef(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # NOTICE, AWARD_ORDER, SURVEY_MAP, ID_PROOF, PAYMENT_RECEIPT, EVIDENCE
    uploaded_at = Column(String, nullable=False) # ISO date string
    ocr_verified = Column(Boolean, default=False)
    ocr_fields = Column(JSON, default=list) # [{field: string, extracted: string, verified: boolean}]
    url = Column(String, nullable=True)
    storage_key = Column(String, nullable=True)
    checksum = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="documents")
