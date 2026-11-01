from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.talent import Team, TeamMember, TalentProfile
from app.models.skill import ProfileSkill, Skill
from app.models.job import Job, JobSkill

# Standard 12 Skill Categories
STANDARD_CATEGORIES = [
    "Programming Languages",
    "Frontend Development",
    "Backend Development",
    "Mobile Development",
    "AI / Machine Learning",
    "Data Science",
    "Databases",
    "Cloud & DevOps",
    "Cybersecurity",
    "Embedded Systems & IoT",
    "UI/UX Design",
    "Tools & Frameworks"
]

CATEGORY_MAPPING = {
    # Programming Languages
    "python": "Programming Languages",
    "javascript": "Programming Languages",
    "typescript": "Programming Languages",
    "c++": "Programming Languages",
    "c": "Programming Languages",
    "rust": "Programming Languages",
    "go": "Programming Languages",
    "golang": "Programming Languages",
    "java": "Programming Languages",
    "kotlin": "Programming Languages",
    "swift": "Programming Languages",
    "ruby": "Programming Languages",
    "php": "Programming Languages",
    "sql": "Programming Languages",

    # Frontend Development
    "react": "Frontend Development",
    "next.js": "Frontend Development",
    "vue": "Frontend Development",
    "angular": "Frontend Development",
    "svelte": "Frontend Development",
    "tailwind css": "Frontend Development",
    "html5": "Frontend Development",
    "css3": "Frontend Development",
    "redux": "Frontend Development",

    # Backend Development
    "fastapi": "Backend Development",
    "node.js": "Backend Development",
    "express": "Backend Development",
    "django": "Backend Development",
    "flask": "Backend Development",
    "rest api": "Backend Development",
    "spring boot": "Backend Development",
    "asp.net": "Backend Development",
    "graphql": "Backend Development",
    "grpc": "Backend Development",

    # Mobile Development
    "react native": "Mobile Development",
    "flutter": "Mobile Development",
    "ios": "Mobile Development",
    "android": "Mobile Development",

    # AI / Machine Learning
    "pytorch": "AI / Machine Learning",
    "tensorflow": "AI / Machine Learning",
    "machine learning": "AI / Machine Learning",
    "deep learning": "AI / Machine Learning",
    "huggingface": "AI / Machine Learning",
    "scikit-learn": "AI / Machine Learning",
    "langchain": "AI / Machine Learning",
    "nlp": "AI / Machine Learning",
    "computer vision": "AI / Machine Learning",

    # Data Science
    "pandas": "Data Science",
    "numpy": "Data Science",
    "apache spark": "Data Science",
    "data analysis": "Data Science",
    "powerbi": "Data Science",
    "tableau": "Data Science",

    # Databases
    "postgresql": "Databases",
    "mysql": "Databases",
    "mongodb": "Databases",
    "redis": "Databases",
    "sqlite": "Databases",
    "cassandra": "Databases",
    "neo4j": "Databases",
    "elasticsearch": "Databases",

    # Cloud & DevOps
    "docker": "Cloud & DevOps",
    "kubernetes": "Cloud & DevOps",
    "aws": "Cloud & DevOps",
    "gcp": "Cloud & DevOps",
    "azure": "Cloud & DevOps",
    "linux": "Cloud & DevOps",
    "ci/cd": "Cloud & DevOps",
    "terraform": "Cloud & DevOps",
    "nginx": "Cloud & DevOps",

    # Cybersecurity
    "penetration testing": "Cybersecurity",
    "owasp": "Cybersecurity",
    "cryptography": "Cybersecurity",
    "network security": "Cybersecurity",
    "oauth2": "Cybersecurity",
    "iam": "Cybersecurity",

    # Embedded Systems & IoT
    "embedded c": "Embedded Systems & IoT",
    "arduino": "Embedded Systems & IoT",
    "esp32": "Embedded Systems & IoT",
    "freertos": "Embedded Systems & IoT",
    "raspberry pi": "Embedded Systems & IoT",
    "arm": "Embedded Systems & IoT",
    "microcontrollers": "Embedded Systems & IoT",

    # UI/UX Design
    "figma": "UI/UX Design",
    "adobe xd": "UI/UX Design",
    "wireframing": "UI/UX Design",
    "prototyping": "UI/UX Design",
    "design systems": "UI/UX Design",
    "ui design": "UI/UX Design",
    "ux research": "UI/UX Design",

    # Tools & Frameworks
    "git": "Tools & Frameworks",
    "github": "Tools & Frameworks",
    "gitlab": "Tools & Frameworks",
    "jira": "Tools & Frameworks",
    "postman": "Tools & Frameworks",
    "webpack": "Tools & Frameworks",
    "vite": "Tools & Frameworks",
    "celery": "Tools & Frameworks",
    "rabbitmq": "Tools & Frameworks"
}

PROFICIENCY_WEIGHTS = {
    "Expert": 4,
    "Advanced": 3,
    "Intermediate": 2,
    "Beginner": 1
}

def resolve_skill_category(skill_name: str, fallback_category: str = "Tools & Frameworks") -> str:
    cleaned = skill_name.strip().lower()
    return CATEGORY_MAPPING.get(cleaned, fallback_category)

class TeamService:

    @staticmethod
    def aggregate_team_skills(team: Team, db: Session) -> Dict[str, Any]:
        """
        Computes the complete combined team skill inventory, frequency counts,
        shared vs unique classification, 12-category grouping, and scorecard.
        """
        members = team.members
        skill_dict: Dict[str, Dict[str, Any]] = {}

        for m in members:
            profile = m.talent_profile
            member_name = profile.name
            user_id = profile.user_id
            member_role = m.role or "Member"
            member_title = m.title or profile.headline or "Engineer"

            for ps in profile.profile_skills:
                skill_name = ps.skill.canonical_name
                category = resolve_skill_category(skill_name, ps.skill.category or "Tools & Frameworks")
                prof = ps.proficiency or "Intermediate"
                exp = float(ps.experience_years or 1.0)

                if skill_name not in skill_dict:
                    skill_dict[skill_name] = {
                        "skill": skill_name,
                        "category": category,
                        "count": 0,
                        "members": [],
                        "max_proficiency": prof,
                        "max_proficiency_weight": PROFICIENCY_WEIGHTS.get(prof, 2),
                        "total_experience_years": 0.0,
                        "proficiency_breakdown": {
                            "Expert": 0,
                            "Advanced": 0,
                            "Intermediate": 0,
                            "Beginner": 0
                        }
                    }

                entry = skill_dict[skill_name]
                entry["count"] += 1
                entry["members"].append({
                    "name": member_name,
                    "user_id": user_id,
                    "role": member_role,
                    "title": member_title,
                    "proficiency": prof,
                    "experience_years": exp
                })
                entry["total_experience_years"] += exp
                if prof in entry["proficiency_breakdown"]:
                    entry["proficiency_breakdown"][prof] += 1

                # Update max proficiency
                weight = PROFICIENCY_WEIGHTS.get(prof, 2)
                if weight > entry["max_proficiency_weight"]:
                    entry["max_proficiency"] = prof
                    entry["max_proficiency_weight"] = weight

        # Sort skills by count descending, then name
        all_skills = sorted(
            list(skill_dict.values()),
            key=lambda x: (x["count"], x["max_proficiency_weight"], x["skill"]),
            reverse=True
        )

        # Clean helper fields from response items
        cleaned_skills = []
        for s in all_skills:
            item = dict(s)
            item.pop("max_proficiency_weight", None)
            cleaned_skills.append(item)

        shared_skills = [s for s in cleaned_skills if s["count"] >= 2]
        unique_skills = [s for s in cleaned_skills if s["count"] == 1]

        # Group by the 12 standard categories
        cat_map: Dict[str, List[Dict[str, Any]]] = {c: [] for c in STANDARD_CATEGORIES}
        for s in cleaned_skills:
            cat = s["category"]
            if cat not in cat_map:
                cat_map[cat] = []
            cat_map[cat].append(s)

        categories_summary = [
            {
                "category": cat_name,
                "count": len(skills_list),
                "total_coverage": sum(sk["count"] for sk in skills_list),
                "skills": [sk["skill"] for sk in skills_list]
            }
            for cat_name, skills_list in cat_map.items()
            if len(skills_list) > 0
        ]
        # Sort categories by count descending
        categories_summary.sort(key=lambda x: x["count"], reverse=True)

        # Team Scorecard metrics
        total_unique_skills = len(cleaned_skills)
        redundancy_ratio = round((len(shared_skills) / max(1, total_unique_skills)) * 100, 1)
        
        dominant_domain = categories_summary[0]["category"] if categories_summary else "Full-Stack Web"
        
        # Skill depth score (0 - 100)
        total_points = sum(
            sum(PROFICIENCY_WEIGHTS.get(m["proficiency"], 2) for m in s["members"])
            for s in cleaned_skills
        )
        max_possible_points = max(1, total_unique_skills * 4)
        depth_score = min(100.0, round((total_points / max_possible_points) * 100, 1))

        scorecard = {
            "total_members": len(members),
            "total_unique_skills": total_unique_skills,
            "shared_skills_count": len(shared_skills),
            "unique_skills_count": len(unique_skills),
            "redundancy_ratio": redundancy_ratio,
            "dominant_domain": dominant_domain,
            "skill_depth_score": depth_score,
            "critical_single_points": len(unique_skills)
        }

        return {
            "team_id": team.id,
            "team_name": team.name,
            "total_members": len(members),
            "total_unique_skills": total_unique_skills,
            "skills_inventory": cleaned_skills,
            "shared_skills": shared_skills,
            "unique_skills": unique_skills,
            "categories": categories_summary,
            "scorecard": scorecard
        }

    @staticmethod
    def build_skill_matrix(team: Team, db: Session) -> Dict[str, Any]:
        """
        Builds a member-wise skill matrix grid:
        Rows = team members
        Columns = all unique skills across the team
        """
        agg = TeamService.aggregate_team_skills(team, db)
        unique_skill_names = [s["skill"] for s in agg["skills_inventory"]]

        matrix_rows = []
        member_summaries = []

        for m in team.members:
            profile = m.talent_profile
            member_dict = {
                "member_id": m.id,
                "user_id": profile.user_id,
                "name": profile.name,
                "role": m.role or "Member",
                "title": m.title or profile.headline or "Engineer",
                "experience_years": profile.experience_years or 0.0,
                "skills_count": len(profile.profile_skills)
            }
            member_summaries.append(member_dict)

            # Map skills for this member
            user_skills = {}
            for ps in profile.profile_skills:
                s_name = ps.skill.canonical_name
                user_skills[s_name] = {
                    "proficiency": ps.proficiency or "Intermediate",
                    "experience_years": ps.experience_years or 1.0,
                    "is_verified": ps.is_verified,
                    "source": ps.source
                }

            row = {
                "member": member_dict,
                "skills": {
                    s: user_skills.get(s, None)
                    for s in unique_skill_names
                }
            }
            matrix_rows.append(row)

        return {
            "team_id": team.id,
            "team_name": team.name,
            "members": member_summaries,
            "skills": unique_skill_names,
            "categories": agg["categories"],
            "matrix": matrix_rows,
            "scorecard": agg["scorecard"]
        }

    @staticmethod
    def calculate_team_job_match(team: Team, job: Job, db: Session) -> Dict[str, Any]:
        """
        Matches a team against a job, calculating coverage for mandatory and preferred
        skills with explicit member attribution (e.g. Python -> Member A, React -> Member B).
        """
        # Gather all skills provided by each member
        member_skills_lookup: Dict[str, List[Dict[str, str]]] = {}
        member_coverage_map: Dict[str, List[str]] = {m.talent_profile.name: [] for m in team.members}

        for m in team.members:
            p = m.talent_profile
            m_name = p.name
            m_role = m.role or "Member"

            for ps in p.profile_skills:
                canonical = ps.skill.canonical_name.lower().strip()
                if canonical not in member_skills_lookup:
                    member_skills_lookup[canonical] = []

                member_skills_lookup[canonical].append({
                    "member_name": m_name,
                    "role": m_role,
                    "proficiency": ps.proficiency or "Intermediate",
                    "years": str(ps.experience_years or 1.0)
                })

        # Process mandatory and preferred job skills
        mandatory_skills = [js.skill.canonical_name for js in job.skills if js.is_mandatory]
        preferred_skills = [js.skill.canonical_name for js in job.skills if not js.is_mandatory]

        # In case job has no skills explicitly marked
        if not mandatory_skills and not preferred_skills:
            mandatory_skills = ["Software Engineering"]

        matched_mandatory = []
        missing_mandatory = []
        for s in mandatory_skills:
            s_lower = s.lower().strip()
            providers = member_skills_lookup.get(s_lower, [])
            is_covered = len(providers) > 0
            if is_covered:
                matched_mandatory.append({
                    "skill": s,
                    "is_mandatory": True,
                    "is_covered": True,
                    "provided_by": providers
                })
                for pr in providers:
                    if s not in member_coverage_map[pr["member_name"]]:
                        member_coverage_map[pr["member_name"]].append(s)
            else:
                missing_mandatory.append(s)

        matched_preferred = []
        missing_preferred = []
        for s in preferred_skills:
            s_lower = s.lower().strip()
            providers = member_skills_lookup.get(s_lower, [])
            is_covered = len(providers) > 0
            if is_covered:
                matched_preferred.append({
                    "skill": s,
                    "is_mandatory": False,
                    "is_covered": True,
                    "provided_by": providers
                })
                for pr in providers:
                    if s not in member_coverage_map[pr["member_name"]]:
                        member_coverage_map[pr["member_name"]].append(s)
            else:
                missing_preferred.append(s)

        # Calculate coverage percentages
        tot_m = max(1, len(mandatory_skills))
        tot_p = max(1, len(preferred_skills)) if preferred_skills else 1

        mand_cov_pct = round((len(matched_mandatory) / tot_m) * 100, 1)
        pref_cov_pct = round((len(matched_preferred) / tot_p) * 100, 1) if preferred_skills else 100.0

        # Team composite match score:
        # Mandatory Skills: 60%
        # Preferred Skills: 25%
        # Team Experience/Availability bonus: 15%
        team_score = round(0.60 * mand_cov_pct + 0.25 * pref_cov_pct + 0.15 * 100, 1)
        team_score = min(100.0, team_score)

        eligibility = "eligible" if mand_cov_pct >= 100.0 else "ineligible"

        # Member contribution breakdown
        member_contributions = []
        for m in team.members:
            name = m.talent_profile.name
            covered = member_coverage_map.get(name, [])
            member_contributions.append({
                "member_name": name,
                "role": m.role or "Member",
                "title": m.title or m.talent_profile.headline or "Engineer",
                "skills_covered": covered,
                "coverage_count": len(covered)
            })

        # Narrative explanation
        covered_summary = []
        for item in matched_mandatory:
            prov_str = ", ".join(f"{p['member_name']} ({p['proficiency']})" for p in item["provided_by"])
            covered_summary.append(f"{item['skill']} -> {prov_str}")

        if eligibility == "eligible":
            explanation = (
                f"Team '{team.name}' collectively covers 100% of all mandatory technical skills for '{job.title}'. "
                f"Individual skill attribution: {'; '.join(covered_summary)}."
            )
            if missing_preferred:
                explanation += f" Preferred skills missing: {', '.join(missing_preferred)}."
        else:
            explanation = (
                f"Team '{team.name}' achieves {mand_cov_pct}% mandatory skill coverage. "
                f"Missing critical mandatory skills: {', '.join(missing_mandatory)}. "
                f"Provided skills: {'; '.join(covered_summary) if covered_summary else 'None'}."
            )

        company_name = job.company.name if job.company else "Hiring Company"

        return {
            "team_id": team.id,
            "team_name": team.name,
            "job_id": job.id,
            "job_title": job.title,
            "company_name": company_name,
            "team_match_score": team_score,
            "eligibility": eligibility,
            "mandatory_coverage_pct": mand_cov_pct,
            "preferred_coverage_pct": pref_cov_pct,
            "mandatory_skills_status": matched_mandatory + [
                {"skill": s, "is_mandatory": True, "is_covered": False, "provided_by": []}
                for s in missing_mandatory
            ],
            "preferred_skills_status": matched_preferred + [
                {"skill": s, "is_mandatory": False, "is_covered": False, "provided_by": []}
                for s in missing_preferred
            ],
            "missing_mandatory_skills": missing_mandatory,
            "missing_preferred_skills": missing_preferred,
            "member_contributions": member_contributions,
            "explanation": explanation
        }
