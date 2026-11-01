from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class IdentityVerificationRecord(Base):
    """
    Government & Identity Verification Record for registered talent.
    Stores minimal verification state and reference IDs without holding raw Aadhaar/biometrics.
    """
    __tablename__ = "identity_verification_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(50), default="not_started")  
    # "not_started", "pending", "in_review", "verified", "failed", "expired", "action_required", "unavailable"
    provider = Column(String(50), default="digilocker_sandbox")  
    # "digilocker_sandbox", "hyperverge_gateway", "persona_id", "nexora_trust_gateway"
    session_id = Column(String(255), nullable=True)
    provider_reference_id = Column(String(255), nullable=True)
    verification_method = Column(String(100), default="government_photo_id")  
    # "government_photo_id", "digilocker_credential", "enterprise_sso"
    disclosed_to_recruiters = Column(Boolean, default=True)  # user consent to display trust badge
    failure_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User")
    events = relationship("IdentityVerificationEvent", back_populates="record", cascade="all, delete-orphan", order_by="desc(IdentityVerificationEvent.created_at)")
    consents = relationship("IdentityConsentRecord", back_populates="record", cascade="all, delete-orphan", order_by="desc(IdentityConsentRecord.granted_at)")

class IdentityVerificationEvent(Base):
    """Audit log of state transitions and webhook payloads during identity check."""
    __tablename__ = "identity_verification_events"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("identity_verification_records.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)  
    # "session_created", "consent_granted", "provider_redirect", "webhook_received", "verification_succeeded", "verification_failed", "consent_withdrawn"
    provider_status = Column(String(100), nullable=True)
    meta_payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    record = relationship("IdentityVerificationRecord", back_populates="events")

class IdentityConsentRecord(Base):
    """User consent history for identity verification and recruitment disclosure."""
    __tablename__ = "identity_consent_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("identity_verification_records.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(100), default="government_identity_verification")
    consent_text = Column(Text, nullable=False)
    consent_version = Column(String(20), default="v1.0")
    is_active = Column(Boolean, default=True)
    ip_address = Column(String(100), nullable=True)
    granted_at = Column(DateTime, default=utc_now)
    withdrawn_at = Column(DateTime, nullable=True)

    record = relationship("IdentityVerificationRecord", back_populates="consents")
    user = relationship("User")

class IdentityAuditLog(Base):
    """Administrative and security audit trails for identity operations."""
    __tablename__ = "identity_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", foreign_keys=[user_id])
    actor = relationship("User", foreign_keys=[actor_id])
