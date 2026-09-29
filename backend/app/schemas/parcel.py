from typing import Optional, List, Any
from pydantic import BaseModel

class StageEventSchema(BaseModel):
    stage: str
    date: str
    actor: str
    note: Optional[str] = None
    immutableHash: str

    class Config:
        from_attributes = True

class DocumentRefSchema(BaseModel):
    id: str
    title: str
    type: str
    uploadedAt: str
    ocrVerified: bool
    ocrFields: Optional[List[dict]] = None
    url: Optional[str] = None

    class Config:
        from_attributes = True

class DataConflictSchema(BaseModel):
    field: str
    sourceA: dict
    sourceB: dict
    resolved: bool

    class Config:
        from_attributes = True

class ObjectionSchema(BaseModel):
    id: str
    filedBy: str
    filedAt: str
    subject: str
    description: str
    status: str
    slaDueDate: str

    class Config:
        from_attributes = True

class FinancialRecordSchema(BaseModel):
    awardedAmount: float
    disbursedAmount: float
    paymentReferenceMasked: Optional[str] = None
    settlementDate: Optional[str] = None
    valuationRatePerSqm: float

    class Config:
        from_attributes = True

class ParcelResponse(BaseModel):
    id: str
    stateRefNo: str
    stateId: str
    districtId: str
    villageId: str
    projectId: str
    ownerId: Optional[str] = None
    ownerName: str
    normalizedAreaSqm: float
    sourceArea: float
    sourceAreaUnit: str
    stage: str
    risk: str
    riskReasons: List[str] = []
    dataQualityFlags: List[str] = []
    geometry: Optional[dict] = None
    centroid: Optional[List[float]] = None
    timeline: List[StageEventSchema] = []
    documents: List[DocumentRefSchema] = []
    conflicts: List[DataConflictSchema] = []
    objections: List[ObjectionSchema] = []
    financials: Optional[FinancialRecordSchema] = None

    class Config:
        from_attributes = True

class ParcelUpdate(BaseModel):
    ownerName: Optional[str] = None
    sourceArea: Optional[float] = None
    sourceAreaUnit: Optional[str] = None
    stage: Optional[str] = None
    risk: Optional[str] = None
    riskReasons: Optional[List[str]] = None
    dataQualityFlags: Optional[List[str]] = None
