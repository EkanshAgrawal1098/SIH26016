from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.parcel import LandParcel
from app.models.project import Project, ProjectParcel
from app.services.copilot_service import (
    process_copilot_query,
    QUICK_PROMPTS
)
from app.services.ai_suggestions_engine import (
    generate_parcel_prescriptive_suggestions,
    generate_project_strategic_suggestions
)

router = APIRouter()

class CopilotQueryRequest(BaseModel):
    message: str
    project_id: Optional[str] = None
    parcel_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

@router.get("/quick-prompts")
def get_quick_prompts():
    return QUICK_PROMPTS

@router.post("/chat")
def chat_with_copilot(
    payload: CopilotQueryRequest,
    db: Session = Depends(get_db)
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    return process_copilot_query(
        message=payload.message,
        db=db,
        context_project_id=payload.project_id,
        context_parcel_id=payload.parcel_id
    )

@router.get("/suggestions/parcel/{parcel_id}")
def get_parcel_suggestions(parcel_id: str, db: Session = Depends(get_db)):
    parcel = db.query(LandParcel).filter(LandParcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    return {
        "parcel_id": parcel.id,
        "owner_name": parcel.owner_name,
        "risk_level": parcel.risk,
        "risk_score": parcel.risk_score,
        "suggestions": generate_parcel_prescriptive_suggestions(parcel)
    }

@router.get("/suggestions/project/{project_id}")
def get_project_suggestions(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    pp_rows = db.query(ProjectParcel).filter(ProjectParcel.project_id == project_id).all()
    p_ids = [pp.parcel_id for pp in pp_rows]
    parcels = db.query(LandParcel).filter(LandParcel.id.in_(p_ids)).all() if p_ids else []

    return {
        "project_id": project.id,
        "project_name": project.name,
        "suggestions": generate_project_strategic_suggestions(project, parcels)
    }
