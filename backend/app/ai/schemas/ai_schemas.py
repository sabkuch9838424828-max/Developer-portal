from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class JobRequirementExtractionResult(BaseModel):
    job_title: str = Field(description="Extracted or inferred job title")
    job_category: str = Field(default="Software Engineering", description="Domain/category of the role")
    job_description: str = Field(description="Executive summary and overview of the role")
    mandatory_skills: List[str] = Field(default_factory=list, description="Non-negotiable required technical skills")
    preferred_skills: List[str] = Field(default_factory=list, description="Nice-to-have technical skills")
    related_skills: List[str] = Field(default_factory=list, description="Technically adjacent skills")
    experience_min: float = Field(default=0.0, description="Minimum years of experience")
    experience_max: float = Field(default=5.0, description="Maximum years of experience")
    education_requirements: Optional[str] = Field(default=None, description="Degree or academic requirements")
    employment_type: str = Field(default="Full-time", description="Full-time, Internship, Contract, or Part-time")
    work_mode: str = Field(default="Remote", description="Remote, Hybrid, or On-site")
    location: Optional[str] = Field(default=None, description="City, state or country requirement")
    compensation: Optional[str] = Field(default=None, description="Salary or hourly rate specification")
    responsibilities: List[str] = Field(default_factory=list, description="Primary engineering duties")
    eligibility_conditions: List[str] = Field(default_factory=list, description="Eligibility or prerequisite rules")
    review_required: bool = Field(default=True, description="Flag indicating human review is mandatory before publishing")
    confidence: float = Field(default=0.95, description="Confidence score of the extraction between 0.0 and 1.0")

class ProfileAnalysisResult(BaseModel):
    specialization: str = Field(description="Primary engineering discipline")
    headline: str = Field(description="Professional one-line headline")
    bio_summary: str = Field(description="Structured technical summary")
    extracted_skills: List[str] = Field(default_factory=list, description="Extracted skills")
    experience_level: str = Field(default="Mid-Level", description="Junior, Mid-Level, Senior, Lead")
    estimated_experience_years: float = Field(default=1.0)
    strengths: List[str] = Field(default_factory=list)
    recommended_domains: List[str] = Field(default_factory=list)

class ProjectRelevanceResult(BaseModel):
    project_title: str
    relevance_score: float = Field(ge=0.0, le=100.0, description="Relevance to target job requirements")
    demonstrated_technologies: List[str] = Field(default_factory=list)
    mentioned_technologies: List[str] = Field(default_factory=list)
    relevance_explanation: str

class MatchExplanationResult(BaseModel):
    recruiter_explanation: str = Field(description="Technical breakdown for the recruiter explaining match grounded in actual data")
    talent_explanation: str = Field(description="Direct insight for the talent explaining why this opportunity matches their skills")
    alignment_summary: str = Field(description="Short one-line summary of match quality")

class SkillNormalizationResult(BaseModel):
    original_term: str
    canonical_name: str
    category: str
    is_known: bool
    related_skills: List[str] = Field(default_factory=list)
