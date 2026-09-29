from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectParcel
from app.models.parcel import LandParcel
from app.models.finance import FinancialRecord
from app.models.rr import AffectedFamily, RRCase
from app.models.workflow import StageEvent

STAGE_SLAS_DAYS = {
    "SURVEY": 30,
    "VERIFICATION": 20,
    "NOTIFICATION": 30,
    "OBJECTION": 21,
    "HEARING": 30,
    "VALUATION": 30,
    "AWARD": 20,
    "COMPENSATION": 30,
    "POSSESSION": 20,
}

def compute_project_kpis(db: Session, project_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Computes exact, transparent dashboard metrics per PRD & TRD requirements:
    - Area Required, Area Notified, Area Acquired
    - Compensation Assessed, Compensation Approved, Compensation Paid
    - Affected Families, Displaced Families, R&R Progress %
    - Possession %, Timeline Adherence %
    """
    # 1. Parcels query
    if project_id:
        pp_rows = db.query(ProjectParcel).filter(ProjectParcel.project_id == project_id).all()
        parcel_ids = [pp.parcel_id for pp in pp_rows]
        parcels = db.query(LandParcel).filter(LandParcel.id.in_(parcel_ids)).all() if parcel_ids else []
        proj = db.query(Project).filter(Project.id == project_id).first()
        area_required_sqm = proj.total_land_required_sqm if proj else sum(p.normalized_area_sqm or 0.0 for p in parcels)
    else:
        parcels = db.query(LandParcel).all()
        projects = db.query(Project).all()
        area_required_sqm = sum(pr.total_land_required_sqm or 0.0 for pr in projects)
        if area_required_sqm == 0:
            area_required_sqm = sum(p.normalized_area_sqm or 0.0 for p in parcels)

    # 2. Exact Area Breakdown
    # Stages after Notification
    notified_stages = {"NOTIFICATION", "OBJECTION", "HEARING", "VALUATION", "AWARD", "COMPENSATION", "POSSESSION"}
    area_notified_sqm = sum(p.normalized_area_sqm or 0.0 for p in parcels if p.stage in notified_stages)
    area_acquired_sqm = sum(p.normalized_area_sqm or 0.0 for p in parcels if p.stage == "POSSESSION")

    # 3. Financial Breakdown
    p_ids = [p.id for p in parcels]
    financials = db.query(FinancialRecord).filter(FinancialRecord.parcel_id.in_(p_ids)).all() if p_ids else []
    
    compensation_assessed = sum(f.awarded_amount or 0.0 for f in financials)
    compensation_approved = sum(f.awarded_amount or 0.0 for f in financials if f.status in ["APPROVED", "DISBURSED"])
    compensation_paid = sum(f.disbursed_amount or 0.0 for f in financials)

    # 4. R&R Metrics
    fam_query = db.query(AffectedFamily)
    if project_id:
        fam_query = fam_query.filter(AffectedFamily.project_id == project_id)
    families = fam_query.all()
    
    affected_families_count = len(families)
    displaced_families_count = sum(1 for f in families if f.displacement_status == "DISPLACED")
    
    # R&R Progress calculation
    rr_cases = [f.rr_case for f in families if f.rr_case]
    if rr_cases:
        completed_score = sum(
            (1.0 if c.rehabilitation_status == "COMPLETED" else (0.5 if c.rehabilitation_status in ["ALLOTTED", "IN_PROGRESS"] else 0.0)) +
            (1.0 if c.resettlement_status == "RESETTLED" else (0.5 if c.resettlement_status in ["SITE_IDENTIFIED", "HOUSE_CONSTRUCTED"] else 0.0))
            for c in rr_cases
        )
        max_score = len(rr_cases) * 2.0
        rr_progress_percentage = round((completed_score / max_score) * 100.0, 1) if max_score > 0 else 0.0
    else:
        rr_progress_percentage = 0.0

    # 5. Possession & Timeline Adherence Calculation
    total_parcels = len(parcels)
    possession_parcels = sum(1 for p in parcels if p.stage == "POSSESSION")
    possession_percentage = round((possession_parcels / total_parcels * 100.0), 1) if total_parcels > 0 else 0.0

    # Timeline adherence based on delay risk flags / SLA breaches
    breached_parcels = sum(1 for p in parcels if p.risk == "HIGH")
    timeline_adherence_percentage = round(max(0.0, 100.0 - ((breached_parcels / total_parcels) * 100.0)), 1) if total_parcels > 0 else 100.0

    return {
        "area_required_sqm": round(area_required_sqm, 2),
        "area_required_acres": round(area_required_sqm / 4046.86, 2),
        "area_notified_sqm": round(area_notified_sqm, 2),
        "area_notified_acres": round(area_notified_sqm / 4046.86, 2),
        "area_acquired_sqm": round(area_acquired_sqm, 2),
        "area_acquired_acres": round(area_acquired_sqm / 4046.86, 2),
        "area_acquisition_percentage": round((area_acquired_sqm / area_required_sqm * 100.0), 1) if area_required_sqm > 0 else 0.0,
        "compensation_assessed": round(compensation_assessed, 2),
        "compensation_approved": round(compensation_approved, 2),
        "compensation_paid": round(compensation_paid, 2),
        "compensation_paid_percentage": round((compensation_paid / compensation_assessed * 100.0), 1) if compensation_assessed > 0 else 0.0,
        "affected_families_count": affected_families_count,
        "displaced_families_count": displaced_families_count,
        "rr_progress_percentage": rr_progress_percentage,
        "possession_percentage": possession_percentage,
        "timeline_adherence_percentage": timeline_adherence_percentage,
    }
