import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.config import settings
from app.models.user import User
from app.models.talent import TalentProfile, Team, TeamMember
from app.models.notification import Notification
from app.models.achievement import (
    Achievement, AchievementEvidence, AchievementVerificationRecord,
    TeamAchievement, TeamAchievementContributor, ACHIEVEMENT_CATEGORIES
)

EVIDENCE_STORAGE_DIR = os.path.join(settings.STORAGE_DIR, "evidence")
os.makedirs(EVIDENCE_STORAGE_DIR, exist_ok=True)

def utc_now():
    return datetime.now(timezone.utc)

def _safe_date_str(val):
    if not val:
        return None
    if isinstance(val, str):
        return val
    if hasattr(val, "isoformat"):
        return val.isoformat()
    return str(val)


class AchievementService:
    """Core domain service for developer & team achievements, evidence storage, and verification workflows."""

    @classmethod
    def create_individual_achievement(
        cls,
        talent_profile: TalentProfile,
        data: Dict[str, Any],
        db: Session
    ) -> Achievement:
        cat_raw = data.get("category", "Other achievements")
        cat_norm = cat_raw.strip().lower().replace(" ", "_").replace("-", "_")
        slug_map = {
            "hackathons": "Hackathons",
            "hackathon_winner": "Hackathons",
            "hackathon": "Hackathons",
            "technical_competitions": "Technical competitions",
            "robotics_competitions": "Robotics competitions",
            "awards_and_recognitions": "Awards and recognitions",
            "certifications": "Certifications",
            "academic_achievements": "Academic achievements",
            "research_and_publications": "Research and publications",
            "research_publication": "Research and publications",
            "open_source_contributions": "Open-source contributions",
            "projects_and_product_launches": "Projects and product launches",
            "internships_and_professional_milestones": "Internships and professional milestones",
            "leadership_and_volunteering": "Leadership and volunteering",
            "other_achievements": "Other achievements",
            "other": "Other achievements"
        }
        category = slug_map.get(cat_norm, cat_raw if cat_raw in ACHIEVEMENT_CATEGORIES else "Other achievements")

        issue_date = None
        if data.get("date_awarded"):
            try:
                issue_date = datetime.fromisoformat(data["date_awarded"].replace("Z", "+00:00"))
            except Exception:
                pass
        elif data.get("date_achieved"):
            try:
                issue_date = datetime.fromisoformat(str(data["date_achieved"]).replace("Z", "+00:00"))
            except Exception:
                pass

        achievement = Achievement(
            talent_profile_id=talent_profile.id,
            title=data.get("title", "Achievement"),
            category=category,
            description=data.get("description", ""),
            issuing_organization=data.get("issuer") or data.get("issuing_organization") or "Independent",
            event_name=data.get("event_name"),
            date_achieved=issue_date,
            position_award=data.get("position_award"),
            certificate_url=data.get("credential_url") or data.get("certificate_url"),
            verification_url=data.get("verification_url"),
            skills=data.get("skills", []),
            visibility="public" if data.get("is_public", True) else "private",
            verification_status="unverified"
        )
        db.add(achievement)
        db.commit()
        db.refresh(achievement)
        return achievement

    @classmethod
    def create_achievement(cls, profile: TalentProfile, data: Dict[str, Any], db: Session) -> Achievement:
        return cls.create_individual_achievement(talent_profile=profile, data=data, db=db)

    @classmethod
    def update_individual_achievement(
        cls,
        achievement_id: int,
        talent_profile: TalentProfile,
        data: Dict[str, Any],
        db: Session
    ) -> Achievement:
        achievement = db.query(Achievement).filter(
            Achievement.id == achievement_id,
            Achievement.talent_profile_id == talent_profile.id
        ).first()

        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        for k in ["title", "description", "category", "event_name", "position_award"]:
            if k in data and data[k] is not None:
                setattr(achievement, k, data[k])

        if "issuer" in data:
            achievement.issuing_organization = data["issuer"]
        elif "issuing_organization" in data:
            achievement.issuing_organization = data["issuing_organization"]

        if "credential_url" in data:
            achievement.certificate_url = data["credential_url"]
        if "is_public" in data:
            achievement.visibility = "public" if data["is_public"] else "private"

        if "date_awarded" in data and data["date_awarded"]:
            try:
                achievement.date_achieved = datetime.fromisoformat(data["date_awarded"].replace("Z", "+00:00"))
            except Exception:
                pass

        if achievement.verification_status == "rejected":
            achievement.verification_status = "unverified"

        db.commit()
        db.refresh(achievement)
        return achievement

    @classmethod
    def update_achievement(cls, achievement_id: int, data: Dict[str, Any], user: User, db: Session) -> Achievement:
        return cls.update_individual_achievement(achievement_id, user.talent_profile, data, db)

    @classmethod
    def delete_individual_achievement(
        cls,
        achievement_id: int,
        talent_profile: TalentProfile,
        db: Session
    ) -> bool:
        achievement = db.query(Achievement).filter(
            Achievement.id == achievement_id,
            Achievement.talent_profile_id == talent_profile.id
        ).first()

        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        db.delete(achievement)
        db.commit()
        return True

    @classmethod
    def delete_achievement(cls, achievement_id: int, user: User, db: Session) -> bool:
        return cls.delete_individual_achievement(achievement_id, user.talent_profile, db)

    @classmethod
    def get_talent_achievements(cls, talent_profile_id: int, db: Session) -> List[Achievement]:
        return db.query(Achievement).filter(
            Achievement.talent_profile_id == talent_profile_id
        ).order_by(Achievement.created_at.desc()).all()

    @classmethod
    def get_team_achievements(cls, team_id: int, db: Session) -> List[TeamAchievement]:
        return db.query(TeamAchievement).filter(
            TeamAchievement.team_id == team_id
        ).order_by(TeamAchievement.created_at.desc()).all()

    @classmethod
    def request_verification(
        cls,
        achievement_id: int,
        talent_profile: Optional[TalentProfile] = None,
        user: Optional[User] = None,
        evidence_notes: str = "",
        db: Session = None
    ) -> Achievement:
        profile_id = talent_profile.id if talent_profile else (user.talent_profile.id if user else None)
        achievement = db.query(Achievement).filter(
            Achievement.id == achievement_id,
            Achievement.talent_profile_id == profile_id
        ).first()

        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        achievement.verification_status = "pending_review"

        record = AchievementVerificationRecord(
            achievement_id=achievement.id,
            previous_status="unverified",
            new_status="pending_review",
            review_notes=evidence_notes or "Submitted for verification review."
        )
        db.add(record)

        target_user_id = talent_profile.user_id if talent_profile else user.id
        db.add(Notification(
            user_id=target_user_id,
            type="achievement_verification",
            title="Verification Requested",
            message=f"Verification request submitted for '{achievement.title}'.",
            link="/talent/achievements"
        ))

        db.commit()
        db.refresh(achievement)
        return achievement

    @classmethod
    def review_verification(
        cls,
        achievement_id: int,
        reviewer_id: int,
        decision: str,  # "verified" or "rejected"
        rejection_reason: Optional[str] = None,
        review_notes: Optional[str] = None,
        db: Session = None
    ) -> Achievement:
        achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        prev = achievement.verification_status
        achievement.verification_status = decision
        achievement.verification_reason = rejection_reason if decision == "rejected" else None
        achievement.verified_by_user_id = reviewer_id
        achievement.verified_at = utc_now() if decision == "verified" else None

        record = AchievementVerificationRecord(
            achievement_id=achievement.id,
            reviewer_id=reviewer_id,
            previous_status=prev,
            new_status=decision,
            review_notes=review_notes or rejection_reason or f"Administrative review: {decision}"
        )
        db.add(record)

        if achievement.talent_profile:
            db.add(Notification(
                user_id=achievement.talent_profile.user_id,
                type="achievement_verification",
                title=f"Achievement {'Verified' if decision == 'verified' else 'Review Update'}",
                message=f"Your achievement '{achievement.title}' has been {decision}.",
                link="/talent/achievements"
            ))

        db.commit()
        db.refresh(achievement)
        return achievement

    # =========================================================================
    # TEAM ACHIEVEMENTS
    # =========================================================================

    @classmethod
    def create_team_achievement(
        cls,
        team: Union[Team, int],
        creator_user_id: Optional[int] = None,
        data: Dict[str, Any] = None,
        user: Optional[User] = None,
        team_id: Optional[int] = None,
        db: Session = None
    ) -> TeamAchievement:
        if isinstance(team, Team):
            t_id = team.id
        elif isinstance(team, int):
            t_id = team
        else:
            t_id = team_id

        cat_raw = data.get("category", "Other achievements")
        cat_norm = cat_raw.strip().lower().replace(" ", "_").replace("-", "_")
        slug_map = {
            "hackathons": "Hackathons",
            "hackathon_winner": "Hackathons",
            "hackathon": "Hackathons",
            "technical_competitions": "Technical competitions",
            "robotics_competitions": "Robotics competitions",
            "awards_and_recognitions": "Awards and recognitions",
            "certifications": "Certifications",
            "academic_achievements": "Academic achievements",
            "research_and_publications": "Research and publications",
            "research_publication": "Research and publications",
            "open_source_contributions": "Open-source contributions",
            "projects_and_product_launches": "Projects and product launches",
            "internships_and_professional_milestones": "Internships and professional milestones",
            "leadership_and_volunteering": "Leadership and volunteering",
            "other_achievements": "Other achievements",
            "other": "Other achievements"
        }
        category = slug_map.get(cat_norm, cat_raw if cat_raw in ACHIEVEMENT_CATEGORIES else "Other achievements")

        date_awarded = None
        if data.get("date_awarded"):
            try:
                date_awarded = datetime.fromisoformat(data["date_awarded"].replace("Z", "+00:00"))
            except Exception:
                pass

        ach = TeamAchievement(
            team_id=t_id,
            title=data.get("title", "Team Achievement"),
            category=category,
            description=data.get("description", ""),
            organizer=data.get("issuer") or data.get("organizer") or "Organization",
            event_name=data.get("event_name"),
            date_achieved=date_awarded,
            position_award=data.get("position_award"),
            certificate_url=data.get("credential_url") or data.get("certificate_url"),
            verification_url=data.get("verification_url"),
            visibility="public" if data.get("is_public", True) else "private",
            verification_status="unverified"
        )
        db.add(ach)
        db.commit()
        db.refresh(ach)
        return ach

    @classmethod
    def attribute_team_member(
        cls,
        team_achievement_id: int,
        talent_profile_id: int,
        role_in_project: str = "Core Contributor",
        db: Session = None
    ) -> TeamAchievementContributor:
        existing = db.query(TeamAchievementContributor).filter(
            TeamAchievementContributor.team_achievement_id == team_achievement_id,
            TeamAchievementContributor.talent_profile_id == talent_profile_id
        ).first()

        if existing:
            return existing

        contrib = TeamAchievementContributor(
            team_achievement_id=team_achievement_id,
            talent_profile_id=talent_profile_id,
            role_in_achievement=role_in_project,
            attribution_status="pending"
        )
        db.add(contrib)

        prof = db.query(TalentProfile).filter(TalentProfile.id == talent_profile_id).first()
        ach = db.query(TeamAchievement).filter(TeamAchievement.id == team_achievement_id).first()
        if prof and ach:
            db.add(Notification(
                user_id=prof.user_id,
                type="team_achievement_attribution",
                title="Team Achievement Attribution",
                message=f"You were attributed as contributor for '{ach.title}'. Review and accept to add to your profile.",
                link="/talent/achievements"
            ))

        db.commit()
        db.refresh(contrib)
        return contrib

    @classmethod
    def respond_to_attribution(
        cls,
        contributor_id: Optional[int] = None,
        talent_profile: Optional[TalentProfile] = None,
        status_choice: Optional[str] = None,
        team_id: Optional[int] = None,
        achievement_id: Optional[int] = None,
        action: Optional[str] = None,
        user: Optional[User] = None,
        db: Session = None
    ) -> TeamAchievementContributor:
        if contributor_id:
            contrib = db.query(TeamAchievementContributor).filter(
                TeamAchievementContributor.id == contributor_id
            ).first()
        else:
            p_id = talent_profile.id if talent_profile else user.talent_profile.id
            contrib = db.query(TeamAchievementContributor).filter(
                TeamAchievementContributor.team_achievement_id == achievement_id,
                TeamAchievementContributor.talent_profile_id == p_id
            ).first()

        if not contrib:
            raise HTTPException(status_code=404, detail="Attribution record not found")

        choice = status_choice or ("accepted" if action == "accept" else "declined")
        contrib.attribution_status = choice
        contrib.responded_at = utc_now()
        db.commit()
        db.refresh(contrib)
        return contrib

    @classmethod
    def serialize_achievement(cls, ach: Achievement) -> Dict[str, Any]:
        return {
            "id": ach.id,
            "title": ach.title,
            "category": ach.category,
            "description": ach.description,
            "issuer": ach.issuing_organization,
            "event_name": ach.event_name,
            "date_awarded": _safe_date_str(ach.date_achieved),
            "position_award": ach.position_award,
            "credential_url": ach.certificate_url,
            "verification_url": ach.verification_url,
            "verification_status": ach.verification_status,
            "verification_reason": ach.verification_reason,
            "verified_at": ach.verified_at.isoformat() if ach.verified_at else None,
            "is_public": ach.visibility == "public",
            "evidence": [
                {
                    "id": ev.id,
                    "title": ev.title,
                    "file_url": ev.external_url or f"/storage/uploads/evidence/{ev.title}",
                    "file_type": ev.mime_type
                }
                for ev in ach.evidence_files
            ] if hasattr(ach, "evidence_files") else []
        }

    @classmethod
    def serialize_team_achievement(cls, ach: TeamAchievement) -> Dict[str, Any]:
        contributors_data = []
        if hasattr(ach, "contributors"):
            for c in ach.contributors:
                p = c.talent_profile
                contributors_data.append({
                    "contributor_id": c.id,
                    "talent_profile_id": c.talent_profile_id,
                    "talent_name": p.name if p else "Member",
                    "avatar_url": getattr(p, "profile_photo_url", None) or (getattr(p.user, "avatar_url", None) if p and p.user else None),
                    "role_in_project": c.role_in_achievement,
                    "attribution_status": c.attribution_status
                })

        return {
            "id": ach.id,
            "team_id": ach.team_id,
            "title": ach.title,
            "category": ach.category,
            "description": ach.description,
            "issuer": ach.organizer,
            "event_name": ach.event_name,
            "date_awarded": _safe_date_str(ach.date_achieved),
            "position_award": ach.position_award,
            "credential_url": ach.certificate_url,
            "verification_url": ach.verification_url,
            "verification_status": ach.verification_status,
            "is_public": ach.visibility == "public",
            "contributors": contributors_data
        }
