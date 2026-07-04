import asyncio
import json
import unittest
from pathlib import Path
import sys

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


if __name__ == "__main__":
    unittest.main()
