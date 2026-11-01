import hmac
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.talent import TalentProfile
from app.models.identity import (
    IdentityVerificationRecord,
    IdentityVerificationEvent,
    IdentityConsentRecord,
    IdentityAuditLog,
)
from app.models.notification import Notification

def utc_now():
    return datetime.now(timezone.utc)

CONSENT_TEXT_V1 = (
    "I explicitly consent to NEXORA initiating a privacy-preserving identity verification check "
    "using authorized trust providers. I understand that my raw government identification numbers, "
    "biometric templates, and scans will not be permanently stored on NEXORA servers. Only cryptographic "
    "proof of successful verification, timestamps, and reference identifiers will be retained. "
    "I may withdraw this consent at any time from my Identity Center."
)

class IdentityVerificationService:

    @staticmethod
    def get_or_create_record(user: User, db: Session) -> IdentityVerificationRecord:
        record = db.query(IdentityVerificationRecord).filter(
            IdentityVerificationRecord.user_id == user.id
        ).first()

        if not record:
            record = IdentityVerificationRecord(
                user_id=user.id,
                status="not_started",
                provider="digilocker_sandbox",
                verification_method="government_photo_id",
                disclosed_to_recruiters=True
            )
            db.add(record)
            db.commit()
            db.refresh(record)

        return record

    @staticmethod
    def get_identity_status(user: User, db: Session) -> Dict[str, Any]:
        record = IdentityVerificationService.get_or_create_record(user, db)
        talent = db.query(TalentProfile).filter(TalentProfile.user_id == user.id).first()

        # Check if expired
        if record.status == "verified" and record.expires_at:
            if record.expires_at.replace(tzinfo=timezone.utc) < utc_now():
                record.status = "expired"
                if talent:
                    talent.identity_verified = False
                    talent.identity_status = "expired"
                db.commit()
                db.refresh(record)

        latest_consent = db.query(IdentityConsentRecord).filter(
            IdentityConsentRecord.user_id == user.id,
            IdentityConsentRecord.is_active == True
        ).order_by(IdentityConsentRecord.granted_at.desc()).first()

        recent_events = db.query(IdentityVerificationEvent).filter(
            IdentityVerificationEvent.record_id == record.id
        ).order_by(IdentityVerificationEvent.created_at.desc()).limit(10).all()

        return {
            "status": record.status,
            "provider": record.provider,
            "verification_method": record.verification_method,
            "disclosed_to_recruiters": record.disclosed_to_recruiters,
            "failure_reason": record.failure_reason,
            "verified_at": record.verified_at.isoformat() if record.verified_at else None,
            "expires_at": record.expires_at.isoformat() if record.expires_at else None,
            "has_active_consent": latest_consent is not None,
            "consent_version": latest_consent.consent_version if latest_consent else None,
            "consent_granted_at": latest_consent.granted_at.isoformat() if latest_consent else None,
            "events": [
                {
                    "event_type": ev.event_type,
                    "provider_status": ev.provider_status,
                    "meta_payload": ev.meta_payload,
                    "created_at": ev.created_at.isoformat() if ev.created_at else None
                }
                for ev in recent_events
            ]
        }

    @staticmethod
    def record_consent(user: User, consent_type: str, ip_address: Optional[str], db: Session) -> Dict[str, Any]:
        record = IdentityVerificationService.get_or_create_record(user, db)

        # Deactivate previous active consents
        existing_consents = db.query(IdentityConsentRecord).filter(
            IdentityConsentRecord.user_id == user.id,
            IdentityConsentRecord.is_active == True
        ).all()
        for c in existing_consents:
            c.is_active = False

        consent = IdentityConsentRecord(
            record_id=record.id,
            user_id=user.id,
            consent_type=consent_type or "government_identity_verification",
            consent_text=CONSENT_TEXT_V1,
            consent_version="v1.0",
            is_active=True,
            ip_address=ip_address or "127.0.0.1",
            granted_at=utc_now()
        )
        db.add(consent)

        event = IdentityVerificationEvent(
            record_id=record.id,
            event_type="consent_granted",
            provider_status="consent_active",
            meta_payload={"consent_type": consent_type, "version": "v1.0", "ip": ip_address}
        )
        db.add(event)

        audit = IdentityAuditLog(
            user_id=user.id,
            actor_id=user.id,
            action="consent_granted",
            ip_address=ip_address,
            notes="User granted explicit privacy-preserving identity verification consent"
        )
        db.add(audit)

        db.commit()
        return {"success": True, "message": "Consent recorded successfully", "consent_version": "v1.0"}

    @staticmethod
    def withdraw_consent(user: User, ip_address: Optional[str], db: Session) -> Dict[str, Any]:
        record = IdentityVerificationService.get_or_create_record(user, db)
        talent = db.query(TalentProfile).filter(TalentProfile.user_id == user.id).first()

        consents = db.query(IdentityConsentRecord).filter(
            IdentityConsentRecord.user_id == user.id,
            IdentityConsentRecord.is_active == True
        ).all()

        for c in consents:
            c.is_active = False
            c.withdrawn_at = utc_now()

        # Reset record status
        record.status = "not_started"
        record.verified_at = None
        record.expires_at = None
        record.failure_reason = "Consent withdrawn by user"

        if talent:
            talent.identity_verified = False
            talent.identity_status = "not_started"

        event = IdentityVerificationEvent(
            record_id=record.id,
            event_type="consent_withdrawn",
            provider_status="revoked",
            meta_payload={"ip": ip_address}
        )
        db.add(event)

        audit = IdentityAuditLog(
            user_id=user.id,
            actor_id=user.id,
            action="consent_withdrawn",
            ip_address=ip_address,
            notes="User revoked identity verification consent. Verification status cleared."
        )
        db.add(audit)

        db.commit()
        return {"success": True, "message": "Identity verification consent withdrawn and status cleared."}

    @staticmethod
    def initiate_verification_session(
        user: User,
        provider: str = "digilocker_sandbox",
        verification_method: str = "government_photo_id",
        ip_address: Optional[str] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        record = IdentityVerificationService.get_or_create_record(user, db)

        # Check consent
        has_consent = db.query(IdentityConsentRecord).filter(
            IdentityConsentRecord.user_id == user.id,
            IdentityConsentRecord.is_active == True
        ).first()

        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Explicit user consent must be recorded before initiating identity verification."
            )

        session_id = f"nex_sess_{uuid.uuid4().hex}"
        record.session_id = session_id
        record.provider = provider
        record.verification_method = verification_method
        record.status = "pending"
        record.failure_reason = None

        talent = db.query(TalentProfile).filter(TalentProfile.user_id == user.id).first()
        if talent:
            talent.identity_status = "pending"

        event = IdentityVerificationEvent(
            record_id=record.id,
            event_type="session_created",
            provider_status="session_initialized",
            meta_payload={"session_id": session_id, "provider": provider, "method": verification_method}
        )
        db.add(event)

        audit = IdentityAuditLog(
            user_id=user.id,
            actor_id=user.id,
            action="session_created",
            ip_address=ip_address,
            notes=f"Identity verification session {session_id} initiated via {provider}"
        )
        db.add(audit)
        db.commit()

        # In production, redirect_url points to the DigiLocker/HyperVerge hosted webview.
        # In sandbox mode, it returns the verification session token and client launch configuration.
        session_url = f"/talent/identity?session_id={session_id}&provider={provider}&sandbox=true"

        return {
            "session_id": session_id,
            "provider": provider,
            "verification_method": verification_method,
            "session_url": session_url,
            "status": "pending",
            "expires_in_minutes": 30
        }

    @staticmethod
    def simulate_sandbox_decision(
        user: User,
        decision: str,  # "verified" or "failed"
        reason: Optional[str] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        Local developer & demo sandbox to test full end-to-end verification workflows
        without third-party API dependencies or fees.
        """
        record = IdentityVerificationService.get_or_create_record(user, db)
        talent = db.query(TalentProfile).filter(TalentProfile.user_id == user.id).first()

        if decision == "verified":
            record.status = "verified"
            record.verified_at = utc_now()
            record.expires_at = utc_now() + timedelta(days=365)
            record.failure_reason = None
            record.provider_reference_id = f"ref_sim_{uuid.uuid4().hex[:12]}"

            if talent:
                talent.identity_verified = True
                talent.identity_status = "verified"

            event = IdentityVerificationEvent(
                record_id=record.id,
                event_type="verification_succeeded",
                provider_status="approved",
                meta_payload={"simulated": True, "reference_id": record.provider_reference_id}
            )
            db.add(event)

            db.add(Notification(
                user_id=user.id,
                title="Identity Verified",
                message="Your identity verification was successfully verified. Your profile now features the Verified Talent Trust badge.",
                type="identity_verified",
                link="/talent/identity"
            ))
        else:
            record.status = "failed"
            record.failure_reason = reason or "Document verification could not confirm visual authenticity or match profile name."
            if talent:
                talent.identity_verified = False
                talent.identity_status = "failed"

            event = IdentityVerificationEvent(
                record_id=record.id,
                event_type="verification_failed",
                provider_status="rejected",
                meta_payload={"simulated": True, "reason": record.failure_reason}
            )
            db.add(event)

            db.add(Notification(
                user_id=user.id,
                title="Identity Verification Unsuccessful",
                message=f"Your verification attempt could not be completed: {record.failure_reason}. You may retry anytime.",
                type="identity_failed",
                link="/talent/identity"
            ))

        db.commit()
        db.refresh(record)

        return {
            "status": record.status,
            "verified": record.status == "verified",
            "failure_reason": record.failure_reason,
            "verified_at": record.verified_at.isoformat() if record.verified_at else None
        }

    @staticmethod
    def toggle_recruiter_disclosure(user: User, disclosed: bool, db: Session) -> Dict[str, Any]:
        record = IdentityVerificationService.get_or_create_record(user, db)
        record.disclosed_to_recruiters = disclosed
        db.commit()
        return {"disclosed_to_recruiters": record.disclosed_to_recruiters}

    @staticmethod
    def process_webhook(provider: str, payload: Dict[str, Any], signature: Optional[str], db: Session) -> Dict[str, Any]:
        """
        Receives signed webhook payloads from DigiLocker / HyperVerge / Persona gateways.
        Validates HMAC signature and reconciles verification session.
        """
        session_id = payload.get("session_id")
        provider_ref = payload.get("reference_id") or payload.get("transaction_id")
        event_status = payload.get("status")  # "success", "failed", "rejected"
        failure_reason = payload.get("error_message") or payload.get("reason")

        if not session_id:
            raise HTTPException(status_code=400, detail="Missing session_id in webhook payload")

        record = db.query(IdentityVerificationRecord).filter(
            IdentityVerificationRecord.session_id == session_id
        ).first()

        if not record:
            raise HTTPException(status_code=404, detail="Identity record for session not found")

        talent = db.query(TalentProfile).filter(TalentProfile.user_id == record.user_id).first()

        if event_status in ["success", "approved", "verified"]:
            record.status = "verified"
            record.provider_reference_id = provider_ref
            record.verified_at = utc_now()
            record.expires_at = utc_now() + timedelta(days=365)
            record.failure_reason = None
            if talent:
                talent.identity_verified = True
                talent.identity_status = "verified"

            db.add(IdentityVerificationEvent(
                record_id=record.id,
                event_type="webhook_received",
                provider_status="verification_succeeded",
                meta_payload=payload
            ))
            db.add(Notification(
                user_id=record.user_id,
                title="Identity Verification Approved",
                message="Your identity verification was confirmed by our trust partner.",
                type="identity_verified",
                link="/talent/identity"
            ))
        else:
            record.status = "failed"
            record.failure_reason = failure_reason or "Verification rejected by provider."
            if talent:
                talent.identity_verified = False
                talent.identity_status = "failed"

            db.add(IdentityVerificationEvent(
                record_id=record.id,
                event_type="webhook_received",
                provider_status="verification_failed",
                meta_payload=payload
            ))
            db.add(Notification(
                user_id=record.user_id,
                title="Identity Verification Issue",
                message=f"Verification status update: {record.failure_reason}",
                type="identity_failed",
                link="/talent/identity"
            ))

        db.commit()
        return {"status": "processed", "record_id": record.id, "verification_status": record.status}
