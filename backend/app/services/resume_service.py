import os
import uuid
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.config import settings
from app.models.user import User
from app.models.talent import TalentProfile
from app.models.skill import Skill, ProfileSkill
from app.models.project import Project, ProjectTechnology
from app.models.resume import Resume, ResumeExtraction, ResumeAccessLog
from app.models.application import Application
from app.ai.services.document_intelligence import DocumentIntelligenceService
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.ai.orchestrator import AIOrchestrator

RESUME_STORAGE_DIR = os.path.join(settings.STORAGE_DIR, "resumes")
os.makedirs(RESUME_STORAGE_DIR, exist_ok=True)

class ResumeIntelligenceService:
    """Core domain service for resume ingestion, parsing, autofill confirmation, and access management."""

    @classmethod
    def save_and_validate_resume(
        cls,
        contents: bytes,
        filename: str,
        content_type: str,
        profile: TalentProfile,
        user: User,
        db: Session,
        visibility: str = "verified_recruiters"
    ) -> Resume:
        # Validate safety and signature
        is_valid, error = DocumentIntelligenceService.validate_file(
            contents=contents,
            filename=filename,
            mime_type=content_type,
            max_size_mb=settings.MAX_FILE_SIZE_MB
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail=error)

        # Sanitize filename
        safe_filename = re.sub(r'[^a-zA-Z0-9_\.-]', '_', filename)
        unique_name = f"resume_{profile.id}_{uuid.uuid4().hex[:8]}_{safe_filename}"
        file_path = os.path.join(RESUME_STORAGE_DIR, unique_name)

        # Securely write to private storage
        with open(file_path, "wb") as f:
            f.write(contents)

        # Calculate version
        latest_resume = (
            db.query(Resume)
            .filter(Resume.talent_profile_id == profile.id)
            .order_by(Resume.version.desc())
            .first()
        )
        new_version = (latest_resume.version + 1) if latest_resume else 1

        # Deactivate older resumes
        db.query(Resume).filter(Resume.talent_profile_id == profile.id).update({"is_active": False})

        resume = Resume(
            talent_profile_id=profile.id,
            user_id=user.id,
            original_filename=safe_filename,
            file_path=file_path,
            file_size=len(contents),
            mime_type=content_type or "application/pdf",
            version=new_version,
            is_active=True,
            visibility=visibility or "verified_recruiters",
            status="uploaded"
        )
        db.add(resume)
        db.flush()

        # Log access
        cls.log_access(resume.id, user.id, "upload", "talent", db, notes=f"Uploaded version {new_version}")
        db.commit()
        db.refresh(resume)
        return resume

    @classmethod
    async def process_resume_pipeline(cls, resume_id: int, db: Session) -> ResumeExtraction:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume record not found.")

        resume.status = "processing"
        resume.error_message = None
        db.commit()

        try:
            # 1. Extract raw text with OCR if needed
            raw_text, doc_class, ocr_applied = DocumentIntelligenceService.process_document(
                resume.file_path, resume.mime_type
            )
            resume.raw_text = raw_text
            resume.ocr_applied = ocr_applied

            # 2. Call AI Orchestrator with structured extraction
            orchestrator = AIOrchestrator()
            extraction_schema = await orchestrator.extract_resume(raw_text, db=db)
            extracted_dict = extraction_schema.model_dump()

            # Record provider used
            provider_name = type(orchestrator.provider).__name__.replace("Provider", "").lower()
            resume.ai_provider_used = provider_name

            # 3. Detect conflicts between extracted data and current profile
            profile = db.query(TalentProfile).filter(TalentProfile.id == resume.talent_profile_id).first()
            conflicts = cls.compute_profile_conflicts(extracted_dict, profile)

            # 4. Save Draft Extraction
            extraction = ResumeExtraction(
                resume_id=resume.id,
                talent_profile_id=profile.id,
                raw_text=raw_text[:4000] if raw_text else "",
                basic_info=extracted_dict.get("basic_info", {}),
                education=extracted_dict.get("education", []),
                skills=extracted_dict.get("skills", []),
                projects=extracted_dict.get("projects", []),
                experience=extracted_dict.get("experience", []),
                additional=extracted_dict.get("additional", {}),
                conflicts=conflicts,
                confidence_score=extracted_dict.get("confidence", 0.95),
                review_status="pending_review"
            )
            db.add(extraction)

            resume.status = "review_required"
            cls.log_access(resume.id, resume.user_id, "parse", "talent", db, notes="Resume extraction completed")
            db.commit()
            db.refresh(extraction)
            return extraction

        except Exception as e:
            resume.status = "failed"
            resume.error_message = str(e)
            db.commit()
            raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")

    @classmethod
    def compute_profile_conflicts(cls, extracted: Dict[str, Any], profile: TalentProfile) -> Dict[str, Any]:
        """Detect discrepancies between current confirmed profile and extracted resume items."""
        conflicts = {}
        basic = extracted.get("basic_info", {})

        # Headline
        if basic.get("headline") and basic.get("headline") != profile.headline:
            conflicts["headline"] = {
                "field": "headline",
                "current_value": profile.headline or "",
                "extracted_value": basic.get("headline"),
                "status": "different" if profile.headline else "new"
            }

        # Bio / Summary
        if basic.get("summary") and basic.get("summary") != profile.bio:
            conflicts["bio"] = {
                "field": "bio",
                "current_value": profile.bio or "",
                "extracted_value": basic.get("summary"),
                "status": "different" if profile.bio else "new"
            }

        # Location
        if basic.get("location") and basic.get("location") != profile.location:
            conflicts["location"] = {
                "field": "location",
                "current_value": profile.location or "",
                "extracted_value": basic.get("location"),
                "status": "different" if profile.location else "new"
            }

        # Existing Skills Comparison
        existing_skills = {ps.skill.canonical_name.lower(): ps for ps in profile.profile_skills}
        skill_diffs = []
        for sk in extracted.get("skills", []):
            name = sk.get("canonical_name", "").strip()
            if name.lower() in existing_skills:
                skill_diffs.append({
                    "name": name,
                    "status": "already_present",
                    "existing_proficiency": existing_skills[name.lower()].proficiency
                })
            else:
                skill_diffs.append({
                    "name": name,
                    "status": "new_skill",
                    "evidence": sk.get("evidence", ""),
                    "category": sk.get("category", "General")
                })
        conflicts["skills_inventory"] = skill_diffs

        # Existing Projects Comparison
        existing_project_titles = {p.title.lower() for p in profile.projects}
        project_diffs = []
        for prj in extracted.get("projects", []):
            title = prj.get("title", "").strip()
            if title.lower() in existing_project_titles:
                project_diffs.append({"title": title, "status": "already_present"})
            else:
                project_diffs.append({"title": title, "status": "new_project", "technologies": prj.get("technologies", [])})
        conflicts["projects_inventory"] = project_diffs

        return conflicts

    @classmethod
    def confirm_and_autofill_profile(
        cls,
        resume_id: int,
        payload: Dict[str, Any],
        user: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Applies user-confirmed and edited fields to the developer's profile.
        Strictly respects user choices without silent overrides.
        """
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found or access denied.")

        extraction = (
            db.query(ResumeExtraction)
            .filter(ResumeExtraction.resume_id == resume.id)
            .order_by(ResumeExtraction.created_at.desc())
            .first()
        )
        if not extraction:
            raise HTTPException(status_code=400, detail="No extraction draft available for this resume.")

        profile = user.talent_profile

        # 1. Basic Info Confirmation
        confirmed_basic = payload.get("basic_info", {})
        if confirmed_basic.get("apply_headline") and confirmed_basic.get("headline"):
            profile.headline = confirmed_basic.get("headline")

        if confirmed_basic.get("apply_bio") and confirmed_basic.get("summary"):
            profile.bio = confirmed_basic.get("summary")

        if confirmed_basic.get("apply_location") and confirmed_basic.get("location"):
            profile.location = confirmed_basic.get("location")

        # Contact preferences & links
        contact_prefs = profile.contact_preferences or {}
        if confirmed_basic.get("github_url"):
            contact_prefs["github"] = confirmed_basic.get("github_url")
        if confirmed_basic.get("linkedin_url"):
            contact_prefs["linkedin"] = confirmed_basic.get("linkedin_url")
        if confirmed_basic.get("portfolio_url"):
            contact_prefs["website"] = confirmed_basic.get("portfolio_url")
        profile.contact_preferences = contact_prefs

        # 2. Education Confirmation
        confirmed_edu = payload.get("education", [])
        if confirmed_edu and len(confirmed_edu) > 0:
            first_edu = confirmed_edu[0]
            inst = first_edu.get("institution", "")
            deg = first_edu.get("degree", "")
            spec = first_edu.get("specialization", "")
            profile.education = f"{deg} in {spec}, {inst}".strip(", ")

        # 3. Skills Confirmation
        confirmed_skills = payload.get("skills", [])
        added_skills_count = 0
        existing_profile_skills = {ps.skill.canonical_name.lower(): ps for ps in profile.profile_skills}

        for sk in confirmed_skills:
            if not sk.get("accepted", True):
                continue
            name = sk.get("canonical_name") or sk.get("name")
            if not name:
                continue

            normalized = SkillNormalizerService.normalize_skill(name)
            canonical = normalized.canonical_name

            # Find or create canonical Skill in global taxonomy
            skill_entity = db.query(Skill).filter(Skill.canonical_name == canonical).first()
            if not skill_entity:
                skill_entity = Skill(
                    name=canonical,
                    canonical_name=canonical,
                    category=sk.get("category") or normalized.category
                )
                db.add(skill_entity)
                db.flush()

            prof_val = sk.get("proficiency") or "Intermediate"
            evidence_val = sk.get("evidence") or f"Documented in resume '{resume.original_filename}'."

            if canonical.lower() in existing_profile_skills:
                # Update existing skill evidence and verification status
                existing_ps = existing_profile_skills[canonical.lower()]
                existing_ps.is_verified = True
                existing_ps.source = "resume_extracted"
                if sk.get("proficiency"):
                    existing_ps.proficiency = prof_val
            else:
                # Create new profile skill
                new_ps = ProfileSkill(
                    profile_id=profile.id,
                    skill_id=skill_entity.id,
                    proficiency=prof_val,
                    experience_years=float(sk.get("experience_years", 1.0)),
                    is_verified=True,
                    source="resume_extracted"
                )
                db.add(new_ps)
                added_skills_count += 1

        # 4. Projects Confirmation
        confirmed_projects = payload.get("projects", [])
        added_projects_count = 0
        existing_proj_titles = {p.title.lower() for p in profile.projects}

        for prj in confirmed_projects:
            if not prj.get("accepted", True):
                continue
            title = prj.get("title", "").strip()
            if not title or title.lower() in existing_proj_titles:
                continue

            new_project = Project(
                profile_id=profile.id,
                title=title,
                description=prj.get("description", "Engineered scalable feature service."),
                problem_statement=prj.get("problem_statement") or "Production engineering requirement.",
                developer_contribution=prj.get("user_contribution") or prj.get("contribution") or "Core design and implementation.",
                demo_url=prj.get("project_url") or prj.get("demo_url"),
                status="Completed"
            )
            db.add(new_project)
            db.flush()

            # Attach project technologies
            for tech_name in prj.get("technologies", []):
                norm_tech = SkillNormalizerService.normalize_skill(tech_name)
                tech_skill = db.query(Skill).filter(Skill.canonical_name == norm_tech.canonical_name).first()
                if not tech_skill:
                    tech_skill = Skill(
                        name=norm_tech.canonical_name,
                        canonical_name=norm_tech.canonical_name,
                        category=norm_tech.category
                    )
                    db.add(tech_skill)
                    db.flush()

                db.add(ProjectTechnology(
                    project_id=new_project.id,
                    skill_id=tech_skill.id,
                    usage_level="demonstrated"
                ))
            added_projects_count += 1

        # Mark extraction status
        extraction.review_status = "confirmed"
        extraction.confirmed_at = datetime.now(timezone.utc)
        extraction.confirmed_fields = list(payload.keys())
        resume.status = "completed"

        cls.log_access(resume.id, user.id, "confirm", "talent", db, notes="Confirmed resume extraction into profile")
        db.commit()

        return {
            "success": True,
            "message": "Profile updated with verified resume intelligence.",
            "skills_added": added_skills_count,
            "projects_added": added_projects_count,
            "profile_id": profile.id
        }

    @classmethod
    def can_recruiter_access_resume(cls, resume: Resume, recruiter_user: User, db: Session) -> Tuple[bool, str]:
        """Enforces strict visibility and candidate privacy access checks."""
        if resume.visibility == "public":
            return True, "Public resume access."

        if resume.visibility == "verified_recruiters":
            if recruiter_user.role in ["recruiter", "admin"]:
                return True, "Verified recruiter access granted."
            return False, "This resume is only visible to verified recruiters."

        if resume.visibility == "private":
            # Check if talent has directly applied to any job posted by this recruiter
            recruiter_profile = recruiter_user.recruiter_profile
            if recruiter_profile:
                recruiter_job_ids = [j.id for j in recruiter_profile.jobs]
                has_applied = (
                    db.query(Application)
                    .filter(
                        Application.job_id.in_(recruiter_job_ids),
                        Application.talent_profile_id == resume.talent_profile_id
                    )
                    .first()
                )
                if has_applied:
                    return True, "Private resume accessible via active job application."
            return False, "This candidate has designated their resume as private."

        return False, "Access denied."

    @classmethod
    def log_access(
        cls,
        resume_id: int,
        user_id: Optional[int],
        action: str,
        actor_role: str,
        db: Session,
        ip_address: Optional[str] = None,
        notes: Optional[str] = None
    ):
        try:
            log = ResumeAccessLog(
                resume_id=resume_id,
                accessed_by_user_id=user_id,
                action=action,
                actor_role=actor_role,
                ip_address=ip_address,
                notes=notes
            )
            db.add(log)
            db.commit()
        except Exception:
            db.rollback()
