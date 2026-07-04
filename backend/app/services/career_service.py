import json
import logging
from io import BytesIO
from pypdf import PdfReader
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.models.career import ResumeAnalysis, CareerRoadmap, InterviewSession
from app.services.gemini_service import gemini_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger(__name__)


class CareerService:
    async def _extract_text_from_pdf(self, file: UploadFile) -> str:
        content = await file.read()
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
            resume_text = await self._extract_text_from_pdf(resume_file)
        
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

            if not response_text:
                raise HTTPException(status_code=500, detail="Gemini returned no response.")

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
                raise HTTPException(status_code=500, detail="Failed to analyze resume.")
        else:
            raise HTTPException(status_code=500, detail="Gemini AI is not configured.")

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


    async def generate_roadmap(self, db: Session, user_id: int, current_skills: str, target_role: str) -> CareerRoadmap:
        """
        Generates a step-by-step career path roadmap using Gemini.
        """
        if not gemini_service.is_configured():
            raise HTTPException(status_code=500, detail="Gemini AI is not configured.")

        prompt = (
            "You are an expert career coach.\n"
            f"Create a comprehensive step-by-step career roadmap for a user transitioning from skills:\n\"{current_skills}\"\n"
            f"to the target role: \"{target_role}\".\n"
            "Include:\n"
            "- A realistic timeframe.\n"
            "- Complexity level.\n"
            "- Detailed phases with:\n"
            "  - Phase title and description.\n"
            "  - Specific skills to acquire.\n"
            "  - Recommended projects to build.\n"
            "  - Suggested certifications.\n"
            "  - Recommended resources (links not required, just names).\n"
            "- Specific interview preparation topics.\n"
            "\nProvide your roadmap as a valid JSON object only. Do NOT include markdown code blocks or any extra text. "
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
            raise HTTPException(status_code=500, detail="Failed to generate roadmap.")

        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            roadmap_data = json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse Gemini response for roadmap: {e}. Raw response: {response_text}")
            raise HTTPException(status_code=500, detail="Failed to parse roadmap.")

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
        latest = user_messages[-1]
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

        prompt = f"""
        You are an expert interviewer for the role of {role_target}.

        Knowledge base context:
        {self._format_context(retrieved_chunks)}

        Conversation history:
        {json.dumps(history[-6:], indent=2)}

        1. Evaluate the user's latest answer (if present) with a score from 1-10 and feedback.
        2. Ask the next interview question.
        3. After 5 questions, stop the interview and generate a final assessment.

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
            logger.error(f"Error in interview processing: {e}")
            return session, {"score": 0, "feedback": "Error processing answer"}, False, None

        reply = result.get("next_question") or result.get("final_report") or ""
        is_finished = result.get("is_finished", False)
        evaluation = result.get("evaluation")
        final_report = result.get("final_report")

        # Append assistant reply
        history.append({"role": "assistant", "content": reply})

        # Save to database
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

        formatted_chunks = [chunk.text for chunk in retrieved_chunks]
        return "\n\n".join(formatted_chunks)


career_service = CareerService()
