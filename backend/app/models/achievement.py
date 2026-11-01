from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

ACHIEVEMENT_CATEGORIES = [
    "Hackathons",
    "Technical competitions",
    "Robotics competitions",
    "Awards and recognitions",
    "Certifications",
    "Academic achievements",
    "Research and publications",
    "Open-source contributions",
    "Projects and product launches",
    "Internships and professional milestones",
    "Leadership and volunteering",
    "Other achievements"
]

class Achievement(Base):
    """Individual developer achievement and credential record."""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Technical competitions")
    description = Column(Text, nullable=False)
    issuing_organization = Column(String(255), nullable=False)  # e.g., "Smart India Hackathon", "AWS", "Google Cloud"
    event_name = Column(String(255), nullable=True)
    date_achieved = Column(String(50), nullable=True)  # YYYY-MM or display date
    position_award = Column(String(100), nullable=True)  # "1st Place Winner", "Top Finalist", "Certified"
    certificate_url = Column(String(500), nullable=True)  # file storage link
    evidence_file_path = Column(String(500), nullable=True)
    verification_url = Column(String(500), nullable=True)  # external verification url
    related_project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    skills = Column(JSON, default=list)  # ["Python", "PyTorch", "Kubernetes"]
    visibility = Column(String(50), default="public")  # "public", "verified_recruiters", "private"
    verification_status = Column(String(50), default="unverified")  # "unverified", "pending_review", "verified", "rejected"
    verification_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_archived = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    talent_profile = relationship("TalentProfile", back_populates="achievements")
    related_project = relationship("Project")
    verifier = relationship("User", foreign_keys=[verified_by_user_id])
    evidences = relationship("AchievementEvidence", back_populates="achievement", cascade="all, delete-orphan")
    verification_records = relationship(
        "AchievementVerificationRecord",
        back_populates="achievement",
        cascade="all, delete-orphan",
        order_by="desc(AchievementVerificationRecord.created_at)"
    )

    @property
    def issuer(self):
        return self.issuing_organization

    @property
    def date_awarded(self):
        return self.date_achieved

class AchievementEvidence(Base):
    """Supporting proof, certification PDF, or medal badge for an achievement."""
    __tablename__ = "achievement_evidences"

    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False, default="application/pdf")
    external_url = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime, default=utc_now)

    achievement = relationship("Achievement", back_populates="evidences")

class AchievementVerificationRecord(Base):
    """Audit history of verification reviews and decisions."""
    __tablename__ = "achievement_verification_records"

    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)  # "pending_review", "verified", "rejected"
    review_notes = Column(Text, nullable=True)
    verification_method = Column(String(100), default="admin_review")  # "certificate_inspection", "issuer_url_verification", "admin_review"
    created_at = Column(DateTime, default=utc_now)

    achievement = relationship("Achievement", back_populates="verification_records")
    reviewer = relationship("User", foreign_keys=[reviewer_id])

class TeamAchievement(Base):
    """Independent team-level achievement and collective recognition."""
    __tablename__ = "team_achievements"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Hackathons")
    description = Column(Text, nullable=False)
    organizer = Column(String(255), nullable=False)  # issuing entity
    event_name = Column(String(255), nullable=True)
    date_achieved = Column(String(50), nullable=True)
    position_award = Column(String(100), nullable=True)  # "Grand Prize Winners", "1st Place"
    certificate_url = Column(String(500), nullable=True)
    verification_url = Column(String(500), nullable=True)
    related_project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    skills = Column(JSON, default=list)
    visibility = Column(String(50), default="public")
    verification_status = Column(String(50), default="unverified")
    verification_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    team = relationship("Team", back_populates="achievements")
    related_project = relationship("Project")
    contributors = relationship("TeamAchievementContributor", back_populates="team_achievement", cascade="all, delete-orphan")

    @property
    def issuer(self):
        return self.organizer

    @property
    def date_awarded(self):
        return self.date_achieved

class TeamAchievementContributor(Base):
    """Team member attribution for team achievement with member acceptance workflow."""
    __tablename__ = "team_achievement_contributors"
    __table_args__ = (UniqueConstraint("team_achievement_id", "talent_profile_id", name="uq_team_achievement_contributor"),)

    id = Column(Integer, primary_key=True, index=True)
    team_achievement_id = Column(Integer, ForeignKey("team_achievements.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    role_in_achievement = Column(String(100), default="Core Contributor")  # "Lead Architect", "Presenter", "Builder"
    attribution_status = Column(String(50), default="pending")  # "pending", "accepted", "declined"
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    team_achievement = relationship("TeamAchievement", back_populates="contributors")
    talent_profile = relationship("TalentProfile", back_populates="team_attributions")

    @property
    def role_in_project(self):
        return self.role_in_achievement
