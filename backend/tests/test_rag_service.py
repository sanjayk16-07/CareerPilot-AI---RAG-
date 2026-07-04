import asyncio
import json
import unittest
from pathlib import Path
import sys
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import Base
from app.services.career_service import career_service
from app.services.vector_store import vector_store_service


class RAGServiceTests(unittest.TestCase):
    def test_indexing_and_retrieval_use_sources(self):
        vector_store_service.reset()
        indexed = vector_store_service.index_documents()
        self.assertGreater(indexed, 0)

        results = vector_store_service.search("What does CareerPilot AI do?", top_k=3)
        self.assertGreaterEqual(len(results), 1)
        self.assertTrue(results[0].source_name)

    def test_unknown_queries_return_known_fallback(self):
        vector_store_service.reset()
        vector_store_service.index_documents()

        results = vector_store_service.search("totally unrelated topic about dragons", top_k=3)
        self.assertEqual(results, [])

    def test_resume_analysis_falls_back_when_gemini_is_unavailable(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)

        db = Session()
        try:
            analysis = asyncio.run(
                career_service.analyze_resume(
                    db,
                    user_id=1,
                    resume_text="Experienced Python developer with FastAPI and React experience.",
                )
            )
            self.assertGreaterEqual(analysis.score, 0)
            parsed = json.loads(analysis.suggestions)
            self.assertIn("strengths", parsed)
            self.assertIn("improvements", parsed)
        finally:
            db.close()

    def test_roadmap_generation_requires_gemini_configuration(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)

        db = Session()
        try:
            with patch("app.services.career_service.gemini_service.is_configured", return_value=False):
                with self.assertRaises(HTTPException) as ctx:
                    asyncio.run(
                        career_service.generate_roadmap(
                            db,
                            user_id=1,
                            current_skills="Python, FastAPI",
                            target_role="Machine Learning Engineer",
                        )
                    )
            self.assertEqual(ctx.exception.status_code, 503)
        finally:
            db.close()

    def test_interview_turn_returns_fallback_when_gemini_is_empty(self):
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=engine)
        Session = sessionmaker(bind=engine)

        db = Session()
        try:
            with patch("app.services.career_service.gemini_service.generate_content", new=AsyncMock(return_value="")):
                session, evaluation, is_finished, reply = asyncio.run(
                    career_service.process_interview_turn(
                        db,
                        user_id=1,
                        role_target="Software Engineer",
                        message="I have worked with Python and SQL.",
                    )
                )

            self.assertTrue(reply)
            self.assertFalse(is_finished)
            self.assertIsNotNone(session.history)
            self.assertIsNotNone(evaluation)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
