from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_recruiter
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.job import Job, JobSkill
from app.models.skill import Skill
from app.models.match import JobMatch
from app.models.application import Application, Invitation
from app.models.talent import TalentProfile
from app.models.ai_log import AuditLog
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.notifications.orchestrator import NotificationOrchestrator
from app.schemas.recruiter import (
    CompanyUpdate, CompanyResponse, RecruiterDashboardStats,
    JobCreateRequest, JobResponse, CandidateMatchCard,
    ApplicationPipelineUpdate, SendInvitationRequest
)

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])

@router.get("/dashboard", response_model=RecruiterDashboardStats)
def get_recruiter_dashboard(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    job_ids = [j.id for j in profile.jobs]
    active_jobs = sum(1 for j in profile.jobs if j.status == "published")
    closed_jobs = sum(1 for j in profile.jobs if j.status == "closed")

    total_matches = (
        db.query(JobMatch)
        .filter(JobMatch.job_id.in_(job_ids), JobMatch.eligibility == "eligible")
        .count() if job_ids else 0
    )

    applications = (
        db.query(Application)
        .filter(Application.job_id.in_(job_ids))
        .all() if job_ids else []
    )

    total_applications = len(applications)
    shortlisted = sum(1 for a in applications if a.status in ["shortlisted", "interview", "selected"])
    pending = sum(1 for a in applications if a.status in ["applied", "under_review"])

    return RecruiterDashboardStats(
        active_jobs=active_jobs,
        total_matched_profiles=total_matches,
        applications_received=total_applications,
        shortlisted_candidates=shortlisted,
        pending_responses=pending,
        closed_opportunities=closed_jobs
    )

@router.get("/company", response_model=CompanyResponse)
def get_company(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    if not profile or not profile.company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return profile.company

@router.put("/company", response_model=CompanyResponse)
def update_company(
    payload: CompanyUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    if not profile or not profile.company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    company = profile.company
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)
    return company

@router.get("/jobs", response_model=List[JobResponse])
def get_recruiter_jobs(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    if not profile:
        return []

    jobs = db.query(Job).filter(Job.recruiter_id == profile.id).order_by(Job.created_at.desc()).all()
    results = []
    for job in jobs:
        m_skills = [js.skill.name for js in job.skills if js.is_mandatory]
        p_skills = [js.skill.name for js in job.skills if not js.is_mandatory]
        m_count = db.query(JobMatch).filter(JobMatch.job_id == job.id, JobMatch.eligibility == "eligible").count()
        app_count = db.query(Application).filter(Application.job_id == job.id).count()

        results.append(JobResponse(
            id=job.id,
            title=job.title,
            category=job.category,
            description=job.description,
            employment_type=job.employment_type,
            work_mode=job.work_mode,
            location=job.location,
            compensation_range=job.compensation_range,
            experience_min=job.experience_min,
            experience_max=job.experience_max,
            openings=job.openings,
            deadline=job.deadline,
            responsibilities=job.responsibilities,
            additional_requirements=job.additional_requirements,
            strict_eligibility=job.strict_eligibility,
            status=job.status,
            created_at=job.created_at,
            published_at=job.published_at,
            company_name=job.company.name if job.company else None,
            mandatory_skills=m_skills,
            preferred_skills=p_skills,
            match_count=m_count,
            application_count=app_count
        ))
    return results

@router.post("/jobs", response_model=JobResponse)
def create_job(
    payload: JobCreateRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    company_id = profile.company.id if profile.company else None

    status_val = "published" if payload.publish_immediately else "draft"
    pub_time = datetime.now(timezone.utc) if payload.publish_immediately else None

    job = Job(
        recruiter_id=profile.id,
        company_id=company_id,
        title=payload.title,
        category=payload.category,
        description=payload.description,
        employment_type=payload.employment_type,
        work_mode=payload.work_mode,
        location=payload.location,
        compensation_range=payload.compensation_range,
        experience_min=payload.experience_min,
        experience_max=payload.experience_max,
        openings=payload.openings,
        deadline=payload.deadline,
        responsibilities=payload.responsibilities,
        additional_requirements=payload.additional_requirements,
        strict_eligibility=payload.strict_eligibility,
        status=status_val,
        published_at=pub_time
    )
    db.add(job)
    db.flush()

    # Link mandatory skills
    for s_name in payload.mandatory_skills:
        norm = SkillNormalizerService.normalize_skill(s_name)
        skill = db.query(Skill).filter(Skill.canonical_name == norm.canonical_name).first()
        if not skill:
            skill = Skill(name=norm.canonical_name, canonical_name=norm.canonical_name, category=norm.category)
            db.add(skill)
            db.flush()
        db.add(JobSkill(job_id=job.id, skill_id=skill.id, is_mandatory=True))

    # Link preferred skills
    for s_name in payload.preferred_skills:
        norm = SkillNormalizerService.normalize_skill(s_name)
        skill = db.query(Skill).filter(Skill.canonical_name == norm.canonical_name).first()
        if not skill:
            skill = Skill(name=norm.canonical_name, canonical_name=norm.canonical_name, category=norm.category)
            db.add(skill)
            db.flush()
        db.add(JobSkill(job_id=job.id, skill_id=skill.id, is_mandatory=False))

    db.commit()
    db.refresh(job)

    # If published immediately, trigger AI matching and targeted notifications
    if job.status == "published":
        NotificationOrchestrator.process_job_published(job.id, db)

    m_skills = [js.skill.name for js in job.skills if js.is_mandatory]
    p_skills = [js.skill.name for js in job.skills if not js.is_mandatory]

    return JobResponse(
        id=job.id,
        title=job.title,
        category=job.category,
        description=job.description,
        employment_type=job.employment_type,
        work_mode=job.work_mode,
        location=job.location,
        compensation_range=job.compensation_range,
        experience_min=job.experience_min,
        experience_max=job.experience_max,
        openings=job.openings,
        deadline=job.deadline,
        responsibilities=job.responsibilities,
        additional_requirements=job.additional_requirements,
        strict_eligibility=job.strict_eligibility,
        status=job.status,
        created_at=job.created_at,
        published_at=job.published_at,
        company_name=job.company.name if job.company else None,
        mandatory_skills=m_skills,
        preferred_skills=p_skills,
        match_count=0,
        application_count=0
    )

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    m_skills = [js.skill.name for js in job.skills if js.is_mandatory]
    p_skills = [js.skill.name for js in job.skills if not js.is_mandatory]
    m_count = db.query(JobMatch).filter(JobMatch.job_id == job.id, JobMatch.eligibility == "eligible").count()
    app_count = db.query(Application).filter(Application.job_id == job.id).count()

    return JobResponse(
        id=job.id,
        title=job.title,
        category=job.category,
        description=job.description,
        employment_type=job.employment_type,
        work_mode=job.work_mode,
        location=job.location,
        compensation_range=job.compensation_range,
        experience_min=job.experience_min,
        experience_max=job.experience_max,
        openings=job.openings,
        deadline=job.deadline,
        responsibilities=job.responsibilities,
        additional_requirements=job.additional_requirements,
        strict_eligibility=job.strict_eligibility,
        status=job.status,
        created_at=job.created_at,
        published_at=job.published_at,
        company_name=job.company.name if job.company else None,
        mandatory_skills=m_skills,
        preferred_skills=p_skills,
        match_count=m_count,
        application_count=app_count
    )

@router.post("/jobs/{job_id}/publish")
def publish_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "published"
    job.published_at = datetime.now(timezone.utc)
    db.commit()

    # Trigger targeted matching and notification orchestration
    match_stats = NotificationOrchestrator.process_job_published(job.id, db)

    return {
        "success": True,
        "message": f"Job '{job.title}' published successfully.",
        "matching_stats": match_stats
    }

@router.post("/jobs/{job_id}/pause")
def pause_job(job_id: int, current_user: User = Depends(require_recruiter), db: Session = Depends(get_db)):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "paused"
    db.commit()
    return {"success": True, "message": "Job paused."}

@router.post("/jobs/{job_id}/close")
def close_job(job_id: int, current_user: User = Depends(require_recruiter), db: Session = Depends(get_db)):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "closed"
    db.commit()
    return {"success": True, "message": "Job closed."}

@router.get("/jobs/{job_id}/matches", response_model=List[CandidateMatchCard])
def get_job_candidate_matches(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # If no matches exist yet, run matching now
    count = db.query(JobMatch).filter(JobMatch.job_id == job.id).count()
    if count == 0:
        NotificationOrchestrator.process_job_published(job.id, db)

    matches = (
        db.query(JobMatch)
        .filter(JobMatch.job_id == job.id)
        .order_by(JobMatch.eligibility.asc(), JobMatch.match_score.desc())
        .all()
    )

    results = []
    for m in matches:
        t_prof = m.talent_profile
        t_user = t_prof.user

        # Check existing application
        app = db.query(Application).filter(Application.job_id == job.id, Application.talent_profile_id == t_prof.id).first()
        inv = db.query(Invitation).filter(Invitation.job_id == job.id, Invitation.talent_profile_id == t_prof.id).first()

        skills = [ps.skill.canonical_name for ps in t_prof.profile_skills]

        results.append(CandidateMatchCard(
            match_id=m.id,
            talent_profile_id=t_prof.id,
            user_id=t_user.id,
            name=t_prof.name,
            headline=t_prof.headline,
            specialization=t_prof.specialization,
            talent_type=t_user.talent_type or "developer",
            experience_years=t_prof.experience_years,
            location=t_prof.location,
            remote_preference=t_prof.remote_preference,
            match_score=m.match_score,
            eligibility=m.eligibility,
            matched_mandatory_skills=m.matched_mandatory_skills or [],
            missing_mandatory_skills=m.missing_mandatory_skills or [],
            matched_preferred_skills=m.matched_preferred_skills or [],
            missing_preferred_skills=m.missing_preferred_skills or [],
            relevant_projects=m.relevant_projects or [],
            score_breakdown=m.score_breakdown or {},
            explanation=m.explanation,
            skills=skills,
            has_applied=app is not None,
            has_invitation=inv is not None,
            application_status=app.status if app else None
        ))
    return results

@router.get("/applications")
def get_recruiter_applications(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job_ids = [j.id for j in profile.jobs]
    if not job_ids:
        return []

    apps = db.query(Application).filter(Application.job_id.in_(job_ids)).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        talent = a.talent_profile
        match_rec = db.query(JobMatch).filter(JobMatch.job_id == a.job_id, JobMatch.talent_profile_id == talent.id).first()
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title,
            "talent_profile_id": talent.id,
            "candidate_name": talent.name,
            "headline": talent.headline,
            "specialization": talent.specialization,
            "talent_type": talent.user.talent_type,
            "experience_years": talent.experience_years,
            "status": a.status,
            "cover_note": a.cover_note,
            "recruiter_notes": a.recruiter_notes,
            "interview_date": a.interview_date,
            "match_score": match_rec.match_score if match_rec else None,
            "applied_at": a.created_at
        })
    return results

@router.put("/applications/{app_id}")
def update_application_status(
    app_id: int,
    payload: ApplicationPipelineUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app or app.job.recruiter_id != profile.id:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    app.status = payload.status
    if payload.recruiter_notes is not None:
        app.recruiter_notes = payload.recruiter_notes
    if payload.interview_date is not None:
        app.interview_date = payload.interview_date

    db.commit()

    # Send status update notification to the candidate
    if old_status != app.status:
        company_name = app.job.company.name if app.job.company else "Company"
        NotificationOrchestrator.send_application_status_notification(
            user_id=app.talent_profile.user_id,
            job_title=app.job.title,
            company_name=company_name,
            new_status=app.status,
            db=db
        )

    return {"success": True, "status": app.status}

@router.post("/invitations")
def send_candidate_invitation(
    payload: SendInvitationRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == payload.job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    talent = db.query(TalentProfile).filter(TalentProfile.id == payload.talent_profile_id).first()
    if not talent:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    existing = db.query(Invitation).filter(
        Invitation.job_id == job.id,
        Invitation.talent_profile_id == talent.id
    ).first()

    if existing:
        return {"success": True, "message": "Invitation already dispatched."}

    inv = Invitation(
        job_id=job.id,
        recruiter_id=profile.id,
        talent_profile_id=talent.id,
        message=payload.message,
        status="pending"
    )
    db.add(inv)
    db.commit()

    # Send targeted notification to candidate
    company_name = job.company.name if job.company else "A hiring partner"
    NotificationOrchestrator.send_recruitment_invitation(
        user_id=talent.user_id,
        recruiter_name=profile.full_name,
        company_name=company_name,
        job_title=job.title,
        db=db
    )

    return {"success": True, "message": f"Invitation dispatched to {talent.name}."}
