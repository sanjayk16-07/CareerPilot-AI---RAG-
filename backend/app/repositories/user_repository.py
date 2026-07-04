from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        return db.get(User, user_id)

    def create(self, db: Session, user_in: UserCreate, hashed_password: str) -> User:
        user = User(
            email=user_in.email.lower(),
            full_name=user_in.full_name,
            hashed_password=hashed_password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update_password(self, db: Session, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_repository = UserRepository()
