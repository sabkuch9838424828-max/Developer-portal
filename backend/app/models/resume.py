from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False, default="application/pdf")
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    visibility = Column(String(50), default="verified_recruiters")  # "public", "verified_recruiters", "private"
    status = Column(String(50), default="uploaded")  # "uploaded", "processing", "review_required", "completed", "failed"
    error_message = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_skills = Column(Text, nullable=True)  # legacy compatibility
    parsed_experience = Column(Text, nullable=True)  # legacy compatibility
    ocr_applied = Column(Boolean, default=False)
    ai_provider_used = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    talent_profile = relationship("TalentProfile", back_populates="resumes")
    user = relationship("User", foreign_keys=[user_id])
    extractions = relationship("ResumeExtraction", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeExtraction.created_at)")
    access_logs = relationship("ResumeAccessLog", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeAccessLog.created_at)")

class ResumeExtraction(Base):
    __tablename__ = "resume_extractions"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=True)
    basic_info = Column(JSON, default=dict)       # name, headline, summary, links, location, email, phone
    education = Column(JSON, default=list)        # [{institution, degree, specialization, dates, coursework, confidence}]
    skills = Column(JSON, default=list)           # [{canonical_name, category, evidence, context, confidence, proficiency}]
    projects = Column(JSON, default=list)         # [{title, description, technologies, contribution, outcomes, links, dates}]
    experience = Column(JSON, default=list)       # [{organization, role, type, dates, responsibilities, accomplishments}]
    additional = Column(JSON, default=dict)       # {certifications, achievements, publications, open_source, languages}
    conflicts = Column(JSON, default=dict)        # {headline: {current: ..., extracted: ...}, ...}
    confidence_score = Column(Float, default=0.95)
    review_status = Column(String(50), default="pending_review")  # "pending_review", "partially_confirmed", "confirmed", "rejected"
    confirmed_fields = Column(JSON, default=list)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    resume = relationship("Resume", back_populates="extractions")
    talent_profile = relationship("TalentProfile")

class ResumeAccessLog(Base):
    __tablename__ = "resume_access_logs"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    accessed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)  # "view", "download", "parse", "reprocess", "visibility_change", "delete", "match_evaluated"
    actor_role = Column(String(50), default="talent")  # "talent", "recruiter", "admin"
    ip_address = Column(String(100), nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    resume = relationship("Resume", back_populates="access_logs")
    user = relationship("User", foreign_keys=[accessed_by_user_id])
