"""
Mental Health Chatbot using Google Gemini API
Strictly scoped to emotional well-being topics.
"""

import os
import logging
import requests

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a compassionate mental health assistant called MentalMass AI. "
    "You ONLY respond to topics related to emotional well-being, mental health, "
    "stress management, anxiety, depression, mindfulness, self-care, and wellness. "
    "If a user asks about anything unrelated (e.g., coding, math, politics, sports), "
    "politely redirect them by saying: 'I'm here to support your mental well-being. "
    "Could you share how you're feeling today?' "
    "Never provide medical diagnoses. Always encourage professional help for serious concerns. "
    "Keep responses warm, empathetic, and concise (under 200 words)."
)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def get_chatbot_response(message: str) -> dict:
    """
    Get a response from Gemini API scoped to mental health topics.
    """
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not set")
            return {
                "reply": "I'm currently unavailable. Please try again later.",
                "success": False,
            }

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser: {message}"}],
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 512,
            },
        }

        response = requests.post(
            f"{GEMINI_API_URL}?key={api_key}",
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return {
                "reply": "I'm having trouble connecting right now. Please try again.",
                "success": False,
            }

        data = response.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]

        return {"reply": reply.strip(), "success": True}

    except Exception as e:
        logger.error(f"Chatbot error: {e}", exc_info=True)
        return {
            "reply": "I'm sorry, something went wrong. Please try again later.",
            "success": False,
        }
