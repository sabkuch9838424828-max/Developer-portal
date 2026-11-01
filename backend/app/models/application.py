from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("job_id", "talent_profile_id", name="uq_job_talent_application"),)

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="applied")  
    # Pipeline: "applied" -> "under_review" -> "shortlisted" -> "interview" -> "selected" / "rejected" / "withdrawn"
    cover_note = Column(Text, nullable=True)
    recruiter_notes = Column(Text, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    job = relationship("Job", back_populates="applications")
    talent_profile = relationship("TalentProfile", back_populates="applications")

class Invitation(Base):
    __tablename__ = "invitations"
    __table_args__ = (UniqueConstraint("job_id", "talent_profile_id", name="uq_job_talent_invitation"),)

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), nullable=False)
    talent_profile_id = Column(Integer, ForeignKey("talent_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # "pending", "accepted", "declined"
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    job = relationship("Job", back_populates="invitations")
    recruiter = relationship("RecruiterProfile", back_populates="invitations")
    talent_profile = relationship("TalentProfile", back_populates="invitations")
