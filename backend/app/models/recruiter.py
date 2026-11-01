from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiter", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="recruiter", cascade="all, delete-orphan")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_profile_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    size = Column(String(100), nullable=True)  # "1-10", "11-50", "51-200", "201-500", "500+"
    industry = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    social_links = Column(JSON, default=dict)  # {"linkedin": "", "twitter": "", "github": ""}
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    recruiter = relationship("RecruiterProfile", back_populates="company")
    jobs = relationship("Job", back_populates="company")
