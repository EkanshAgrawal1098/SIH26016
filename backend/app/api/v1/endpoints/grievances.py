from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dispute import Grievance, Objection
from pydantic import BaseModel

router = APIRouter()

class GrievanceCreate(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = None
    parcel_id: Optional[str] = None
    project_id: Optional[str] = None
    category: str
    subject: str
    description: str

@router.get("", response_model=List[dict])
def list_grievances(
    parcel_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Grievance)
    if parcel_id:
        query = query.filter(Grievance.parcel_id == parcel_id)
    if status:
        query = query.filter(Grievance.status == status)
    items = query.all()
    return [
        {
            "id": g.id,
            "citizenName": g.citizen_name,
            "citizenPhoneMasked": g.citizen_phone_masked,
            "parcelId": g.parcel_id,
            "projectId": g.project_id,
            "category": g.category,
            "subject": g.subject,
            "description": g.description,
            "status": g.status,
            "assignedTo": g.assigned_to,
            "createdAt": g.created_at.isoformat() if g.created_at else None
        } for g in items
    ]

@router.post("", response_model=dict)
def submit_grievance(payload: GrievanceCreate, db: Session = Depends(get_db)):
    masked_phone = None
    if payload.citizen_phone and len(payload.citizen_phone) >= 10:
        masked_phone = f"+91 {payload.citizen_phone[:2]}*** ***{payload.citizen_phone[-2:]}"

    g = Grievance(
        citizen_name=payload.citizen_name,
        citizen_phone_masked=masked_phone,
        parcel_id=payload.parcel_id,
        project_id=payload.project_id,
        category=payload.category,
        subject=payload.subject,
        description=payload.description,
        status="OPEN"
    )
    db.add(g)
    db.commit()
    db.refresh(g)

    return {
        "id": g.id,
        "message": "Grievance submitted successfully. Tracking reference generated.",
        "status": g.status,
        "createdAt": g.created_at.isoformat()
    }
