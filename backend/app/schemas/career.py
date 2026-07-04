from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ResumeAnalysisRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description: str | None = None


class ResumeAnalysisResponse(BaseModel):
    id: int
    score: int
    suggestions: Any
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapRequest(BaseModel):
    current_skills: str
    target_role: str


class RoadmapResponse(BaseModel):
    id: int
    current_skills: str
    target_role: str
    roadmap_data: Any
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class InterviewRequest(BaseModel):
    role_target: str
    message: str
    session_id: int | None = None


class InterviewResponse(BaseModel):
    session_id: int
    reply: str
    history: list[InterviewMessage]
    evaluation: Optional[dict[str, Any]] = None
    is_finished: bool = False

    class Config:
        from_attributes = True


class InterviewSessionInfo(BaseModel):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
