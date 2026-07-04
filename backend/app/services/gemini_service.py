import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def is_configured(self) -> bool:
        return bool(settings.gemini_api_key)

    def client_options(self) -> dict[str, str]:
        return {"api_key": settings.gemini_api_key}

    async def generate_content(self, prompt: str) -> str:
        """
        Calls Gemini API directly using httpx.
        """
        if not self.is_configured():
            logger.warning("Gemini API key is not configured.")
            return ""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.gemini_api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(f"Gemini API returned error {response.status_code}: {response.text}")
                    return ""
                
                data = response.json()
                try:
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text
                except (KeyError, IndexError) as e:
                    logger.error(f"Error parsing Gemini response structure: {e}. Data: {data}")
                    return ""
        except Exception as e:
            logger.error(f"Exception during Gemini API request: {e}")
            return ""


gemini_service = GeminiService()
