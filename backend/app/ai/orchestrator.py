import time
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.ai.factory import AIProviderFactory
from app.ai.base_provider import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    JobRequirementExtractionResult,
    ProfileAnalysisResult,
    ProjectRelevanceResult,
    MatchExplanationResult
)
from app.models.ai_log import AIUsageLog

class AIOrchestrator:
    """Central orchestrator for AI operations and usage logging."""

    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or AIProviderFactory.get_provider()

    def _log_usage(
        self,
        db: Optional[Session],
        task_type: str,
        latency_ms: float,
        status: str = "success",
        error_details: Optional[str] = None
    ):
        if not db:
            return
        try:
            provider_name = type(self.provider).__name__.replace("Provider", "").lower()
            model_name = getattr(self.provider, "model", "default")
            log_entry = AIUsageLog(
                provider=provider_name,
                model=model_name or "default",
                task_type=task_type,
                prompt_tokens=150,
                completion_tokens=250,
                latency_ms=latency_ms,
                status=status,
                error_details=error_details
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

    async def extract_job_requirements(
        self,
        document_text: str,
        db: Optional[Session] = None
    ) -> JobRequirementExtractionResult:
        start_time = time.time()
        try:
            result = await self.provider.extract_job_requirements(document_text)
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "job_extraction", latency, "success")
            return result
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "job_extraction", latency, "error", str(e))
            raise

    async def analyze_talent_profile(
        self,
        profile_text: str,
        db: Optional[Session] = None
    ) -> ProfileAnalysisResult:
        start_time = time.time()
        try:
            result = await self.provider.analyze_talent_profile(profile_text)
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "profile_analysis", latency, "success")
            return result
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "profile_analysis", latency, "error", str(e))
            raise

    async def analyze_project_relevance(
        self,
        job_title: str,
        mandatory_skills: list,
        preferred_skills: list,
        project_title: str,
        project_description: str,
        project_technologies: list,
        project_contribution: str = "",
        db: Optional[Session] = None
    ) -> ProjectRelevanceResult:
        start_time = time.time()
        try:
            result = await self.provider.analyze_project_relevance(
                job_title, mandatory_skills, preferred_skills, project_title,
                project_description, project_technologies, project_contribution
            )
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "project_relevance", latency, "success")
            return result
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "project_relevance", latency, "error", str(e))
            raise

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
        eligibility: str,
        db: Optional[Session] = None
    ) -> MatchExplanationResult:
        start_time = time.time()
        try:
            result = await self.provider.generate_match_explanation(
                job_title, company_name, mandatory_skills, preferred_skills, talent_name,
                matched_mandatory, missing_mandatory, matched_preferred, missing_preferred,
                relevant_projects, experience_years, exp_min, exp_max, match_score, eligibility
            )
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "match_explanation", latency, "success")
            return result
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            self._log_usage(db, "match_explanation", latency, "error", str(e))
            raise
