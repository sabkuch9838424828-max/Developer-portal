from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, Boolean
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=True)
    features = Column(Text, nullable=True)
    developer_contribution = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    status = Column(String(50), default="Completed")  # "Completed", "In Progress", "Prototype"
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    talent_profile = relationship("TalentProfile", back_populates="projects")
    team = relationship("Team", back_populates="projects")
    technologies = relationship("ProjectTechnology", back_populates="project", cascade="all, delete-orphan")

class ProjectTechnology(Base):
    __tablename__ = "project_technologies"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    usage_level = Column(String(50), default="demonstrated")  # "demonstrated", "mentioned"

    project = relationship("Project", back_populates="technologies")
    skill = relationship("Skill", back_populates="project_technologies")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_skills = Column(Text, nullable=True)  # JSON string or CSV
    parsed_experience = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    talent_profile = relationship("TalentProfile", back_populates="resumes")
