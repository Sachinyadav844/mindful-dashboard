"""
Mood Score Engine & Risk Alert System
"""

import logging

logger = logging.getLogger(__name__)

EMOTION_SCORE_MAP = {
    "happy": 90,
    "surprise": 75,
    "neutral": 60,
    "sad": 30,
    "angry": 20,
    "fear": 25,
    "disgust": 20,
}

SENTIMENT_SCORE_MAP = {
    "positive": 80,
    "neutral": 60,
    "negative": 30,
}


def calculate_mood_score(emotion: str, sentiment: str) -> dict:
    """
    Calculate mood score from emotion + sentiment.
    score = (emotion_score * 0.6) + (sentiment_score * 0.4), clamped 0-100
    """
    try:
        emotion_score = EMOTION_SCORE_MAP.get(emotion.lower(), 50)
        sentiment_score = SENTIMENT_SCORE_MAP.get(sentiment.lower(), 60)

        score = round((emotion_score * 0.6) + (sentiment_score * 0.4))
        score = max(0, min(score, 100))

        # Risk assessment
        if score < 35:
            risk = "High Risk"
            category = "Needs Attention"
        elif score < 60:
            risk = "Moderate Risk"
            category = "Fair"
        else:
            risk = "Low Risk"
            category = "Good"

        logger.info(f"Mood score: {score}, Risk: {risk}")
        return {
            "score": score,
            "risk": risk,
            "category": category,
            "emotion_contribution": emotion_score,
            "sentiment_contribution": sentiment_score,
        }

    except Exception as e:
        logger.error(f"Scoring error: {e}", exc_info=True)
        return {
            "score": 50,
            "risk": "Moderate Risk",
            "category": "Fair",
            "emotion_contribution": 50,
            "sentiment_contribution": 50,
        }
