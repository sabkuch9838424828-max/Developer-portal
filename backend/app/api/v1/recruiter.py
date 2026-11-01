import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_recruiter
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.job import Job, JobSkill
from app.models.skill import Skill
from app.models.match import JobMatch
from app.models.application import Application, Invitation
from app.models.talent import TalentProfile, Team
from app.models.resume import Resume, ResumeExtraction, ResumeAccessLog
from app.models.achievement import Achievement, TeamAchievement, TeamAchievementContributor
from app.models.identity import IdentityVerificationRecord
from app.services.achievement_service import AchievementService
from app.models.ai_log import AuditLog
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.services.resume_service import ResumeIntelligenceService
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
        identity_requirement=payload.identity_requirement or "none",
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
        application_count=0,
        identity_requirement=job.identity_requirement or "none"
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
        application_count=app_count,
        identity_requirement=job.identity_requirement or "none"
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

        # Active resume information
        active_resume = next((r for r in t_prof.resumes if r.is_active), None)
        has_resume = active_resume is not None
        resume_id = active_resume.id if active_resume else None
        resume_visibility = active_resume.visibility if active_resume else None
        resume_filename = active_resume.original_filename if active_resume else None
        evidence_count = len(active_resume.extractions[0].skills) if active_resume and active_resume.extractions and active_resume.extractions[0].skills else 0

        # Identity disclosure check
        id_rec = db.query(IdentityVerificationRecord).filter(
            IdentityVerificationRecord.user_id == t_user.id
        ).first()
        is_id_disclosed = id_rec.disclosed_to_recruiters if id_rec else True
        is_verified = bool(t_prof.identity_verified) if is_id_disclosed else False
        id_status = t_prof.identity_status if is_id_disclosed else "hidden"

        # Verified achievements
        verified_achs = [
            a for a in t_prof.achievements
            if a.verification_status == "verified" and a.is_public
        ]
        top_achs = [
            {"id": a.id, "title": a.title, "category": a.category, "issuer": a.issuer}
            for a in verified_achs[:3]
        ]

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
            application_status=app.status if app else None,
            has_resume=has_resume,
            resume_id=resume_id,
            resume_visibility=resume_visibility,
            resume_filename=resume_filename,
            evidence_count=evidence_count,
            profile_picture_url=t_prof.profile_picture_url or t_user.avatar_url,
            identity_verified=is_verified,
            identity_status=id_status,
            verified_achievements_count=len(verified_achs),
            top_achievements=top_achs
        ))
    return results

@router.get("/jobs/{job_id}/candidate-matches", response_model=List[CandidateMatchCard])
def get_job_candidate_matches_alias(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    return get_job_candidate_matches(job_id=job_id, current_user=current_user, db=db)

@router.get("/jobs/{job_id}/candidate-matches/{candidate_id}/evidence")
def get_candidate_match_evidence(
    job_id: int,
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidate = db.query(TalentProfile).filter(TalentProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    match = db.query(JobMatch).filter(JobMatch.job_id == job.id, JobMatch.talent_profile_id == candidate.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Candidate match record not found.")

    # Find active resume & extraction evidence
    active_resume = next((r for r in candidate.resumes if r.is_active), None)
    resume_skills_map = {}
    if active_resume and active_resume.extractions:
        for sk in active_resume.extractions[0].skills or []:
            c_name = sk.get("canonical_name")
            if c_name:
                resume_skills_map[c_name] = sk

    # Construct verified evidence list
    mandatory_evidence = []
    for m_skill in match.matched_mandatory_skills or []:
        clean_name = m_skill.replace(" (via related)", "")
        ev_item = resume_skills_map.get(clean_name, {})
        mandatory_evidence.append({
            "skill": m_skill,
            "evidence": ev_item.get("evidence") or f"Demonstrated in verified candidate skill inventory.",
            "context": ev_item.get("associated_context") or "Profile & Portfolio",
            "confidence": ev_item.get("confidence", 0.95),
            "is_resume_verified": clean_name in resume_skills_map
        })

    preferred_evidence = []
    for p_skill in match.matched_preferred_skills or []:
        clean_name = p_skill.replace(" (via related)", "")
        ev_item = resume_skills_map.get(clean_name, {})
        preferred_evidence.append({
            "skill": p_skill,
            "evidence": ev_item.get("evidence") or f"Demonstrated in verified candidate profile.",
            "context": ev_item.get("associated_context") or "Profile & Portfolio",
            "confidence": ev_item.get("confidence", 0.95),
            "is_resume_verified": clean_name in resume_skills_map
        })

    # Can recruiter download/view full resume?
    can_download_resume = False
    resume_access_reason = "No active resume uploaded."
    if active_resume:
        can_download_resume, resume_access_reason = ResumeIntelligenceService.can_recruiter_access_resume(
            active_resume, current_user, db
        )

    return {
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "headline": candidate.headline,
        "match_score": match.match_score,
        "eligibility": match.eligibility,
        "explanation": match.explanation,
        "score_breakdown": match.score_breakdown or {},
        "mandatory_evidence": mandatory_evidence,
        "preferred_evidence": preferred_evidence,
        "missing_mandatory": match.missing_mandatory_skills or [],
        "missing_preferred": match.missing_preferred_skills or [],
        "relevant_projects": match.relevant_projects or [],
        "experience_years": candidate.experience_years,
        "education": candidate.education,
        "has_resume": active_resume is not None,
        "resume_id": active_resume.id if active_resume else None,
        "can_download_resume": can_download_resume,
        "resume_access_reason": resume_access_reason,
        "disclaimer": "NEXORA match compatibility indicates engineering qualification grounded in verified evidence. Protected personal characteristics are not used in ranking."
    }

@router.get("/candidates/{candidate_id}/resume")
def download_candidate_resume(
    candidate_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    candidate = db.query(TalentProfile).filter(TalentProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    active_resume = next((r for r in candidate.resumes if r.is_active), None)
    if not active_resume:
        raise HTTPException(status_code=404, detail="Candidate has not uploaded a resume.")

    # Enforce strict visibility permissions
    can_access, reason = ResumeIntelligenceService.can_recruiter_access_resume(active_resume, current_user, db)
    if not can_access:
        raise HTTPException(status_code=403, detail=f"Resume access denied: {reason}")

    if not os.path.exists(active_resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on storage server.")

    # Audit log
    ResumeIntelligenceService.log_access(
        active_resume.id,
        current_user.id,
        "download",
        "recruiter",
        db,
        notes=f"Recruiter {current_user.id} accessed resume for candidate {candidate_id}"
    )

    return FileResponse(
        path=active_resume.file_path,
        filename=f"{candidate.name.replace(' ', '_')}_Resume_{active_resume.original_filename}",
        media_type=active_resume.mime_type
    )

@router.post("/candidates/compare")
def compare_candidates_for_job(
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    job_id = payload.get("job_id")
    candidate_ids = payload.get("candidate_ids", [])

    if not job_id or not candidate_ids:
        raise HTTPException(status_code=400, detail="job_id and candidate_ids list (at least 2) are required.")

    profile = current_user.recruiter_profile
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = db.query(TalentProfile).filter(TalentProfile.id.in_(candidate_ids)).all()
    if len(candidates) < 1:
        raise HTTPException(status_code=404, detail="No matching candidates found.")

    comparison_results = []
    job_mandatory = [js.skill.name for js in job.skills if js.is_mandatory]
    job_preferred = [js.skill.name for js in job.skills if not js.is_mandatory]

    for cand in candidates:
        match = db.query(JobMatch).filter(JobMatch.job_id == job.id, JobMatch.talent_profile_id == cand.id).first()
        active_resume = next((r for r in cand.resumes if r.is_active), None)

        resume_skills = []
        if active_resume and active_resume.extractions:
            resume_skills = [sk.get("canonical_name") for sk in active_resume.extractions[0].skills or []]

        can_view_resume, access_note = (
            ResumeIntelligenceService.can_recruiter_access_resume(active_resume, current_user, db)
            if active_resume else (False, "No resume uploaded.")
        )

        comparison_results.append({
            "candidate_id": cand.id,
            "name": cand.name,
            "headline": cand.headline,
            "specialization": cand.specialization,
            "experience_years": cand.experience_years,
            "education": cand.education,
            "location": cand.location,
            "remote_preference": cand.remote_preference,
            "match_score": match.match_score if match else 0.0,
            "eligibility": match.eligibility if match else "unscored",
            "score_breakdown": match.score_breakdown if match else {},
            "matched_mandatory": match.matched_mandatory_skills if match else [],
            "missing_mandatory": match.missing_mandatory_skills if match else [],
            "matched_preferred": match.matched_preferred_skills if match else [],
            "missing_preferred": match.missing_preferred_skills if match else [],
            "mandatory_coverage_percent": round(len(match.matched_mandatory_skills or []) / max(1, len(job_mandatory)) * 100) if match else 0,
            "preferred_coverage_percent": round(len(match.matched_preferred_skills or []) / max(1, len(job_preferred)) * 100) if match else 0,
            "relevant_projects": match.relevant_projects if match else [],
            "has_resume": active_resume is not None,
            "resume_id": active_resume.id if active_resume else None,
            "can_view_resume": can_view_resume,
            "resume_access_note": access_note,
            "resume_verified_skills": resume_skills[:8]
        })

    # Sort candidates by eligibility and match score
    comparison_results.sort(key=lambda x: (x["eligibility"] == "eligible", x["match_score"]), reverse=True)

    return {
        "job_id": job.id,
        "job_title": job.title,
        "mandatory_requirements": job_mandatory,
        "preferred_requirements": job_preferred,
        "candidate_count": len(comparison_results),
        "candidates": comparison_results
    }

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


# ==========================================
# MODULE 7: RECRUITER TRUST & ACHIEVEMENT DISCOVERY
# ==========================================

@router.get("/candidates/{talent_id}/trust-profile")
def get_candidate_trust_profile(
    talent_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    talent = db.query(TalentProfile).filter(TalentProfile.id == talent_id).first()
    if not talent:
        raise HTTPException(status_code=404, detail="Candidate not found")

    user = talent.user
    id_rec = db.query(IdentityVerificationRecord).filter(
        IdentityVerificationRecord.user_id == user.id
    ).first()

    disclosed = id_rec.disclosed_to_recruiters if id_rec else True

    # Public individual achievements
    achievements = db.query(Achievement).filter(
        Achievement.talent_profile_id == talent.id,
        Achievement.is_public == True
    ).all()

    # Public team attributions accepted
    attributions = db.query(TeamAchievementContributor).filter(
        TeamAchievementContributor.talent_profile_id == talent.id,
        TeamAchievementContributor.attribution_status == "accepted"
    ).all()

    team_ach_data = []
    for attr in attributions:
        ach = attr.team_achievement
        if ach and ach.is_public:
            team_ach_data.append({
                "team_name": ach.team.name if ach.team else "Team",
                "team_logo_url": ach.team.logo_url if ach.team else None,
                "title": ach.title,
                "category": ach.category,
                "issuer": ach.issuer,
                "role_in_project": attr.role_in_project,
                "date_awarded": ach.date_awarded.isoformat() if ach.date_awarded else None
            })

    return {
        "candidate_id": talent.id,
        "name": talent.name,
        "headline": talent.headline,
        "profile_picture_url": talent.profile_picture_url or user.avatar_url,
        "identity_verified": bool(talent.identity_verified) if disclosed else False,
        "identity_status": talent.identity_status if disclosed else "hidden",
        "verified_at": id_rec.verified_at.isoformat() if id_rec and id_rec.verified_at and disclosed else None,
        "achievements": [AchievementService.serialize_achievement(a) for a in achievements],
        "team_achievements": team_ach_data
    }

@router.get("/teams/{team_id}/trust-profile")
def get_team_trust_profile(
    team_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    if team_id.isdigit():
        team = db.query(Team).filter(Team.id == int(team_id)).first()
    else:
        team = db.query(Team).filter(Team.slug == team_id).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    achievements = AchievementService.get_team_achievements(team.id, db=db)

    # Check how many team members have verified government identities
    verified_members_count = sum(1 for m in team.members if m.talent_profile and m.talent_profile.identity_verified)

    return {
        "team_id": team.id,
        "name": team.name,
        "slug": team.slug,
        "logo_url": team.logo_url,
        "cover_image_url": team.cover_image_url,
        "total_members": len(team.members),
        "verified_identity_members_count": verified_members_count,
        "achievements": [AchievementService.serialize_team_achievement(a) for a in achievements]
    }
