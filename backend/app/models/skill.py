from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, DateTime, Float, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    canonical_name = Column(String(100), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # "Frontend", "Backend", "Database", "AI", "Tools", "Embedded", "Other"
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")
    profile_skills = relationship("ProfileSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    project_technologies = relationship("ProjectTechnology", back_populates="skill", cascade="all, delete-orphan")

class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    alias = Column(String(100), unique=True, index=True, nullable=False)

    skill = relationship("Skill", back_populates="aliases")

class ProfileSkill(Base):
    __tablename__ = "profile_skills"
    __table_args__ = (UniqueConstraint("profile_id", "skill_id", name="uq_profile_skill"),)

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(String(50), default="Intermediate")  # "Beginner", "Intermediate", "Advanced", "Expert"
    experience_years = Column(Float, default=1.0)
    is_verified = Column(Boolean, default=False)
    evidence_url = Column(String(500), nullable=True)  # link to github or project
    source = Column(String(50), default="self_declared")  # "self_declared", "resume_extracted", "project_demonstrated"

    talent_profile = relationship("TalentProfile", back_populates="profile_skills")
    skill = relationship("Skill", back_populates="profile_skills")
