from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.parcel import LandParcel
from app.models.document import DocumentRef
from app.models.workflow import StageEvent
from app.services.audit_service import record_audit_event, generate_stage_event_hash
from app.services.risk_engine import calculate_parcel_risk
import uuid

router = APIRouter()

class FieldVerificationSubmission(BaseModel):
    parcel_id: str
    officer_name: str
    verified_gps_lat: float
    verified_gps_lng: float
    boundary_verified: bool
    crop_structure_found: bool
    structure_details: Optional[str] = None
    evidence_photo_url: Optional[str] = None
    officer_remarks: str
    advance_stage_to: Optional[str] = "VERIFICATION" # e.g. VERIFICATION, NOTIFICATION

class FieldVerificationResponse(BaseModel):
    status: str
    parcel_id: str
    verification_hash: str
    updated_stage: str
    message: str
    timestamp: str

@router.get("/assigned-parcels")
def get_assigned_field_parcels(db: Session = Depends(get_db)):
    """
    Returns parcels requiring field inspection & ground survey validation
    """
    parcels = db.query(LandParcel).filter(LandParcel.stage.in_(["SURVEY", "VERIFICATION", "HEARING", "OBJECTION"])).all()
    results = []
    for p in parcels:
        results.append({
            "id": p.id,
            "stateRefNo": p.state_ref_no,
            "ownerName": p.owner_name,
            "stage": p.stage,
            "risk": p.risk,
            "sourceArea": p.source_area,
            "sourceAreaUnit": p.source_area_unit,
            "normalizedAreaSqm": p.normalized_area_sqm,
            "centroid": p.centroid,
            "geometry": p.geometry,
            "dataQualityFlags": p.data_quality_flags or [],
            "documentsCount": len(p.documents or [])
        })
    return results

@router.post("/verify", response_model=FieldVerificationResponse)
def submit_field_verification(
    payload: FieldVerificationSubmission,
    db: Session = Depends(get_db)
):
    parcel = db.query(LandParcel).filter(LandParcel.id == payload.parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    today_iso = datetime.utcnow().strftime("%Y-%m-%d")
    actor = payload.officer_name or "Field Survey Officer"

    # 1. Update centroid with ground-verified GPS if provided
    parcel.centroid = [payload.verified_gps_lat, payload.verified_gps_lng]
    
    # 2. Attach evidence photo / ground survey doc
    doc_id = f"DOC-FLD-{uuid.uuid4().hex[:6].upper()}"
    new_doc = DocumentRef(
        id=doc_id,
        parcel_id=parcel.id,
        title=f"Field Geo-Survey & Inspection Evidence ({actor})",
        type="EVIDENCE",
        uploaded_at=today_iso,
        ocr_verified=True,
        ocr_fields=[
            {"field": "GPS Latitude", "extracted": str(payload.verified_gps_lat), "verified": True},
            {"field": "GPS Longitude", "extracted": str(payload.verified_gps_lng), "verified": True},
            {"field": "Boundary Match", "extracted": "Confirmed" if payload.boundary_verified else "Disputed", "verified": True},
        ],
        url=payload.evidence_photo_url or f"/evidence/{doc_id}.jpg"
    )
    db.add(new_doc)

    # 3. Create cryptographic hash for field verification seal
    verification_hash = generate_stage_event_hash(parcel.id, payload.advance_stage_to or parcel.stage, actor, today_iso)

    # 4. Advance or record stage event
    previous_stage = parcel.stage
    target_stage = payload.advance_stage_to or "VERIFICATION"
    parcel.stage = target_stage

    event = StageEvent(
        parcel_id=parcel.id,
        stage=target_stage,
        date=today_iso,
        actor=actor,
        note=f"Field verification completed. GPS: ({payload.verified_gps_lat:.5f}, {payload.verified_gps_lng:.5f}). {payload.officer_remarks}",
        immutable_hash=verification_hash
    )
    db.add(event)

    # 5. Clear or update risk flags
    if payload.boundary_verified:
        parcel.data_quality_flags = [f for f in (parcel.data_quality_flags or []) if "mismatch" not in f.lower()]
    
    comp_status = parcel.financials.status if parcel.financials else "PENDING"
    new_risk_level, new_risk_score, new_risk_reasons = calculate_parcel_risk(
        has_dispute=bool(parcel.objections and any(o.status in ["OPEN", "IN_HEARING"] for o in parcel.objections)),
        days_in_stage=1,
        compensation_status=comp_status,
        missing_docs=False,
        has_conflicts=False if payload.boundary_verified else True,
        stage=target_stage
    )
    parcel.risk = new_risk_level
    parcel.risk_score = new_risk_score
    parcel.risk_reasons = new_risk_reasons

    db.commit()
    db.refresh(parcel)

    # 6. Audit event
    record_audit_event(
        db=db,
        actor_user_id=actor,
        actor_name=actor,
        action="FIELD_VERIFICATION_SUBMITTED",
        entity_type="PARCEL",
        entity_id=parcel.id,
        before_state={"stage": previous_stage},
        after_state={
            "stage": target_stage,
            "gps": [payload.verified_gps_lat, payload.verified_gps_lng],
            "hash": verification_hash
        }
    )

    return FieldVerificationResponse(
        status="VERIFIED",
        parcel_id=parcel.id,
        verification_hash=verification_hash,
        updated_stage=target_stage,
        message=f"Ground verification recorded with digital audit seal {verification_hash}. Stage updated to {target_stage}.",
        timestamp=datetime.utcnow().isoformat()
    )
