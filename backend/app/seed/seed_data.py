from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.talent import TalentProfile, Team, TeamMember
from app.models.skill import Skill, ProfileSkill
from app.models.project import Project, ProjectTechnology
from app.models.job import Job, JobSkill
from app.models.match import JobMatch
from app.models.application import Application, Invitation
from app.models.notification import Notification, NotificationPreference
from app.models.ai_log import AIUsageLog, AuditLog
from app.ai.services.skill_normalizer import SkillNormalizerService
from app.matching.engine import HybridMatchingEngine

def run_seed(db: Session):
    # Check if seed already run
    if db.query(User).filter(User.email == "recruiter@nexora.ai").first():
        print("[SEED] Seed data already exists. Skipping.")
        return

    print("[SEED] Seeding initial NEXORA master data...")

    # 1. ADMIN USER
    admin_user = User(
        email="admin@nexora.ai",
        hashed_password=hash_password("AdminSecret123!"),
        role="admin",
        is_active=True,
        is_verified=True
    )
    db.add(admin_user)

    # 2. RECRUITER USER
    recruiter_user = User(
        email="recruiter@nexora.ai",
        hashed_password=hash_password("Password123!"),
        role="recruiter",
        is_active=True,
        is_verified=True
    )
    db.add(recruiter_user)
    db.flush()

    recruiter_profile = RecruiterProfile(
        user_id=recruiter_user.id,
        full_name="Sarah Jenkins",
        designation="VP of Technical Talent",
        phone="+1 (555) 492-8812"
    )
    db.add(recruiter_profile)
    db.flush()

    company = Company(
        recruiter_profile_id=recruiter_profile.id,
        name="Apex Cloud Systems",
        website="https://apexcloud.example.io",
        size="51-200",
        industry="Cloud Infrastructure & AI",
        location="San Francisco, CA (Hybrid / Remote)",
        description="Apex Cloud Systems builds high-performance distributed cloud infrastructure and automated AI data pipelines for enterprise engineering teams.",
        social_links={"linkedin": "apexcloud", "github": "apexcloud-sys"}
    )
    db.add(company)
    db.add(NotificationPreference(user_id=recruiter_user.id))

    # 3. TALENT 1: Alex Chen (Senior Backend / AI)
    alex_user = User(
        email="alex.chen@nexora.ai",
        hashed_password=hash_password("Password123!"),
        role="talent",
        talent_type="developer",
        is_active=True,
        is_verified=True
    )
    db.add(alex_user)
    db.flush()

    alex_profile = TalentProfile(
        user_id=alex_user.id,
        name="Alex Chen",
        headline="Senior Python & Distributed Systems Engineer",
        bio="Engineering lead specializing in asynchronous FastAPI microservices, PostgreSQL scalability, Docker containerization, and distributed task queues.",
        specialization="Backend Engineering",
        location="Seattle, WA",
        education="B.S. in Computer Science, University of Washington",
        experience_years=4.5,
        availability="Immediately",
        preferred_employment_type="Full-time",
        remote_preference="Remote",
        compensation_expectation="$135,000 - $160,000",
        contact_preferences={"github": "alexchen-dev", "linkedin": "alexchen-eng"}
    )
    db.add(alex_profile)
    db.add(NotificationPreference(user_id=alex_user.id))

    # 4. TALENT 2: Sophia Martinez (Full-Stack Engineer)
    sophia_user = User(
        email="sophia.martinez@nexora.ai",
        hashed_password=hash_password("Password123!"),
        role="talent",
        talent_type="developer",
        is_active=True,
        is_verified=True
    )
    db.add(sophia_user)
    db.flush()

    sophia_profile = TalentProfile(
        user_id=sophia_user.id,
        name="Sophia Martinez",
        headline="Full-Stack TypeScript & React Architect",
        bio="Passionate frontend and full-stack software engineer crafting responsive, accessible, high-performance web applications using React, Next.js, and Node.js.",
        specialization="Full-Stack Development",
        location="Austin, TX",
        education="B.S. in Software Engineering, UT Austin",
        experience_years=3.2,
        availability="2 weeks",
        preferred_employment_type="Full-time",
        remote_preference="Remote",
        compensation_expectation="$115,000 - $135,000",
        contact_preferences={"github": "sophiam-code", "website": "https://sophiamartinez.dev"}
    )
    db.add(sophia_profile)
    db.add(NotificationPreference(user_id=sophia_user.id))

    # 5. TALENT 3: Rohit Sharma (CS Student / Intern)
    rohit_user = User(
        email="rohit.sharma@nexora.ai",
        hashed_password=hash_password("Password123!"),
        role="talent",
        talent_type="student",
        is_active=True,
        is_verified=True
    )
    db.add(rohit_user)
    db.flush()

    rohit_profile = TalentProfile(
        user_id=rohit_user.id,
        name="Rohit Sharma",
        headline="Computer Science Honors Student & Embedded Systems Enthusiast",
        bio="Undergraduate CS student passionate about systems programming in C++ and Python automation. Looking for summer software engineering internships.",
        specialization="Systems & Automation",
        location="Boston, MA",
        education="B.S. Computer Science (Junior Year), Northeastern University",
        experience_years=0.5,
        availability="Immediately",
        preferred_employment_type="Internship",
        remote_preference="Hybrid",
        compensation_expectation="$35 - $45 / hour",
        contact_preferences={"github": "rohit-sharma-cs"}
    )
    db.add(rohit_profile)
    db.add(NotificationPreference(user_id=rohit_user.id))

    # 6. TALENT 4: Development Team Lead (Marcus Vance / NovaTech)
    marcus_user = User(
        email="marcus.vance@nexora.ai",
        hashed_password=hash_password("Password123!"),
        role="talent",
        talent_type="team",
        is_active=True,
        is_verified=True
    )
    db.add(marcus_user)
    db.flush()

    marcus_profile = TalentProfile(
        user_id=marcus_user.id,
        name="Marcus Vance",
        headline="Principal Lead at NovaTech Engineering Collective",
        bio="Full-lifecycle engineering team of 4 senior engineers specialized in delivering complex end-to-end cloud platforms, AI integrations, and mobile applications.",
        specialization="Full-Stack Team Collective",
        location="Remote Worldwide",
        experience_years=6.0,
        availability="Available for projects",
        preferred_employment_type="Contract",
        remote_preference="Remote",
        compensation_expectation="$90 - $120 / hour per engineer"
    )
    db.add(marcus_profile)
    db.add(NotificationPreference(user_id=marcus_user.id))

    team = Team(
        lead_user_id=marcus_user.id,
        name="NovaTech Engineering Collective",
        slug="novatech-collective",
        description="A cohesive team of 4 senior engineers providing turn-key architecture, backend systems, and modern web applications.",
        website="https://novatech.example.dev",
        github_url="https://github.com/novatech-collective",
        availability="Available for 3-6 month projects"
    )
    db.add(team)
    db.flush()

    db.add(TeamMember(
        team_id=team.id,
        talent_profile_id=marcus_profile.id,
        role="Lead",
        title="Solutions Architect & Lead"
    ))

    db.flush()

    # 7. POPULATE SKILLS
    skills_map = {}
    seed_skills = [
        ("Python", "Backend"), ("FastAPI", "Backend"), ("REST API", "Backend"),
        ("PostgreSQL", "Database"), ("Redis", "Database"), ("Docker", "Tools"),
        ("Git", "Tools"), ("Linux", "Tools"), ("TypeScript", "Frontend"),
        ("React", "Frontend"), ("Next.js", "Frontend"), ("Tailwind CSS", "Frontend"),
        ("Node.js", "Backend"), ("PyTorch", "AI"), ("Machine Learning", "AI"),
        ("C++", "Embedded"), ("Embedded C", "Embedded")
    ]
    for s_name, cat in seed_skills:
        skill = Skill(name=s_name, canonical_name=s_name, category=cat, is_verified=True)
        db.add(skill)
        db.flush()
        skills_map[s_name] = skill

    # Assign skills to Alex Chen
    for s_name, prof, exp in [
        ("Python", "Expert", 4.5), ("FastAPI", "Expert", 4.0), ("REST API", "Expert", 4.5),
        ("PostgreSQL", "Advanced", 4.0), ("Docker", "Advanced", 3.5), ("Redis", "Intermediate", 2.5),
        ("Git", "Advanced", 4.5), ("Linux", "Advanced", 4.0)
    ]:
        db.add(ProfileSkill(
            profile_id=alex_profile.id,
            skill_id=skills_map[s_name].id,
            proficiency=prof,
            experience_years=exp,
            source="project_demonstrated"
        ))

    # Assign skills to Sophia Martinez
    for s_name, prof, exp in [
        ("React", "Expert", 3.2), ("Next.js", "Expert", 3.0), ("TypeScript", "Advanced", 3.2),
        ("Tailwind CSS", "Expert", 3.0), ("Node.js", "Intermediate", 2.0), ("Git", "Advanced", 3.0)
    ]:
        db.add(ProfileSkill(
            profile_id=sophia_profile.id,
            skill_id=skills_map[s_name].id,
            proficiency=prof,
            experience_years=exp,
            source="project_demonstrated"
        ))

    # Assign skills to Rohit Sharma
    for s_name, prof, exp in [
        ("Python", "Intermediate", 1.5), ("C++", "Intermediate", 1.2),
        ("Git", "Intermediate", 1.0), ("Linux", "Beginner", 0.8)
    ]:
        db.add(ProfileSkill(
            profile_id=rohit_profile.id,
            skill_id=skills_map[s_name].id,
            proficiency=prof,
            experience_years=exp,
            source="self_declared"
        ))

    # Assign skills to Marcus / Team
    for s_name, prof, exp in [
        ("Python", "Expert", 6.0), ("FastAPI", "Expert", 5.0), ("React", "Expert", 5.0),
        ("Next.js", "Expert", 4.0), ("Docker", "Expert", 5.0), ("PostgreSQL", "Expert", 6.0)
    ]:
        db.add(ProfileSkill(
            profile_id=marcus_profile.id,
            skill_id=skills_map[s_name].id,
            proficiency=prof,
            experience_years=exp,
            source="project_demonstrated"
        ))

    # 8. PROJECTS
    # Alex's Projects
    p1 = Project(
        profile_id=alex_profile.id,
        title="NEXUS High-Throughput Ingestion Engine",
        description="Asynchronous distributed pipeline handling 25,000 events/sec built with FastAPI, Redis, and PostgreSQL.",
        problem_statement="Needed sub-50ms ingestion latency across distributed edge nodes.",
        features="Automated batching, dead-letter retries, PostgreSQL partitioning.",
        developer_contribution="Architected the async consumer pipeline and database connection pool tuning.",
        github_url="https://github.com/alexchen-dev/nexus-engine",
        status="Completed"
    )
    db.add(p1)
    db.flush()
    for s in ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]:
        db.add(ProjectTechnology(project_id=p1.id, skill_id=skills_map[s].id, usage_level="demonstrated"))

    p2 = Project(
        profile_id=alex_profile.id,
        title="Vector Semantic Retrieval Core",
        description="Semantic embedding search microservice integrating HuggingFace and pgvector.",
        problem_statement="Providing real-time nearest-neighbor document searches with high recall.",
        features="HNSW index tuning, streaming response endpoints.",
        developer_contribution="Designed REST endpoints and vector indexing strategy.",
        github_url="https://github.com/alexchen-dev/vector-core",
        status="Completed"
    )
    db.add(p2)
    db.flush()
    for s in ["Python", "FastAPI", "REST API", "Docker"]:
        db.add(ProjectTechnology(project_id=p2.id, skill_id=skills_map[s].id, usage_level="demonstrated"))

    # Sophia's Projects
    p3 = Project(
        profile_id=sophia_profile.id,
        title="CloudScale SaaS Design System & Canvas",
        description="Accessible UI library with 45+ components built with React 19, TypeScript, and Tailwind CSS.",
        problem_statement="Unifying design tokens and animations across a multi-tenant enterprise portal.",
        features="Dark/light tokens, zero CLS layouts, Framer Motion animations.",
        developer_contribution="Built core component library and test coverage.",
        github_url="https://github.com/sophiam-code/cloudscale-ui",
        demo_url="https://cloudscale-ui.demo.io",
        status="Completed"
    )
    db.add(p3)
    db.flush()
    for s in ["React", "Next.js", "TypeScript", "Tailwind CSS"]:
        db.add(ProjectTechnology(project_id=p3.id, skill_id=skills_map[s].id, usage_level="demonstrated"))

    # 9. JOBS PUBLISHED BY RECRUITER
    now = datetime.now(timezone.utc)
    job1 = Job(
        recruiter_id=recruiter_profile.id,
        company_id=company.id,
        title="Senior Python Backend Engineer (Distributed Systems)",
        category="Software Engineering",
        description="Apex Cloud Systems is seeking a Senior Python Backend Engineer to architect, build, and optimize high-throughput distributed microservices. You will work on low-latency data pipelines, asynchronous FastAPI services, and scalable database architectures.",
        employment_type="Full-time",
        work_mode="Remote",
        location="United States (Remote)",
        compensation_range="$130,000 - $160,000",
        experience_min=3.0,
        experience_max=6.0,
        openings=2,
        deadline=now + timedelta(days=30),
        responsibilities="1. Design and maintain asynchronous FastAPI microservices.\n2. Optimize PostgreSQL queries, indexes, and caching with Redis.\n3. Implement containerized deployments via Docker.",
        additional_requirements="Demonstrated experience with production asynchronous Python architectures.",
        strict_eligibility=True,
        status="published",
        published_at=now - timedelta(days=2)
    )
    db.add(job1)
    db.flush()

    for s in ["Python", "FastAPI", "PostgreSQL", "REST API"]:
        db.add(JobSkill(job_id=job1.id, skill_id=skills_map[s].id, is_mandatory=True))
    for s in ["Docker", "Redis"]:
        db.add(JobSkill(job_id=job1.id, skill_id=skills_map[s].id, is_mandatory=False))

    job2 = Job(
        recruiter_id=recruiter_profile.id,
        company_id=company.id,
        title="Lead Frontend Architect (Next.js & React)",
        category="Software Engineering",
        description="Looking for an exceptional Lead Frontend Engineer to drive the next-generation developer interface of Apex Cloud. You will own client-side architecture, performance optimization, and interactive visualization components.",
        employment_type="Full-time",
        work_mode="Remote",
        location="Remote",
        compensation_range="$140,000 - $170,000",
        experience_min=3.0,
        experience_max=7.0,
        openings=1,
        deadline=now + timedelta(days=45),
        responsibilities="Lead frontend architecture in Next.js, maintain design systems, optimize Core Web Vitals.",
        strict_eligibility=True,
        status="published",
        published_at=now - timedelta(days=1)
    )
    db.add(job2)
    db.flush()

    for s in ["React", "Next.js", "TypeScript", "Tailwind CSS"]:
        db.add(JobSkill(job_id=job2.id, skill_id=skills_map[s].id, is_mandatory=True))
    for s in ["Node.js", "Git"]:
        db.add(JobSkill(job_id=job2.id, skill_id=skills_map[s].id, is_mandatory=False))

    db.commit()

    # 10. RUN DETERMINISTIC MATCHING & GENERATE REAL MATCHES
    matcher = HybridMatchingEngine()

    # Match Job 1 with Alex Chen
    alex_match_res = matcher.calculate_match(
        job_data={
            "mandatory_skills": ["Python", "FastAPI", "PostgreSQL", "REST API"],
            "preferred_skills": ["Docker", "Redis"],
            "experience_min": 3.0,
            "experience_max": 6.0,
            "work_mode": "Remote"
        },
        talent_data={
            "skills": ["Python", "FastAPI", "PostgreSQL", "REST API", "Docker", "Redis", "Git", "Linux"],
            "projects": [{"title": p1.title, "technologies": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]}],
            "experience_years": 4.5,
            "remote_preference": "Remote"
        },
        strict_eligibility=True
    )

    db.add(JobMatch(
        job_id=job1.id,
        talent_profile_id=alex_profile.id,
        match_score=alex_match_res["match_score"],
        eligibility=alex_match_res["eligibility"],
        matched_mandatory_skills=alex_match_res["matched_mandatory_skills"],
        matched_preferred_skills=alex_match_res["matched_preferred_skills"],
        missing_mandatory_skills=alex_match_res["missing_mandatory_skills"],
        missing_preferred_skills=alex_match_res["missing_preferred_skills"],
        relevant_projects=alex_match_res["relevant_projects"],
        score_breakdown=alex_match_res["score_breakdown"],
        explanation="Candidate demonstrates flawless mastery of all 4 mandatory backend technologies (Python, FastAPI, PostgreSQL, REST API) plus both preferred tools (Docker, Redis). Portfolio project 'NEXUS High-Throughput Ingestion Engine' provides concrete evidence of high-load asynchronous architecture."
    ))

    # Match Job 2 with Sophia Martinez
    sophia_match_res = matcher.calculate_match(
        job_data={
            "mandatory_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
            "preferred_skills": ["Node.js", "Git"],
            "experience_min": 3.0,
            "experience_max": 7.0,
            "work_mode": "Remote"
        },
        talent_data={
            "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Git"],
            "projects": [{"title": p3.title, "technologies": ["React", "Next.js", "TypeScript", "Tailwind CSS"]}],
            "experience_years": 3.2,
            "remote_preference": "Remote"
        },
        strict_eligibility=True
    )

    db.add(JobMatch(
        job_id=job2.id,
        talent_profile_id=sophia_profile.id,
        match_score=sophia_match_res["match_score"],
        eligibility=sophia_match_res["eligibility"],
        matched_mandatory_skills=sophia_match_res["matched_mandatory_skills"],
        matched_preferred_skills=sophia_match_res["matched_preferred_skills"],
        missing_mandatory_skills=sophia_match_res["missing_mandatory_skills"],
        missing_preferred_skills=sophia_match_res["missing_preferred_skills"],
        relevant_projects=sophia_match_res["relevant_projects"],
        score_breakdown=sophia_match_res["score_breakdown"],
        explanation="Sophia Martinez achieves 96% compatibility. Matches all mandatory frontend requirements (React, Next.js, TypeScript, Tailwind CSS) with proven production design system project evidence."
    ))

    # Add realistic application for Alex -> Job 1
    app1 = Application(
        job_id=job1.id,
        talent_profile_id=alex_profile.id,
        status="shortlisted",
        cover_note="I built similar asynchronous ingestion architectures at scale and would love to contribute to Apex Cloud's distributed systems.",
        recruiter_notes="Strong architectural alignment; highly relevant portfolio code."
    )
    db.add(app1)

    # Add targeted notifications for Alex and Sophia
    db.add(Notification(
        user_id=alex_user.id,
        type="job_match",
        title="New High-Match Role: Senior Python Backend Engineer",
        message="Apex Cloud Systems posted a Senior Python Backend Engineer role. Your profile scored 98% compatibility.",
        link="/talent/opportunities",
        is_read=False,
        meta_data={"job_id": job1.id, "match_score": 98.0}
    ))

    db.add(Notification(
        user_id=sophia_user.id,
        type="job_match",
        title="New High-Match Role: Lead Frontend Architect",
        message="Apex Cloud Systems posted a Lead Frontend Architect role. Your profile scored 96% compatibility.",
        link="/talent/opportunities",
        is_read=False,
        meta_data={"job_id": job2.id, "match_score": 96.0}
    ))

    # Add usage logs for initial AI operations
    db.add(AIUsageLog(
        provider="gemini",
        model="gemini-1.5-pro",
        task_type="job_extraction",
        prompt_tokens=320,
        completion_tokens=210,
        latency_ms=480.0,
        status="success"
    ))

    db.commit()
    print("[SEED] NEXORA database successfully initialized with rich production seed data.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        run_seed(db)
    finally:
        db.close()
