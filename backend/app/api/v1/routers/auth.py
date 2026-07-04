from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, create_password_reset_token
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.token import Token
from app.schemas.user import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserRead,
)
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Token:
    existing_user = user_repository.get_by_email(db, user_in.email.lower())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = auth_service.register(db, user_in)
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = auth_service.authenticate(db, credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return Token(access_token=create_access_token(str(user.id)))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> None:
    return None


@router.get("/me", response_model=UserRead)
def read_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    user = user_repository.get_by_email(db, request.email.lower())
    if user is None:
        return ForgotPasswordResponse(
            message="If an account exists, password reset instructions are available."
        )

    reset_token = create_password_reset_token(str(user.id))
    return ForgotPasswordResponse(
        message="Password reset token generated.",
        reset_token=reset_token,
    )


@router.post("/reset-password", response_model=UserRead)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> User:
    from app.core.security import decode_token

    payload = decode_token(request.token)
    if not payload or payload.get("purpose") != "password_reset" or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    try:
        user_id = int(payload["sub"])
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        ) from exc

    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user_repository.update_password(db, user, auth_service.hash_password(request.password))
