from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class TalentProfile(Base):
    __tablename__ = "talent_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    specialization = Column(String(100), nullable=True)  # "Full-Stack", "Backend", "AI / ML", "Frontend", "DevOps", "Embedded"
    location = Column(String(255), nullable=True)
    education = Column(String(255), nullable=True)
    experience_years = Column(Float, default=0.0)
    availability = Column(String(100), default="Immediately")  # "Immediately", "2 weeks", "1 month"
    preferred_employment_type = Column(String(100), default="Full-time")  # "Full-time", "Internship", "Contract", "Part-time"
    remote_preference = Column(String(50), default="Remote")  # "Remote", "Hybrid", "On-site", "Any"
    compensation_expectation = Column(String(100), nullable=True)
    contact_preferences = Column(JSON, default=dict)  # {"email": true, "github": "...", "linkedin": "...", "website": "..."}
    is_public = Column(Boolean, default=True)
    profile_photo_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    identity_status = Column(String(50), default="not_started")  # "not_started", "pending", "in_review", "verified", "failed"
    identity_verified = Column(Boolean, default=False)
    resume_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="talent_profile")
    profile_skills = relationship("ProfileSkill", back_populates="talent_profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="talent_profile", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="talent_profile", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="talent_profile", cascade="all, delete-orphan", order_by="Achievement.order_index")
    team_attributions = relationship("TeamAchievementContributor", back_populates="talent_profile", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="talent_profile", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="talent_profile", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="talent_profile", cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="talent_profile", cascade="all, delete-orphan")

    @property
    def profile_picture_url(self):
        return self.profile_photo_url

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    lead_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    domain = Column(String(100), default="Full-Stack Web")  # "AI / ML", "Distributed Systems", "Mobile Apps", etc.
    project_goals = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list)  # ["Rust", "PyTorch"] - open positions/looking for members
    visibility = Column(String(50), default="public")  # "public", "private", "discoverable"
    website = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    availability = Column(String(100), default="Available for projects")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    owner = relationship("User", foreign_keys=[lead_user_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    invitations = relationship("TeamInvitation", back_populates="team", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="team", cascade="all, delete-orphan")
    achievements = relationship("TeamAchievement", back_populates="team", cascade="all, delete-orphan", order_by="TeamAchievement.order_index")

class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("team_id", "talent_profile_id", name="uq_team_member"),)

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="Member")  # "Owner", "Admin", "Member"
    title = Column(String(100), nullable=True)   # "Solutions Architect", "Frontend Engineer", etc.
    joined_at = Column(DateTime, default=utc_now)

    team = relationship("Team", back_populates="members")
    talent_profile = relationship("TalentProfile", back_populates="team_memberships")

class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    inviter_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invitee_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="Member")  # "Admin", "Member"
    title = Column(String(100), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # "pending", "accepted", "declined", "cancelled", "expired"
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    team = relationship("Team", back_populates="invitations")
    inviter = relationship("User", foreign_keys=[inviter_user_id])
    invitee = relationship("User", foreign_keys=[invitee_user_id])
