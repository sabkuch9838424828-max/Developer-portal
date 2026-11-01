from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from app.services.media_service import MediaProcessingService
from app.services.achievement_service import AchievementService
from app.models.achievement import TeamAchievement, TeamAchievementContributor

from app.api.deps import get_db, get_current_user, require_talent
from app.models.user import User
from app.models.talent import TalentProfile, Team, TeamMember, TeamInvitation
from app.models.skill import ProfileSkill, Skill
from app.models.job import Job
from app.models.project import Project
from app.models.notification import Notification
from app.schemas.team import (
    TeamCreateRequest, TeamUpdateRequest, TeamMemberRoleUpdate,
    TeamInvitationCreateRequest, TeamInvitationResponse,
    MemberSearchItem, TeamSkillsResponse, TeamSkillMatrixResponse,
    TeamMatchResponse
)
from app.services.team_service import TeamService

router = APIRouter(tags=["Teams"])

def utc_now():
    return datetime.now(timezone.utc)

def get_user_team_role(team: Team, user_id: int, profile_id: Optional[int]) -> Optional[str]:
    """Helper to check role of a user in a team."""
    if team.lead_user_id == user_id:
        return "Owner"
    if profile_id:
        membership = next((m for m in team.members if m.talent_profile_id == profile_id), None)
        if membership:
            return membership.role or "Member"
    return None

# ==========================================
# 1. TEAM CREATION AND MANAGEMENT
# ==========================================

@router.post("/teams", status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreateRequest,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    profile = current_user.talent_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Talent profile required to create a team.")

    # Generate unique slug
    base_slug = payload.name.lower().strip().replace(" ", "-")
    base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
    slug = base_slug
    counter = 1
    while db.query(Team).filter(Team.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    team = Team(
        lead_user_id=current_user.id,
        name=payload.name.strip(),
        slug=slug,
        domain=payload.domain or "Full-Stack Web",
        description=payload.description,
        logo_url=payload.logo_url,
        project_goals=payload.project_goals,
        required_skills=payload.required_skills or [],
        visibility=payload.visibility or "public",
        website=payload.website,
        github_url=payload.github_url,
        availability=payload.availability or "Available for projects"
    )
    db.add(team)
    db.flush()

    # Creator automatically becomes Team Owner
    owner_member = TeamMember(
        team_id=team.id,
        talent_profile_id=profile.id,
        role="Owner",
        title=profile.headline or "Founder & Solutions Architect"
    )
    db.add(owner_member)
    db.commit()
    db.refresh(team)

    return {
        "success": True,
        "team_id": team.id,
        "name": team.name,
        "slug": team.slug,
        "role": "Owner"
    }

@router.get("/teams")
def list_teams(
    mine: bool = Query(False, description="Filter to teams user belongs to"),
    search: Optional[str] = Query(None, description="Search by name, domain, or skills"),
    visibility: Optional[str] = Query(None, description="Filter by visibility"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    query = db.query(Team).filter(Team.is_active == True)

    if mine:
        # User is lead or member
        query = query.filter(
            or_(
                Team.lead_user_id == current_user.id,
                Team.members.any(TeamMember.talent_profile_id == profile_id)
            )
        )
    else:
        # Public or discoverable teams
        query = query.filter(Team.visibility.in_(["public", "discoverable"]))

    if search:
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Team.name).like(search_filter),
                func.lower(Team.domain).like(search_filter),
                func.lower(Team.description).like(search_filter)
            )
        )

    if visibility and visibility != "all":
        query = query.filter(Team.visibility == visibility)

    teams = query.order_by(Team.created_at.desc()).all()
    results = []

    for t in teams:
        user_role = get_user_team_role(t, current_user.id, profile_id)
        # Quick skill summary
        all_skills = set()
        for m in t.members:
            for ps in m.talent_profile.profile_skills:
                all_skills.add(ps.skill.canonical_name)

        results.append({
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "domain": t.domain,
            "description": t.description,
            "logo_url": t.logo_url,
            "project_goals": t.project_goals,
            "required_skills": t.required_skills or [],
            "visibility": t.visibility,
            "availability": t.availability,
            "website": t.website,
            "github_url": t.github_url,
            "member_count": len(t.members),
            "unique_skills_count": len(all_skills),
            "top_skills": list(all_skills)[:6],
            "is_owner": user_role == "Owner",
            "is_admin": user_role in ["Owner", "Admin"],
            "is_member": user_role is not None,
            "user_role": user_role,
            "created_at": t.created_at
        })

    return results

@router.get("/teams/{team_id}")
def get_team_detail(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile_id = current_user.talent_profile.id if current_user.talent_profile else None

    # Support lookup by numeric ID or unique slug
    if team_id.isdigit():
        team = db.query(Team).filter(Team.id == int(team_id), Team.is_active == True).first()
    else:
        team = db.query(Team).filter(Team.slug == team_id, Team.is_active == True).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found or inactive")

    user_role = get_user_team_role(team, current_user.id, profile_id)

    # Privacy check: if private, only team members or admin can view
    if team.visibility == "private" and not user_role and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="This team profile is private to team members.")

    members_data = []
    for m in team.members:
        p = m.talent_profile
        member_skills = [
            {
                "name": ps.skill.canonical_name,
                "category": ps.skill.category,
                "proficiency": ps.proficiency,
                "experience_years": ps.experience_years
            }
            for ps in p.profile_skills
        ]
        members_data.append({
            "id": m.id,
            "talent_profile_id": p.id,
            "user_id": p.user_id,
            "name": p.name,
            "email": p.user.email if (user_role in ["Owner", "Admin"]) else None,
            "role": m.role or "Member",
            "title": m.title or p.headline or "Engineer",
            "specialization": p.specialization,
            "location": p.location,
            "profile_photo_url": getattr(p, "profile_photo_url", None) or (getattr(p.user, "avatar_url", None) if p and p.user else None),
            "skills": member_skills,
            "joined_at": m.joined_at
        })

    # Team projects
    projects_data = []
    for pr in team.projects:
        techs = [pt.skill.canonical_name for pt in pr.technologies]
        projects_data.append({
            "id": pr.id,
            "title": pr.title,
            "description": pr.description,
            "problem_statement": pr.problem_statement,
            "features": pr.features,
            "github_url": pr.github_url,
            "demo_url": pr.demo_url,
            "status": pr.status,
            "technologies": techs
        })

    return {
        "id": team.id,
        "name": team.name,
        "slug": team.slug,
        "domain": team.domain,
        "description": team.description,
        "logo_url": team.logo_url,
        "cover_image_url": team.cover_image_url,
        "project_goals": team.project_goals,
        "required_skills": team.required_skills or [],
        "visibility": team.visibility,
        "availability": team.availability,
        "website": team.website,
        "github_url": team.github_url,
        "owner_user_id": team.lead_user_id,
        "is_owner": user_role == "Owner",
        "is_admin": user_role in ["Owner", "Admin"],
        "is_member": user_role is not None,
        "user_role": user_role,
        "members": members_data,
        "projects": projects_data,
        "created_at": team.created_at
    }

@router.patch("/teams/{team_id}")
def update_team(
    team_id: int,
    payload: TeamUpdateRequest,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only team Owner or Admins can edit team settings.")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(team, k, v)

    db.commit()
    db.refresh(team)
    return {"success": True, "message": "Team updated successfully."}

@router.delete("/teams/{team_id}")
def delete_team(
    team_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.lead_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the Team Owner can delete this team.")

    team.is_active = False
    db.delete(team)
    db.commit()
    return {"success": True, "message": f"Team '{team.name}' has been permanently deleted."}

# ==========================================
# 2. MEMBER INVITATION WORKFLOW
# ==========================================

@router.post("/teams/{team_id}/invitations", status_code=status.HTTP_201_CREATED)
def invite_member_to_team(
    team_id: int,
    payload: TeamInvitationCreateRequest,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only team Owner or Admins can invite new members.")

    # Target user validation
    invitee = db.query(User).filter(User.id == payload.invitee_user_id, User.is_active == True).first()
    if not invitee or not invitee.talent_profile:
        raise HTTPException(status_code=404, detail="Candidate talent account not found.")

    if invitee.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot invite yourself to your own team.")

    # Check if already a member
    already_member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.talent_profile_id == invitee.talent_profile.id
    ).first()
    if already_member:
        raise HTTPException(status_code=400, detail=f"{invitee.talent_profile.name} is already a member of this team.")

    # Check for active pending invitation
    existing_invite = db.query(TeamInvitation).filter(
        TeamInvitation.team_id == team.id,
        TeamInvitation.invitee_user_id == invitee.id,
        TeamInvitation.status == "pending"
    ).first()
    if existing_invite:
        raise HTTPException(status_code=400, detail="A pending invitation has already been sent to this member.")

    invitation = TeamInvitation(
        team_id=team.id,
        inviter_user_id=current_user.id,
        invitee_user_id=invitee.id,
        role=payload.role or "Member",
        title=payload.title,
        message=payload.message,
        status="pending",
        expires_at=utc_now() + timedelta(days=14)
    )
    db.add(invitation)
    db.flush()

    # Create in-app notification for the invitee
    notif = Notification(
        user_id=invitee.id,
        type="team_invitation",
        title=f"Team Invitation: {team.name}",
        message=f"{current_user.talent_profile.name if current_user.talent_profile else 'A team admin'} invited you to join '{team.name}' as {payload.role or 'Member'}.",
        link="/talent/invitations",
        meta_data={"team_id": team.id, "invitation_id": invitation.id, "team_name": team.name}
    )
    db.add(notif)
    db.commit()

    return {
        "success": True,
        "invitation_id": invitation.id,
        "message": f"Invitation sent to {invitee.talent_profile.name}."
    }

@router.get("/teams/{team_id}/invitations")
def list_team_invitations(
    team_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only team Owner or Admins can view invitation logs.")

    invites = db.query(TeamInvitation).filter(TeamInvitation.team_id == team.id).order_by(TeamInvitation.created_at.desc()).all()
    results = []
    for inv in invites:
        results.append({
            "id": inv.id,
            "team_id": inv.team_id,
            "team_name": team.name,
            "inviter_id": inv.inviter_user_id,
            "inviter_name": inv.inviter.talent_profile.name if (inv.inviter and inv.inviter.talent_profile) else "Team Admin",
            "invitee_id": inv.invitee_user_id,
            "invitee_name": inv.invitee.talent_profile.name if (inv.invitee and inv.invitee.talent_profile) else "Candidate",
            "invitee_email": inv.invitee.email if inv.invitee else None,
            "role": inv.role,
            "title": inv.title,
            "message": inv.message,
            "status": inv.status,
            "expires_at": inv.expires_at,
            "created_at": inv.created_at
        })
    return results

# Endpoints for candidate responding to invitations
@router.post("/invitations/{invitation_id}/accept")
def accept_team_invitation(
    invitation_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.invitee_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only accept invitations addressed directly to your account.")

    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot accept invitation with status '{invitation.status}'.")

    # Check expiration
    if invitation.expires_at and invitation.expires_at < utc_now():
        invitation.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="This invitation has expired.")

    team = invitation.team
    profile = current_user.talent_profile

    # Check if already in team
    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.talent_profile_id == profile.id
    ).first()

    if not existing_member:
        new_member = TeamMember(
            team_id=team.id,
            talent_profile_id=profile.id,
            role=invitation.role or "Member",
            title=invitation.title or profile.headline or "Engineer"
        )
        db.add(new_member)

    invitation.status = "accepted"
    invitation.updated_at = utc_now()

    # Notify team inviter / owner
    notif = Notification(
        user_id=invitation.inviter_user_id,
        type="invitation_accepted",
        title=f"Invitation Accepted: {team.name}",
        message=f"{profile.name} accepted your invitation and joined '{team.name}' as {invitation.role}.",
        link=f"/talent/teams/{team.id}",
        meta_data={"team_id": team.id, "member_name": profile.name}
    )
    db.add(notif)
    db.commit()

    return {
        "success": True,
        "message": f"Welcome! You are now an active member of {team.name}.",
        "team_id": team.id
    }

@router.post("/invitations/{invitation_id}/decline")
def decline_team_invitation(
    invitation_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.invitee_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only decline invitations addressed to your account.")

    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot decline invitation with status '{invitation.status}'.")

    invitation.status = "declined"
    invitation.updated_at = utc_now()

    # Notify inviter
    profile = current_user.talent_profile
    notif = Notification(
        user_id=invitation.inviter_user_id,
        type="invitation_declined",
        title=f"Invitation Declined: {invitation.team.name}",
        message=f"{profile.name} declined the invitation to join '{invitation.team.name}'.",
        link=f"/talent/teams/{invitation.team_id}",
        meta_data={"team_id": invitation.team_id, "member_name": profile.name}
    )
    db.add(notif)
    db.commit()

    return {"success": True, "message": "Invitation declined."}

@router.delete("/invitations/{invitation_id}")
def cancel_team_invitation(
    invitation_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(invitation.team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and invitation.inviter_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this invitation.")

    invitation.status = "cancelled"
    invitation.updated_at = utc_now()
    db.commit()

    return {"success": True, "message": "Invitation cancelled."}

@router.post("/invitations/{invitation_id}/resend")
def resend_team_invitation(
    invitation_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(invitation.team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to resend invitations.")

    invitation.status = "pending"
    invitation.expires_at = utc_now() + timedelta(days=14)
    invitation.updated_at = utc_now()

    # Re-send notification
    notif = Notification(
        user_id=invitation.invitee_user_id,
        type="team_invitation",
        title=f"Reminder: Invitation to {invitation.team.name}",
        message=f"Reminder: You have a pending invitation to join '{invitation.team.name}' as {invitation.role}.",
        link="/talent/invitations",
        meta_data={"team_id": invitation.team_id, "invitation_id": invitation.id}
    )
    db.add(notif)
    db.commit()

    return {"success": True, "message": "Invitation refreshed and notification dispatched."}

# List received team invitations for the logged in talent member
@router.get("/talent/team-invitations")
def get_user_team_invitations(
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    invites = (
        db.query(TeamInvitation)
        .filter(TeamInvitation.invitee_user_id == current_user.id)
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )

    results = []
    for inv in invites:
        team = inv.team
        results.append({
            "id": inv.id,
            "team_id": team.id,
            "team_name": team.name,
            "team_slug": team.slug,
            "team_domain": team.domain,
            "team_logo_url": team.logo_url,
            "team_description": team.description,
            "inviter_name": inv.inviter.talent_profile.name if (inv.inviter and inv.inviter.talent_profile) else "Team Lead",
            "role": inv.role,
            "title": inv.title,
            "message": inv.message,
            "status": inv.status,
            "expires_at": inv.expires_at,
            "created_at": inv.created_at
        })

    return results

# ==========================================
# 3. TEAM MEMBERSHIP MANAGEMENT
# ==========================================

@router.get("/teams/{team_id}/members")
def get_team_members(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    results = []
    for m in team.members:
        p = m.talent_profile
        skills = [
            {
                "name": ps.skill.canonical_name,
                "proficiency": ps.proficiency,
                "experience_years": ps.experience_years
            }
            for ps in p.profile_skills
        ]
        results.append({
            "id": m.id,
            "user_id": p.user_id,
            "talent_profile_id": p.id,
            "name": p.name,
            "role": m.role or "Member",
            "title": m.title or p.headline or "Engineer",
            "specialization": p.specialization,
            "location": p.location,
            "skills": skills,
            "joined_at": m.joined_at
        })
    return results

@router.patch("/teams/{team_id}/members/{member_id}")
def update_team_member_role(
    team_id: int,
    member_id: int,
    payload: TeamMemberRoleUpdate,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(team, current_user.id, profile_id)
    if user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only team Owner or Admins can modify member roles.")

    member = db.query(TeamMember).filter(TeamMember.id == member_id, TeamMember.team_id == team.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in team")

    # Cannot demote the primary owner unless transferring ownership
    if member.role == "Owner" and payload.role != "Owner":
        raise HTTPException(status_code=400, detail="Cannot demote the primary Team Owner.")

    member.role = payload.role
    if payload.title is not None:
        member.title = payload.title

    db.commit()
    return {"success": True, "message": f"Updated role to {payload.role}."}

@router.delete("/teams/{team_id}/members/{member_id}")
def remove_team_member(
    team_id: int,
    member_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    member = db.query(TeamMember).filter(TeamMember.id == member_id, TeamMember.team_id == team.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in team")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    user_role = get_user_team_role(team, current_user.id, profile_id)

    # Permission check: Member can leave on their own, OR Owner/Admin can remove them
    is_self = (member.talent_profile_id == profile_id)
    if not is_self and user_role not in ["Owner", "Admin"] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to remove this member.")

    if member.role == "Owner" and len(team.members) > 1:
        raise HTTPException(status_code=400, detail="Team Owner cannot leave before transferring ownership to another member.")

    db.delete(member)
    db.commit()

    return {"success": True, "message": "Member removed from team."}

# ==========================================
# 4. TEAM SKILLS AGGREGATION & VISUALIZATION
# ==========================================

@router.get("/teams/{team_id}/skills", response_model=TeamSkillsResponse)
def get_team_skills_dashboard(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return TeamService.aggregate_team_skills(team, db)

@router.get("/teams/{team_id}/skill-matrix", response_model=TeamSkillMatrixResponse)
def get_team_skill_matrix(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return TeamService.build_skill_matrix(team, db)

# ==========================================
# 5. DISCOVER & SEARCH REGISTERED MEMBERS
# ==========================================

@router.get("/members/search", response_model=List[MemberSearchItem])
def search_registered_members(
    q: Optional[str] = Query(None, description="Search term for name, email, or headline"),
    skill: Optional[str] = Query(None, description="Filter by specific skill name"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    availability: Optional[str] = Query(None, description="Filter by availability"),
    team_id: Optional[int] = Query(None, description="Context team ID to check membership/invitation status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(TalentProfile).join(User, TalentProfile.user_id == User.id).filter(
        User.is_active == True,
        TalentProfile.is_public == True
    )

    if q:
        term = f"%{q.lower().strip()}%"
        query = query.filter(
            or_(
                func.lower(TalentProfile.name).like(term),
                func.lower(TalentProfile.headline).like(term),
                func.lower(TalentProfile.bio).like(term),
                func.lower(User.email).like(term)
            )
        )

    if specialization and specialization != "all":
        query = query.filter(func.lower(TalentProfile.specialization) == specialization.lower())

    if availability and availability != "all":
        query = query.filter(TalentProfile.availability == availability)

    if skill:
        skill_term = f"%{skill.lower().strip()}%"
        query = query.filter(
            TalentProfile.profile_skills.any(
                ProfileSkill.skill.has(func.lower(Skill.canonical_name).like(skill_term))
            )
        )

    profiles = query.limit(40).all()
    results = []

    # Pre-fetch existing members and pending invites for context team
    existing_member_profile_ids = set()
    pending_invite_user_ids = set()

    if team_id:
        existing_member_profile_ids = {
            m.talent_profile_id
            for m in db.query(TeamMember.talent_profile_id).filter(TeamMember.team_id == team_id).all()
        }
        pending_invite_user_ids = {
            inv.invitee_user_id
            for inv in db.query(TeamInvitation.invitee_user_id).filter(
                TeamInvitation.team_id == team_id,
                TeamInvitation.status == "pending"
            ).all()
        }

    for p in profiles:
        # Don't list the current searching user themselves
        if p.user_id == current_user.id:
            continue

        skills_list = [
            {
                "name": ps.skill.canonical_name,
                "proficiency": ps.proficiency or "Intermediate",
                "category": ps.skill.category
            }
            for ps in p.profile_skills
        ]

        results.append(MemberSearchItem(
            user_id=p.user_id,
            profile_id=p.id,
            name=p.name,
            email=p.user.email,
            headline=p.headline,
            specialization=p.specialization,
            location=p.location,
            experience_years=p.experience_years or 0.0,
            skills=skills_list,
            projects_count=len(p.projects),
            availability=p.availability or "Immediately",
            is_already_member=(p.id in existing_member_profile_ids),
            has_pending_invitation=(p.user_id in pending_invite_user_ids)
        ))

    return results

# ==========================================
# 6. TEAM-BASED RECRUITMENT MATCHING
# ==========================================

@router.post("/teams/{team_id}/match/{job_id}", response_model=TeamMatchResponse)
def match_team_with_job(
    team_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found")

    return TeamService.calculate_team_job_match(team, job, db)


# ==========================================
# MODULE 2: TEAM BRANDING & VISUAL IDENTITY
# ==========================================

@router.post("/teams/{team_id}/logo")
async def upload_team_logo(
    team_id: int,
    file: UploadFile = File(...),
    crop_x: Optional[float] = Form(None),
    crop_y: Optional[float] = Form(None),
    crop_width: Optional[float] = Form(None),
    crop_height: Optional[float] = Form(None),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can update team branding")

    crop_data = None
    if all(v is not None for v in [crop_x, crop_y, crop_width, crop_height]):
        crop_data = {"x": crop_x, "y": crop_y, "width": crop_width, "height": crop_height}

    logo_url = await MediaProcessingService.process_and_save_avatar(
        file=file,
        user_id=f"team_{team.id}",
        crop_data=crop_data,
        old_avatar_url=team.logo_url
    )

    team.logo_url = logo_url
    db.commit()

    return {
        "success": True,
        "logo_url": logo_url,
        "message": "Team logo uploaded and processed successfully."
    }

@router.delete("/teams/{team_id}/logo")
def remove_team_logo(
    team_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can remove team branding")

    MediaProcessingService.delete_file_safely(team.logo_url)
    team.logo_url = None
    db.commit()

    return {"success": True, "message": "Team logo removed successfully."}

@router.post("/teams/{team_id}/cover")
async def upload_team_cover(
    team_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can update team cover")

    cover_url = await MediaProcessingService.process_and_save_cover(
        file=file,
        entity_type="team",
        entity_id=team.id,
        old_cover_url=team.cover_image_url
    )

    team.cover_image_url = cover_url
    db.commit()

    return {
        "success": True,
        "cover_image_url": cover_url,
        "message": "Team cover banner updated successfully."
    }

@router.delete("/teams/{team_id}/cover")
def remove_team_cover(
    team_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can remove team cover")

    MediaProcessingService.delete_file_safely(team.cover_image_url)
    team.cover_image_url = None
    db.commit()

    return {"success": True, "message": "Team cover banner removed successfully."}


# ==========================================
# MODULE 4: TEAM ACHIEVEMENTS & CONTRIBUTIONS
# ==========================================

@router.post("/teams/{team_id}/achievements")
def create_team_achievement(
    team_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can record team achievements")

    ach = AchievementService.create_team_achievement(
        team=team,
        creator_user_id=current_user.id,
        data=payload,
        db=db
    )

    return {
        "success": True,
        "achievement": AchievementService.serialize_team_achievement(ach)
    }

@router.get("/teams/{team_id}/achievements")
def list_team_achievements(
    team_id: str,
    db: Session = Depends(get_db)
):
    if team_id.isdigit():
        team = db.query(Team).filter(Team.id == int(team_id)).first()
    else:
        team = db.query(Team).filter(Team.slug == team_id).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    achievements = AchievementService.get_team_achievements(team.id, db=db)
    return [AchievementService.serialize_team_achievement(a) for a in achievements]

@router.patch("/teams/{team_id}/achievements/{ach_id}")
def update_team_achievement(
    team_id: int,
    ach_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can edit team achievements")

    ach = db.query(TeamAchievement).filter(
        TeamAchievement.id == ach_id,
        TeamAchievement.team_id == team.id
    ).first()

    if not ach:
        raise HTTPException(status_code=404, detail="Team achievement not found")

    for field in ["title", "description", "category", "issuer", "credential_url", "evidence_url", "is_public"]:
        if field in payload:
            setattr(ach, field, payload[field])

    if "date_awarded" in payload and payload["date_awarded"]:
        try:
            ach.date_awarded = datetime.fromisoformat(payload["date_awarded"])
        except Exception:
            pass

    db.commit()
    db.refresh(ach)

    return {
        "success": True,
        "achievement": AchievementService.serialize_team_achievement(ach)
    }

@router.delete("/teams/{team_id}/achievements/{ach_id}")
def delete_team_achievement(
    team_id: int,
    ach_id: int,
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can delete team achievements")

    ach = db.query(TeamAchievement).filter(
        TeamAchievement.id == ach_id,
        TeamAchievement.team_id == team.id
    ).first()

    if not ach:
        raise HTTPException(status_code=404, detail="Team achievement not found")

    db.delete(ach)
    db.commit()

    return {"success": True, "message": "Team achievement deleted successfully."}

@router.post("/teams/{team_id}/achievements/{ach_id}/attribute")
def attribute_team_member(
    team_id: int,
    ach_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(require_talent),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile_id = current_user.talent_profile.id if current_user.talent_profile else None
    role = get_user_team_role(team, current_user.id, profile_id)
    if role not in ["Owner", "Admin"]:
        raise HTTPException(status_code=403, detail="Only team owners or admins can attribute contributors")

    member_talent_id = payload.get("talent_profile_id")
    role_in_project = payload.get("role_in_project", "Core Contributor")

    if not member_talent_id:
        raise HTTPException(status_code=400, detail="talent_profile_id is required")

    contributor = AchievementService.attribute_team_member(
        team_achievement_id=ach_id,
        talent_profile_id=member_talent_id,
        role_in_project=role_in_project,
        db=db
    )

    return {
        "success": True,
        "contributor_id": contributor.id,
        "attribution_status": contributor.attribution_status,
        "message": "Attribution invitation sent to member."
    }
