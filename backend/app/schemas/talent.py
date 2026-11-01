from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class TalentProfileUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[float] = None
    availability: Optional[str] = None
    preferred_employment_type: Optional[str] = None
    remote_preference: Optional[str] = None
    compensation_expectation: Optional[str] = None
    contact_preferences: Optional[Dict[str, Any]] = None

class SkillItem(BaseModel):
    name: str
    category: str = "Backend"
    proficiency: str = "Intermediate"  # Beginner, Intermediate, Advanced, Expert
    experience_years: float = 1.0
    evidence_url: Optional[str] = None

class ProjectCreateRequest(BaseModel):
    title: str
    description: str
    problem_statement: Optional[str] = None
    features: Optional[str] = None
    developer_contribution: Optional[str] = None
    thumbnail_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: str = "Completed"
    technologies: List[str] = Field(default_factory=list)

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    problem_statement: Optional[str] = None
    features: Optional[str] = None
    developer_contribution: Optional[str] = None
    thumbnail_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: str
    technologies: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    talent_profile_id: int
    role: str = "Member"
    title: Optional[str] = None

class TeamCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    github_url: Optional[str] = None
    availability: str = "Available for projects"
    members: List[TeamMemberCreate] = []

class TalentOpportunityCard(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    company_logo: Optional[str] = None
    employment_type: str
    work_mode: str
    location: Optional[str] = None
    compensation_range: Optional[str] = None
    match_score: float
    eligibility: str
    matched_mandatory_skills: List[str] = []
    missing_mandatory_skills: List[str] = []
    matched_preferred_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    score_breakdown: Dict[str, float] = {}
    explanation: str
    deadline: Optional[datetime] = None
    has_applied: bool = False
    application_status: Optional[str] = None
    is_invited: bool = False

class TalentDashboardStats(BaseModel):
    matched_opportunities: int
    applications_submitted: int
    active_invitations: int
    profile_completion_percentage: int
    skills_count: int
    projects_count: int
