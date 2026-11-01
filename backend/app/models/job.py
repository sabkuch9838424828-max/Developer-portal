from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Software Engineering")  # "Software Engineering", "AI & Data", "Cloud & DevOps", "Product"
    description = Column(Text, nullable=False)
    employment_type = Column(String(50), default="Full-time")  # "Full-time", "Internship", "Contract", "Part-time"
    work_mode = Column(String(50), default="Remote")  # "Remote", "Hybrid", "On-site"
    location = Column(String(255), nullable=True)
    compensation_range = Column(String(100), nullable=True)  # e.g. "$120,000 - $150,000" or "$30/hr"
    experience_min = Column(Float, default=0.0)
    experience_max = Column(Float, default=5.0)
    openings = Column(Integer, default=1)
    deadline = Column(DateTime, nullable=True)
    responsibilities = Column(Text, nullable=True)
    additional_requirements = Column(Text, nullable=True)
    strict_eligibility = Column(Boolean, default=True)  # If true, missing any mandatory skill disqualifies candidate
    status = Column(String(50), default="draft")  # "draft", "published", "paused", "closed"
    created_at = Column(DateTime, default=utc_now)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    recruiter = relationship("RecruiterProfile", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    is_mandatory = Column(Boolean, default=True)  # True = mandatory requirement, False = preferred skill
    importance_weight = Column(Float, default=1.0)

    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="job_skills")
