import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_talent
from app.models.user import User
from app.models.talent import TalentProfile, Team, TeamMember
from app.models.skill import Skill, ProfileSkill
from app.models.project import Project, ProjectTechnology
from app.models.job import Job
from app.models.match import JobMatch
from app.models.application import Application, Invitation
from app.models.notification import Notification
from app.models.resume import Resume, ResumeExtraction, ResumeAccessLog
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.services.resume_service import ResumeIntelligenceService
from app.matching.engine import HybridMatchingEngine
from app.schemas.talent import (
    TalentProfileUpdate, SkillItem, ProjectCreateRequest,
    ProjectResponse, TalentOpportunityCard, TalentDashboardStats,
    TeamCreateRequest
)

router = APIRouter(prefix="/talent", tags=["Talent"])

@router.get("/dashboard", response_model=TalentDashboardStats)
def get_talent_dashboard(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    matched_count = (
        db.query(JobMatch)
        .filter(JobMatch.talent_profile_id == profile.id, JobMatch.eligibility == "eligible")
        .count()
    )

    apps_count = db.query(Application).filter(Application.talent_profile_id == profile.id).count()
    invites_count = db.query(Invitation).filter(Invitation.talent_profile_id == profile.id, Invitation.status == "pending").count()
    skills_count = len(profile.profile_skills)
    projects_count = len(profile.projects)

    # Calculate profile completion percentage
    score = 30  # basic account
    if profile.headline and profile.bio:
        score += 20
    if skills_count >= 3:
        score += 25
    if projects_count >= 1:
        score += 25
    completion = min(100, score)

    return TalentDashboardStats(
        matched_opportunities=matched_count,
        applications_submitted=apps_count,
        active_invitations=invites_count,
        profile_completion_percentage=completion,
        skills_count=skills_count,
        projects_count=projects_count
    )

@router.get("/profile")
def get_talent_profile(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    skills = [
        {
            "id": ps.id,
            "name": ps.skill.canonical_name,
            "category": ps.skill.category,
            "proficiency": ps.proficiency,
            "experience_years": ps.experience_years,
            "is_verified": ps.is_verified,
            "source": ps.source
        }
        for ps in profile.profile_skills
    ]

    return {
        "id": profile.id,
        "user_id": current_user.id,
        "name": profile.name,
        "email": current_user.email,
        "talent_type": current_user.talent_type,
        "headline": profile.headline,
        "bio": profile.bio,
        "specialization": profile.specialization,
        "location": profile.location,
        "education": profile.education,
        "experience_years": profile.experience_years,
        "availability": profile.availability,
        "preferred_employment_type": profile.preferred_employment_type,
        "remote_preference": profile.remote_preference,
        "compensation_expectation": profile.compensation_expectation,
        "contact_preferences": profile.contact_preferences or {},
        "skills": skills,
        "created_at": profile.created_at
    }

@router.put("/profile")
def update_talent_profile(
    payload: TalentProfileUpdate,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {"success": True, "message": "Profile updated successfully."}

@router.get("/skills")
def get_talent_skills(current_user: User = Depends(require_talent)):
    profile = current_user.talent_profile
    return [
        {
            "id": ps.id,
            "name": ps.skill.canonical_name,
            "category": ps.skill.category,
            "proficiency": ps.proficiency,
            "experience_years": ps.experience_years,
            "is_verified": ps.is_verified,
            "source": ps.source,
            "evidence_url": ps.evidence_url
        }
        for ps in profile.profile_skills
    ]

@router.post("/skills")
def add_talent_skill(
    payload: SkillItem,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    norm = SkillNormalizerService.normalize_skill(payload.name)

    skill = db.query(Skill).filter(Skill.canonical_name == norm.canonical_name).first()
    if not skill:
        skill = Skill(
            name=norm.canonical_name,
            canonical_name=norm.canonical_name,
            category=payload.category or norm.category
        )
        db.add(skill)
        db.flush()

    existing = db.query(ProfileSkill).filter(
        ProfileSkill.profile_id == profile.id,
        ProfileSkill.skill_id == skill.id
    ).first()

    if existing:
        existing.proficiency = payload.proficiency
        existing.experience_years = payload.experience_years
        existing.evidence_url = payload.evidence_url
    else:
        ps = ProfileSkill(
            profile_id=profile.id,
            skill_id=skill.id,
            proficiency=payload.proficiency,
            experience_years=payload.experience_years,
            evidence_url=payload.evidence_url,
            source="self_declared"
        )
        db.add(ps)

    db.commit()
    return {"success": True, "skill": norm.canonical_name}

@router.delete("/skills/{profile_skill_id}")
def delete_talent_skill(
    profile_skill_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    ps = db.query(ProfileSkill).filter(
        ProfileSkill.id == profile_skill_id,
        ProfileSkill.profile_id == profile.id
    ).first()

    if not ps:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(ps)
    db.commit()
    return {"success": True, "message": "Skill removed."}

@router.get("/projects", response_model=List[ProjectResponse])
def get_talent_projects(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    projects = db.query(Project).filter(Project.profile_id == profile.id).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        techs = [pt.skill.canonical_name for pt in p.technologies]
        results.append(ProjectResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            problem_statement=p.problem_statement,
            features=p.features,
            developer_contribution=p.developer_contribution,
            thumbnail_url=p.thumbnail_url,
            github_url=p.github_url,
            demo_url=p.demo_url,
            status=p.status,
            technologies=techs,
            created_at=p.created_at
        ))
    return results

@router.post("/projects", response_model=ProjectResponse)
def create_talent_project(
    payload: ProjectCreateRequest,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile

    project = Project(
        profile_id=profile.id,
        title=payload.title,
        description=payload.description,
        problem_statement=payload.problem_statement,
        features=payload.features,
        developer_contribution=payload.developer_contribution,
        thumbnail_url=payload.thumbnail_url,
        github_url=payload.github_url,
        demo_url=payload.demo_url,
        status=payload.status
    )
    db.add(project)
    db.flush()

    for tech in payload.technologies:
        norm = SkillNormalizerService.normalize_skill(tech)
        skill = db.query(Skill).filter(Skill.canonical_name == norm.canonical_name).first()
        if not skill:
            skill = Skill(name=norm.canonical_name, canonical_name=norm.canonical_name, category=norm.category)
            db.add(skill)
            db.flush()
        db.add(ProjectTechnology(project_id=project.id, skill_id=skill.id, usage_level="demonstrated"))

    db.commit()
    db.refresh(project)

    techs = [pt.skill.canonical_name for pt in project.technologies]
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        problem_statement=project.problem_statement,
        features=project.features,
        developer_contribution=project.developer_contribution,
        thumbnail_url=project.thumbnail_url,
        github_url=project.github_url,
        demo_url=project.demo_url,
        status=project.status,
        technologies=techs,
        created_at=project.created_at
    )

@router.delete("/projects/{project_id}")
def delete_talent_project(
    project_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    project = db.query(Project).filter(Project.id == project_id, Project.profile_id == profile.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"success": True, "message": "Project removed."}

@router.get("/opportunities", response_model=List[TalentOpportunityCard])
def get_talent_opportunities(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    matches = (
        db.query(JobMatch)
        .filter(JobMatch.talent_profile_id == profile.id)
        .order_by(JobMatch.match_score.desc())
        .all()
    )

    results = []
    for m in matches:
        job = m.job
        # Only show published jobs
        if job.status != "published":
            continue

        app = db.query(Application).filter(Application.job_id == job.id, Application.talent_profile_id == profile.id).first()
        inv = db.query(Invitation).filter(Invitation.job_id == job.id, Invitation.talent_profile_id == profile.id).first()

        company_name = job.company.name if job.company else "Tech Partner"
        company_logo = job.company.logo_url if job.company else None

        results.append(TalentOpportunityCard(
            job_id=job.id,
            job_title=job.title,
            company_name=company_name,
            company_logo=company_logo,
            employment_type=job.employment_type,
            work_mode=job.work_mode,
            location=job.location,
            compensation_range=job.compensation_range,
            match_score=m.match_score,
            eligibility=m.eligibility,
            matched_mandatory_skills=m.matched_mandatory_skills or [],
            missing_mandatory_skills=m.missing_mandatory_skills or [],
            matched_preferred_skills=m.matched_preferred_skills or [],
            missing_preferred_skills=m.missing_preferred_skills or [],
            score_breakdown=m.score_breakdown or {},
            explanation=m.explanation,
            deadline=job.deadline,
            has_applied=app is not None,
            application_status=app.status if app else None,
            is_invited=inv is not None and inv.status == "pending"
        ))
    return results

@router.post("/opportunities/{job_id}/apply")
def apply_to_opportunity(
    job_id: int,
    payload: dict,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    job = db.query(Job).filter(Job.id == job_id, Job.status == "published").first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    existing = db.query(Application).filter(
        Application.job_id == job.id,
        Application.talent_profile_id == profile.id
    ).first()

    if existing:
        return {"success": True, "message": "Application already submitted."}

    cover_note = payload.get("cover_note", "")
    app = Application(
        job_id=job.id,
        talent_profile_id=profile.id,
        status="applied",
        cover_note=cover_note
    )
    db.add(app)

    # Notify recruiter about new application
    recruiter_user_id = job.recruiter.user_id
    notif = Notification(
        user_id=recruiter_user_id,
        type="new_application",
        title=f"New Candidate Applied: {job.title}",
        message=f"{profile.name} has submitted an application for {job.title}.",
        link="/recruiter/applications",
        meta_data={"job_id": job.id, "candidate_name": profile.name}
    )
    db.add(notif)
    db.commit()

    return {"success": True, "message": f"Successfully applied to {job.title}."}

@router.get("/applications")
def get_talent_applications(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    apps = (
        db.query(Application)
        .filter(Application.talent_profile_id == profile.id)
        .order_by(Application.created_at.desc())
        .all()
    )

    results = []
    for a in apps:
        job = a.job
        company_name = job.company.name if job.company else "Company"
        results.append({
            "id": a.id,
            "job_id": job.id,
            "job_title": job.title,
            "company_name": company_name,
            "employment_type": job.employment_type,
            "work_mode": job.work_mode,
            "location": job.location,
            "status": a.status,
            "applied_at": a.created_at,
            "interview_date": a.interview_date
        })
    return results

@router.get("/invitations")
def get_talent_invitations(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    invites = (
        db.query(Invitation)
        .filter(Invitation.talent_profile_id == profile.id)
        .order_by(Invitation.created_at.desc())
        .all()
    )

    results = []
    for inv in invites:
        job = inv.job
        company = job.company
        results.append({
            "id": inv.id,
            "job_id": job.id,
            "job_title": job.title,
            "company_name": company.name if company else "Hiring Company",
            "recruiter_name": inv.recruiter.full_name,
            "message": inv.message,
            "status": inv.status,
            "created_at": inv.created_at
        })
    return results

@router.put("/invitations/{invitation_id}/respond")
def respond_to_invitation(
    invitation_id: int,
    payload: dict,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    inv = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.talent_profile_id == profile.id
    ).first()

    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")

    action = payload.get("action")  # "accept" or "decline"
    if action == "accept":
        inv.status = "accepted"
        # Auto-create application
        existing_app = db.query(Application).filter(
            Application.job_id == inv.job_id,
            Application.talent_profile_id == profile.id
        ).first()
        if not existing_app:
            app = Application(
                job_id=inv.job_id,
                talent_profile_id=profile.id,
                status="applied",
                cover_note="Accepted direct recruiter invitation."
            )
            db.add(app)
    else:
        inv.status = "declined"

    db.commit()
    return {"success": True, "status": inv.status}

@router.get("/teams")
def get_talent_teams(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    teams = db.query(Team).filter(Team.lead_user_id == current_user.id).all()
    results = []
    for t in teams:
        members = [
            {
                "id": m.id,
                "name": m.talent_profile.name,
                "role": m.role,
                "title": m.title,
                "specialization": m.talent_profile.specialization
            }
            for m in t.members
        ]
        results.append({
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "description": t.description,
            "website": t.website,
            "github_url": t.github_url,
            "availability": t.availability,
            "members": members
        })
    return results

@router.post("/teams")
def create_team(
    payload: TeamCreateRequest,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    slug = payload.name.lower().replace(" ", "-")

    team = Team(
        lead_user_id=current_user.id,
        name=payload.name,
        slug=slug,
        description=payload.description,
        website=payload.website,
        github_url=payload.github_url,
        availability=payload.availability
    )
    db.add(team)
    db.flush()

    # Add creator as Lead
    db.add(TeamMember(
        team_id=team.id,
        talent_profile_id=profile.id,
        role="Lead",
        title=profile.headline or "Team Lead"
    ))

    db.commit()
    return {"success": True, "team_id": team.id, "name": team.name}

# ============================================================================
# RESUME INTELLIGENCE & PROFILE AUTOFILL ENDPOINTS
# ============================================================================

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    visibility: str = Form("verified_recruiters"),
    auto_process: bool = Form(True),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    contents = await file.read()
    filename = file.filename or "resume.pdf"
    content_type = file.content_type or "application/pdf"

    # Save and validate
    resume = ResumeIntelligenceService.save_and_validate_resume(
        contents=contents,
        filename=filename,
        content_type=content_type,
        profile=profile,
        user=current_user,
        db=db,
        visibility=visibility
    )

    extraction_result = None
    if auto_process:
        extraction_result = await ResumeIntelligenceService.process_resume_pipeline(resume.id, db)

    return {
        "success": True,
        "resume_id": resume.id,
        "filename": resume.original_filename,
        "version": resume.version,
        "status": resume.status,
        "visibility": resume.visibility,
        "created_at": resume.created_at,
        "has_extraction": extraction_result is not None
    }

@router.get("/resume")
def get_talent_resumes(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    resumes = (
        db.query(Resume)
        .filter(Resume.talent_profile_id == profile.id)
        .order_by(Resume.is_active.desc(), Resume.version.desc())
        .all()
    )

    results = []
    for r in resumes:
        latest_ext = r.extractions[0] if r.extractions else None
        results.append({
            "id": r.id,
            "filename": r.original_filename,
            "file_size": r.file_size,
            "mime_type": r.mime_type,
            "version": r.version,
            "is_active": r.is_active,
            "visibility": r.visibility,
            "status": r.status,
            "ocr_applied": r.ocr_applied,
            "ai_provider_used": r.ai_provider_used,
            "error_message": r.error_message,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "extraction_id": latest_ext.id if latest_ext else None,
            "review_status": latest_ext.review_status if latest_ext else None,
            "confidence_score": latest_ext.confidence_score if latest_ext else None,
            "skills_extracted_count": len(latest_ext.skills) if latest_ext and latest_ext.skills else 0,
            "projects_extracted_count": len(latest_ext.projects) if latest_ext and latest_ext.projects else 0
        })

    active_resume = next((r for r in results if r["is_active"]), None)

    return {
        "active_resume": active_resume,
        "resumes": results,
        "total_count": len(results)
    }

@router.get("/resume/{resume_id}")
def get_resume_detail(
    resume_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    latest_ext = resume.extractions[0] if resume.extractions else None

    return {
        "id": resume.id,
        "filename": resume.original_filename,
        "file_size": resume.file_size,
        "mime_type": resume.mime_type,
        "version": resume.version,
        "is_active": resume.is_active,
        "visibility": resume.visibility,
        "status": resume.status,
        "ocr_applied": resume.ocr_applied,
        "ai_provider_used": resume.ai_provider_used,
        "error_message": resume.error_message,
        "raw_text_preview": (resume.raw_text[:1000] if resume.raw_text else ""),
        "created_at": resume.created_at,
        "extraction": {
            "id": latest_ext.id,
            "review_status": latest_ext.review_status,
            "confidence_score": latest_ext.confidence_score,
            "confirmed_at": latest_ext.confirmed_at
        } if latest_ext else None
    }

@router.get("/resume/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Underlying document file not found on storage server.")

    ResumeIntelligenceService.log_access(resume.id, current_user.id, "download", "talent", db)

    return FileResponse(
        path=resume.file_path,
        filename=resume.original_filename,
        media_type=resume.mime_type
    )

@router.post("/resume/{resume_id}/process")
async def process_or_reprocess_resume(
    resume_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    extraction = await ResumeIntelligenceService.process_resume_pipeline(resume.id, db)
    return {
        "success": True,
        "resume_id": resume.id,
        "extraction_id": extraction.id,
        "status": resume.status,
        "review_status": extraction.review_status,
        "confidence_score": extraction.confidence_score
    }

@router.get("/resume/{resume_id}/extraction")
def get_resume_extraction_draft(
    resume_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    extraction = (
        db.query(ResumeExtraction)
        .filter(ResumeExtraction.resume_id == resume.id)
        .order_by(ResumeExtraction.created_at.desc())
        .first()
    )
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction record found for this resume.")

    profile = current_user.talent_profile

    # Re-calculate live conflicts with current profile
    extracted_data = {
        "basic_info": extraction.basic_info or {},
        "education": extraction.education or [],
        "skills": extraction.skills or [],
        "projects": extraction.projects or [],
        "experience": extraction.experience or [],
        "additional": extraction.additional or {}
    }
    live_conflicts = ResumeIntelligenceService.compute_profile_conflicts(extracted_data, profile)

    return {
        "extraction_id": extraction.id,
        "resume_id": resume.id,
        "filename": resume.original_filename,
        "confidence_score": extraction.confidence_score,
        "review_status": extraction.review_status,
        "confirmed_at": extraction.confirmed_at,
        "raw_text": extraction.raw_text,
        "basic_info": extraction.basic_info,
        "education": extraction.education,
        "skills": extraction.skills,
        "projects": extraction.projects,
        "experience": extraction.experience,
        "additional": extraction.additional,
        "conflicts": live_conflicts,
        "current_profile_snapshot": {
            "name": profile.name,
            "headline": profile.headline,
            "bio": profile.bio,
            "location": profile.location,
            "education": profile.education,
            "skills_count": len(profile.profile_skills),
            "projects_count": len(profile.projects)
        }
    }

@router.post("/resume/{resume_id}/confirm")
def confirm_resume_extraction(
    resume_id: int,
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    result = ResumeIntelligenceService.confirm_and_autofill_profile(
        resume_id=resume_id,
        payload=payload,
        user=current_user,
        db=db
    )
    return result

@router.patch("/resume/{resume_id}/visibility")
def update_resume_visibility(
    resume_id: int,
    payload: Dict[str, str] = Body(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    visibility = payload.get("visibility")
    if visibility not in ["public", "verified_recruiters", "private"]:
        raise HTTPException(status_code=400, detail="Invalid visibility value. Allowed: 'public', 'verified_recruiters', 'private'")

    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    resume.visibility = visibility
    ResumeIntelligenceService.log_access(resume.id, current_user.id, "visibility_change", "talent", db, notes=f"Set to {visibility}")
    db.commit()

    return {"success": True, "resume_id": resume.id, "visibility": resume.visibility}

@router.delete("/resume/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Remove file on disk if exists
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()

    # Re-activate latest remaining resume if available
    remaining = (
        db.query(Resume)
        .filter(Resume.talent_profile_id == current_user.talent_profile.id)
        .order_by(Resume.version.desc())
        .first()
    )
    if remaining:
        remaining.is_active = True
        db.commit()

    return {"success": True, "message": "Resume and associated extractions deleted successfully."}

@router.get("/opportunities/matches")
def get_resume_enriched_matches(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Talent profile not found")

    matches = (
        db.query(JobMatch)
        .filter(JobMatch.talent_profile_id == profile.id)
        .order_by(JobMatch.match_score.desc())
        .all()
    )

    # Active resume info
    active_resume = next((r for r in profile.resumes if r.is_active), None)
    resume_evidence_summary = {}
    if active_resume and active_resume.extractions:
        for sk in active_resume.extractions[0].skills or []:
            if sk.get("canonical_name"):
                resume_evidence_summary[sk["canonical_name"]] = sk.get("evidence", "")

    results = []
    for m in matches:
        job = m.job
        if job.status != "published":
            continue

        company_name = job.company.name if job.company else "Tech Collective"
        company_logo = job.company.logo_url if job.company else None
        app = db.query(Application).filter(Application.job_id == job.id, Application.talent_profile_id == profile.id).first()

        # Build evidence list for matched skills
        supporting_evidence = []
        for s in (m.matched_mandatory_skills or []) + (m.matched_preferred_skills or []):
            clean_s = s.replace(" (via related)", "")
            if clean_s in resume_evidence_summary:
                supporting_evidence.append({
                    "skill": clean_s,
                    "evidence": resume_evidence_summary[clean_s],
                    "source": "verified_resume"
                })

        results.append({
            "job_id": job.id,
            "job_title": job.title,
            "company_name": company_name,
            "company_logo": company_logo,
            "employment_type": job.employment_type,
            "work_mode": job.work_mode,
            "location": job.location,
            "compensation_range": job.compensation_range,
            "match_score": m.match_score,
            "eligibility": m.eligibility,
            "matched_mandatory_skills": m.matched_mandatory_skills or [],
            "missing_mandatory_skills": m.missing_mandatory_skills or [],
            "matched_preferred_skills": m.matched_preferred_skills or [],
            "missing_preferred_skills": m.missing_preferred_skills or [],
            "score_breakdown": m.score_breakdown or {},
            "explanation": m.explanation,
            "supporting_evidence": supporting_evidence,
            "has_applied": app is not None,
            "has_active_resume": active_resume is not None,
            "active_resume_filename": active_resume.original_filename if active_resume else None
        })

    return results
