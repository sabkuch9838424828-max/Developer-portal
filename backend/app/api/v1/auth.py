from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.talent import TalentProfile
from app.models.notification import NotificationPreference
from app.models.ai_log import AuditLog
from app.schemas.auth import (
    Token, LoginRequest, RecruiterRegisterRequest, TalentRegisterRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/recruiter", response_model=Token)
def register_recruiter(payload: RecruiterRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.work_email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=payload.work_email.lower(),
        hashed_password=hash_password(payload.password),
        role="recruiter",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    recruiter_profile = RecruiterProfile(
        user_id=user.id,
        full_name=payload.full_name,
        designation=payload.designation
    )
    db.add(recruiter_profile)
    db.flush()

    company = Company(
        recruiter_profile_id=recruiter_profile.id,
        name=payload.company_name,
        website=payload.company_website,
        size=payload.company_size,
        description=payload.company_description,
        industry=payload.industry,
        location=payload.location
    )
    db.add(company)

    # Default notification preferences
    notif_pref = NotificationPreference(user_id=user.id)
    db.add(notif_pref)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="RECRUITER_REGISTERED",
        target_type="company",
        target_id=company.id,
        details={"company_name": payload.company_name}
    )
    db.add(audit)

    db.commit()

    token = create_access_token(subject=user.id, role="recruiter")
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        name=payload.full_name
    )

@router.post("/register/talent", response_model=Token)
def register_talent(payload: TalentRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role="talent",
        talent_type=payload.account_type,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    talent_profile = TalentProfile(
        user_id=user.id,
        name=payload.name,
        headline=payload.headline or f"Technical {payload.account_type.title()}",
        specialization=payload.primary_specialization,
        availability="Immediately",
        preferred_employment_type="Full-time" if payload.account_type != "student" else "Internship",
        remote_preference="Remote"
    )
    db.add(talent_profile)

    # Default notification preferences
    notif_pref = NotificationPreference(user_id=user.id)
    db.add(notif_pref)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="TALENT_REGISTERED",
        target_type="talent_profile",
        target_id=talent_profile.id,
        details={"account_type": payload.account_type}
    )
    db.add(audit)

    db.commit()

    token = create_access_token(subject=user.id, role="talent")
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        talent_type=user.talent_type,
        name=payload.name
    )

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended or deactivated. Contact support."
        )

    name = user.email.split("@")[0]
    if user.role == "recruiter" and user.recruiter_profile:
        name = user.recruiter_profile.full_name
    elif user.role == "talent" and user.talent_profile:
        name = user.talent_profile.name

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        talent_type=user.talent_type,
        name=name
    )

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    name = current_user.email.split("@")[0]
    company_name = None
    company_id = None
    profile_id = None

    if current_user.role == "recruiter" and current_user.recruiter_profile:
        name = current_user.recruiter_profile.full_name
        profile_id = current_user.recruiter_profile.id
        if current_user.recruiter_profile.company:
            company_name = current_user.recruiter_profile.company.name
            company_id = current_user.recruiter_profile.company.id
    elif current_user.role == "talent" and current_user.talent_profile:
        name = current_user.talent_profile.name
        profile_id = current_user.talent_profile.id

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "talent_type": current_user.talent_type,
        "name": name,
        "profile_id": profile_id,
        "company_name": company_name,
        "company_id": company_id,
        "is_active": current_user.is_active
    }

@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    # Return friendly success message without leaking existence of account
    return {
        "success": True,
        "message": f"If an account exists for {email}, password recovery instructions have been dispatched."
    }
