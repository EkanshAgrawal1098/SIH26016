import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parcel_id = Column(String, ForeignKey("land_parcels.id"), nullable=False, unique=True)
    awarded_amount = Column(Float, default=0.0)
    disbursed_amount = Column(Float, default=0.0)
    payment_reference_masked = Column(String, nullable=True)
    settlement_date = Column(String, nullable=True)
    valuation_rate_per_sqm = Column(Float, default=0.0)
    status = Column(String, default="PENDING") # PENDING, APPROVED, DISBURSED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parcel = relationship("LandParcel", back_populates="financials")
