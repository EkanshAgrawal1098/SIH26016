from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.rr import AffectedFamily, RRCase
from app.schemas.rr import AffectedFamilySchema, RRCaseSchema, RRCaseStatusUpdate, RRSummaryResponse
from app.services.kpi_calculator import compute_project_kpis

router = APIRouter()

@router.get("/summary", response_model=RRSummaryResponse)
def get_rr_summary(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    fam_query = db.query(AffectedFamily)
    if project_id:
        fam_query = fam_query.filter(AffectedFamily.project_id == project_id)
    families = fam_query.all()

    total_affected = len(families)
    total_displaced = sum(1 for f in families if f.displacement_status == "DISPLACED")
    
    rr_cases = [f.rr_case for f in families if f.rr_case]
    eligible_count = sum(1 for c in rr_cases if c.eligibility_status == "ELIGIBLE")
    rehab_completed = sum(1 for c in rr_cases if c.rehabilitation_status == "COMPLETED")
    resettle_completed = sum(1 for c in rr_cases if c.resettlement_status == "RESETTLED")
    
    total_budget = sum(c.total_assistance_amount or 0.0 for c in rr_cases)
    total_disbursed = sum(c.disbursed_amount or 0.0 for c in rr_cases)
    
    kpis = compute_project_kpis(db, project_id)

    return RRSummaryResponse(
        total_affected_families=total_affected,
        total_displaced_families=total_displaced,
        eligible_families_count=eligible_count,
        rehabilitation_completed_count=rehab_completed,
        resettlement_completed_count=resettle_completed,
        total_rr_assistance_budget=round(total_budget, 2),
        total_rr_assistance_disbursed=round(total_disbursed, 2),
        rr_progress_percentage=kpis["rr_progress_percentage"]
    )

@router.get("/families", response_model=List[AffectedFamilySchema])
def list_affected_families(
    project_id: Optional[str] = None,
    displacement_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AffectedFamily)
    if project_id:
        query = query.filter(AffectedFamily.project_id == project_id)
    if displacement_status:
        query = query.filter(AffectedFamily.displacement_status == displacement_status)
    return query.all()

@router.get("/cases", response_model=List[RRCaseSchema])
def list_rr_cases(db: Session = Depends(get_db)):
    return db.query(RRCase).all()

@router.post("/cases/{case_id}/update-status", response_model=RRCaseSchema)
def update_rr_case_status(
    case_id: str,
    payload: RRCaseStatusUpdate,
    db: Session = Depends(get_db)
):
    rr_case = db.query(RRCase).filter(RRCase.id == case_id).first()
    if not rr_case:
        raise HTTPException(status_code=404, detail="R&R Case not found")

    if payload.eligibility_status is not None:
        rr_case.eligibility_status = payload.eligibility_status
    if payload.rehabilitation_status is not None:
        rr_case.rehabilitation_status = payload.rehabilitation_status
    if payload.resettlement_status is not None:
        rr_case.resettlement_status = payload.resettlement_status
    if payload.disbursed_amount is not None:
        rr_case.disbursed_amount = payload.disbursed_amount
    if payload.remarks is not None:
        rr_case.remarks = payload.remarks

    db.commit()
    db.refresh(rr_case)
    return rr_case
