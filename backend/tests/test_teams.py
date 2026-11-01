import pytest
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.talent import TalentProfile, Team, TeamMember, TeamInvitation
from app.models.skill import Skill, ProfileSkill
from app.models.job import Job, JobSkill
from app.models.recruiter import RecruiterProfile, Company
from app.services.team_service import TeamService

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_team_creation_and_ownership(db: Session):
    # Find or verify a talent user
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    assert alex is not None
    assert alex.talent_profile is not None

    team_name = "Cloud Architecture Collective"
    slug = "cloud-architecture-collective-test"

    # Cleanup if exists
    existing = db.query(Team).filter(Team.slug == slug).first()
    if existing:
        db.delete(existing)
        db.commit()

    team = Team(
        lead_user_id=alex.id,
        name=team_name,
        slug=slug,
        domain="Cloud & Distributed Systems",
        description="High-performance cloud engineering team",
        visibility="public"
    )
    db.add(team)
    db.flush()

    # Creator assigned as Owner
    member = TeamMember(
        team_id=team.id,
        talent_profile_id=alex.talent_profile.id,
        role="Owner",
        title="Principal Architect"
    )
    db.add(member)
    db.commit()

    assert team.id is not None
    assert team.lead_user_id == alex.id
    assert len(team.members) == 1
    assert team.members[0].role == "Owner"
    assert team.members[0].talent_profile.name == "Alex Chen"

def test_invitation_and_membership_acceptance(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    sophia = db.query(User).filter(User.email == "sophia.martinez@nexora.ai").first()
    assert alex is not None and sophia is not None

    team = db.query(Team).filter(Team.lead_user_id == alex.id).first()
    assert team is not None

    # Ensure Sophia is not already a member
    mem = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.talent_profile_id == sophia.talent_profile.id
    ).first()
    if mem:
        db.delete(mem)
        db.commit()

    # Create invitation from Alex to Sophia
    inv = TeamInvitation(
        team_id=team.id,
        inviter_user_id=alex.id,
        invitee_user_id=sophia.id,
        role="Admin",
        title="Lead Frontend Specialist",
        message="Hey Sophia, we would love for you to lead our frontend architecture!",
        status="pending"
    )
    db.add(inv)
    db.commit()

    assert inv.id is not None
    assert inv.status == "pending"

    # Simulate Sophia accepting
    inv.status = "accepted"
    new_member = TeamMember(
        team_id=team.id,
        talent_profile_id=sophia.talent_profile.id,
        role=inv.role,
        title=inv.title
    )
    db.add(new_member)
    db.commit()

    # Re-query team members
    db.refresh(team)
    assert len(team.members) >= 2
    sophia_mem = next((m for m in team.members if m.talent_profile_id == sophia.talent_profile.id), None)
    assert sophia_mem is not None
    assert sophia_mem.role == "Admin"
    assert sophia_mem.title == "Lead Frontend Specialist"

def test_team_skills_aggregation(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    team = db.query(Team).filter(Team.lead_user_id == alex.id).first()
    assert team is not None

    agg = TeamService.aggregate_team_skills(team, db)
    assert agg["team_id"] == team.id
    assert agg["total_members"] >= 2
    assert agg["total_unique_skills"] > 0

    skills_inventory = agg["skills_inventory"]
    skill_names = [s["skill"] for s in skills_inventory]

    # Alex has Python, FastAPI; Sophia has React, Next.js, TypeScript
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "React" in skill_names
    assert "TypeScript" in skill_names

    # Check scorecard
    scorecard = agg["scorecard"]
    assert scorecard["total_members"] >= 2
    assert scorecard["total_unique_skills"] > 0
    assert "dominant_domain" in scorecard
    assert "skill_depth_score" in scorecard

def test_team_skill_matrix(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    team = db.query(Team).filter(Team.lead_user_id == alex.id).first()
    assert team is not None

    matrix_res = TeamService.build_skill_matrix(team, db)
    assert "members" in matrix_res
    assert "skills" in matrix_res
    assert "matrix" in matrix_res
    assert len(matrix_res["matrix"]) >= 2

    # Verify each row has member details and skills mapping
    for row in matrix_res["matrix"]:
        assert "member" in row
        assert "skills" in row
        assert isinstance(row["skills"], dict)

def test_team_job_recruitment_matching(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    team = db.query(Team).filter(Team.lead_user_id == alex.id).first()
    assert team is not None

    job = db.query(Job).filter(Job.title.like("%Python%")).first()
    assert job is not None

    match_res = TeamService.calculate_team_job_match(team, job, db)
    assert match_res["team_id"] == team.id
    assert match_res["job_id"] == job.id
    assert match_res["mandatory_coverage_pct"] > 0
    assert "member_contributions" in match_res
    assert len(match_res["member_contributions"]) >= 2
    assert "explanation" in match_res
    assert len(match_res["explanation"]) > 20
