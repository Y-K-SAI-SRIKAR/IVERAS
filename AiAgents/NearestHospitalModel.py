"""
╔══════════════════════════════════════════════════════════════════╗
║  NearestHospitalModel  —  AiAgents/nearest_hospital_model.py    ║
║  Standalone Flask micro-server  |  PORT: 5002                   ║
║                                                                  ║
║  Endpoints:                                                      ║
║    GET /nearest-hospital?lat=&lng=   → nearest hospital JSON    ║
║    GET /health                       → liveness probe            ║
║                                                                  ║
║  Strategy (in priority order):                                   ║
║    1. OpenStreetMap Overpass API  (free, no key)                 ║
║    2. Mapbox Search Box API       (needs MAPBOX_TOKEN in .env)   ║
║    3. Mapbox Geocoding API        (keyword fallback)             ║
║    4. Hardcoded FALLBACK_HOSPITAL (if all above fail)            ║
║                                                                  ║
║  Run:                                                            ║
║    cd AiAgents                                                   ║
║    python nearest_hospital_model.py                             ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import math
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env from the backend directory (one level up)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MAPBOX_TOKEN = os.getenv("VITE_MAPBOX_TOKEN") or os.getenv("MAPBOX_TOKEN", "")

# ── Fallback hospital (used only when all APIs fail) ──────────────
FALLBACK_HOSPITAL = {
    "name":     "Osmania General Hospital",
    "lat":      17.375,
    "lng":      78.480,
    "distance": "N/A",
    "contact":  "+91 40 2460 0146",
    "address":  "Afzalgunj, Hyderabad, Telangana",
    "source":   "fallback",
}

# ── Haversine helper ──────────────────────────────────────────────
def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Returns distance in km between two GPS coordinates."""
    R    = 6371
    dLat = (lat2 - lat1) * math.pi / 180
    dLng = (lng2 - lng1) * math.pi / 180
    a    = (math.sin(dLat / 2) ** 2 +
            math.cos(lat1 * math.pi / 180) *
            math.cos(lat2 * math.pi / 180) *
            math.sin(dLng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Hospital classifier: exclude veterinary / pet / animal ───────
VET_KEYWORDS    = ["vet", "veterin", "animal", "pet", "zoo", "livestock",
                   "cattle", "veterinary", "dog", "cat", "equine", "poultry"]
HUMAN_KEYWORDS  = ["hospital", "medical", "health", "clinic", "care",
                   "apollo", "yashoda", "kims", "rainbow", "aiims", "govt",
                   "government", "general", "district", "community", "primary",
                   "PHC", "CHC", "nursing", "trauma", "emergency"]

def is_human_hospital(name: str) -> bool:
    if not name:
        return False
    lower = name.lower()
    if any(k in lower for k in VET_KEYWORDS):
        return False
    return any(k in lower for k in HUMAN_KEYWORDS)


# ── Strategy 1: OpenStreetMap Overpass ────────────────────────────
def _search_overpass(lat: float, lng: float) -> dict | None:
    overpass_query = f"""
        [out:json][timeout:12];
        (
          node["amenity"="hospital"](around:15000,{lat},{lng});
          way["amenity"="hospital"](around:15000,{lat},{lng});
        );
        out center 15;
    """
    try:
        resp = requests.post(
            "https://overpass-api.de/api/interpreter",
            data={"data": overpass_query},
            timeout=12,
        )
        data = resp.json()
        elements = data.get("elements", [])
        if not elements:
            return None

        hospitals = []
        for el in elements:
            h_lat = el.get("lat") or (el.get("center") or {}).get("lat")
            h_lng = el.get("lon") or (el.get("center") or {}).get("lon")
            name  = (el.get("tags") or {}).get("name") or "Hospital"
            phone = (
                (el.get("tags") or {}).get("phone") or
                (el.get("tags") or {}).get("contact:phone") or
                "Not Available"
            )
            addr  = (el.get("tags") or {}).get("addr:full") or ""
            if h_lat and h_lng:
                dist = haversine(lat, lng, float(h_lat), float(h_lng))
                hospitals.append({
                    "name":     name,
                    "lat":      float(h_lat),
                    "lng":      float(h_lng),
                    "distance": f"{dist:.1f} km",
                    "contact":  phone,
                    "address":  addr,
                    "dist_km":  dist,
                    "source":   "openstreetmap",
                })

        if not hospitals:
            return None

        hospitals.sort(key=lambda h: h["dist_km"])
        best = hospitals[0]
        best.pop("dist_km", None)
        print(f"✅ [Overpass] Found: {best['name']} | {best['distance']}")
        return best

    except Exception as e:
        print(f"⚠️  Overpass error: {e}")
        return None


# ── Strategy 2: Mapbox Search Box API ────────────────────────────
def _search_mapbox_searchbox(lat: float, lng: float) -> dict | None:
    if not MAPBOX_TOKEN:
        return None
    try:
        url  = (
            f"https://api.mapbox.com/search/searchbox/v1/category/hospital"
            f"?proximity={lng},{lat}&limit=10&access_token={MAPBOX_TOKEN}"
        )
        resp = requests.get(url, timeout=8)
        data = resp.json()
        features = data.get("features", [])

        filtered = [f for f in features if is_human_hospital(f.get("properties", {}).get("name", ""))]
        best_list = filtered or features

        for f in best_list:
            coords = f.get("geometry", {}).get("coordinates", [])
            if len(coords) < 2:
                continue
            h_lng, h_lat = coords[0], coords[1]
            name  = f.get("properties", {}).get("name", "Hospital")
            phone = f.get("properties", {}).get("metadata", {}).get("phone", "Not Available")
            dist  = haversine(lat, lng, h_lat, h_lng)
            result = {
                "name":     name,
                "lat":      h_lat,
                "lng":      h_lng,
                "distance": f"{dist:.1f} km",
                "contact":  phone,
                "address":  f.get("properties", {}).get("place_formatted", ""),
                "source":   "mapbox_search",
            }
            print(f"✅ [Mapbox SearchBox] Found: {name} | {dist:.1f} km")
            return result

    except Exception as e:
        print(f"⚠️  Mapbox SearchBox error: {e}")
    return None


# ── Strategy 3: Mapbox Geocoding fallback ─────────────────────────
def _search_mapbox_geocoding(lat: float, lng: float) -> dict | None:
    if not MAPBOX_TOKEN:
        return None

    queries = [
        "government hospital",
        "general hospital",
        "district hospital",
        "medical college hospital",
        "trauma centre",
    ]

    for q in queries:
        try:
            url  = (
                f"https://api.mapbox.com/geocoding/v5/mapbox.places/"
                f"{requests.utils.quote(q)}.json"
                f"?proximity={lng},{lat}&types=poi&limit=5&access_token={MAPBOX_TOKEN}"
            )
            resp = requests.get(url, timeout=8)
            data = resp.json()
            for f in data.get("features", []):
                name = f.get("text", "") or f.get("place_name", "")
                if not (is_human_hospital(name) or is_human_hospital(f.get("place_name", ""))):
                    continue
                coords = f.get("center", [])
                if len(coords) < 2:
                    continue
                h_lng, h_lat = coords[0], coords[1]
                dist = haversine(lat, lng, h_lat, h_lng)
                result = {
                    "name":     name,
                    "lat":      h_lat,
                    "lng":      h_lng,
                    "distance": f"{dist:.1f} km",
                    "contact":  "Not Available",
                    "address":  f.get("place_name", ""),
                    "source":   "mapbox_geocoding",
                }
                print(f"✅ [Mapbox Geocoding] Found: {name} | {dist:.1f} km")
                return result
        except Exception as e:
            print(f"⚠️  Mapbox Geocoding error for '{q}': {e}")

    return None


# ── Routes ────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":      "NearestHospitalModel running",
        "port":        5002,
        "mapbox_key":  "configured" if MAPBOX_TOKEN else "missing",
    }), 200


@app.route("/nearest-hospital", methods=["GET"])
def nearest_hospital():
    """
    Query params: lat, lng (float)
    Returns JSON:
      name, lat, lng, distance (str), contact, address, source
    """
    try:
        lat = float(request.args.get("lat", 0))
        lng = float(request.args.get("lng", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid lat/lng parameters"}), 400

    if lat == 0 and lng == 0:
        return jsonify({"error": "lat and lng are required and must be non-zero"}), 400

    print(f"🏥 NearestHospitalModel searching near ({lat:.4f}, {lng:.4f})")

    # Try all strategies in order
    result = (
        _search_overpass(lat, lng) or
        _search_mapbox_searchbox(lat, lng) or
        _search_mapbox_geocoding(lat, lng) or
        FALLBACK_HOSPITAL
    )

    return jsonify(result), 200


# ── Entry point ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  NearestHospitalModel  |  http://127.0.0.1:5002")
    print(f"  Mapbox Token: {'configured' if MAPBOX_TOKEN else 'NOT SET (Mapbox fallback disabled)'}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5002, debug=False, use_reloader=False)