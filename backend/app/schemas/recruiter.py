from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None

class CompanyResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    social_links: Dict[str, str] = {}

    class Config:
        from_attributes = True

class RecruiterDashboardStats(BaseModel):
    active_jobs: int
    total_matched_profiles: int
    applications_received: int
    shortlisted_candidates: int
    pending_responses: int
    closed_opportunities: int

class JobCreateRequest(BaseModel):
    title: str
    category: str = "Software Engineering"
    description: str
    mandatory_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    experience_min: float = 0.0
    experience_max: float = 5.0
    employment_type: str = "Full-time"
    work_mode: str = "Remote"
    location: Optional[str] = "Remote"
    compensation_range: Optional[str] = None
    openings: int = 1
    deadline: Optional[datetime] = None
    responsibilities: Optional[str] = None
    additional_requirements: Optional[str] = None
    strict_eligibility: bool = True
    identity_requirement: Optional[str] = "none"
    publish_immediately: bool = False

class JobResponse(BaseModel):
    id: int
    title: str
    category: str
    description: str
    employment_type: str
    work_mode: str
    location: Optional[str] = None
    compensation_range: Optional[str] = None
    experience_min: float
    experience_max: float
    openings: int
    deadline: Optional[datetime] = None
    responsibilities: Optional[str] = None
    additional_requirements: Optional[str] = None
    strict_eligibility: bool
    status: str
    created_at: datetime
    published_at: Optional[datetime] = None
    company_name: Optional[str] = None
    mandatory_skills: List[str] = []
    preferred_skills: List[str] = []
    match_count: Optional[int] = 0
    application_count: Optional[int] = 0
    identity_requirement: Optional[str] = "none"

    class Config:
        from_attributes = True

class CandidateMatchCard(BaseModel):
    match_id: int
    talent_profile_id: int
    user_id: int
    name: str
    headline: Optional[str] = None
    specialization: Optional[str] = None
    talent_type: str
    experience_years: float
    location: Optional[str] = None
    remote_preference: Optional[str] = None
    match_score: float
    eligibility: str
    matched_mandatory_skills: List[str] = []
    missing_mandatory_skills: List[str] = []
    matched_preferred_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    relevant_projects: List[Dict[str, Any]] = []
    score_breakdown: Dict[str, float] = {}
    explanation: str
    skills: List[str] = []
    has_applied: bool = False
    has_invitation: bool = False
    application_status: Optional[str] = None
    has_resume: bool = False
    resume_id: Optional[int] = None
    resume_visibility: Optional[str] = None
    resume_filename: Optional[str] = None
    evidence_count: int = 0
    profile_picture_url: Optional[str] = None
    identity_verified: bool = False
    identity_status: Optional[str] = "unverified"
    verified_achievements_count: int = 0
    top_achievements: List[Dict[str, Any]] = []

class ApplicationPipelineUpdate(BaseModel):
    status: str  # "applied", "under_review", "shortlisted", "interview", "selected", "rejected"
    recruiter_notes: Optional[str] = None
    interview_date: Optional[datetime] = None

class SendInvitationRequest(BaseModel):
    talent_profile_id: int
    job_id: int
    message: Optional[str] = "We reviewed your technical background and would love to invite you to apply for this role."
