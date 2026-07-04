import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

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


if __name__ == "__main__":
    unittest.main()
