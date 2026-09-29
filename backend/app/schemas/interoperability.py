from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ImportRequest(BaseModel):
    source_system: str # e.g. "JH-Jharbhoomi", "MH-Mahabhulekh"
    schema_version: Optional[str] = "1.0"
    format: Optional[str] = "geojson" # "geojson", "json", "csv"
    mapping_version: Optional[str] = "mapping-01"
    records: List[Dict[str, Any]]

class ImportResult(BaseModel):
    source_system: str
    records_received: int
    records_processed: int
    records_failed: int
    conflicts_detected: int
    summary_message: str

class StateFieldMappingSchema(BaseModel):
    id: str
    source_system_id: str
    source_field: str
    canonical_field: str
    transform_rule: str
    is_required: bool

    class Config:
        from_attributes = True

class SourceSystemResponse(BaseModel):
    id: str
    code: str
    name: str
    state_code: str
    system_type: str
    is_active: bool

    class Config:
        from_attributes = True
