import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import DocumentRef
from app.schemas.document import DocumentCreate, DocumentOCRPreview

router = APIRouter()

@router.get("", response_model=List[dict])
def list_documents(
    parcel_id: Optional[str] = None,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DocumentRef)
    if parcel_id:
        query = query.filter(DocumentRef.parcel_id == parcel_id)
    if project_id:
        query = query.filter(DocumentRef.project_id == project_id)
    docs = query.all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "type": d.type,
            "uploadedAt": d.uploaded_at,
            "ocrVerified": d.ocr_verified,
            "ocrFields": d.ocr_fields or [],
            "url": d.url
        } for d in docs
    ]

@router.post("", response_model=dict)
def create_document_metadata(doc: DocumentCreate, db: Session = Depends(get_db)):
    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    today_iso = doc.uploaded_at or datetime.utcnow().strftime("%Y-%m-%d")

    # Sample OCR extraction preview for demonstration
    mock_ocr = [
        {"field": "Document Date", "extracted": today_iso, "verified": True},
        {"field": "Document Reference", "extracted": f"REF/{doc_id}", "verified": True},
    ]

    new_doc = DocumentRef(
        id=doc_id,
        parcel_id=doc.parcel_id,
        project_id=doc.project_id,
        title=doc.title,
        type=doc.type,
        uploaded_at=today_iso,
        ocr_verified=True,
        ocr_fields=mock_ocr,
        url=doc.url or f"/documents/{doc_id}.pdf"
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "id": new_doc.id,
        "title": new_doc.title,
        "type": new_doc.type,
        "uploadedAt": new_doc.uploaded_at,
        "ocrVerified": new_doc.ocr_verified,
        "ocrFields": new_doc.ocr_fields,
        "url": new_doc.url
    }

@router.get("/{document_id}/ocr", response_model=DocumentOCRPreview)
def get_document_ocr(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentRef).filter(DocumentRef.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentOCRPreview(
        document_id=doc.id,
        title=doc.title,
        ocr_verified=doc.ocr_verified,
        extracted_fields=doc.ocr_fields or [],
        confidence_score=0.96
    )
