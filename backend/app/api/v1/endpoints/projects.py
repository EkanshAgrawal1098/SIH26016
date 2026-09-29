from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project, ProjectParcel
from app.models.parcel import LandParcel
from app.models.finance import FinancialRecord
from app.schemas.project import ProjectResponse, Project360Response, ProjectCreate
from app.services.bottleneck_analyzer import analyze_project_bottlenecks

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    state_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    projects = query.all()
    
    if state_id:
        projects = [p for p in projects if state_id in (p.state_ids or [])]
        
    return projects

@router.get("/{project_id}", response_model=Project360Response)
def get_project_360(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get linked parcels
    project_parcels = db.query(ProjectParcel).filter(ProjectParcel.project_id == project_id).all()
    parcel_ids = [pp.parcel_id for pp in project_parcels]
    parcels = db.query(LandParcel).filter(LandParcel.id.in_(parcel_ids)).all() if parcel_ids else []

    total_parcels = len(parcels)
    acquired_count = sum(1 for p in parcels if p.stage == "POSSESSION")
    pending_count = total_parcels - acquired_count
    critical_count = sum(1 for p in parcels if p.risk == "HIGH")

    acq_percentage = (acquired_count / total_parcels * 100) if total_parcels > 0 else 0.0
    
    # Financial metrics
    total_awarded = 0.0
    total_disbursed = 0.0
    for p in parcels:
        if p.financials:
            total_awarded += p.financials.awarded_amount or 0.0
            total_disbursed += p.financials.disbursed_amount or 0.0

    comp_percentage = (total_disbursed / total_awarded * 100) if total_awarded > 0 else 0.0
    possession_percentage = acq_percentage

    # Bottlenecks
    bottlenecks = analyze_project_bottlenecks(parcels)

    # Risk
    high_risk_ratio = (critical_count / total_parcels) if total_parcels > 0 else 0.0
    overall_risk_score = round(high_risk_ratio * 100, 1)
    overall_risk_level = "HIGH" if overall_risk_score >= 40 else ("MEDIUM" if overall_risk_score >= 20 else "LOW")

    return Project360Response(
        id=project.id,
        project_code=project.project_code,
        name=project.name,
        type=project.type,
        department=project.department,
        state_ids=project.state_ids or [],
        total_land_required_sqm=project.total_land_required_sqm or 0.0,
        corridor=project.corridor,
        description=project.description,
        status=project.status,
        target_date=project.target_date,
        created_at=project.created_at,
        updated_at=project.updated_at,
        total_parcels_count=total_parcels,
        acquired_parcels_count=acquired_count,
        pending_parcels_count=pending_count,
        critical_parcels_count=critical_count,
        acquisition_percentage=round(acq_percentage, 1),
        compensation_disbursed_percentage=round(comp_percentage, 1),
        possession_percentage=round(possession_percentage, 1),
        overall_risk_score=overall_risk_score,
        overall_risk_level=overall_risk_level,
        top_bottlenecks=bottlenecks
    )

@router.get("/{project_id}/parcels")
def get_project_parcels(project_id: str, db: Session = Depends(get_db)):
    project_parcels = db.query(ProjectParcel).filter(ProjectParcel.project_id == project_id).all()
    parcel_ids = [pp.parcel_id for pp in project_parcels]
    if not parcel_ids:
        return []
    parcels = db.query(LandParcel).filter(LandParcel.id.in_(parcel_ids)).all()
    
    # Format according to frontend expectations
    results = []
    for p in parcels:
        results.append({
            "id": p.id,
            "stateRefNo": p.state_ref_no,
            "stateId": p.state_id,
            "districtId": p.district_id,
            "villageId": p.village_id,
            "projectId": project_id,
            "ownerId": p.owner_id,
            "ownerName": p.owner_name,
            "normalizedAreaSqm": p.normalized_area_sqm,
            "sourceArea": p.source_area,
            "sourceAreaUnit": p.source_area_unit,
            "stage": p.stage,
            "risk": p.risk,
            "riskReasons": p.risk_reasons or [],
            "dataQualityFlags": p.data_quality_flags or [],
            "geometry": p.geometry,
            "centroid": p.centroid,
            "timeline": [
                {
                    "stage": e.stage,
                    "date": e.date,
                    "actor": e.actor,
                    "note": e.note,
                    "immutableHash": e.immutable_hash
                } for e in (p.timeline or [])
            ],
            "documents": [
                {
                    "id": d.id,
                    "title": d.title,
                    "type": d.type,
                    "uploadedAt": d.uploaded_at,
                    "ocrVerified": d.ocr_verified,
                    "ocrFields": d.ocr_fields or [],
                    "url": d.url
                } for d in (p.documents or [])
            ],
            "conflicts": [
                {
                    "field": c.field,
                    "sourceA": c.source_a,
                    "sourceB": c.source_b,
                    "resolved": c.resolved
                } for c in (p.conflicts or [])
            ],
            "objections": [
                {
                    "id": o.id,
                    "filedBy": o.filed_by,
                    "filedAt": o.filed_at,
                    "subject": o.subject,
                    "description": o.description,
                    "status": o.status,
                    "slaDueDate": o.sla_due_date
                } for o in (p.objections or [])
            ],
            "financials": {
                "awardedAmount": p.financials.awarded_amount if p.financials else 0.0,
                "disbursedAmount": p.financials.disbursed_amount if p.financials else 0.0,
                "paymentReferenceMasked": p.financials.payment_reference_masked if p.financials else None,
                "settlementDate": p.financials.settlement_date if p.financials else None,
                "valuationRatePerSqm": p.financials.valuation_rate_per_sqm if p.financials else 0.0
            } if p.financials else None
        })
    return results
