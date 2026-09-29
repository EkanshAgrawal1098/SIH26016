from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.reference import State, District, Village

router = APIRouter()

@router.get("/states")
def get_states(db: Session = Depends(get_db)):
    states = db.query(State).all()
    return [{"id": s.id, "code": s.code, "name": s.name} for s in states]

@router.get("/districts")
def get_districts(state_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(District)
    if state_id:
        query = query.filter(District.state_id == state_id)
    districts = query.all()
    return [{"id": d.id, "stateId": d.state_id, "code": d.code, "name": d.name} for d in districts]

@router.get("/villages")
def get_villages(district_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Village)
    if district_id:
        query = query.filter(Village.district_id == district_id)
    villages = query.all()
    return [{"id": v.id, "districtId": v.district_id, "name": v.name} for v in villages]
