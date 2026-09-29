from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class WorkflowTransitionRequest(BaseModel):
    to_stage: str # SURVEY, VERIFICATION, NOTIFICATION, OBJECTION, HEARING, VALUATION, AWARD, COMPENSATION, POSSESSION
    remarks: Optional[str] = None
    document_ids: Optional[List[str]] = None
    actor: Optional[str] = "Current Officer"

class WorkflowTransitionResponse(BaseModel):
    parcel_id: str
    previous_stage: str
    current_stage: str
    transition_timestamp: str
    status: str
    audit_hash: str

class WorkflowTemplateResponse(BaseModel):
    id: str
    name: str
    state_id: Optional[str] = None
    version: str
    stages_order: List[str]

    class Config:
        from_attributes = True
