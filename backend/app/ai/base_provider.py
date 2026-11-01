from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.ai.schemas.ai_schemas import (
    JobRequirementExtractionResult,
    ProfileAnalysisResult,
    ProjectRelevanceResult,
    MatchExplanationResult,
    SkillNormalizationResult,
    ResumeExtractionResult
)

class BaseAIProvider(ABC):
    """Abstract Base Class for AI providers in NEXORA."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, timeout: int = 60, temperature: float = 0.1):
        self.api_key = api_key or ""
        self.model = model or ""
        self.timeout = timeout
        self.temperature = temperature

    @abstractmethod
    async def extract_job_requirements(self, document_text: str) -> JobRequirementExtractionResult:
        """Extract structured job requirements from text."""
        pass

    @abstractmethod
    async def analyze_talent_profile(self, profile_text: str) -> ProfileAnalysisResult:
        """Analyze developer background and extract structured talent profile."""
        pass

    @abstractmethod
    async def analyze_project_relevance(
        self,
        job_title: str,
        mandatory_skills: list,
        preferred_skills: list,
        project_title: str,
        project_description: str,
        project_technologies: list,
        project_contribution: str = ""
    ) -> ProjectRelevanceResult:
        """Evaluate project relevance against job requirements."""
        pass

    @abstractmethod
    async def generate_match_explanation(
        self,
        job_title: str,
        company_name: str,
        mandatory_skills: list,
        preferred_skills: list,
        talent_name: str,
        matched_mandatory: list,
        missing_mandatory: list,
        matched_preferred: list,
        missing_preferred: list,
        relevant_projects: list,
        experience_years: float,
        exp_min: float,
        exp_max: float,
        match_score: float,
        eligibility: str
    ) -> MatchExplanationResult:
        """Generate explainable match rationale grounded in deterministic data."""
        pass

    @abstractmethod
    async def extract_resume(self, document_text: str) -> ResumeExtractionResult:
        """Extract structured resume information into strict Pydantic schema."""
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Test the provider credentials, connectivity, and model latency."""
        pass
