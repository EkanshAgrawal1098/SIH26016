from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class RRCaseSchema(BaseModel):
    id: str
    family_id: str
    case_number: str
    eligibility_status: str
    rehabilitation_status: str
    resettlement_status: str
    benefits_package: Dict[str, Any] = {}
    total_assistance_amount: float
    disbursed_amount: float
    resettlement_colony_site: Optional[str] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class AffectedFamilySchema(BaseModel):
    id: str
    family_head: str
    members_count: int
    social_category: str
    livelihood_type: str
    displacement_status: str
    contact_masked: Optional[str] = None
    parcel_id: Optional[str] = None
    project_id: str
    rr_case: Optional[RRCaseSchema] = None

    class Config:
        from_attributes = True

class RRCaseStatusUpdate(BaseModel):
    eligibility_status: Optional[str] = None
    rehabilitation_status: Optional[str] = None
    resettlement_status: Optional[str] = None
    disbursed_amount: Optional[float] = None
    remarks: Optional[str] = None

class RRSummaryResponse(BaseModel):
    total_affected_families: int
    total_displaced_families: int
    eligible_families_count: int
    rehabilitation_completed_count: int
    resettlement_completed_count: int
    total_rr_assistance_budget: float
    total_rr_assistance_disbursed: float
    rr_progress_percentage: float
