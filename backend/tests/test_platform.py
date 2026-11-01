import pytest
from app.core.database import SessionLocal
from app.core.security import verify_password, hash_password
from app.models.user import User
from app.models.job import Job
from app.models.match import JobMatch
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.matching.engine import HybridMatchingEngine
from app.ai.providers.heuristic_provider import HeuristicProvider

def test_password_hashing():
    pwd = "SecureTestPassword123!"
    h = hash_password(pwd)
    assert verify_password(pwd, h) is True
    assert verify_password("WrongPassword", h) is False

def test_skill_normalization():
    res1 = SkillNormalizerService.normalize_skill("fast api")
    assert res1.canonical_name == "FastAPI"
    assert res1.category == "Backend"

    res2 = SkillNormalizerService.normalize_skill("reactjs")
    assert res2.canonical_name == "React"

    res3 = SkillNormalizerService.normalize_skill("ts")
    assert res3.canonical_name == "TypeScript"

    assert SkillNormalizerService.are_related("React", "Next.js") is True
    assert SkillNormalizerService.are_related("Python", "FastAPI") is True

def test_hybrid_matching_engine():
    engine = HybridMatchingEngine()
    
    job = {
        "mandatory_skills": ["Python", "FastAPI", "PostgreSQL"],
        "preferred_skills": ["Docker"],
        "experience_min": 2.0,
        "experience_max": 5.0,
        "work_mode": "Remote"
    }

    # Highly qualified candidate
    talent_good = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
        "projects": [{"title": "API Core", "technologies": ["Python", "FastAPI", "PostgreSQL"]}],
        "experience_years": 3.5,
        "remote_preference": "Remote"
    }
    res_good = engine.calculate_match(job, talent_good, strict_eligibility=True)
    assert res_good["eligibility"] == "eligible"
    assert res_good["match_score"] >= 80

    # Ineligible candidate (missing mandatory skill)
    talent_ineligible = {
        "skills": ["React", "CSS", "HTML"],
        "projects": [],
        "experience_years": 1.0,
        "remote_preference": "Remote"
    }
    res_bad = engine.calculate_match(job, talent_ineligible, strict_eligibility=True)
    assert res_bad["eligibility"] == "ineligible"
    assert len(res_bad["missing_mandatory_skills"]) > 0

@pytest.mark.asyncio
async def test_heuristic_job_extraction():
    provider = HeuristicProvider()
    doc_text = """
    Position: Senior Python Engineer
    Apex Systems is hiring for a Python Engineer.
    Requirements:
    - Mandatory: Python, FastAPI, PostgreSQL, REST API
    - Nice to have: Docker, Redis
    Experience: 3-5 years required.
    Remote opportunity. Full-time.
    """
    result = await provider.extract_job_requirements(doc_text)
    assert "Python" in result.mandatory_skills
    assert result.employment_type == "Full-time"
    assert result.work_mode == "Remote"
    assert result.review_required is True

def test_seeded_database_records():
    db = SessionLocal()
    try:
        recruiter = db.query(User).filter(User.email == "recruiter@nexora.ai").first()
        assert recruiter is not None
        assert recruiter.role == "recruiter"

        talent = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
        assert talent is not None
        assert talent.role == "talent"

        jobs = db.query(Job).all()
        assert len(jobs) >= 2

        matches = db.query(JobMatch).all()
        assert len(matches) >= 2
    finally:
        db.close()

if __name__ == "__main__":
    print("Running backend tests...")
    test_password_hashing()
    test_skill_normalization()
    test_hybrid_matching_engine()
    test_seeded_database_records()
    print("All backend deterministic tests passed successfully!")
