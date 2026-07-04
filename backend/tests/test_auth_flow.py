import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import Base, engine
from app.main import app


class AuthFlowTests(unittest.TestCase):
    def setUp(self) -> None:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)

    def test_register_login_me_forgot_reset_and_invalid_token(self) -> None:
        register_resp = self.client.post(
            "/api/v1/auth/register",
            json={
                "email": "user@example.com",
                "password": "StrongPass123",
                "full_name": "Test User",
            },
        )
        self.assertEqual(register_resp.status_code, 201)
        self.assertIn("access_token", register_resp.json())

        login_resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "StrongPass123"},
        )
        self.assertEqual(login_resp.status_code, 200)
        token = login_resp.json()["access_token"]

        me_resp = self.client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["email"], "user@example.com")

        forgot_resp = self.client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "user@example.com"},
        )
        self.assertEqual(forgot_resp.status_code, 200)
        self.assertIn("reset_token", forgot_resp.json())

        reset_resp = self.client.post(
            "/api/v1/auth/reset-password",
            json={"token": forgot_resp.json()["reset_token"], "password": "NewStrongPass123"},
        )
        self.assertEqual(reset_resp.status_code, 200)

        invalid_token_resp = self.client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        self.assertEqual(invalid_token_resp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
