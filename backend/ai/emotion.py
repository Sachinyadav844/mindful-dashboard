"""
Facial Emotion Detection using DeepFace + OpenCV
High-accuracy multi-inference with majority voting
"""

import numpy as np
import cv2
import logging
from collections import Counter

logger = logging.getLogger(__name__)

# DeepFace loaded lazily on first call to avoid slow startup if unused
_deepface = None

def _get_deepface():
    global _deepface
    if _deepface is None:
        from deepface import DeepFace
        _deepface = DeepFace
        logger.info("DeepFace model loaded successfully")
    return _deepface


def detect_and_crop_face(img_array: np.ndarray):
    """Detect face using Haarcascade and crop the region."""
    gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))

    if len(faces) == 0:
        return None

    # Take the largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_img = img_array[y:y+h, x:x+w]
    face_img = cv2.resize(face_img, (224, 224))
    return face_img


def analyze_emotion(image_bytes: bytes) -> dict:
    """
    Analyze facial emotion from image bytes.
    Uses multi-inference (3 runs) with majority voting for accuracy.
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            logger.warning("Could not decode image")
            return {"emotion": "neutral", "confidence": 0.3}

        # Detect and crop face
        face_img = detect_and_crop_face(img)

        if face_img is None:
            logger.info("No face detected, returning neutral")
            return {"emotion": "neutral", "confidence": 0.3}

        DeepFace = _get_deepface()

        # Multi-inference: run 3 times for accuracy
        emotions_list = []
        last_result = None

        for _ in range(3):
            result = DeepFace.analyze(
                img_path=face_img,
                actions=["emotion"],
                enforce_detection=False,
                detector_backend="opencv",
            )
            entry = result[0] if isinstance(result, list) else result
            emotions_list.append(entry["dominant_emotion"])
            last_result = entry

        # Majority vote
        vote_counts = Counter(emotions_list)
        dominant_emotion = vote_counts.most_common(1)[0][0]

        # Confidence from the last analysis result's emotion scores
        confidence = round(max(last_result["emotion"].values()) / 100.0, 2)

        logger.info(f"Emotion detected: {dominant_emotion} (confidence: {confidence})")
        return {"emotion": dominant_emotion, "confidence": confidence}

    except Exception as e:
        logger.error(f"Emotion analysis error: {e}", exc_info=True)
        return {"emotion": "neutral", "confidence": 0.3}
