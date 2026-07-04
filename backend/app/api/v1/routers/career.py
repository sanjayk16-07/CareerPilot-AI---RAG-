import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.career import ResumeAnalysis, CareerRoadmap, InterviewSession
from app.schemas.career import (
    ResumeAnalysisResponse,
    RoadmapRequest,
    RoadmapResponse,
    InterviewRequest,
    InterviewResponse,
    InterviewSessionInfo,
    InterviewMessage,
)
from app.services.career_service import career_service

router = APIRouter()


@router.post("/resume-analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_text: str | None = Form(None),
    resume_file: UploadFile | None = File(None),
    job_description: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = await career_service.analyze_resume(
        db, 
        current_user.id, 
        resume_text=resume_text, 
        resume_file=resume_file,
        job_description=job_description
    )
    return ResumeAnalysisResponse(
        id=analysis.id,
        score=analysis.score,
        suggestions=json.loads(analysis.suggestions),
        created_at=analysis.created_at,
    )


@router.get("/resume-analyses", response_model=list[ResumeAnalysisResponse])
def get_resume_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analyses = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )
    return [
        ResumeAnalysisResponse(
            id=a.id,
            score=a.score,
            suggestions=json.loads(a.suggestions),
            created_at=a.created_at,
        )
        for a in analyses
    ]


@router.post("/roadmap", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roadmap = await career_service.generate_roadmap(
        db, current_user.id, payload.current_skills, payload.target_role
    )
    return RoadmapResponse(
        id=roadmap.id,
        current_skills=roadmap.current_skills,
        target_role=roadmap.target_role,
        roadmap_data=json.loads(roadmap.roadmap_data),
        created_at=roadmap.created_at,
    )


@router.get("/roadmaps", response_model=list[RoadmapResponse])
def get_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roadmaps = (
        db.query(CareerRoadmap)
        .filter(CareerRoadmap.user_id == current_user.id)
        .order_by(CareerRoadmap.created_at.desc())
        .all()
    )
    return [
        RoadmapResponse(
            id=r.id,
            current_skills=r.current_skills,
            target_role=r.target_role,
            roadmap_data=json.loads(r.roadmap_data),
            created_at=r.created_at,
        )
        for r in roadmaps
    ]


@router.post("/interview", response_model=InterviewResponse)
async def start_or_reply_interview(
    payload: InterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session, evaluation, is_finished, reply = await career_service.process_interview_turn(
        db, current_user.id, payload.role_target, payload.message, payload.session_id
    )
    if reply is None:
         raise HTTPException(status_code=500, detail="Failed to process interview turn.")

    history_list = json.loads(session.history)
    history_msgs = [InterviewMessage(role=m["role"], content=m["content"]) for m in history_list]
    
    return InterviewResponse(
        session_id=session.id,
        reply=reply,
        history=history_msgs,
        evaluation=evaluation,
        is_finished=is_finished
    )


@router.get("/interview/sessions", response_model=list[InterviewSessionInfo])
def get_interview_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    return [
        InterviewSessionInfo(
            id=s.id,
            role=s.role,
            created_at=s.created_at,
        )
        for s in sessions
    ]


@router.get("/interview/sessions/{session_id}", response_model=InterviewResponse)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    history_list = json.loads(session.history)
    history_msgs = [InterviewMessage(role=m["role"], content=m["content"]) for m in history_list]
    reply = history_list[-1]["content"] if history_list else ""
    return InterviewResponse(
        session_id=session.id,
        reply=reply,
        history=history_msgs,
    )
