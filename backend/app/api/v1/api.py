from fastapi import APIRouter

from app.api.v1.routers import auth, health, career, user

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(career.router, prefix="/career", tags=["career"])
api_router.include_router(user.router, prefix="/user", tags=["user"])

