from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    type: str # HIGHWAY, RAIL, INDUSTRIAL
    department: Optional[str] = "MoRTH / NHAI"
    state_ids: List[str]
    total_land_required_sqm: float
    corridor: Optional[dict] = None
    description: Optional[str] = None
    status: Optional[str] = "IN_PROGRESS"

class ProjectCreate(ProjectBase):
    id: str
    project_code: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    project_code: Optional[str] = None
    target_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Project360Response(ProjectResponse):
    total_parcels_count: int = 0
    acquired_parcels_count: int = 0
    pending_parcels_count: int = 0
    critical_parcels_count: int = 0
    acquisition_percentage: float = 0.0
    compensation_disbursed_percentage: float = 0.0
    possession_percentage: float = 0.0
    overall_risk_score: float = 0.0
    overall_risk_level: str = "LOW"
    top_bottlenecks: List[dict] = []
