import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.document import UploadedDocument, DocumentExtraction
from app.ai.services.document_intelligence import DocumentIntelligenceService
from app.ai.orchestrator import AIOrchestrator

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("job_description"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify extension
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower().replace(".", "")
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type .{ext}. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read bytes and check size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Save to private storage
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(settings.STORAGE_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Record in DB
    doc = UploadedDocument(
        user_id=current_user.id,
        filename=filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        doc_type=doc_type,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extract text from document using Document Intelligence
    try:
        raw_text, doc_class, ocr_applied = DocumentIntelligenceService.process_document(file_path, doc.mime_type)
        
        # Analyze with AI
        orchestrator = AIOrchestrator()
        if doc_type == "job_description":
            extraction_result = await orchestrator.extract_job_requirements(raw_text, db=db)
            structured_data = extraction_result.model_dump()
        else:
            profile_result = await orchestrator.analyze_talent_profile(raw_text, db=db)
            structured_data = profile_result.model_dump()

        # Save extraction
        extraction = DocumentExtraction(
            document_id=doc.id,
            raw_text=raw_text[:2000],
            structured_data=structured_data,
            confidence=structured_data.get("confidence", 0.95),
            review_required=True,
            approved_by_user=False
        )
        db.add(extraction)
        doc.status = "review_required"
        db.commit()

        return {
            "success": True,
            "document_id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "extracted_text_preview": raw_text[:500] if raw_text else "",
            "extracted_data": structured_data
        }

    except Exception as e:
        doc.status = "failed"
        doc.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

@router.get("/{document_id}")
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    extractions = [
        {
            "id": e.id,
            "structured_data": e.structured_data,
            "confidence": e.confidence,
            "review_required": e.review_required,
            "approved_by_user": e.approved_by_user
        }
        for e in doc.extractions
    ]

    return {
        "id": doc.id,
        "filename": doc.filename,
        "status": doc.status,
        "mime_type": doc.mime_type,
        "extractions": extractions,
        "created_at": doc.created_at
    }

@router.post("/{document_id}/approve")
def approve_document_extraction(
    document_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    extraction = doc.extractions[0] if doc.extractions else None
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction found for document")

    # Update structured data with approved/edited fields
    if "approved_data" in payload:
        extraction.structured_data = payload["approved_data"]
    extraction.approved_by_user = True
    extraction.review_required = False
    doc.status = "completed"
    db.commit()

    return {
        "success": True,
        "document_id": doc.id,
        "status": doc.status,
        "approved_data": extraction.structured_data
    }
