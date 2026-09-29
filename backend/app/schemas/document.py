from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DocumentCreate(BaseModel):
    parcel_id: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    type: str # NOTICE, AWARD_ORDER, SURVEY_MAP, ID_PROOF, PAYMENT_RECEIPT, EVIDENCE
    uploaded_at: Optional[str] = None
    url: Optional[str] = None

class DocumentOCRPreview(BaseModel):
    document_id: str
    title: str
    ocr_verified: bool
    extracted_fields: List[Dict[str, Any]]
    confidence_score: float
