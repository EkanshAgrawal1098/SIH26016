from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    projects,
    parcels,
    acquisition,
    analytics,
    documents,
    interoperability,
    grievances,
    reference,
    rr,
    field,
    routes,
    copilot
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access"])
api_router.include_router(projects.router, prefix="/projects", tags=["Project Management & 360"])
api_router.include_router(parcels.router, prefix="/parcels", tags=["Land Parcel & 360"])
api_router.include_router(acquisition.router, prefix="/acquisition-cases", tags=["Acquisition Workflow"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Risk Intelligence"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Management & OCR"])
api_router.include_router(interoperability.router, prefix="/imports", tags=["State Interoperability & Ingestion"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["Grievances & Citizen Support"])
api_router.include_router(reference.router, prefix="/reference", tags=["Administrative Reference Hierarchy"])
api_router.include_router(rr.router, prefix="/rr", tags=["Rehabilitation & Resettlement (R&R)"])
api_router.include_router(field.router, prefix="/field", tags=["Field Officer Inspection & Verification"])
api_router.include_router(routes.router, prefix="/projects", tags=["AI Corridor Rerouting & Contiguity"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["BhoomiAI Copilot & Statutory Guidance"])

