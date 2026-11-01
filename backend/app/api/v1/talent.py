from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
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
from app.ai.services.skill_normalizer import SkillNormalizerService
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
