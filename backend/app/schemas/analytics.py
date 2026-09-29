from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BottleneckItem(BaseModel):
    type: str # OWNERSHIP_DISPUTE, COMPENSATION_PENDING, SURVEY_PENDING, LEGAL_STAY
    title: Optional[str] = None
    count: int
    severity: str
    affected_parcels: List[str] = []
    projected_delay_months: Optional[int] = None
    financial_idle_cost_cr: Optional[float] = None
    is_corridor_severing: Optional[bool] = False
    recommended_action: Optional[str] = None
    statutory_playbook: Optional[str] = None

class RiskAnalysisResponse(BaseModel):
    project_id: str
    risk_level: str # LOW, MEDIUM, HIGH
    risk_score: float
    contributing_factors: List[str]
    bottlenecks: List[BottleneckItem]
    recommended_actions: List[str]

class NationalKPIsResponse(BaseModel):
    total_projects: int
    total_parcels: int
    total_area_sqm: float
    acquired_area_sqm: float
    total_awarded_amount: float
    total_disbursed_amount: float
    high_risk_projects_count: int
    active_disputes_count: int
    average_data_quality_score: float
    states_count: int
