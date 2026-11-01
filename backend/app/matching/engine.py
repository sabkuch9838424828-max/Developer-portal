from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.ai.services.skill_normalizer import SkillNormalizerService

class HybridMatchingEngine:
    """Deterministic, explainable hybrid matching engine with strict eligibility gates."""

    def __init__(
        self,
        weight_mandatory: float = None,
        weight_preferred: float = None,
        weight_projects: float = None,
        weight_experience: float = None,
        weight_availability: float = None,
        match_threshold: int = None
    ):
        self.w_mandatory = weight_mandatory if weight_mandatory is not None else settings.WEIGHT_MANDATORY_SKILLS
        self.w_preferred = weight_preferred if weight_preferred is not None else settings.WEIGHT_PREFERRED_SKILLS
        self.w_projects = weight_projects if weight_projects is not None else settings.WEIGHT_RELEVANT_PROJECTS
        self.w_exp = weight_experience if weight_experience is not None else settings.WEIGHT_EXPERIENCE
        self.w_avail = weight_availability if weight_availability is not None else settings.WEIGHT_AVAILABILITY_PREFERENCE
        self.match_threshold = match_threshold if match_threshold is not None else settings.MATCH_THRESHOLD

    def calculate_match(
        self,
        job_data: Dict[str, Any],
        talent_data: Dict[str, Any],
        strict_eligibility: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates deterministic compatibility score (0-100) between a job and a talent profile.
        """
        # Normalize job skills
        job_mandatory = [SkillNormalizerService.normalize_skill(s).canonical_name for s in job_data.get("mandatory_skills", [])]
        job_preferred = [SkillNormalizerService.normalize_skill(s).canonical_name for s in job_data.get("preferred_skills", [])]

        # Normalize talent skills
        talent_skills_list = [SkillNormalizerService.normalize_skill(s).canonical_name for s in talent_data.get("skills", [])]
        talent_skills_set = set(talent_skills_list)

        # 1. Mandatory Skills Calculation (Weight: 40%)
        matched_mandatory = []
        missing_mandatory = []
        
        for req in job_mandatory:
            if req in talent_skills_set:
                matched_mandatory.append(req)
            else:
                # Check related skills
                has_related = any(SkillNormalizerService.are_related(req, ts) for ts in talent_skills_set)
                if has_related:
                    matched_mandatory.append(f"{req} (via related)")
                else:
                    missing_mandatory.append(req)

        if job_mandatory:
            mandatory_ratio = len([m for m in matched_mandatory if "(via related)" not in m]) / len(job_mandatory)
            related_bonus = len([m for m in matched_mandatory if "(via related)" in m]) * 0.5 / len(job_mandatory)
            mandatory_score = min(1.0, mandatory_ratio + related_bonus) * (self.w_mandatory * 100)
        else:
            mandatory_score = (self.w_mandatory * 100)

        # Strict eligibility check: if configured and candidate misses mandatory skills
        is_eligible = True
        if strict_eligibility and len(missing_mandatory) > 0:
            is_eligible = False

        # 2. Preferred Skills Calculation (Weight: 20%)
        matched_preferred = []
        missing_preferred = []
        for pref in job_preferred:
            if pref in talent_skills_set:
                matched_preferred.append(pref)
            else:
                missing_preferred.append(pref)

        if job_preferred:
            preferred_score = (len(matched_preferred) / len(job_preferred)) * (self.w_preferred * 100)
        else:
            preferred_score = (self.w_preferred * 100)

        # 3. Relevant Projects Alignment (Weight: 20%)
        # Evaluate how many projects demonstrated job technologies
        talent_projects = talent_data.get("projects", [])
        relevant_projects = []
        all_job_skills = set(job_mandatory + job_preferred)
        
        project_overlap_count = 0
        for proj in talent_projects:
            proj_techs = [SkillNormalizerService.normalize_skill(t).canonical_name for t in proj.get("technologies", [])]
            overlap = all_job_skills.intersection(set(proj_techs))
            if overlap:
                project_overlap_count += 1
                relevant_projects.append({
                    "title": proj.get("title", "Project"),
                    "matched_technologies": list(overlap),
                    "relevance": min(100, int(len(overlap) * 35 + 30))
                })

        if talent_projects:
            proj_ratio = min(1.0, project_overlap_count / max(1, len(talent_projects)))
            project_score = proj_ratio * (self.w_projects * 100)
        else:
            project_score = 0.0

        # 4. Experience Compatibility (Weight: 10%)
        exp_min = job_data.get("experience_min", 0.0)
        exp_max = job_data.get("experience_max", 5.0)
        cand_exp = talent_data.get("experience_years", 0.0)

        if cand_exp >= exp_min:
            if cand_exp <= exp_max + 2.0:
                exp_score = self.w_exp * 100
            else:
                exp_score = (self.w_exp * 100) * 0.85  # slightly overqualified
        else:
            # Under minimum experience
            gap = exp_min - cand_exp
            exp_score = max(0.0, (self.w_exp * 100) * (1.0 - (gap / max(1.0, exp_min))))
            if gap > 2.0 and strict_eligibility:
                is_eligible = False

        # 5. Availability & Work Preference (Weight: 10%)
        job_mode = job_data.get("work_mode", "Remote").lower()
        cand_mode = talent_data.get("remote_preference", "Remote").lower()
        
        mode_compatible = (
            job_mode == cand_mode or 
            cand_mode in ["any", "open to all"] or 
            job_mode == "remote"
        )
        avail_score = (self.w_avail * 100) if mode_compatible else (self.w_avail * 100 * 0.5)

        # Total Raw Score
        raw_total = mandatory_score + preferred_score + project_score + exp_score + avail_score
        final_score = round(min(100.0, max(0.0, raw_total)), 1)

        # Eligibility status
        eligibility = "eligible" if is_eligible else "ineligible"

        # Construct explanation
        if is_eligible:
            explanation = (
                f"Candidate matches {len(matched_mandatory)}/{len(job_mandatory) or 1} mandatory requirements "
                f"and {len(matched_preferred)}/{len(job_preferred) or 1} preferred skills. "
                f"Portfolio features {len(relevant_projects)} relevant projects demonstrating target stack."
            )
        else:
            missing_str = ", ".join(missing_mandatory) if missing_mandatory else "experience gap"
            explanation = f"Candidate is disqualified by strict eligibility gate due to missing: {missing_str}."

        return {
            "match_score": final_score,
            "eligibility": eligibility,
            "matched_mandatory_skills": matched_mandatory,
            "missing_mandatory_skills": missing_mandatory,
            "matched_preferred_skills": matched_preferred,
            "missing_preferred_skills": missing_preferred,
            "relevant_projects": relevant_projects,
            "score_breakdown": {
                "mandatory": round(mandatory_score, 1),
                "preferred": round(preferred_score, 1),
                "projects": round(project_score, 1),
                "experience": round(exp_score, 1),
                "availability": round(avail_score, 1)
            },
            "explanation": explanation,
            "algorithm_version": "1.0-hybrid"
        }
