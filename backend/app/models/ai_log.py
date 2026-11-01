from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)  # "gemini", "grok", "heuristic"
    model = Column(String(100), nullable=False)
    task_type = Column(String(100), nullable=False)  # "job_extraction", "profile_analysis", "project_relevance", "match_explanation"
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    status = Column(String(50), default="success")  # "success", "error", "fallback"
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # "LOGIN", "REGISTER", "JOB_PUBLISHED", "APPLICATION_SUBMITTED", "MATCH_CALCULATED"
    target_type = Column(String(100), nullable=True)
    target_id = Column(Integer, nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="audit_logs")
