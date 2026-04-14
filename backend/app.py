"""
MENTALMASS - AI-Driven Mental Wellness Backend
Flask API server with real AI models
"""

import os
import base64
import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ── AI modules (lazy-loaded internally) ──────────────────────────
from ai.emotion import analyze_emotion
from ai.sentiment import analyze_sentiment
from ai.scoring import calculate_mood_score
from ai.chatbot import get_chatbot_response


# ── Health Check ─────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "MENTALMASS AI Backend is running"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "emotion_detection": True,
        "sentiment": True,
        "chatbot": bool(os.environ.get("GEMINI_API_KEY")),
    })


# ── Facial Emotion Detection ────────────────────────────────────
@app.route("/analyze_face", methods=["POST"])
def api_analyze_face():
    try:
        image_bytes = None

        # Support file upload
        if "image" in request.files:
            image_file = request.files["image"]
            image_bytes = image_file.read()

        # Support base64 JSON payload
        if image_bytes is None:
            data = request.get_json(silent=True)
            if data and "image" in data:
                b64_str = data["image"]
                # Strip data URI prefix if present
                if "," in b64_str:
                    b64_str = b64_str.split(",", 1)[1]
                image_bytes = base64.b64decode(b64_str)

        if not image_bytes or len(image_bytes) == 0:
            return jsonify({"success": False, "message": "No image provided"}), 400

        result = analyze_emotion(image_bytes)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        logger.error(f"/analyze_face error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error analyzing face"}), 500


# ── Text Sentiment Analysis ─────────────────────────────────────
@app.route("/analyze_text", methods=["POST"])
def api_analyze_text():
    try:
        data = request.get_json(silent=True)
        if not data or "text" not in data:
            return jsonify({"success": False, "message": "No text provided"}), 400

        text = data["text"]
        if not isinstance(text, str) or not text.strip():
            return jsonify({"success": False, "message": "Invalid text"}), 400

        result = analyze_sentiment(text)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        logger.error(f"/analyze_text error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error analyzing text"}), 500


# ── Mood Score Calculation ───────────────────────────────────────
@app.route("/calculate_score", methods=["POST"])
def api_calculate_score():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        emotion = data.get("emotion", "neutral")
        sentiment = data.get("sentiment", "neutral")

        result = calculate_mood_score(emotion, sentiment)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        logger.error(f"/calculate_score error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error calculating score"}), 500


# ── Chatbot ──────────────────────────────────────────────────────
@app.route("/chatbot", methods=["POST"])
def api_chatbot():
    try:
        data = request.get_json(silent=True)
        if not data or "message" not in data:
            return jsonify({"success": False, "message": "No message provided"}), 400

        message = data["message"]
        if not isinstance(message, str) or not message.strip():
            return jsonify({"success": False, "message": "Invalid message"}), 400

        result = get_chatbot_response(message.strip())
        return jsonify({"success": True, "data": result})

    except Exception as e:
        logger.error(f"/chatbot error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error processing chat"}), 500


# ── Recommendation (based on last mood score) ───────────────────
@app.route("/recommendation", methods=["GET"])
def api_recommendation():
    """Return wellness recommendations based on query params or defaults."""
    emotion = request.args.get("emotion", "neutral")
    score = int(request.args.get("score", 50))

    recommendations = {
        "happy": "Keep up the great energy! Try journaling your positive moments.",
        "sad": "Consider taking a short walk or talking to someone you trust.",
        "angry": "Try deep breathing exercises. Box breathing (4-4-4-4) can help.",
        "fear": "Ground yourself with the 5-4-3-2-1 technique. You are safe.",
        "neutral": "Stay mindful. Try a 5-minute meditation session.",
        "surprise": "Channel that energy! Write down what surprised you.",
        "disgust": "Take a break from what's bothering you. Fresh air helps.",
    }

    suggestion = recommendations.get(emotion.lower(), recommendations["neutral"])

    if score < 35:
        suggestion += " Consider speaking with a mental health professional."

    return jsonify({
        "success": True,
        "data": {"recommendation": suggestion, "emotion": emotion, "score": score},
    })


# ── Placeholder endpoints for frontend compatibility ─────────────
@app.route("/trend_data", methods=["GET"])
def api_trend_data():
    return jsonify({"success": True, "data": []})


@app.route("/emotion_stats", methods=["GET"])
def api_emotion_stats():
    return jsonify({"success": True, "data": {}})


@app.route("/history", methods=["GET"])
def api_history():
    return jsonify({"success": True, "data": []})


@app.route("/save_assessment", methods=["POST"])
def api_save_assessment():
    data = request.get_json(silent=True)
    logger.info(f"Assessment saved: {data}")
    return jsonify({"success": True, "message": "Assessment saved"})


@app.route("/journal/history", methods=["GET"])
def api_journal_history():
    return jsonify({"success": True, "data": []})


@app.route("/export_report", methods=["GET"])
def api_export_report():
    from io import BytesIO
    report = "MENTALMASS Wellness Report\n\nNo data available yet."
    buf = BytesIO(report.encode())
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="wellness_report.pdf")


# ── 404 Handler ──────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Route not found"}), 404


# ── Run ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting MENTALMASS AI Backend on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
