from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.ai.orchestrator import AIOrchestrator
from app.ai.factory import AIProviderFactory
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.models.ai_log import AIUsageLog
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Operations"])

@router.post("/extract-requirements")
async def extract_requirements(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")

    orchestrator = AIOrchestrator()
    try:
        result = await orchestrator.extract_job_requirements(text, db=db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Extraction failed: {str(e)}")

@router.post("/analyze-profile")
async def analyze_profile(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Profile text cannot be empty.")

    orchestrator = AIOrchestrator()
    try:
        result = await orchestrator.analyze_talent_profile(text, db=db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Profile Analysis failed: {str(e)}")

@router.post("/normalize-skills")
def normalize_skills(payload: dict = Body(...)):
    skills = payload.get("skills", [])
    results = [SkillNormalizerService.normalize_skill(s).model_dump() for s in skills]
    return {"results": results}

@router.get("/test-connection")
async def test_ai_connection(
    provider_name: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None
):
    provider = AIProviderFactory.get_provider(
        provider_name=provider_name,
        api_key=api_key,
        model=model
    )
    result = await provider.test_connection()
    return result

@router.get("/status")
def get_ai_status(db: Session = Depends(get_db)):
    total_logs = db.query(AIUsageLog).count()
    success_logs = db.query(AIUsageLog).filter(AIUsageLog.status == "success").count()
    error_logs = db.query(AIUsageLog).filter(AIUsageLog.status == "error").count()

    recent_logs = db.query(AIUsageLog).order_by(AIUsageLog.created_at.desc()).limit(10).all()
    avg_latency = 0.0
    if recent_logs:
        avg_latency = sum(l.latency_ms for l in recent_logs) / len(recent_logs)

    return {
        "selected_provider": settings.AI_PROVIDER,
        "selected_model": settings.GEMINI_MODEL if settings.AI_PROVIDER == "gemini" else settings.GROK_MODEL,
        "features_enabled": settings.AI_FEATURES_ENABLED,
        "match_threshold": settings.MATCH_THRESHOLD,
        "algorithm_version": "1.0-hybrid",
        "total_requests": total_logs,
        "success_count": success_logs,
        "error_count": error_logs,
        "average_latency_ms": round(avg_latency, 2),
        "weights": {
            "mandatory_skills": settings.WEIGHT_MANDATORY_SKILLS,
            "preferred_skills": settings.WEIGHT_PREFERRED_SKILLS,
            "relevant_projects": settings.WEIGHT_RELEVANT_PROJECTS,
            "experience": settings.WEIGHT_EXPERIENCE,
            "availability": settings.WEIGHT_AVAILABILITY_PREFERENCE
        }
    }

@router.post("/configure")
def configure_ai_settings(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can adjust AI engine settings.")

    if "provider" in payload:
        settings.AI_PROVIDER = payload["provider"]
    if "match_threshold" in payload:
        settings.MATCH_THRESHOLD = int(payload["match_threshold"])
    if "gemini_model" in payload:
        settings.GEMINI_MODEL = payload["gemini_model"]
    if "grok_model" in payload:
        settings.GROK_MODEL = payload["grok_model"]

    return {
        "success": True,
        "message": "AI configuration updated.",
        "provider": settings.AI_PROVIDER,
        "threshold": settings.MATCH_THRESHOLD
    }
