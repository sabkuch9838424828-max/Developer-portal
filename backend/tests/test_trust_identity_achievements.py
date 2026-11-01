import pytest
import io
import uuid
from PIL import Image
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.core.database import SessionLocal
from app.models.user import User
from app.models.talent import TalentProfile, Team
from app.models.achievement import Achievement, TeamAchievement, TeamAchievementContributor
from app.models.identity import IdentityVerificationRecord
from app.services.media_service import MediaProcessingService
from app.services.achievement_service import AchievementService
from app.services.identity_service import IdentityVerificationService

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def create_dummy_image(width=500, height=500, format="PNG") -> UploadFile:
    img = Image.new("RGB", (width, height), color=(66, 133, 244))
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return UploadFile(filename=f"test_avatar.{format.lower()}", file=buf)

@pytest.mark.asyncio
async def test_avatar_crop_and_storage(db: Session):
    file = create_dummy_image(400, 300, "PNG")
    avatar_url = await MediaProcessingService.process_and_save_avatar(
        file=file,
        user_id=99999,
        crop_data={"x": 50, "y": 20, "width": 200, "height": 200}
    )
    assert avatar_url.startswith("/storage/uploads/avatars/")
    assert avatar_url.endswith(".webp")

    # Cover
    cover_file = create_dummy_image(1600, 900, "JPEG")
    cover_url = await MediaProcessingService.process_and_save_cover(
        file=cover_file,
        entity_type="talent",
        entity_id=99999
    )
    assert cover_url.startswith("/storage/uploads/covers/")
    assert cover_url.endswith(".webp")

def test_individual_achievement_lifecycle(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    assert alex is not None
    talent = alex.talent_profile

    # 1. Create achievement
    ach_data = {
        "title": "Global AI Hackathon 1st Place",
        "category": "hackathon_winner",
        "description": "Architected an autonomous agent swarm for emergency disaster response",
        "issuer": "Global Tech Arena",
        "date_awarded": "2025-10-15T00:00:00Z",
        "credential_url": "https://hackathon.example.com/winners/alex",
        "is_featured": True,
        "is_public": True
    }
    ach = AchievementService.create_individual_achievement(talent, ach_data, db=db)
    assert ach.id is not None
    assert ach.verification_status == "unverified"
    assert ach.category == "Hackathons"

    # 2. Request verification
    ach = AchievementService.request_verification(
        achievement_id=ach.id,
        talent_profile=talent,
        evidence_notes="Uploaded event certificate and winner press release.",
        db=db
    )
    assert ach.verification_status == "pending_review"

    # 3. Admin review approval
    admin_user = db.query(User).filter(User.role == "admin").first()
    admin_id = admin_user.id if admin_user else alex.id

    verified_ach = AchievementService.review_verification(
        achievement_id=ach.id,
        reviewer_id=admin_id,
        decision="verified",
        review_notes="Official certificate validated against public registry.",
        db=db
    )
    assert verified_ach.verification_status == "verified"
    assert len(verified_ach.verification_records) >= 1
    assert verified_ach.verification_records[0].new_status == "verified"

def test_team_achievement_and_attribution(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    sophia = db.query(User).filter(User.email == "sophia.martinez@nexora.ai").first()
    assert alex is not None and sophia is not None

    team = db.query(Team).filter(Team.lead_user_id == alex.id).first()
    assert team is not None

    # 1. Create team achievement
    ach_data = {
        "title": "NeurIPS Best System Demonstration",
        "category": "research_publication",
        "description": "Demonstrated ultra-low latency transformer inference on edge silicon.",
        "issuer": "NeurIPS Foundation",
        "date_awarded": "2025-12-01T00:00:00Z",
        "credential_url": "https://neurips.cc/demos/2025/agent-edge",
        "is_public": True
    }
    team_ach = AchievementService.create_team_achievement(
        team=team,
        creator_user_id=alex.id,
        data=ach_data,
        db=db
    )
    assert team_ach.id is not None

    # 2. Attribute Sophia as Core Contributor
    contributor = AchievementService.attribute_team_member(
        team_achievement_id=team_ach.id,
        talent_profile_id=sophia.talent_profile.id,
        role_in_project="Edge Model Quantization Lead",
        db=db
    )
    assert contributor.attribution_status == "pending"

    # Verify Sophia's personal public achievements do NOT have it yet
    sophia_achs = db.query(Achievement).filter(Achievement.talent_profile_id == sophia.talent_profile.id).all()
    assert all(a.title != team_ach.title for a in sophia_achs)

    # 3. Sophia explicitly accepts attribution
    contributor = AchievementService.respond_to_attribution(
        contributor_id=contributor.id,
        talent_profile=sophia.talent_profile,
        status_choice="accepted",
        db=db
    )
    assert contributor.attribution_status == "accepted"

def test_identity_verification_and_consent(db: Session):
    alex = db.query(User).filter(User.email == "alex.chen@nexora.ai").first()
    assert alex is not None

    # 1. Check initial status
    status_info = IdentityVerificationService.get_identity_status(alex, db=db)
    assert "status" in status_info

    # 2. Record explicit consent
    consent_res = IdentityVerificationService.record_consent(
        user=alex,
        consent_type="government_identity_verification",
        ip_address="192.168.1.100",
        db=db
    )
    assert consent_res["success"] is True

    # 3. Initiate verification session
    sess = IdentityVerificationService.initiate_verification_session(
        user=alex,
        provider="digilocker_sandbox",
        verification_method="government_photo_id",
        ip_address="192.168.1.100",
        db=db
    )
    assert sess["session_id"].startswith("nex_sess_")
    assert "session_url" in sess

    # 4. Simulate verification approval in developer sandbox
    sim_res = IdentityVerificationService.simulate_sandbox_decision(
        user=alex,
        decision="verified",
        db=db
    )
    assert sim_res["verified"] is True
    assert sim_res["status"] == "verified"
    assert alex.talent_profile.identity_verified is True
    assert alex.talent_profile.identity_status == "verified"

    # 5. Withdraw consent
    withdraw_res = IdentityVerificationService.withdraw_consent(
        user=alex,
        ip_address="192.168.1.100",
        db=db
    )
    assert withdraw_res["success"] is True
    assert alex.talent_profile.identity_verified is False
    assert alex.talent_profile.identity_status == "not_started"
