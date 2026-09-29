from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.parcel import LandParcel
from app.models.project import ProjectParcel
from app.models.workflow import StageEvent
from app.schemas.parcel import ParcelResponse, ParcelUpdate
from app.services.audit_service import record_audit_event

router = APIRouter()

def format_parcel_dict(p: LandParcel, project_id: Optional[str] = None) -> dict:
    if not project_id:
        if p.projects and len(p.projects) > 0:
            project_id = p.projects[0].project_id
        else:
            project_id = "PRJ-NH-33"

    return {
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
    }

@router.get("")
def get_parcels(
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
    project_id: Optional[str] = None,
    stage: Optional[str] = None,
    risk: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LandParcel)
    if state_id:
        query = query.filter(LandParcel.state_id == state_id)
    if district_id:
        query = query.filter(LandParcel.district_id == district_id)
    if stage:
        query = query.filter(LandParcel.stage == stage)
    if risk:
        query = query.filter(LandParcel.risk == risk)

    if project_id:
        pp_rows = db.query(ProjectParcel).filter(ProjectParcel.project_id == project_id).all()
        parcel_ids = [pp.parcel_id for pp in pp_rows]
        query = query.filter(LandParcel.id.in_(parcel_ids))

    parcels = query.all()
    return [format_parcel_dict(p, project_id) for p in parcels]

@router.get("/{parcel_id}")
def get_parcel_360(parcel_id: str, db: Session = Depends(get_db)):
    parcel = db.query(LandParcel).filter(LandParcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return format_parcel_dict(parcel)

@router.get("/{parcel_id}/timeline")
def get_parcel_timeline(parcel_id: str, db: Session = Depends(get_db)):
    events = db.query(StageEvent).filter(StageEvent.parcel_id == parcel_id).order_by(StageEvent.date).all()
    return [
        {
            "stage": e.stage,
            "date": e.date,
            "actor": e.actor,
            "note": e.note,
            "immutableHash": e.immutable_hash
        } for e in events
    ]

@router.patch("/{parcel_id}")
def update_parcel(parcel_id: str, payload: ParcelUpdate, db: Session = Depends(get_db)):
    parcel = db.query(LandParcel).filter(LandParcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    before_state = {"owner_name": parcel.owner_name, "stage": parcel.stage, "risk": parcel.risk}
    
    if payload.ownerName is not None:
        parcel.owner_name = payload.ownerName
    if payload.stage is not None:
        parcel.stage = payload.stage
    if payload.risk is not None:
        parcel.risk = payload.risk
    if payload.riskReasons is not None:
        parcel.risk_reasons = payload.riskReasons
    if payload.dataQualityFlags is not None:
        parcel.data_quality_flags = payload.dataQualityFlags
    if payload.sourceArea is not None:
        parcel.source_area = payload.sourceArea

    db.commit()
    db.refresh(parcel)

    after_state = {"owner_name": parcel.owner_name, "stage": parcel.stage, "risk": parcel.risk}
    record_audit_event(
        db=db,
        actor_user_id="SYSTEM_OR_OFFICER",
        action="PARCEL_METADATA_UPDATE",
        entity_type="PARCEL",
        entity_id=parcel.id,
        before_state=before_state,
        after_state=after_state
    )

    return format_parcel_dict(parcel)
