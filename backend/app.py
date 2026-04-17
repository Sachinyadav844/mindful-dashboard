"""
MENTALMASS - AI-Driven Mental Wellness Backend
Flask API server with real AI models, auth, PDF reports, and Socket.IO
"""

import os
import base64
import json
import hashlib
import logging
import uuid
from datetime import datetime, timedelta
from io import BytesIO
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ── AI modules (lazy-loaded internally) ──────────────────────────
from ai.emotion import analyze_emotion
from ai.sentiment import analyze_sentiment
from ai.scoring import calculate_mood_score
from ai.chatbot import get_chatbot_response

# ── Config ───────────────────────────────────────────────────────
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
JWT_SECRET = os.environ.get("JWT_SECRET", "mentalmass_secret_key_2025")
SESSIONS_STORE = {}  # In-memory session history per user

# ── Helpers ──────────────────────────────────────────────────────

def _read_users():
    try:
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, "w") as f:
                json.dump([], f)
            return []
        with open(USERS_FILE) as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _write_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def _hash_password(password: str) -> str:
    return hashlib.sha256((password + JWT_SECRET).encode()).hexdigest()


def _generate_token(user: dict) -> str:
    """Simple base64 token (for local dev). Production should use PyJWT."""
    payload = json.dumps({
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "exp": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
    })
    return base64.b64encode(payload.encode()).decode()


def _decode_token(token: str) -> dict | None:
    try:
        payload = json.loads(base64.b64decode(token))
        exp = datetime.fromisoformat(payload["exp"])
        if datetime.utcnow() > exp:
            return None
        return payload
    except Exception:
        return None


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "No token provided"}), 401
        token = auth_header.split(" ", 1)[1]
        user = _decode_token(token)
        if not user:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return wrapper


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


# ── Authentication ───────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def api_register():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"success": False, "message": "Name, email, and password are required"}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

        users = _read_users()
        if any(u["email"] == email for u in users):
            return jsonify({"success": False, "message": "User already exists"}), 409

        new_user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "password": _hash_password(password),
            "createdAt": datetime.utcnow().isoformat(),
        }
        users.append(new_user)
        _write_users(users)

        token = _generate_token(new_user)
        logger.info(f"Registered: {email}")

        return jsonify({
            "success": True,
            "message": "Registration successful",
            "token": token,
            "user": {"id": new_user["id"], "name": new_user["name"], "email": new_user["email"]},
        }), 201

    except Exception as e:
        logger.error(f"Register error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Server error during registration"}), 500


@app.route("/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        email = (data.get("email") or "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        users = _read_users()
        user = next((u for u in users if u["email"] == email), None)

        if not user or user["password"] != _hash_password(password):
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        token = _generate_token(user)
        logger.info(f"Login: {email}")

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
        })

    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Server error during login"}), 500


@app.route("/profile", methods=["GET"])
@auth_required
def api_profile():
    return jsonify({"success": True, "user": request.current_user})


# ── Facial Emotion Detection ────────────────────────────────────
@app.route("/analyze_face", methods=["POST"])
def api_analyze_face():
    try:
        image_bytes = None
        source = None

        if "image" in request.files:
            image_file = request.files["image"]
            image_bytes = image_file.read()
            source = "multipart"

        if image_bytes is None:
            data = request.get_json(silent=True)
            if data and "image" in data:
                b64_str = data["image"]
                if "," in b64_str:
                    b64_str = b64_str.split(",", 1)[1]
                image_bytes = base64.b64decode(b64_str)
                source = "base64"

        if not image_bytes or len(image_bytes) == 0:
            logger.warning("/analyze_face: no image in request")
            return jsonify({"success": False, "message": "No image provided"}), 400

        logger.info(f"/analyze_face: image received via {source} ({len(image_bytes)} bytes)")
        result = analyze_emotion(image_bytes)
        logger.info(f"/analyze_face: result -> {result}")

        # Emit real-time update
        socketio.emit("emotion_update", result)

        return jsonify({"success": True, "data": result})

    except Exception as e:
        logger.error(f"/analyze_face error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Analysis failed"}), 500


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

        socketio.emit("sentiment_update", result)

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

        # Emit real-time dashboard update
        socketio.emit("dashboard_update", {
            "emotion": emotion,
            "sentiment": sentiment,
            "score": result["score"],
            "risk": result["risk"],
            "timestamp": datetime.utcnow().isoformat(),
        })

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


# ── Recommendation ───────────────────────────────────────────────
@app.route("/recommendation", methods=["GET"])
def api_recommendation():
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


# ── PDF Report Generation ───────────────────────────────────────
@app.route("/generate_report", methods=["POST"])
def api_generate_report():
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        data = request.get_json(silent=True) or {}

        user_name = data.get("name", "Anonymous User")
        age = data.get("age", "N/A")
        emotion = data.get("emotion", "neutral")
        emotion_confidence = data.get("emotionConfidence", 0)
        sentiment = data.get("sentiment", "neutral")
        sentiment_confidence = data.get("sentimentConfidence", 0)
        score = data.get("score", 50)
        risk = data.get("risk", "Moderate Risk")
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=50, bottomMargin=50)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "CustomTitle", parent=styles["Title"],
            fontSize=24, textColor=colors.HexColor("#4F46E5"),
            spaceAfter=20,
        )
        subtitle_style = ParagraphStyle(
            "Subtitle", parent=styles["Normal"],
            fontSize=11, textColor=colors.grey, spaceAfter=30,
        )

        elements = []

        elements.append(Paragraph("MENTALMASS", title_style))
        elements.append(Paragraph("AI-Driven Mental Wellness Report", subtitle_style))
        elements.append(Spacer(1, 10))

        # User info table
        info_data = [
            ["Name", user_name],
            ["Age", str(age)],
            ["Report Date", timestamp],
        ]
        info_table = Table(info_data, colWidths=[150, 300])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EEF2FF")),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#4F46E5")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("PADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C7D2FE")),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 25))

        # Analysis results
        elements.append(Paragraph("Analysis Results", styles["Heading2"]))
        elements.append(Spacer(1, 10))

        results_data = [
            ["Metric", "Value", "Confidence"],
            ["Facial Emotion", emotion.capitalize(), f"{round(emotion_confidence * 100)}%"],
            ["Text Sentiment", sentiment.capitalize(), f"{round(sentiment_confidence * 100)}%"],
            ["Mood Score", f"{score}/100", "—"],
            ["Risk Level", risk, "—"],
        ]
        results_table = Table(results_data, colWidths=[150, 150, 150])

        risk_color = colors.HexColor("#DC2626") if "High" in risk else (
            colors.HexColor("#F59E0B") if "Moderate" in risk else colors.HexColor("#16A34A")
        )

        results_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("PADDING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C7D2FE")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F3FF")]),
        ]))
        elements.append(results_table)
        elements.append(Spacer(1, 25))

        # Disclaimer
        elements.append(Paragraph("Disclaimer", styles["Heading3"]))
        elements.append(Paragraph(
            "This report is generated by an AI system for informational purposes only. "
            "It is not a medical diagnosis. If you are experiencing a mental health crisis, "
            "please contact a healthcare professional or call a helpline immediately.",
            styles["Normal"],
        ))

        doc.build(elements)
        buf.seek(0)

        filename = f"report_{user_name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        logger.error(f"/generate_report error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error generating report"}), 500


# ── Legacy export_report (GET) ───────────────────────────────────
@app.route("/export_report", methods=["GET"])
def api_export_report():
    """Backward-compatible GET endpoint that redirects to generate_report logic."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = [
            Paragraph("MENTALMASS Wellness Report", styles["Title"]),
            Spacer(1, 20),
            Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
            Spacer(1, 10),
            Paragraph("Use the Monitor page to generate a detailed report with your analysis data.", styles["Normal"]),
        ]
        doc.build(elements)
        buf.seek(0)

        return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="wellness_report.pdf")
    except Exception as e:
        logger.error(f"/export_report error: {e}", exc_info=True)
        return jsonify({"success": False, "message": "Error exporting report"}), 500


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


# ── Socket.IO Events ────────────────────────────────────────────
@socketio.on("connect")
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit("connected", {"message": "Connected to MENTALMASS real-time server"})


@socketio.on("disconnect")
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on("request_dashboard")
def handle_request_dashboard(data):
    """Client can request a fresh dashboard push."""
    emit("dashboard_update", {
        "emotion": "neutral",
        "sentiment": "neutral",
        "score": 50,
        "risk": "Moderate Risk",
        "timestamp": datetime.utcnow().isoformat(),
    })


# ── 404 Handler ──────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Route not found"}), 404


# ── Run ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting MENTALMASS AI Backend on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=False)
