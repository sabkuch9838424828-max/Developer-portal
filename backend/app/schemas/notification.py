from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    meta_data: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationPreferenceResponse(BaseModel):
    email_enabled: bool
    in_app_enabled: bool
    min_match_score: int
    notify_on_interview: bool
    notify_on_application_update: bool

    class Config:
        from_attributes = True

class NotificationPreferenceUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    min_match_score: Optional[int] = None
    notify_on_interview: Optional[bool] = None
    notify_on_application_update: Optional[bool] = None

class AdminStatsResponse(BaseModel):
    total_users: int
    total_recruiters: int
    total_talents: int
    total_teams: int
    total_jobs: int
    published_jobs: int
    total_matches_generated: int
    total_applications: int
    ai_requests_count: int
    ai_success_rate: float
    selected_ai_provider: str
    selected_ai_model: str

class AIStatusResponse(BaseModel):
    selected_provider: str
    selected_model: str
    connection_status: str
    average_latency_ms: float
    total_requests: int
    success_count: int
    error_count: int
    algorithm_version: str
    match_threshold: int
