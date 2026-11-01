from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.job import Job
from app.models.talent import TalentProfile
from app.models.user import User
from app.models.match import JobMatch
from app.models.notification import Notification, NotificationPreference
from app.matching.engine import HybridMatchingEngine

class NotificationOrchestrator:
    """Orchestrates targeted recruitment notifications to eligible candidates."""

    @staticmethod
    def process_job_published(job_id: int, db: Session) -> Dict[str, Any]:
        """
        Runs the matching engine across all active talent profiles and sends targeted notifications
        strictly to eligible candidates whose score meets or exceeds MATCH_THRESHOLD.
        """
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found", "notified_count": 0}

        # Prepare job data
        mandatory_skills = [js.skill.canonical_name for js in job.skills if js.is_mandatory]
        preferred_skills = [js.skill.canonical_name for js in job.skills if not js.is_mandatory]

        job_data = {
            "title": job.title,
            "mandatory_skills": mandatory_skills,
            "preferred_skills": preferred_skills,
            "experience_min": job.experience_min,
            "experience_max": job.experience_max,
            "work_mode": job.work_mode,
            "employment_type": job.employment_type
        }

        # Query active talent profiles
        talents = (
            db.query(TalentProfile)
            .join(User, TalentProfile.user_id == User.id)
            .filter(User.is_active == True)
            .all()
        )

        matcher = HybridMatchingEngine(match_threshold=settings.MATCH_THRESHOLD)
        matches_created = 0
        notified_count = 0

        for talent in talents:
            talent_skills = [ps.skill.canonical_name for ps in talent.profile_skills]
            talent_projects = [
                {
                    "title": p.title,
                    "technologies": [pt.skill.canonical_name for pt in p.technologies]
                }
                for p in talent.projects
            ]

            talent_data = {
                "skills": talent_skills,
                "projects": talent_projects,
                "experience_years": talent.experience_years,
                "remote_preference": talent.remote_preference or "Remote"
            }

            match_result = matcher.calculate_match(
                job_data=job_data,
                talent_data=talent_data,
                strict_eligibility=job.strict_eligibility
            )

            # Upsert match record in DB
            existing_match = (
                db.query(JobMatch)
                .filter(JobMatch.job_id == job.id, JobMatch.talent_profile_id == talent.id)
                .first()
            )

            if existing_match:
                existing_match.match_score = match_result["match_score"]
                existing_match.eligibility = match_result["eligibility"]
                existing_match.matched_mandatory_skills = match_result["matched_mandatory_skills"]
                existing_match.matched_preferred_skills = match_result["matched_preferred_skills"]
                existing_match.missing_mandatory_skills = match_result["missing_mandatory_skills"]
                existing_match.missing_preferred_skills = match_result["missing_preferred_skills"]
                existing_match.relevant_projects = match_result["relevant_projects"]
                existing_match.score_breakdown = match_result["score_breakdown"]
                existing_match.explanation = match_result["explanation"]
                match_rec = existing_match
            else:
                match_rec = JobMatch(
                    job_id=job.id,
                    talent_profile_id=talent.id,
                    match_score=match_result["match_score"],
                    eligibility=match_result["eligibility"],
                    matched_mandatory_skills=match_result["matched_mandatory_skills"],
                    matched_preferred_skills=match_result["matched_preferred_skills"],
                    missing_mandatory_skills=match_result["missing_mandatory_skills"],
                    missing_preferred_skills=match_result["missing_preferred_skills"],
                    relevant_projects=match_result["relevant_projects"],
                    score_breakdown=match_result["score_breakdown"],
                    explanation=match_result["explanation"],
                    algorithm_version=match_result["algorithm_version"]
                )
                db.add(match_rec)
                matches_created += 1

            # TARGETED NOTIFICATION GATING:
            # Must be strictly eligible AND score >= threshold
            pref = talent.user.notification_preference
            min_score = pref.min_match_score if pref else settings.MATCH_THRESHOLD
            in_app_enabled = pref.in_app_enabled if pref else True

            if (
                match_result["eligibility"] == "eligible"
                and match_result["match_score"] >= min_score
                and in_app_enabled
            ):
                # Check for duplicate notification for this job
                existing_notif = (
                    db.query(Notification)
                    .filter(
                        Notification.user_id == talent.user_id,
                        Notification.type == "job_match",
                        Notification.link == f"/talent/opportunities"
                    )
                    .filter(Notification.meta_data["job_id"].as_integer() == job.id)
                    .first()
                )

                if not existing_notif:
                    company_name = job.company.name if job.company else "A top tech company"
                    notif = Notification(
                        user_id=talent.user_id,
                        type="job_match",
                        title=f"New High-Match Role: {job.title}",
                        message=(
                            f"{company_name} is hiring a {job.title}. "
                            f"Your technical profile achieved a {match_result['match_score']:.0f}% match score."
                        ),
                        link="/talent/opportunities",
                        is_read=False,
                        meta_data={
                            "job_id": job.id,
                            "match_score": match_result["match_score"],
                            "job_title": job.title,
                            "company_name": company_name
                        }
                    )
                    db.add(notif)
                    notified_count += 1

        db.commit()
        return {
            "job_id": job_id,
            "talents_evaluated": len(talents),
            "matches_processed": matches_created,
            "notified_count": notified_count
        }

    @staticmethod
    def send_application_status_notification(
        user_id: int,
        job_title: str,
        company_name: str,
        new_status: str,
        db: Session
    ):
        """Sends notification when candidate's application pipeline advances."""
        readable_status = new_status.replace("_", " ").title()
        notif = Notification(
            user_id=user_id,
            type="application_status",
            title=f"Application Update: {job_title}",
            message=f"Your application at {company_name} for '{job_title}' has moved to: {readable_status}.",
            link="/talent/applications",
            is_read=False,
            meta_data={"job_title": job_title, "status": new_status}
        )
        db.add(notif)
        db.commit()

    @staticmethod
    def send_recruitment_invitation(
        user_id: int,
        recruiter_name: str,
        company_name: str,
        job_title: str,
        db: Session
    ):
        """Sends notification when recruiter sends direct invitation to talent."""
        notif = Notification(
            user_id=user_id,
            type="invitation",
            title=f"Direct Invitation: {job_title}",
            message=f"{recruiter_name} from {company_name} invited you to apply for {job_title}.",
            link="/talent/invitations",
            is_read=False,
            meta_data={"job_title": job_title, "company_name": company_name}
        )
        db.add(notif)
        db.commit()
