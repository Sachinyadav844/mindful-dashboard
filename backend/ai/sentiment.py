"""
Text Sentiment Analysis using HuggingFace transformers
Model: cardiffnlp/twitter-roberta-base-sentiment
"""

import logging

logger = logging.getLogger(__name__)

# Load model ONCE at module level
_sentiment_model = None

LABEL_MAP = {
    "LABEL_0": "negative",
    "LABEL_1": "neutral",
    "LABEL_2": "positive",
}


def _get_model():
    global _sentiment_model
    if _sentiment_model is None:
        from transformers import pipeline
        _sentiment_model = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment",
            device=-1,
        )
        logger.info("Sentiment model loaded successfully")
    return _sentiment_model


def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of the given text.
    Returns: {"sentiment": "positive"|"neutral"|"negative", "confidence": float}
    """
    try:
        if not text or not text.strip():
            return {"sentiment": "neutral", "confidence": 0.5}

        model = _get_model()
        cleaned = text.strip().lower()[:512]
        result = model(cleaned)[0]

        label = LABEL_MAP.get(result["label"], "neutral")
        confidence = round(result["score"], 2)

        logger.info(f"Sentiment: {label} (confidence: {confidence})")
        return {"sentiment": label, "confidence": confidence}

    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}", exc_info=True)
        return {"sentiment": "neutral", "confidence": 0.5}
