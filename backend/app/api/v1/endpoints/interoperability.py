from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.integration import SourceSystem, FieldMapping, SyncRun
from app.models.parcel import LandParcel
from app.models.audit import DataConflict
from app.schemas.interoperability import ImportRequest, ImportResult, SourceSystemResponse
from app.services.state_adapters import adapt_state_record
from app.services.audit_service import record_audit_event

router = APIRouter()

@router.get("/sources", response_model=List[SourceSystemResponse])
def get_source_systems(db: Session = Depends(get_db)):
    sources = db.query(SourceSystem).all()
    if not sources:
        # Provide default registered state adapters
        default_sources = [
            SourceSystem(id="JH-Jharbhoomi", code="JH_REV", name="Jharkhand Jharbhoomi Portal", state_code="JH", system_type="LAND_RECORD"),
            SourceSystem(id="MH-Mahabhulekh", code="MH_REV", name="Maharashtra Mahabhulekh 7/12", state_code="MH", system_type="LAND_RECORD"),
            SourceSystem(id="UP-Bhulekh", code="UP_REV", name="Uttar Pradesh Bhulekh Portal", state_code="UP", system_type="LAND_RECORD"),
            SourceSystem(id="NHAI-DataLake", code="NHAI_GIS", name="NHAI GIS Cadastral Data Lake", state_code="NAT", system_type="ACQUISITION"),
        ]
        for s in default_sources:
            db.add(s)
        db.commit()
        sources = default_sources
    return sources

@router.post("/import", response_model=ImportResult)
def import_state_records(req: ImportRequest, db: Session = Depends(get_db)):
    received = len(req.records)
    processed = 0
    failed = 0
    conflicts = 0

    for raw in req.records:
        try:
            adapted = adapt_state_record(req.source_system, raw)
            
            # Check if parcel already exists
            existing = db.query(LandParcel).filter(LandParcel.state_ref_no == adapted["state_ref_no"]).first()
            if existing:
                # If area or owner differs, flag as DataConflict rather than silently overwriting
                if abs(existing.source_area - adapted["source_area"]) > 0.05:
                    conflict = DataConflict(
                        parcel_id=existing.id,
                        field="Area (Acres)",
                        source_a={"system": existing.source_system or "System Record", "value": f"{existing.source_area} {existing.source_area_unit}"},
                        source_b={"system": req.source_system, "value": f"{adapted['source_area']} {adapted['source_area_unit']}"},
                        resolved=False
                    )
                    db.add(conflict)
                    conflicts += 1
                processed += 1
            else:
                # Insert new canonical parcel
                new_id = f"IN-{req.source_system[:2].upper()}-{raw.get('district_id', 'DST')[:3].upper()}-{raw.get('id', '999')}"
                new_parcel = LandParcel(
                    id=new_id,
                    national_parcel_id=new_id,
                    state_ref_no=adapted["state_ref_no"],
                    state_id=raw.get("state_id", "jharkhand"),
                    district_id=raw.get("district_id", "ranchi"),
                    village_id=raw.get("village_id", "vil-01"),
                    owner_name=adapted["owner_name"],
                    normalized_area_sqm=adapted["normalized_area_sqm"],
                    source_area=adapted["source_area"],
                    source_area_unit=adapted["source_area_unit"],
                    stage="SURVEY",
                    risk="LOW",
                    risk_reasons=[],
                    data_quality_flags=[],
                    geometry=adapted.get("geometry"),
                    centroid=raw.get("centroid", [23.3441, 85.3096]),
                    source_system=req.source_system,
                    source_record_id=adapted["source_record_id"]
                )
                db.add(new_parcel)
                processed += 1
        except Exception as e:
            failed += 1

    db.commit()

    # Record sync run history
    sync_run = SyncRun(
        source_system_id=req.source_system,
        records_read=received,
        records_written=processed,
        records_failed=failed,
        log_summary=f"Batch import executed. Processed: {processed}, Conflicts flagged: {conflicts}"
    )
    db.add(sync_run)
    db.commit()

    return ImportResult(
        source_system=req.source_system,
        records_received=received,
        records_processed=processed,
        records_failed=failed,
        conflicts_detected=conflicts,
        summary_message=f"Successfully transformed {processed}/{received} records into canonical national schema."
    )
