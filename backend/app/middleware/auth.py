from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.security import decode_token


class AuthContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.user_id = None
        authorization = request.headers.get("Authorization", "")

        if authorization.startswith("Bearer "):
            payload = decode_token(authorization.removeprefix("Bearer ").strip())
            if payload and payload.get("sub"):
                request.state.user_id = payload["sub"]

        return await call_next(request)

