from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Team Create / Update
class TeamCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    domain: Optional[str] = "Full-Stack Web"
    description: Optional[str] = None
    logo_url: Optional[str] = None
    project_goals: Optional[str] = None
    required_skills: Optional[List[str]] = []
    visibility: Optional[str] = "public"  # "public", "private", "discoverable"
    website: Optional[str] = None
    github_url: Optional[str] = None
    availability: Optional[str] = "Available for projects"

class TeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    project_goals: Optional[str] = None
    required_skills: Optional[List[str]] = None
    visibility: Optional[str] = None
    website: Optional[str] = None
    github_url: Optional[str] = None
    availability: Optional[str] = None

class TeamMemberRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(Owner|Admin|Member)$")
    title: Optional[str] = None

# Team Invitation Requests
class TeamInvitationCreateRequest(BaseModel):
    invitee_user_id: int
    role: Optional[str] = "Member"  # "Admin", "Member"
    title: Optional[str] = None
    message: Optional[str] = None

class TeamInvitationResponse(BaseModel):
    id: int
    team_id: int
    team_name: str
    team_domain: Optional[str] = None
    team_logo_url: Optional[str] = None
    inviter_id: int
    inviter_name: str
    invitee_id: int
    invitee_name: str
    role: str
    title: Optional[str] = None
    message: Optional[str] = None
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime

# Member Search
class MemberSearchItem(BaseModel):
    user_id: int
    profile_id: int
    name: str
    email: str
    headline: Optional[str] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    experience_years: float = 0.0
    skills: List[Dict[str, Any]] = []
    projects_count: int = 0
    availability: str = "Immediately"
    is_already_member: bool = False
    has_pending_invitation: bool = False

# Team Skills & Aggregation
class SkillInventoryItem(BaseModel):
    skill: str
    category: str
    count: int
    members: List[Dict[str, Any]]  # [{"name": "Alex Chen", "proficiency": "Expert", "years": 4.5}]
    max_proficiency: str
    proficiency_breakdown: Dict[str, int]  # {"Expert": 1, "Advanced": 1, ...}

class TeamSkillsResponse(BaseModel):
    team_id: int
    team_name: str
    total_members: int
    total_unique_skills: int
    skills_inventory: List[SkillInventoryItem]
    shared_skills: List[SkillInventoryItem]
    unique_skills: List[SkillInventoryItem]
    categories: List[Dict[str, Any]]  # [{"category": "Backend Development", "count": 5, "skills": [...]}]
    scorecard: Dict[str, Any]

class TeamSkillMatrixResponse(BaseModel):
    team_id: int
    team_name: str
    members: List[Dict[str, Any]]
    skills: List[str]
    categories: List[Dict[str, Any]]
    matrix: List[Dict[str, Any]]  # List of rows for each member
    scorecard: Dict[str, Any]

# Team-Based Recruitment Matching
class SkillAttribution(BaseModel):
    skill: str
    is_mandatory: bool
    is_covered: bool
    provided_by: List[Dict[str, str]]  # [{"member_name": "Alex Chen", "role": "Lead", "proficiency": "Expert"}]

class TeamMatchResponse(BaseModel):
    team_id: int
    team_name: str
    job_id: int
    job_title: str
    company_name: str
    team_match_score: float
    eligibility: str  # "eligible", "ineligible"
    mandatory_coverage_pct: float
    preferred_coverage_pct: float
    mandatory_skills_status: List[SkillAttribution]
    preferred_skills_status: List[SkillAttribution]
    missing_mandatory_skills: List[str]
    missing_preferred_skills: List[str]
    member_contributions: List[Dict[str, Any]]
    explanation: str
