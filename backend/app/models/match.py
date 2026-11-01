from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class JobMatch(Base):
    __tablename__ = "job_matches"
    __table_args__ = (UniqueConstraint("job_id", "talent_profile_id", name="uq_job_talent_match"),)

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)  # 0 to 100
    eligibility = Column(String(50), default="eligible")  # "eligible", "ineligible"
    matched_mandatory_skills = Column(JSON, default=list)  # ["Python", "FastAPI"]
    matched_preferred_skills = Column(JSON, default=list)  # ["Docker"]
    missing_mandatory_skills = Column(JSON, default=list)  # []
    missing_preferred_skills = Column(JSON, default=list)  # ["Redis"]
    relevant_projects = Column(JSON, default=list)  # [{"title": "API Engine", "relevance": 95}]
    score_breakdown = Column(JSON, default=dict)  # {"mandatory": 40, "preferred": 18, "projects": 17, "experience": 9, "availability": 8}
    explanation = Column(Text, nullable=False)  # Explainable matching paragraph
    algorithm_version = Column(String(50), default="1.0-hybrid")
    is_viewed_by_recruiter = Column(Boolean, default=False)
    is_viewed_by_talent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    job = relationship("Job", back_populates="matches")
    talent_profile = relationship("TalentProfile", back_populates="matches")
