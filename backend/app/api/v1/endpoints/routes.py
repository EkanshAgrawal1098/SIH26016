from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project
from app.services.route_diversion_engine import (
    analyze_corridor_contiguity,
    generate_diverted_routes
)

router = APIRouter()

class DivertedRouteRequest(BaseModel):
    blocked_parcel_ids: Optional[List[str]] = None

class AdoptRouteRequest(BaseModel):
    option_id: str
    remarks: Optional[str] = "Adopted AI recommended bypass alignment"

@router.get("/{project_id}/corridor-analysis")
def get_project_corridor_analysis(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return analyze_corridor_contiguity(project, db)

@router.post("/{project_id}/diverted-routes")
def compute_diverted_routes(
    project_id: str,
    payload: Optional[DivertedRouteRequest] = None,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    blocked_ids = payload.blocked_parcel_ids if payload else None
    return generate_diverted_routes(project, blocked_ids, db)

@router.post("/{project_id}/adopt-diverted-route")
def adopt_diverted_route(
    project_id: str,
    payload: AdoptRouteRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diverted_data = generate_diverted_routes(project, None, db)
    matching_option = None
    for opt in diverted_data.get("diversion_options", []):
        if opt["id"] == payload.option_id:
            matching_option = opt
            break

    if not matching_option:
        raise HTTPException(status_code=400, detail=f"Option {payload.option_id} not found in diversion candidates")

    # Update project corridor with new GeoJSON geometry
    project.corridor = matching_option["corridor"]
    db.commit()
    db.refresh(project)

    return {
        "status": "SUCCESS",
        "message": f"Successfully adopted {matching_option['name']} into project corridor!",
        "new_corridor": project.corridor,
        "metrics": matching_option["metrics"]
    }
