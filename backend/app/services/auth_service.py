from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.user import UserCreate


class AuthService:
    def hash_password(self, password: str) -> str:
        return get_password_hash(password)

    def verify_credentials(self, password: str, hashed_password: str) -> bool:
        return verify_password(password, hashed_password)

    def authenticate(self, db: Session, email: str, password: str) -> User | None:
        user = user_repository.get_by_email(db, email.lower())
        if not user or not user.is_active:
            return None

        if not self.verify_credentials(password, user.hashed_password):
            return None

        return user

    def register(self, db: Session, user_in: UserCreate) -> User:
        hashed_password = self.hash_password(user_in.password)
        return user_repository.create(db, user_in, hashed_password)


auth_service = AuthService()
