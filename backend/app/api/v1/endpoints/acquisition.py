from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.parcel import LandParcel
from app.models.workflow import StageEvent, AcquisitionCase
from app.models.document import DocumentRef
from app.schemas.workflow import WorkflowTransitionRequest, WorkflowTransitionResponse
from app.services.audit_service import record_audit_event, generate_stage_event_hash
from app.services.risk_engine import calculate_parcel_risk

router = APIRouter()

STAGE_ORDER = [
    "SURVEY", "VERIFICATION", "NOTIFICATION", "OBJECTION", 
    "HEARING", "VALUATION", "AWARD", "COMPENSATION", "POSSESSION"
]

@router.post("/{parcel_id}/transition", response_model=WorkflowTransitionResponse)
def transition_workflow_stage(
    parcel_id: str,
    req: WorkflowTransitionRequest,
    db: Session = Depends(get_db)
):
    parcel = db.query(LandParcel).filter(LandParcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if req.to_stage not in STAGE_ORDER:
        raise HTTPException(status_code=400, detail=f"Invalid stage '{req.to_stage}'")

    previous_stage = parcel.stage
    today_iso = datetime.utcnow().strftime("%Y-%m-%d")
    actor = req.actor or "District Acquisition Officer"

    # Compute cryptographic hash for immutable history
    event_hash = generate_stage_event_hash(parcel_id, req.to_stage, actor, today_iso)

    # Add new stage event
    event = StageEvent(
        parcel_id=parcel_id,
        stage=req.to_stage,
        date=today_iso,
        actor=actor,
        note=req.remarks or f"Transitioned from {previous_stage} to {req.to_stage}",
        immutable_hash=event_hash
    )
    db.add(event)

    # Link any documents provided
    if req.document_ids:
        for doc_id in req.document_ids:
            doc = db.query(DocumentRef).filter(DocumentRef.id == doc_id).first()
            if doc:
                doc.parcel_id = parcel_id

    # Update parcel stage
    parcel.stage = req.to_stage

    # Re-calculate risk score
    has_dispute = bool(parcel.objections and any(o.status in ["OPEN", "IN_HEARING"] for o in parcel.objections))
    comp_status = parcel.financials.status if parcel.financials else "PENDING"
    missing_docs = len(parcel.documents or []) == 0
    has_conflicts = bool(parcel.conflicts and any(not c.resolved for c in parcel.conflicts))
    
    new_risk_level, new_risk_score, new_risk_reasons = calculate_parcel_risk(
        has_dispute=has_dispute,
        days_in_stage=1,
        compensation_status=comp_status,
        missing_docs=missing_docs,
        has_conflicts=has_conflicts,
        stage=req.to_stage
    )
    
    parcel.risk = new_risk_level
    parcel.risk_score = new_risk_score
    parcel.risk_reasons = new_risk_reasons

    db.commit()
    db.refresh(parcel)

    # Record Audit Event
    record_audit_event(
        db=db,
        actor_user_id=actor,
        actor_name=actor,
        action="STAGE_TRANSITION",
        entity_type="PARCEL",
        entity_id=parcel.id,
        before_state={"stage": previous_stage},
        after_state={"stage": req.to_stage, "immutable_hash": event_hash}
    )

    return WorkflowTransitionResponse(
        parcel_id=parcel_id,
        previous_stage=previous_stage,
        current_stage=req.to_stage,
        transition_timestamp=today_iso,
        status="SUCCESS",
        audit_hash=event_hash
    )
