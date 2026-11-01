from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_admin
from app.core.config import settings
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.talent import TalentProfile, Team
from app.models.job import Job
from app.models.match import JobMatch
from app.models.application import Application
from app.models.ai_log import AIUsageLog, AuditLog
from app.schemas.notification import AdminStatsResponse, AIStatusResponse

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/analytics", response_model=AdminStatsResponse)
def get_admin_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    recruiters = db.query(User).filter(User.role == "recruiter").count()
    talents = db.query(User).filter(User.role == "talent").count()
    teams = db.query(Team).count()
    jobs = db.query(Job).count()
    pub_jobs = db.query(Job).filter(Job.status == "published").count()
    matches = db.query(JobMatch).count()
    apps = db.query(Application).count()

    ai_logs = db.query(AIUsageLog).all()
    ai_count = len(ai_logs)
    success_count = sum(1 for l in ai_logs if l.status == "success")
    rate = (success_count / ai_count * 100) if ai_count > 0 else 100.0

    return AdminStatsResponse(
        total_users=total_users,
        total_recruiters=recruiters,
        total_talents=talents,
        total_teams=teams,
        total_jobs=jobs,
        published_jobs=pub_jobs,
        total_matches_generated=matches,
        total_applications=apps,
        ai_requests_count=ai_count,
        ai_success_rate=round(rate, 1),
        selected_ai_provider=settings.AI_PROVIDER,
        selected_ai_model=settings.GEMINI_MODEL if settings.AI_PROVIDER == "gemini" else settings.GROK_MODEL
    )

@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).limit(100).all()

    results = []
    for u in users:
        name = u.email.split("@")[0]
        details = ""
        if u.role == "recruiter" and u.recruiter_profile:
            name = u.recruiter_profile.full_name
            if u.recruiter_profile.company:
                details = u.recruiter_profile.company.name
        elif u.role == "talent" and u.talent_profile:
            name = u.talent_profile.name
            details = u.talent_profile.specialization or u.talent_type or "Developer"

        results.append({
            "id": u.id,
            "email": u.email,
            "name": name,
            "role": u.role,
            "talent_type": u.talent_type,
            "details": details,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return results

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own admin account")

    user.is_active = not user.is_active
    db.commit()
    return {"success": True, "user_id": user.id, "is_active": user.is_active}

@router.get("/jobs")
def get_all_jobs_for_moderation(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    results = []
    for j in jobs:
        results.append({
            "id": j.id,
            "title": j.title,
            "company_name": j.company.name if j.company else "Unknown",
            "recruiter_name": j.recruiter.full_name if j.recruiter else "Unknown",
            "employment_type": j.employment_type,
            "status": j.status,
            "created_at": j.created_at
        })
    return results

@router.put("/jobs/{job_id}/moderate")
def moderate_job(
    job_id: int,
    payload: dict,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_status = payload.get("status")
    if new_status in ["published", "paused", "closed"]:
        job.status = new_status
        db.commit()

    return {"success": True, "job_id": job.id, "status": job.status}

@router.get("/ai-monitoring")
def get_ai_monitoring_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AIUsageLog).order_by(AIUsageLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "provider": l.provider,
            "model": l.model,
            "task_type": l.task_type,
            "latency_ms": l.latency_ms,
            "status": l.status,
            "error_details": l.error_details,
            "created_at": l.created_at
        }
        for l in logs
    ]

@router.get("/audit-logs")
def get_audit_trail(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": l.created_at
        }
        for l in logs
    ]
