import json
import time
import httpx
from typing import Dict, Any, List
from app.ai.base_provider import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    JobRequirementExtractionResult,
    ProfileAnalysisResult,
    ProjectRelevanceResult,
    MatchExplanationResult
)
from app.ai.prompts.templates import (
    JOB_REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
    JOB_REQUIREMENT_EXTRACTION_USER_TEMPLATE,
    PROFILE_ANALYSIS_SYSTEM_PROMPT,
    PROFILE_ANALYSIS_USER_TEMPLATE,
    PROJECT_RELEVANCE_SYSTEM_PROMPT,
    PROJECT_RELEVANCE_USER_TEMPLATE,
    MATCH_EXPLANATION_SYSTEM_PROMPT,
    MATCH_EXPLANATION_USER_TEMPLATE
)
from app.ai.providers.heuristic_provider import HeuristicProvider

class GrokProvider(BaseAIProvider):
    """xAI Grok API Provider using standard REST OpenAI-compatible endpoint."""

    def __init__(self, api_key: str, model: str = "grok-beta", timeout: int = 60, temperature: float = 0.1):
        super().__init__(api_key=api_key, model=model or "grok-beta", timeout=timeout, temperature=temperature)
        self.fallback = HeuristicProvider()

    async def _call_grok_json(self, system_prompt: str, user_prompt: str) -> dict:
        if not self.api_key:
            raise ValueError("GROK_API_KEY is not set.")

        endpoint = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": self.temperature,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        choices = data.get("choices", [])
        if not choices:
            raise ValueError("Grok returned empty choices list.")

        content_text = choices[0].get("message", {}).get("content", "{}")
        clean_text = content_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]

        return json.loads(clean_text.strip())

    async def extract_job_requirements(self, document_text: str) -> JobRequirementExtractionResult:
        try:
            user_prompt = JOB_REQUIREMENT_EXTRACTION_USER_TEMPLATE.format(document_text=document_text)
            data = await self._call_grok_json(JOB_REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, user_prompt)
            return JobRequirementExtractionResult(**data)
        except Exception:
            return await self.fallback.extract_job_requirements(document_text)

    async def analyze_talent_profile(self, profile_text: str) -> ProfileAnalysisResult:
        try:
            user_prompt = PROFILE_ANALYSIS_USER_TEMPLATE.format(profile_text=profile_text)
            data = await self._call_grok_json(PROFILE_ANALYSIS_SYSTEM_PROMPT, user_prompt)
            return ProfileAnalysisResult(**data)
        except Exception:
            return await self.fallback.analyze_talent_profile(profile_text)

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
        try:
            user_prompt = PROJECT_RELEVANCE_USER_TEMPLATE.format(
                job_title=job_title,
                mandatory_skills=", ".join(mandatory_skills),
                preferred_skills=", ".join(preferred_skills),
                project_title=project_title,
                project_description=project_description,
                project_technologies=", ".join(project_technologies),
                project_contribution=project_contribution
            )
            data = await self._call_grok_json(PROJECT_RELEVANCE_SYSTEM_PROMPT, user_prompt)
            return ProjectRelevanceResult(**data)
        except Exception:
            return await self.fallback.analyze_project_relevance(
                job_title, mandatory_skills, preferred_skills, project_title,
                project_description, project_technologies, project_contribution
            )

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
        try:
            user_prompt = MATCH_EXPLANATION_USER_TEMPLATE.format(
                job_title=job_title,
                company_name=company_name,
                mandatory_skills=", ".join(mandatory_skills),
                preferred_skills=", ".join(preferred_skills),
                talent_name=talent_name,
                matched_mandatory=", ".join(matched_mandatory) if matched_mandatory else "None",
                missing_mandatory=", ".join(missing_mandatory) if missing_mandatory else "None",
                matched_preferred=", ".join(matched_preferred) if matched_preferred else "None",
                missing_preferred=", ".join(missing_preferred) if missing_preferred else "None",
                relevant_projects=", ".join([p.get("title", "") if isinstance(p, dict) else str(p) for p in relevant_projects]) or "None",
                experience_years=experience_years,
                exp_min=exp_min,
                exp_max=exp_max,
                match_score=match_score,
                eligibility=eligibility
            )
            data = await self._call_grok_json(MATCH_EXPLANATION_SYSTEM_PROMPT, user_prompt)
            return MatchExplanationResult(**data)
        except Exception:
            return await self.fallback.generate_match_explanation(
                job_title, company_name, mandatory_skills, preferred_skills, talent_name,
                matched_mandatory, missing_mandatory, matched_preferred, missing_preferred,
                relevant_projects, experience_years, exp_min, exp_max, match_score, eligibility
            )

    async def test_connection(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "status": "error",
                "provider": "grok",
                "model": self.model,
                "latency_ms": 0.0,
                "message": "GROK_API_KEY is not configured in .env or environment."
            }
        
        start_time = time.time()
        try:
            endpoint = "https://api.x.ai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": "ping"}],
                "max_tokens": 5
            }
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.post(endpoint, json=payload, headers=headers)
                res.raise_for_status()
            latency = (time.time() - start_time) * 1000
            return {
                "status": "connected",
                "provider": "grok",
                "model": self.model,
                "latency_ms": round(latency, 2),
                "message": f"Successfully connected to xAI Grok ({self.model})."
            }
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return {
                "status": "error",
                "provider": "grok",
                "model": self.model,
                "latency_ms": round(latency, 2),
                "message": f"Grok connection failed: {str(e)}"
            }
