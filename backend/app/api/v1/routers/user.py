from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.career import ResumeAnalysis, CareerRoadmap, InterviewSession
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()


@router.get("/profile", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/profile", response_model=UserRead)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/profile/stats")
def get_profile_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_avg = db.query(func.avg(ResumeAnalysis.score)).filter(ResumeAnalysis.user_id == current_user.id).scalar() or 0
    
    # We don't have a direct interview score field in the model yet, need to aggregate from history? 
    # Or maybe we can add a score field to InterviewSession later. For now, assume 0.
    
    return {
        "resume_average": round(resume_avg, 1),
        "roadmap_count": db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).count(),
        "interview_count": db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).count(),
    }
