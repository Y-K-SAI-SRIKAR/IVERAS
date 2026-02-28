"""
╔══════════════════════════════════════════════════════════════════╗
║  AccidentSeverityModel  —  AiAgents/accident_severity_model.py  ║
║  Standalone Flask micro-server  |  PORT: 5001                   ║
║                                                                  ║
║  Endpoints:                                                      ║
║    POST /upload   → analyse accident image → severity JSON       ║
║    GET  /health   → liveness probe                               ║
║                                                                  ║
║  Run:                                                            ║
║    cd AiAgents                                                   ║
║    python accident_severity_model.py                            ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import io
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageFilter

# ── Optional: numpy for faster analysis ──────────────────────────
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    print("⚠️  numpy not installed — using pure-PIL heuristic")

# ── Optional: load a real TF/Keras model if present ──────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "acc_sev_model.h5")
_tf_model  = None

try:
    import tensorflow as tf
    if os.path.exists(MODEL_PATH):
        _tf_model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ TF Model loaded: {MODEL_PATH}")
    else:
        print(f"⚠️  Model file not found at {MODEL_PATH} — running in DEMO mode")
except ImportError:
    print("⚠️  TensorFlow not installed — running in DEMO mode")


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

IMG_SIZE     = (224, 224)
SEVERITY_MAP = {0: "mild", 1: "moderate", 2: "severe"}


# ── Pure-PIL helpers (used when numpy absent) ────────────────────
def _pil_stats(img_rgb_128):
    """Return (r_mean, g_mean, b_mean, dark_ratio, edge_density) using PIL only."""
    r_band, g_band, b_band = img_rgb_128.split()

    def band_mean(band):
        px = list(band.getdata())
        return sum(px) / len(px)

    r_mean = band_mean(r_band)
    g_mean = band_mean(g_band)
    b_mean = band_mean(b_band)

    gray   = img_rgb_128.convert("L")
    pixels = list(gray.getdata())
    dark_ratio = sum(1 for p in pixels if p < 60) / len(pixels)

    # Edge density via PIL Laplacian
    edges  = gray.filter(ImageFilter.FIND_EDGES)
    epx    = list(edges.getdata())
    edge_density = sum(epx) / (len(epx) * 255.0) * 100  # 0-100 scale

    return r_mean, g_mean, b_mean, dark_ratio, edge_density


def _np_stats(arr_128_128_3):
    """Return same stats tuple using numpy (faster)."""
    arr   = arr_128_128_3.astype(float)
    r_mean = arr[:, :, 0].mean()
    g_mean = arr[:, :, 1].mean()
    b_mean = arr[:, :, 2].mean()

    dark_ratio = float(np.sum(arr.mean(axis=2) < 60)) / (128 * 128)

    gray  = arr.mean(axis=2)
    dx    = np.abs(np.diff(gray, axis=1)).mean()
    dy    = np.abs(np.diff(gray, axis=0)).mean()
    edge_density = (dx + dy) / 2   # raw gradient magnitude units

    return r_mean, g_mean, b_mean, dark_ratio, edge_density


# ── Heuristic analyser (DEMO mode) ──────────────────────────────
def _heuristic_analyse(pil_img: Image.Image) -> dict:
    """
    Rule-based analyser — used when no trained TF model is present.

    Scoring:
      • Red-channel dominance  → fire / blood / damage signal
      • Dark-pixel ratio       → crushed metal / dark scene
      • Edge density           → structural complexity / debris
      • Colour variance        → scene complexity (real photo vs blank)

    Realness score measures image complexity — rejects
    very flat / synthetic / blank images.
    """
    img = pil_img.resize((128, 128)).convert("RGB")

    if HAS_NUMPY:
        arr = np.array(img)
        r_mean, g_mean, b_mean, dark_ratio, edge_density = _np_stats(arr)
        # Colour variance (std dev across all channels) — real photos have high variance
        colour_variance = float(arr.astype(float).std())
    else:
        r_mean, g_mean, b_mean, dark_ratio, edge_density = _pil_stats(img)
        # Approximate colour variance from channel means spread
        channel_spread = max(r_mean, g_mean, b_mean) - min(r_mean, g_mean, b_mean)
        colour_variance = channel_spread  # rough proxy

    # ── Realness score (0–100) ───────────────────────────────────
    # High edge density, high colour variance → complex real-world image
    if HAS_NUMPY:
        # edge_density is raw gradient magnitude (typically 5–40 for real photos)
        edge_contrib     = min(40.0, edge_density * 1.5)
        variance_contrib = min(40.0, colour_variance * 0.5)
        dark_contrib     = dark_ratio * 20.0
    else:
        # edge_density from PIL is already 0-100 scaled
        edge_contrib     = min(40.0, edge_density * 0.4)
        variance_contrib = min(40.0, colour_variance * 0.2)
        dark_contrib     = dark_ratio * 20.0

    realness_score = round(min(100.0, edge_contrib + variance_contrib + dark_contrib), 1)

    # Reject extremely flat/synthetic images (solid colours, blank frames)
    rejected = realness_score < 15

    # ── Accident detection score ─────────────────────────────────
    # Factors: red dominance, darkness, scene complexity
    red_dom   = max(0.0, r_mean - max(g_mean, b_mean))   # extra red above other channels
    red_ratio = red_dom / 255.0

    if HAS_NUMPY:
        acc_score = (red_ratio * 35.0) + (dark_ratio * 30.0) + (min(edge_density, 30) * 1.2)
    else:
        acc_score = (red_ratio * 35.0) + (dark_ratio * 30.0) + (edge_density * 0.15)

    is_accident = acc_score > 12.0

    # ── Severity & confidence ────────────────────────────────────
    if not is_accident:
        severity   = "none"
        confidence = round(min(92.0, max(10.0, 100.0 - acc_score * 3.0)), 1)
        ai_label   = "No Accident Detected"
    else:
        # Normalise acc_score to a 0-100 confidence
        confidence = round(min(94.0, max(10.0, acc_score * 3.5)), 1)

        if confidence >= 60:
            severity = "severe"
        elif confidence >= 35:
            severity = "moderate"
        else:
            severity = "mild"

        ai_label = "Accident Detected"

    return {
        "is_accident": bool(is_accident),
        "severity":    severity,
        "confidence":  confidence,
        "result":      ai_label,
        "rejected":    bool(rejected),
        "realness": {
            "score":      realness_score,
            "type":       "real"      if realness_score >= 40 else "synthetic",
            "type_label": "Real Photo" if realness_score >= 40 else "Synthetic / Low-Quality",
        },
    }


def _tf_analyse(pil_img: Image.Image) -> dict:
    """TF/Keras model path — model outputs softmax (1,3): [mild, moderate, severe]."""
    img    = pil_img.resize(IMG_SIZE).convert("RGB")
    if HAS_NUMPY:
        arr    = np.array(img, dtype=np.float32) / 255.0
        tensor = np.expand_dims(arr, axis=0)
    else:
        # Fallback: convert via list (slow but works)
        import array as arr_mod
        px  = list(img.getdata())
        flat = [v / 255.0 for rgb in px for v in rgb]
        tensor = [[[flat[i*3:(i*3)+3] for i in range(len(px))]]]

    probs = _tf_model.predict(tensor, verbose=0)[0]
    if HAS_NUMPY:
        idx  = int(np.argmax(probs))
        conf = round(float(probs[idx]) * 100, 1)
    else:
        idx  = probs.tolist().index(max(probs))
        conf = round(float(probs[idx]) * 100, 1)

    heuristic = _heuristic_analyse(pil_img)
    severity  = SEVERITY_MAP[idx]

    return {
        "is_accident": bool(severity != "none"),
        "severity":    severity,
        "confidence":  conf,
        "result":      "Accident Detected" if severity != "none" else "No Accident Detected",
        "rejected":    bool(heuristic["realness"]["score"] < 15),
        "realness":    heuristic["realness"],
    }


# ── Routes ────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":    "AccidentSeverityModel running",
        "port":      5001,
        "mode":      "TF Model" if _tf_model else "DEMO (heuristic)",
        "numpy":     HAS_NUMPY,
        "model_path": MODEL_PATH,
    }), 200


@app.route("/upload", methods=["POST"])
def upload():
    """
    Accepts a multipart image under key 'image'.
    Returns JSON with severity, confidence, realness, etc.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided — use key 'image'"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        raw     = file.read()
        if len(raw) == 0:
            return jsonify({"error": "Empty file received"}), 400
        pil_img = Image.open(io.BytesIO(raw))
    except Exception as e:
        return jsonify({"error": f"Cannot open image: {e}"}), 400

    try:
        result = _tf_analyse(pil_img) if _tf_model else _heuristic_analyse(pil_img)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {e}"}), 500

    print(
        f"🤖 [AccSevModel] {result['result']} | "
        f"severity={result['severity']} | "
        f"conf={result['confidence']}% | "
        f"realness={result['realness']['score']}%"
    )
    return jsonify(result), 200


# ── Entry point ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  AccidentSeverityModel  |  http://127.0.0.1:5001")
    print(f"  Mode  : {'TF Model' if _tf_model else 'DEMO (heuristic)'}")
    print(f"  NumPy : {'✅ Available' if HAS_NUMPY else '⚠️  Not installed'}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)