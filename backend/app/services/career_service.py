import json
import logging
from io import BytesIO
from typing import Any

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - optional dependency fallback
    PdfReader = None

from app.models.career import ResumeAnalysis, CareerRoadmap, InterviewSession
from app.services.gemini_service import gemini_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger(__name__)


class CareerService:
    async def _extract_text_from_pdf(self, file: UploadFile) -> str:
        content = await file.read()
        if PdfReader is None:
            raise RuntimeError("PDF parsing is unavailable because the pypdf dependency is not installed.")

        reader = PdfReader(BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    async def analyze_resume(self, db: Session, user_id: int, resume_text: str | None = None, resume_file: UploadFile | None = None, job_description: str | None = None) -> ResumeAnalysis:
        """
        Analyzes a resume against an optional job description using Gemini.
        """
        if resume_file:
            try:
                resume_text = await self._extract_text_from_pdf(resume_file)
            except Exception as exc:
                logger.warning("Failed to extract text from uploaded resume: %s", exc)
                resume_text = ""

        if not resume_text:
            raise ValueError("Resume text or file is required.")

        suggestions_data = None
        score = 0

        if gemini_service.is_configured():
            prompt = (
                "You are an expert technical recruiter and resume reviewer.\n"
                f"Analyze the following resume text:\n\"\"\"\n{resume_text}\n\"\"\"\n"
            )
            if job_description:
                prompt += f"Optimize the resume to fit this Job Description:\n\"\"\"\n{job_description}\n\"\"\"\n"

            prompt += (
                "\nProvide your analysis as a valid JSON object only. Do NOT include markdown code blocks (like ```json) or any extra text. "
                "The JSON must have the following structure:\n"
                "{\n"
                "  \"score\": 82,\n"
                "  \"missing_skills\": [\"React Query\", \"Docker\"],\n"
                "  \"strengths\": [\"Strong TypeScript experience\", \"Solid foundation in Node.js\"],\n"
                "  \"improvements\": [\"Quantify achievements under professional experience\", \"Add a summary section\"],\n"
                "  \"formatting_tips\": [\"Ensure font sizes are consistent\", \"Keep the length to 1 page\"],\n"
                "  \"tailored_suggestions\": [\"Highlight your FastAPI work in the top bullet point\", \"Include keyword X from job description\"]\n"
                "}\n"
            )

            response_text = await gemini_service.generate_content(prompt)

            if response_text:
                cleaned = (
                    response_text
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

                try:
                    suggestions_data = json.loads(cleaned)
                    score = suggestions_data.get("score", 0)
                except Exception as e:
                    logger.error(f"Failed to parse Gemini response for resume analysis: {e}. Raw response: {response_text}")
        
        if suggestions_data is None:
            suggestions_data = {
                "score": max(60, min(90, len(resume_text.split()) // 8)),
                "missing_skills": [],
                "strengths": ["Resume content was received successfully."],
                "improvements": ["Add measurable results and specific tools used."],
                "formatting_tips": ["Use a clear, scannable layout."],
                "tailored_suggestions": ["Tailor the resume to the target role using the job description."],
            }
            score = suggestions_data.get("score", 0)

        # Create record in DB
        analysis = ResumeAnalysis(
            user_id=user_id,
            resume_text=resume_text,
            job_description=job_description,
            score=score,
            suggestions=json.dumps(suggestions_data)
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis


    def _parse_roadmap_payload(self, response_text: str) -> dict[str, Any]:
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            roadmap_data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse Gemini response for roadmap: %s", exc)
            raise ValueError("Gemini returned an invalid roadmap payload.") from exc

        if not isinstance(roadmap_data, dict):
            raise ValueError("Gemini returned an invalid roadmap payload.")

        steps = roadmap_data.get("steps")
        if not isinstance(steps, list) or not steps:
            raise ValueError("Gemini roadmap payload is missing steps.")

        return roadmap_data

    async def generate_roadmap(self, db: Session, user_id: int, current_skills: str, target_role: str) -> CareerRoadmap:
        """
        Generates a personalized step-by-step career path roadmap using Gemini.
        """
        if not gemini_service.is_configured():
            raise HTTPException(status_code=503, detail="Gemini roadmap generation is unavailable right now.")

        prompt = (
            "You are an expert career coach and technical recruiter.\n"
            "Create a personalized roadmap that is unique to the user's background and target role.\n"
            f"Current skills: {current_skills}\n"
            f"Target role: {target_role}\n"
            "Requirements:\n"
            "- Tailor the plan to the gap between the user's current skills and the target role.\n"
            "- Make the roadmap distinct, practical, and specific to the role.\n"
            "- Include a realistic timeframe, a difficulty level, and 4-6 phases.\n"
            "- Each phase must include title, description, skills to acquire, projects to build, certifications, resources, and interview preparation topics.\n"
            "- Do not reuse generic boilerplate.\n"
            "Provide your roadmap as a valid JSON object only. Do NOT include markdown code blocks or any extra text.\n"
            "The JSON must have the following structure:\n"
            "{\n"
            "  \"role\": \"Target Role\",\n"
            "  \"timeframe\": \"e.g., 6 Months\",\n"
            "  \"difficulty\": \"e.g., Intermediate\",\n"
            "  \"steps\": [\n"
            "    {\n"
            "      \"phase\": \"Phase Name\",\n"
            "      \"title\": \"Title\",\n"
            "      \"description\": \"Description\",\n"
            "      \"skills_to_acquire\": [\"Skill 1\"],\n"
            "      \"projects_to_build\": [\"Project 1\"],\n"
            "      \"certifications\": [\"Cert 1\"],\n"
            "      \"resources\": [\"Resource 1\"],\n"
            "      \"interview_prep\": [\"Prep topic 1\"]\n"
            "    }\n"
            "  ]\n"
            "}\n"
        )

        response_text = await gemini_service.generate_content(prompt)
        if not response_text:
            raise HTTPException(status_code=502, detail="Gemini roadmap generation failed. Please try again.")

        try:
            roadmap_data = self._parse_roadmap_payload(response_text)
        except ValueError as exc:
            logger.error("Failed to parse Gemini roadmap response: %s", exc)
            raise HTTPException(status_code=502, detail="Gemini returned an invalid roadmap format.") from exc

        roadmap = CareerRoadmap(
            user_id=user_id,
            current_skills=current_skills,
            target_role=target_role,
            roadmap_data=json.dumps(roadmap_data)
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        return roadmap

    async def get_or_create_interview_session(self, db: Session, user_id: int, role_target: str, session_id: int | None = None) -> InterviewSession:
        """
        Gets an existing interview session or starts a new one.
        """
        if session_id:
            session = db.query(InterviewSession).filter(
                InterviewSession.id == session_id,
                InterviewSession.user_id == user_id
            ).first()
            if session:
                return session

        # Start a new session
        initial_history = [
            {
                "role": "assistant",
                "content": f"Hi there! Welcome to your mock interview for the {role_target} position. Let's start! Can you tell me a little about yourself and your experience related to this role?"
            }
        ]

        session = InterviewSession(
            user_id=user_id,
            role=role_target,
            history=json.dumps(initial_history)
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def _build_retrieval_query(self, history: list[dict[str, str]], role_target: str) -> str:
        user_messages = [item["content"] for item in history if item.get("role") == "user"]
        if not user_messages:
            return role_target

        recent_messages = user_messages[-3:]
        latest = " ".join(message.strip() for message in recent_messages if message.strip())
        if not latest:
            return role_target

        return f"{role_target} {latest}".strip()

    async def process_interview_turn(self, db: Session, user_id: int, role_target: str, message: str, session_id: int | None = None) -> tuple[InterviewSession, dict[str, Any], bool, str | None]:
        """
        Processes an interview turn: evaluates answer, generates next question/report.
        """
        session = await self.get_or_create_interview_session(db, user_id, role_target, session_id)
        history = json.loads(session.history)

        # Append user message
        history.append({"role": "user", "content": message})

        retrieved_chunks = vector_store_service.search(self._build_retrieval_query(history, role_target), top_k=4)
        recent_history = history[-6:]
        context_text = self._format_context(retrieved_chunks)

        prompt = f"""
        You are an expert interviewer and career coach for the role of {role_target}.

        Use the knowledge base context below to ground your feedback. If the context is weak or missing, still answer helpfully based on the conversation and the target role.

        Knowledge base context:
        {context_text}

        Conversation history:
        {json.dumps(recent_history, indent=2)}

        Task:
        1. Evaluate the user's latest answer with a score from 1-10 and concise feedback.
        2. Ask the next interview question that feels natural and specific to the role.
        3. After 5 questions, stop the interview and generate a final assessment summary.

        Return ONLY valid JSON.

        {{
          "evaluation": {{
            "score": 8,
            "feedback": "..."
          }},
          "next_question": "...",
          "is_finished": false,
          "final_report": null
        }}
        """

        try:
            response_text = await gemini_service.generate_content(prompt)
            cleaned = response_text.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned)
        except Exception as e:
            logger.error("Error in interview processing: %s", e)
            result = {
                "evaluation": {"score": 5, "feedback": "Your answer was received, but the interviewer could not generate a detailed response. Please continue and share more specifics."},
                "next_question": self._build_fallback_question(role_target, message),
                "is_finished": False,
                "final_report": None,
            }

        reply = result.get("next_question") or result.get("final_report") or self._build_fallback_question(role_target, message)
        is_finished = bool(result.get("is_finished", False))
        evaluation = result.get("evaluation") or {"score": 5, "feedback": "Keep going and provide more detail about your experience."}
        final_report = result.get("final_report")

        history.append({"role": "assistant", "content": reply})
        session.history = json.dumps(history)
        if is_finished:
            session.is_active = False
            session.final_report = json.dumps(final_report)
        db.add(session)
        db.commit()
        db.refresh(session)

        return session, evaluation, is_finished, reply

    def _format_context(self, retrieved_chunks: list[object]) -> str:
        if not retrieved_chunks:
            return "No relevant context found."

        formatted_chunks = []
        for chunk in retrieved_chunks:
            if hasattr(chunk, "text") and chunk.text:
                formatted_chunks.append(f"Source: {getattr(chunk, 'source_name', 'unknown')}\n{chunk.text}")
        return "\n\n".join(formatted_chunks) if formatted_chunks else "No relevant context found."

    def _build_fallback_question(self, role_target: str, message: str) -> str:
        normalized = message.strip()
        if not normalized:
            return f"Tell me about your experience relevant to the {role_target} role and the impact you made."
        return f"Thanks for sharing that. Can you describe a project where you used those skills and the results you delivered for the {role_target} role?"


career_service = CareerService()
