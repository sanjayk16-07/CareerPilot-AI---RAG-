from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings


@dataclass
class RetrievedChunk:
    text: str
    source_name: str
    source_path: str
    score: float | None = None


class VectorStoreService:
    def __init__(self) -> None:
        self.collection_name = "careerpilot_kb"
        self._client: chromadb.PersistentClient | None = None
        self._collection: Any | None = None

    @property
    def persist_directory(self) -> Path:
        return Path(settings.chroma_persist_directory)

    @property
    def repo_root(self) -> Path:
        return Path(__file__).resolve().parents[3]

    def ensure_storage(self) -> Path:
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        return self.persist_directory

    def _get_client(self) -> chromadb.PersistentClient:
        if self._client is None:
            self.ensure_storage()
            self._client = chromadb.PersistentClient(
                path=str(self.persist_directory),
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        return self._client

    def _get_collection(self) -> Any:
        if self._collection is None:
            try:
                from chromadb.utils import embedding_functions

                embedding_function = embedding_functions.DefaultEmbeddingFunction()
            except Exception:
                embedding_function = None

            self._collection = self._get_client().get_or_create_collection(
                name=self.collection_name,
                embedding_function=embedding_function,
            )
        return self._collection

    def reset(self) -> None:
        try:
            self._get_client().delete_collection(self.collection_name)
        except Exception:
            pass
        self._collection = None

    def _documents_to_index(self) -> list[tuple[Path, str]]:
        candidate_files = [
            self.repo_root / "README.md",
            self.repo_root / "docs" / "api.md",
            self.repo_root / "docs" / "architecture.md",
            self.repo_root / "docs" / "chat-transcript.md",
        ]
        documents: list[tuple[Path, str]] = []
        for path in candidate_files:
            if path.exists():
                documents.append((path, path.read_text(encoding="utf-8", errors="ignore")))
        return documents

    def _chunk_text(self, text: str, max_chars: int = 700) -> list[str]:
        paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
        chunks: list[str] = []
        current = ""

        for paragraph in paragraphs:
            normalized = re.sub(r"\s+", " ", paragraph).strip()
            if not normalized:
                continue
            if current and len(current) + len(normalized) + 1 <= max_chars:
                current = f"{current} {normalized}"
            else:
                if current:
                    chunks.append(current)
                current = normalized

        if current:
            chunks.append(current)
        return chunks or [text[:max_chars]]

    def index_documents(self) -> int:
        self.reset()
        collection = self._get_collection()
        documents_to_add: list[str] = []
        metadatas: list[dict[str, Any]] = []
        ids: list[str] = []

        for path, content in self._documents_to_index():
            for index, chunk in enumerate(self._chunk_text(content)):
                documents_to_add.append(chunk)
                metadatas.append(
                    {
                        "source_name": path.name,
                        "source_path": str(path),
                        "chunk_index": index,
                    }
                )
                ids.append(f"{path.stem}-{index}")

        if documents_to_add:
            collection.add(documents=documents_to_add, metadatas=metadatas, ids=ids)
        return len(documents_to_add)

    def search(self, query: str, top_k: int = 6) -> list[RetrievedChunk]:
        if not query or not query.strip():
            return []
        if not self._has_domain_context(query):
            return []

        collection = self._get_collection()
        if collection.count() == 0:
            self.index_documents()

        try:
            results = collection.query(query_texts=[query], n_results=min(max(top_k, 4), 6))
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            retrieved: list[RetrievedChunk] = []
            for document, metadata, distance in zip(documents, metadatas, distances, strict=False):
                if not document:
                    continue
                similarity = self._distance_to_similarity(distance)
                if similarity < 0.15 and self._lexical_overlap(query, document) < 0.25:
                    continue
                retrieved.append(
                    RetrievedChunk(
                        text=document,
                        source_name=str(metadata.get("source_name", "unknown")),
                        source_path=str(metadata.get("source_path", "")),
                        score=similarity,
                    )
                )
            return retrieved[:top_k]
        except Exception:
            return self._lexical_search(query, top_k)

    def _lexical_search(self, query: str, top_k: int) -> list[RetrievedChunk]:
        scored: list[tuple[float, RetrievedChunk]] = []
        for path, content in self._documents_to_index():
            for chunk in self._chunk_text(content):
                overlap = self._lexical_overlap(query, chunk)
                if overlap > 0.25:
                    scored.append(
                        (
                            overlap,
                            RetrievedChunk(
                                text=chunk,
                                source_name=path.name,
                                source_path=str(path),
                                score=overlap,
                            ),
                        )
                    )

        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[:top_k]]

    def _has_domain_context(self, query: str) -> bool:
        query_terms = set(re.findall(r"[a-z0-9]+", query.lower()))
        domain_terms = {
            "career",
            "careerpilot",
            "resume",
            "roadmap",
            "interview",
            "job",
            "skills",
            "profile",
            "ai",
            "gemini",
            "rag",
            "backend",
            "frontend",
            "project",
        }
        return bool(query_terms & domain_terms)

    def _lexical_overlap(self, query: str, document: str) -> float:
        query_terms = set(re.findall(r"[a-z0-9]+", query.lower()))
        document_terms = set(re.findall(r"[a-z0-9]+", document.lower()))
        if not query_terms:
            return 0.0
        overlap = len(query_terms & document_terms)
        return overlap / max(1, len(query_terms))

    def _distance_to_similarity(self, distance: float | None) -> float:
        if distance is None:
            return 0.0
        return max(0.0, min(1.0, 1.0 / (1.0 + float(distance))))


vector_store_service = VectorStoreService()

