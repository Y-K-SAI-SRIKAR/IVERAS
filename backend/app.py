from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os
import math
from datetime import datetime, timezone
import random
import string
import requests as http_requests  # renamed to avoid clash with Flask's `request`

# ================================================================
#  LOAD ENV
# ================================================================
# Ensure we load the .env from the backend directory regardless of where the script is run from
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ================================================================
#  UPLOAD FOLDER
# ================================================================
UPLOAD_FOLDER = 'static/Accidentuploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Disabled for Vercel Serverless
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# ================================================================
#  TEST ROUTE
# ================================================================
@app.route("/")
def index():
    import google.generativeai as genai_lib
    return f"<h1>IVERAS Backend Deployment V2</h1><p>Model Configured: <b>gemini-3-flash-preview</b></p><p>SDK Version: {genai_lib.__version__}</p><p>Deployment ID: 123456</p>", 200

@app.route("/api/health-check")
def health_check():
    import google.generativeai as genai_lib
    return jsonify({"status": "running", "model": "gemini-3-flash-preview", "sdk": genai_lib.__version__, "deploy": 123456}), 200

# ================================================================
#  AI AGENT URLS
#  AccidentSeverityModel : AiAgents/accident_severity_model.py  → :5001
#  NearestHospitalModel  : AiAgents/nearest_hospital_model.py   → :5002
# ================================================================
ACC_SEV_MODEL_URL  = os.getenv("ACC_SEV_MODEL_URL",  "http://127.0.0.1:5001")
NEAR_HOSP_MODEL_URL = os.getenv("NEAR_HOSP_MODEL_URL", "http://127.0.0.1:5002")


# ================================================================
#  MONGODB
# ================================================================
mongo_url = os.getenv("MONGO_URL")
if not mongo_url:
    print("[Error] MONGO_URL not found in .env")
    exit()

app.config["MONGO_URI"] = mongo_url
mongo = PyMongo(app)
print("[OK] Connected to Database:", mongo.db.name)


# ================================================================
#  SHARED UTILITY — Resolve full user profile
# ================================================================
def resolve_user(user_id=None, device_id=None):
    user = None

    if user_id and user_id not in ("UNKNOWN_DEVICE", "undefined", "", None):
        user = mongo.db.users.find_one({"userId": user_id}, {"password": 0})

    if not user and device_id:
        user = mongo.db.users.find_one({"iotDeviceId": device_id}, {"password": 0})
        if user:
            print(f"[OK] Device '{device_id}' -> user '{user.get('userId')}' ({user.get('name')})")

    if not user and user_id:
        try:
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        except Exception:
            pass

    if user:
        print(f"[OK] Profile resolved: {user.get('name')} ({user.get('userId')})")
    else:
        print(f"⚠️  No profile found — userId='{user_id}' deviceId='{device_id}'")

    return {
        "userId":         user.get("userId",         user_id or "UNKNOWN_DEVICE") if user else (user_id or "UNKNOWN_DEVICE"),
        "name":           user.get("name",           "Unknown Driver")  if user else "Unknown Driver",
        "bloodGroup":     user.get("bloodGroup",     "Unknown")         if user else "Unknown",
        "vehicleNumber":  user.get("vehicleNumber",  "")                if user else "",
        "vehicleModel":   user.get("vehicleModel",   "")                if user else "",
        "emergencyPhone": user.get("emergencyPhone", "")                if user else "",
        "contactNumber":  user.get("contactNumber",  "")                if user else "",
        "conditions":     user.get("conditions",     "")                if user else "",
        "allergies":      user.get("allergies",      "")                if user else "",
        "email":          user.get("email",          "")                if user else "",
        "_raw":           user,
    }


# ================================================================
#  HELPER — send WhatsApp via Twilio sandbox
# ================================================================
def send_whatsapp(message: str) -> bool:
    print("[Mobile] WhatsApp Disabled (Twilio removed)")
    print("Message would have been:\n", message)
    return True


# ================================================================
#  AUTO ASSIGN HELPER
# ================================================================
def auto_assign_helper(accident_lat, accident_lng):
    try:
        available_helpers = list(mongo.db.users.find(
            {"userType": {"$in": ["Ambulance", "Helper", "ambulance", "helper", "Emergency Assistant"]}},
            {"_id": 0, "userId": 1, "name": 1, "vehicleNumber": 1, "contactNumber": 1}
        ))

        print(f"🔍 Found {len(available_helpers)} available helpers")

        if not available_helpers:
            print("⚠️  No available helpers found in DB")
            return None

        active_assignments = set(
            a.get("assignedHelper") for a in mongo.db.accidents.find(
                {"assignedHelper": {"$exists": True, "$ne": None},
                 "status": {"$in": ["REPORTED", "ASSIGNED", "EN_ROUTE"]}},
                {"assignedHelper": 1}
            )
        )

        free_helpers = [h for h in available_helpers if h.get("userId") not in active_assignments]
        if not free_helpers:
            print("⚠️  All helpers busy, assigning anyway")
            free_helpers = available_helpers

        chosen = free_helpers[0]
        print(f"[OK] Auto-assigned: {chosen.get('name')} ({chosen.get('userId')})")
        return chosen

    except Exception as e:
        print(f"❌ Auto-assign failed: {e}")
        return None


# ================================================================
#  TRIGGER → ALERT CATEGORY MAP
# ================================================================
def get_alert_category(trigger: str) -> str:
    return {
        "High-G_or_Airbag":          "🚨 CRITICAL CRASH",
        "Rollover_Detected":          "🚨 ROLLOVER DETECTED",
        "Unresponsive_To_Alarm":      "🚨 MODERATE CRASH",
        "Hard_Brake_Impact":          "⚠️ HARD BRAKE IMPACT",
        "Tilt_Sensor_Alert":          "⚠️ TILT ALERT",
        "SOS_Button_Pressed":         "🆘 MANUAL SOS",
        "Police_Help_Requested":      "👮 POLICE HELP",
        "Accident_Ambulance_Needed":  "🚑 AMBULANCE NEEDED",
        "Accident_No_Injury":         "⚠️ ACCIDENT REPORTED",
        "Unconscious_Driver":         "🚑 MEDICAL EMERGENCY",
        "Medical_Emergency":          "🚑 MEDICAL EMERGENCY",
        "Out_Of_Fuel":                "⛽ FUEL NEEDED",
        "Tyre_Puncture":              "🔧 TYRE PUNCTURE",
        "Engine_Failure":             "🔧 ENGINE FAILURE",
        "Unknown_Car_Issue":          "🔧 CAR TROUBLE",
        "Fire_Detected":              "🔥 FIRE ALERT",
        "Manual":                     "📍 MANUAL TRIGGER",
        "App_Report":                 "📱 APP REPORT",
    }.get(trigger, "🚨 EMERGENCY ALERT")


# ================================================================
#  ANALYSE IMAGE — using local model logic
# ================================================================
def analyse_accident_image(image_data: bytes) -> dict:
    from AccidentSeverityModel import _tf_model, _tf_analyse, _heuristic_analyse
    from PIL import Image
    import io
    
    fallback = {
        "is_accident": False,
        "severity":    "unknown",
        "confidence":  0.0,
        "realness":    {"score": 0, "type": "unknown", "type_label": "Analysis Unavailable"},
        "rejected":    False,
        "result":      "unknown",
        "raw":         {},
    }

    try:
        pil_img = Image.open(io.BytesIO(image_data))
        result = _tf_analyse(pil_img) if _tf_model else _heuristic_analyse(pil_img)
        
        print(f"[AI] AccSevModel Local: {result.get('result')} | severity={result.get('severity')} | "
              f"confidence={result.get('confidence', 0):.1f}%")
        return result

    except Exception as e:
        print(f"[WARN] AccSevModel local analysis failed: {e}")
        return fallback


# ================================================================
#  NEAREST HOSPITAL — using local model logic
# ================================================================
def get_nearest_hospital(lat: float, lng: float) -> dict:
    from NearestHospitalModel import _search_overpass, _search_mapbox_searchbox, _search_mapbox_geocoding, FALLBACK_HOSPITAL
    
    try:
        result = (
            _search_overpass(lat, lng) or
            _search_mapbox_searchbox(lat, lng) or
            _search_mapbox_geocoding(lat, lng) or
            FALLBACK_HOSPITAL
        )
        print(f"[Hospital] NearestHospital Local: {result.get('name')} | {result.get('distance')}")
        return result
    except Exception as e:
        print(f"⚠️  NearestHospitalModel local error: {e}")
        return FALLBACK_HOSPITAL


# ================================================================
#  WHATSAPP MESSAGE BUILDERS
# ================================================================
def _maps(lat, lng, gps_status=None):
    if gps_status in ("NO_LOCK", "UNKNOWN"):
        return "GPS unavailable"
    if lat is None or lng is None or (float(lat) == 0 and float(lng) == 0):
        return "GPS unavailable"
    suffix = " (App Location)" if gps_status == "APP_LOCATION" else ""
    return f"https://maps.google.com/?q={lat},{lng}{suffix}"


def msg_accident(profile, trigger, severity, gps_status, lat, lng, helper_name, device_id=None):
    category = get_alert_category(trigger)
    instructions = {
        "High-G_or_Airbag":         "🚨 HIGH IMPACT CRASH. Dispatch emergency response NOW!",
        "Rollover_Detected":         "🚨 VEHICLE ROLLOVER. Dispatch emergency response NOW!",
        "Unresponsive_To_Alarm":     "🚨 DRIVER UNRESPONSIVE. Check immediately!",
        "SOS_Button_Pressed":        "🆘 Driver manually triggered SOS. Check immediately!",
        "Police_Help_Requested":     "👮 Driver requested police. Notify nearest patrol.",
        "Accident_Ambulance_Needed": "🚑 Victim requires ambulance. Dispatch immediately!",
        "Unconscious_Driver":        "🚑 UNCONSCIOUS DRIVER. Dispatch ambulance immediately!",
        "Medical_Emergency":         "🚑 MEDICAL EMERGENCY. Dispatch ambulance immediately!",
        "Out_Of_Fuel":               "⛽ Driver needs fuel assistance.",
        "Tyre_Puncture":             "🔧 Driver needs puncture repair.",
        "Engine_Failure":            "🔧 Driver needs roadside mechanic.",
        "Fire_Detected":             "🔥 FIRE IN VEHICLE. Dispatch fire response!",
        "App_Report":                "📱 Accident reported via app. Verify and respond.",
    }
    note = instructions.get(trigger, "Respond immediately.")
    return f"""
{category}

Driver   : {profile['name']}
Blood    : {profile['bloodGroup']}
Vehicle  : {profile['vehicleNumber'] or 'N/A'}
Model    : {profile['vehicleModel'] or 'N/A'}
Device   : {device_id or 'App'}
Severity : {severity}
Trigger  : {trigger}
GPS      : {gps_status}
Helper   : {helper_name or 'Searching...'}
Emergency: {profile['emergencyPhone'] or 'N/A'}
Location : {_maps(lat, lng, gps_status)}

{note}
"""


def msg_sos(profile, sos_type, lat, lng):
    headers = {
        "Vehicle Theft":   "🚗 VEHICLE THEFT ALERT",
        "Personal Danger": "🚨 PERSONAL DANGER — SOS",
        "Women Safety":    "🆘 WOMEN SAFETY ALERT — PRIORITY",
    }
    instructions = {
        "Vehicle Theft":   "Notify traffic police and nearest patrol. Track vehicle.",
        "Personal Danger": "Dispatch nearest patrol immediately. Person in danger.",
        "Women Safety":    "PRIORITY ALERT. Dispatch women's helpline + nearest patrol immediately.",
    }
    return f"""
{headers.get(sos_type, f'🚨 {sos_type.upper()} ALERT')}

Name     : {profile['name']}
Vehicle  : {profile['vehicleNumber'] or 'N/A'}
Blood    : {profile['bloodGroup']}
Contact  : {profile['emergencyPhone'] or profile['contactNumber'] or 'N/A'}
Location : {_maps(lat, lng)}

{instructions.get(sos_type, 'Respond immediately.')}
"""


def msg_medical(profile, lat, lng):
    return f"""
🚑 MEDICAL EMERGENCY 🚑

Name        : {profile['name']}
Blood Group : {profile['bloodGroup']}
Conditions  : {profile['conditions'] or 'None'}
Allergies   : {profile['allergies'] or 'None'}
Contact     : {profile['emergencyPhone'] or profile['contactNumber'] or 'N/A'}
Location    : {_maps(lat, lng)}

Immediate Ambulance Required!
"""


def msg_fuel(profile, fuel_amount, lat, lng):
    return f"""
⛽ FUEL ASSIST REQUEST ⛽

Driver      : {profile['name']}
Vehicle     : {profile['vehicleNumber'] or 'N/A'}
Fuel Needed : {fuel_amount or 'Unspecified'}
Contact     : {profile['emergencyPhone'] or profile['contactNumber'] or 'N/A'}
Location    : {_maps(lat, lng)}
"""


def msg_mechanic(profile, count, lat, lng):
    return f"""
🔧 ROAD SUPPORT REQUEST 🔧

Driver          : {profile['name']}
Vehicle         : {profile['vehicleNumber'] or 'N/A'}
Contact         : {profile['emergencyPhone'] or profile['contactNumber'] or 'N/A'}
Mechanics Found : {count}
Location        : {_maps(lat, lng)}
"""


# ================================================================
#  TEST
# ================================================================
@app.route("/", methods=["GET"])
def home():
    return "IVERAS Backend Running Successfully!"


# ================================================================
#  REGISTER
# ================================================================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.form if request.form else request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    name     = data.get("name")
    email    = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    custom_user_id  = "IVR-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    import base64
    image_base64 = ""
    if 'ambulanceImage' in request.files:
        file = request.files['ambulanceImage']
        if file and file.filename != '':
            file_bytes = file.read()
            # Prefix with data schema for easy frontend rendering
            image_base64 = "data:" + file.content_type + ";base64," + base64.b64encode(file_bytes).decode('utf-8')

    mongo.db.users.insert_one({
        "userId":          custom_user_id,
        "name":            name,
        "email":           email,
        "password":        hashed_password,
        "userType":        data.get("userType"),
        "iotDeviceId":     data.get("iotDeviceId"),
        "vehicleNumber":   data.get("vehicleNumber"),
        "vehicleModel":    data.get("vehicleModel"),
        "emergencyPhone":  data.get("emergencyPhone"),
        "contactNumber":   data.get("contactNumber"),
        "ambulanceNumber": data.get("ambulanceNumber"),
        "driverId":        data.get("driverId"),
        "ambulanceImage":  image_base64,
        "bloodGroup":      data.get("bloodGroup"),
        "conditions":      data.get("conditions"),
        "allergies":       data.get("allergies")
    })

    return jsonify({"message": "Registration successful", "userId": custom_user_id}), 200


# ================================================================
#  LOGIN
# ================================================================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    email    = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = mongo.db.users.find_one({"email": email})

    if not user:
        return jsonify({"error": "User not found"}), 400

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Wrong password"}), 400

    return jsonify({
        "message":        "Login successful",
        "id":             user.get("userId", str(user["_id"])),
        "name":           user.get("name", ""),
        "email":          user.get("email", ""),
        "userType":       user.get("userType", "Public"),
        "vehicleNumber":  user.get("vehicleNumber", ""),
        "vehicleModel":   user.get("vehicleModel", ""),
        "bloodGroup":     user.get("bloodGroup", ""),
        "conditions":     user.get("conditions", ""),
        "allergies":      user.get("allergies", ""),
        "emergencyPhone": user.get("emergencyPhone", ""),
        "contactNumber":  user.get("contactNumber", ""),
        "iotDeviceId":    user.get("iotDeviceId", "")
    }), 200


# ================================================================
#  REPORT ACCIDENT  (manual — UserDashboard / mobile app)
#  Calls AccidentSeverityModel to get AI severity.
#  Also fetches nearest hospital via NearestHospitalModel.
# ================================================================
@app.route("/api/report-accident", methods=["POST"])
def report_accident():
    print("[Alert] Manual accident report received")

    user_id   = request.form.get("userId")
    latitude  = request.form.get("latitude")
    longitude = request.form.get("longitude")

    if not user_id or not latitude or not longitude:
        return jsonify({"error": "Missing required fields"}), 400

    profile = resolve_user(user_id=user_id)

    import base64
    image_base64  = ""
    ai_analysis = {}

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            file_bytes = file.read()
            mime_type = file.content_type if file.content_type else "image/jpeg"
            image_base64 = "data:" + mime_type + ";base64," + base64.b64encode(file_bytes).decode('utf-8')

            print("[AI] Sending image bytes to AccidentSeverityModel locally")
            ai_analysis = analyse_accident_image(file_bytes)

    try:
        lat = float(latitude)
        lng = float(longitude)
    except (ValueError, TypeError):
        lat, lng = 0.0, 0.0

    # Determine final severity
    ai_sev_val = ai_analysis.get("severity", "unknown")
    if ai_sev_val and ai_sev_val != "unknown" and not ai_analysis.get("rejected", False):
        final_severity = ai_sev_val.upper()
    else:
        final_severity = "CRITICAL"

    # Fetch nearest hospital from NearestHospitalModel
    nearest_hospital = {}
    if lat != 0 or lng != 0:
        nearest_hospital = get_nearest_hospital(lat, lng)

    assigned_helper = auto_assign_helper(lat, lng)
    helper_id   = assigned_helper.get("userId") if assigned_helper else None
    helper_name = assigned_helper.get("name")   if assigned_helper else None

    mongo.db.accidents.insert_one({
        "userId":          profile["userId"],
        "name":            profile["name"],
        "bloodGroup":      profile["bloodGroup"],
        "vehicleNumber":   profile["vehicleNumber"],
        "vehicleModel":    profile["vehicleModel"],
        "conditions":      profile["conditions"],
        "allergies":       profile["allergies"],
        "emergencyPhone":  profile["emergencyPhone"],
        "latitude":        lat,
        "longitude":       lng,
        "imagePath":       image_base64,
        "severity":        final_severity,
        "trigger":         "App_Report",
        "alertCategory":   "📱 APP REPORT",
        "status":          "ASSIGNED" if helper_id else "REPORTED",
        "source":          "MOBILE_APP",
        "assignedHelper":  helper_id,
        "helperName":      helper_name,
        "timestamp":       datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        # AI Severity fields
        "aiSeverity":      ai_analysis.get("severity",   ""),
        "aiConfidence":    ai_analysis.get("confidence", 0),
        "aiLabel":         ai_analysis.get("result",     ""),
        "aiRealness":      ai_analysis.get("realness",   {}),
        "aiRejected":      ai_analysis.get("rejected",   False),
        # Nearest hospital (cached from NearestHospitalModel)
        "nearestHospital": nearest_hospital,
    })

    print(f"[OK] Manual Accident | {profile['name']} | Severity: {final_severity} | Helper: {helper_id}")
    send_whatsapp(msg_accident(profile, "App_Report", final_severity, "GPS_FIXED", lat, lng, helper_name))

    return jsonify({
        "message":        "Accident reported successfully",
        "assignedHelper": helper_id,
        "helperName":     helper_name,
        "severity":       final_severity,
        # Return AI analysis + hospital to frontend (UserDashboard shows these)
        # Only return aiAnalysis when model actually ran with a valid result
        "aiAnalysis": (
            {
                "severity":   ai_analysis.get("severity",   ""),
                "confidence": ai_analysis.get("confidence", 0),
                "label":      ai_analysis.get("result",     ""),
                "realness":   ai_analysis.get("realness",   {}),
                "rejected":   ai_analysis.get("rejected",   False),
            }
            if ai_analysis
            and ai_analysis.get("severity", "unknown") not in ("", "unknown")
            and not ai_analysis.get("rejected", False)
            else None
        ),
        "nearestHospital": nearest_hospital or None,
    }), 200


# ================================================================
#  GET USER BY ID
# ================================================================
@app.route("/api/user/<user_id>", methods=["GET"])
def get_user(user_id):
    user = mongo.db.users.find_one({"userId": user_id})

    if not user:
        try:
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return jsonify({"error": "Invalid ID"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return jsonify(user), 200





# ================================================================
#  ACCIDENTS — GET all / POST from ESP32
# ================================================================
@app.route("/api/accidents", methods=["GET", "POST"])
def accidents():

    if request.method == "GET":
        return jsonify(list(mongo.db.accidents.find({}, {"_id": 0}))), 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    device_id = data.get("deviceId")
    if not device_id:
        return jsonify({"error": "Missing required field: deviceId"}), 400

    profile = resolve_user(device_id=device_id)

    try:
        lat = float(data.get("latitude",  0))
        lng = float(data.get("longitude", 0))
    except (ValueError, TypeError):
        lat = 0.0
        lng = 0.0

    gps_status = data.get("gpsStatus", "UNKNOWN")

    if lat == 0 and lng == 0 and profile.get("_raw"):
        user_raw     = profile["_raw"]
        fallback_lat = user_raw.get("latitude")
        fallback_lng = user_raw.get("longitude")
        if fallback_lat and fallback_lng:
            try:
                f_lat = float(fallback_lat)
                f_lng = float(fallback_lng)
                if f_lat != 0 or f_lng != 0:
                    lat        = f_lat
                    lng        = f_lng
                    gps_status = "APP_LOCATION"
                    print(f"[Location] GPS fallback: device '{device_id}' using app location ({lat}, {lng})")
            except (ValueError, TypeError):
                pass

    severity       = data.get("severity",  "Unknown")
    trigger        = data.get("trigger",   "Unknown")
    alert_category = get_alert_category(trigger)

    assigned_helper = auto_assign_helper(lat, lng)
    helper_id   = assigned_helper.get("userId") if assigned_helper else None
    helper_name = assigned_helper.get("name")   if assigned_helper else None

    # Fetch nearest hospital for ESP32 accidents too
    nearest_hospital = {}
    if lat != 0 or lng != 0:
        nearest_hospital = get_nearest_hospital(lat, lng)

    mongo.db.accidents.insert_one({
        "deviceId":        device_id,
        "userId":          profile["userId"],
        "name":            profile["name"],
        "bloodGroup":      profile["bloodGroup"],
        "vehicleNumber":   profile["vehicleNumber"],
        "vehicleModel":    profile["vehicleModel"],
        "conditions":      profile["conditions"],
        "allergies":       profile["allergies"],
        "emergencyPhone":  profile["emergencyPhone"],
        "latitude":        lat,
        "longitude":       lng,
        "gpsStatus":       gps_status,
        "severity":        severity,
        "trigger":         trigger,
        "alertCategory":   alert_category,
        "status":          "ASSIGNED" if helper_id else "REPORTED",
        "source":          "ESP32_AUTO",
        "assignedHelper":  helper_id,
        "helperName":      helper_name,
        "timestamp":       datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        "nearestHospital": nearest_hospital,
    })

    print(f"[Alert] ESP32 | {alert_category} | {trigger} | {device_id} | {profile['userId']} | Helper: {helper_id}")
    send_whatsapp(msg_accident(profile, trigger, severity, gps_status, lat, lng, helper_name, device_id))

    return jsonify({
        "message":        "Accident reported successfully",
        "assignedHelper": helper_id,
        "helperName":     helper_name,
        "alertCategory":  alert_category
    }), 200


# ================================================================
#  LATEST ACCIDENT (UserDashboard polling)
# ================================================================
@app.route("/api/latest-accident", methods=["GET"])
def get_latest_accident():
    user_id = request.args.get("userId")

    if not user_id:
        return jsonify({"message": "No valid accidents found"}), 404

    accident = None

    accident = mongo.db.accidents.find_one(
        {"userId": user_id, "status": {"$nin": ["COMPLETED", "CANCELLED"]}},
        sort=[("timestamp", -1)]
    )

    if not accident:
        user_doc = mongo.db.users.find_one({"userId": user_id}, {"iotDeviceId": 1})
        if user_doc and user_doc.get("iotDeviceId"):
            accident = mongo.db.accidents.find_one(
                {"deviceId": user_doc["iotDeviceId"], "status": {"$nin": ["COMPLETED", "CANCELLED"]}},
                sort=[("timestamp", -1)]
            )

    if not accident:
        return jsonify({"message": "No active accidents found for this user"}), 404

    return jsonify({
        "accidentId":      str(accident["_id"]),
        "userId":          accident.get("userId"),
        "name":            accident.get("name", ""),
        "latitude":        accident.get("latitude"),
        "longitude":       accident.get("longitude"),
        "gpsStatus":       accident.get("gpsStatus", ""),
        "severity":        accident.get("severity", ""),
        "trigger":         accident.get("trigger", ""),
        "alertCategory":   accident.get("alertCategory", ""),
        "source":          accident.get("source", ""),
        "status":          accident.get("status", "REPORTED"),
        "assignedHelper":  accident.get("assignedHelper"),
        "helperName":      accident.get("helperName"),
        "image":           accident.get("imagePath", ""),
        "timestamp":       accident.get("timestamp"),
        # AI fields — only include when model actually ran with a valid result
        "aiSeverity":      accident.get("aiSeverity",   "")
                            if accident.get("aiSeverity", "") not in ("", "unknown")
                            else "",
        "aiConfidence":    accident.get("aiConfidence",  0),
        "aiLabel":         accident.get("aiLabel",       ""),
        "aiRealness":      accident.get("aiRealness",    {}),
        "aiRejected":      accident.get("aiRejected",    False),
        # Nearest hospital (cached when accident was reported)
        "nearestHospital": accident.get("nearestHospital", {}),
    }), 200


# ================================================================
#  ACCIDENT FOR HELPER  (HelperDashboard polling)
#  Now returns all AI fields + nearestHospital
# ================================================================
@app.route("/api/accident-for-helper", methods=["GET"])
def accident_for_helper():
    helper_id = request.args.get("helperId")

    if not helper_id:
        return jsonify({"error": "helperId required"}), 400

    accident = mongo.db.accidents.find_one(
        {"assignedHelper": helper_id, "status": {"$nin": ["COMPLETED", "CANCELLED"]}},
        sort=[("timestamp", -1)]
    )

    if not accident:
        return jsonify({"message": "No accident assigned"}), 404

    profile = resolve_user(
        user_id=accident.get("userId"),
        device_id=accident.get("deviceId")
    )

    def pick(profile_field, accident_field, default="Unknown"):
        val = profile.get(profile_field)
        if val and val not in ("Unknown Driver", "Unknown", ""):
            return val
        return accident.get(accident_field, default) or default

    # If nearestHospital was NOT cached at report time, fetch now
    nearest_hospital = accident.get("nearestHospital", {})
    if not nearest_hospital:
        acc_lat = accident.get("latitude")
        acc_lng = accident.get("longitude")
        if acc_lat and acc_lng:
            try:
                acc_lat = float(acc_lat)
                acc_lng = float(acc_lng)
                if acc_lat != 0 or acc_lng != 0:
                    nearest_hospital = get_nearest_hospital(acc_lat, acc_lng)
                    # Cache it back into DB so future polls don't re-call the model
                    mongo.db.accidents.update_one(
                        {"_id": accident["_id"]},
                        {"$set": {"nearestHospital": nearest_hospital}}
                    )
            except Exception:
                pass

    return jsonify({
        "accidentId":      str(accident["_id"]),
        "userId":          accident.get("userId"),
        "latitude":        accident.get("latitude"),
        "longitude":       accident.get("longitude"),
        "gpsStatus":       accident.get("gpsStatus", ""),
        "severity":        accident.get("severity", "CRITICAL"),
        "trigger":         accident.get("trigger", ""),
        "alertCategory":   accident.get("alertCategory", ""),
        "status":          accident.get("status", "REPORTED"),
        "source":          accident.get("source", ""),
        "timestamp":       accident.get("timestamp"),
        "imagePath":       accident.get("imagePath", ""),
        # AI analysis fields
        "aiSeverity":      accident.get("aiSeverity",   ""),
        "aiConfidence":    accident.get("aiConfidence",  0),
        "aiLabel":         accident.get("aiLabel",       ""),
        "aiRealness":      accident.get("aiRealness",    {}).get("score") if isinstance(accident.get("aiRealness"), dict) else accident.get("aiRealness", 0),
        "aiRejected":      accident.get("aiRejected",    False),
        # Victim profile
        "name":            pick("name",          "name",          "Unknown"),
        "vehicle":         pick("vehicleNumber",  "vehicleNumber", "Unknown"),
        "bloodGroup":      pick("bloodGroup",     "bloodGroup",    "NA"),
        "conditions":      pick("conditions",     "conditions",    "Not Available"),
        "allergies":       pick("allergies",      "allergies",     "NA"),
        "emergencyPhone":  pick("emergencyPhone", "emergencyPhone",""),
        "vehicleModel":    pick("vehicleModel",   "vehicleModel",  ""),
        # Nearest hospital
        "nearestHospital": nearest_hospital,
    }), 200


# ================================================================
#  NEAREST HOSPITAL — direct REST endpoint
#  Called by both UserDashboard and HelperDashboard onClick
#  (bypasses the model microservice and uses cached DB value first)
# ================================================================
@app.route("/api/nearest-hospital", methods=["GET"])
def nearest_hospital_endpoint():
    """
    Query params: lat, lng
    Returns nearest hospital JSON (name, lat, lng, distance, contact, address).
    First checks if there's a recent accident with a cached nearestHospital.
    Falls back to calling NearestHospitalModel.
    """
    try:
        lat = float(request.args.get("lat", 0))
        lng = float(request.args.get("lng", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid lat/lng"}), 400

    if lat == 0 and lng == 0:
        return jsonify({"error": "lat and lng are required"}), 400

    result = get_nearest_hospital(lat, lng)
    return jsonify(result), 200


# ================================================================
#  UPDATE ACCIDENT STATUS
# ================================================================
@app.route("/api/accident-status", methods=["POST"])
def update_accident_status():
    data        = request.get_json()
    accident_id = data.get("accidentId")
    new_status  = data.get("status")
    helper_id   = data.get("helperId")

    if not accident_id or not new_status:
        return jsonify({"error": "accidentId and status required"}), 400

    try:
        update_fields = {"status": new_status, "lastUpdated": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()}

        if helper_id:
            accident = mongo.db.accidents.find_one({"_id": ObjectId(accident_id)}, {"assignedHelper": 1})
            if accident and not accident.get("assignedHelper"):
                helper_user = mongo.db.users.find_one({"userId": helper_id}, {"name": 1})
                update_fields["assignedHelper"] = helper_id
                if helper_user:
                    update_fields["helperName"] = helper_user.get("name", helper_id)

        result = mongo.db.accidents.update_one(
            {"_id": ObjectId(accident_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Accident not found"}), 404

        print(f"✅ Accident {accident_id} → {new_status} by {helper_id}")
        return jsonify({"message": f"Status updated to {new_status}"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================================================
#  PANIC / SOS ALERT
# ================================================================
@app.route("/api/panic-alert", methods=["POST"])
def panic_alert():
    data       = request.get_json()
    user_id    = data.get("userId")
    alert_type = data.get("type")
    latitude   = data.get("latitude")
    longitude  = data.get("longitude")

    if not user_id or not alert_type:
        return jsonify({"error": "Missing userId or type"}), 400

    profile = resolve_user(user_id=user_id)

    mongo.db.panic_alerts.insert_one({
        "userId":         profile["userId"],
        "name":           profile["name"],
        "vehicle":        profile["vehicleNumber"],
        "bloodGroup":     profile["bloodGroup"],
        "emergencyPhone": profile["emergencyPhone"],
        "type":           alert_type,
        "latitude":       latitude,
        "longitude":      longitude,
        "status":         "ACTIVE",
        "timestamp":      datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })

    print(f"🚨 Panic Alert: {alert_type} | {profile['name']} ({user_id})")
    send_whatsapp(msg_sos(profile, alert_type, latitude, longitude))

    return jsonify({"message": "Emergency alert sent successfully"}), 200


# ================================================================
#  MEDICAL EMERGENCY
# ================================================================
@app.route("/api/medical-alert", methods=["POST"])
def medical_alert():
    data      = request.get_json()
    user_id   = data.get("userId")
    latitude  = data.get("latitude")
    longitude = data.get("longitude")

    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    profile = resolve_user(user_id=user_id)

    mongo.db.medical_alerts.insert_one({
        "userId":         profile["userId"],
        "name":           profile["name"],
        "bloodGroup":     profile["bloodGroup"],
        "conditions":     profile["conditions"],
        "allergies":      profile["allergies"],
        "contact":        profile["emergencyPhone"] or profile["contactNumber"],
        "latitude":       latitude,
        "longitude":      longitude,
        "status":         "DISPATCHED",
        "timestamp":      datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })

    print(f"🚑 Medical Alert | {profile['name']} ({user_id})")
    send_whatsapp(msg_medical(profile, latitude, longitude))

    return jsonify({"message": "Ambulance dispatched successfully"}), 200


# ================================================================
#  FUEL ASSIST REQUEST
# ================================================================
@app.route("/api/fuel-request", methods=["POST"])
def fuel_request():
    data        = request.get_json()
    user_id     = data.get("userId")
    latitude    = data.get("latitude")
    longitude   = data.get("longitude")
    fuel_amount = data.get("fuelAmount")

    if not user_id or not latitude or not longitude:
        return jsonify({"error": "Missing required fields"}), 400

    if not fuel_amount:
        return jsonify({"error": "Please specify fuel amount"}), 400

    profile = resolve_user(user_id=user_id)

    try:
        lat = float(latitude)
        lng = float(longitude)
    except (ValueError, TypeError):
        lat = latitude
        lng = longitude

    mongo.db.fuel_requests.insert_one({
        "userId":     profile["userId"],
        "name":       profile["name"],
        "vehicle":    profile["vehicleNumber"],
        "contact":    profile["emergencyPhone"] or profile["contactNumber"],
        "latitude":   lat,
        "longitude":  lng,
        "fuelAmount": fuel_amount,
        "status":     "OPEN",
        "timestamp":  datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })

    print(f"⛽ Fuel Request | {profile['name']} ({user_id}) | {fuel_amount}")
    send_whatsapp(msg_fuel(profile, fuel_amount, lat, lng))

    return jsonify({"message": "Fuel request broadcasted"}), 200


# ================================================================
#  ACTIVE FUEL REQUESTS
# ================================================================
@app.route("/api/fuel-requests/active", methods=["GET"])
def get_active_fuel_requests():
    try:
        lat = float(request.args.get("latitude",  0))
        lng = float(request.args.get("longitude", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid coordinates"}), 400

    all_requests = list(mongo.db.fuel_requests.find(
        {"status": "OPEN"},
        {"_id": 1, "userId": 1, "name": 1, "vehicle": 1,
         "contact": 1, "latitude": 1, "longitude": 1,
         "fuelAmount": 1, "timestamp": 1}
    ))

    result = []
    R = 6371
    for r in all_requests:
        try:
            r_lat = float(r.get("latitude",  0))
            r_lng = float(r.get("longitude", 0))
        except (ValueError, TypeError):
            continue

        dLat = (r_lat - lat) * math.pi / 180
        dLng = (r_lng - lng) * math.pi / 180
        a    = (math.sin(dLat/2)**2 +
                math.cos(lat * math.pi/180) * math.cos(r_lat * math.pi/180) *
                math.sin(dLng/2)**2)
        dist = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        if dist <= 10:
            result.append({
                "requestId":  str(r["_id"]),
                "userId":     r.get("userId"),
                "name":       r.get("name",       "Unknown"),
                "vehicle":    r.get("vehicle",    "N/A"),
                "contact":    r.get("contact",    "N/A"),
                "fuelAmount": r.get("fuelAmount", "Unspecified"),
                "latitude":   r_lat,
                "longitude":  r_lng,
                "distance":   round(dist, 2),
                "timestamp":  r.get("timestamp"),
            })

    result.sort(key=lambda x: x["distance"])
    return jsonify(result), 200


# ================================================================
#  CLOSE FUEL REQUEST
# ================================================================
@app.route("/api/fuel-requests/close", methods=["POST"])
def close_fuel_request():
    data       = request.get_json()
    request_id = data.get("requestId")
    helper_id  = data.get("helperId")

    if not request_id:
        return jsonify({"error": "requestId required"}), 400

    try:
        mongo.db.fuel_requests.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {
                "status":      "CLOSED",
                "closedBy":    helper_id,
                "closedAt":    datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
            }}
        )
        return jsonify({"message": "Fuel request closed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================================================
#  NEARBY DRIVERS
# ================================================================
@app.route("/api/nearby-drivers", methods=["GET"])
def nearby_drivers():
    try:
        lat        = float(request.args.get("latitude",  0))
        lng        = float(request.args.get("longitude", 0))
        exclude_id = request.args.get("excludeUserId", "")
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid coordinates"}), 400

    all_users = list(mongo.db.users.find(
        {
            "latitude":  {"$exists": True, "$ne": None},
            "longitude": {"$exists": True, "$ne": None},
            "userId":    {"$ne": exclude_id}
        },
        {"_id": 0, "userId": 1, "name": 1, "vehicleNumber": 1,
         "contactNumber": 1, "emergencyPhone": 1,
         "latitude": 1, "longitude": 1, "lastLocationAt": 1}
    ))

    result = []
    R = 6371
    for u in all_users:
        try:
            u_lat = float(u.get("latitude",  0))
            u_lng = float(u.get("longitude", 0))
        except (ValueError, TypeError):
            continue

        if u_lat == 0 and u_lng == 0:
            continue

        dLat = (u_lat - lat) * math.pi / 180
        dLng = (u_lng - lng) * math.pi / 180
        a    = (math.sin(dLat/2)**2 +
                math.cos(lat * math.pi/180) * math.cos(u_lat * math.pi/180) *
                math.sin(dLng/2)**2)
        dist = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        if dist <= 10:
            result.append({
                "userId":   u.get("userId"),
                "name":     u.get("name", "Unknown"),
                "vehicle":  u.get("vehicleNumber", "N/A"),
                "contact":  u.get("contactNumber") or u.get("emergencyPhone") or "N/A",
                "distance": round(dist, 2),
            })

    result.sort(key=lambda x: x["distance"])
    return jsonify(result), 200


# ================================================================
#  NEARBY MECHANICS
# ================================================================
@app.route("/api/nearby-mechanics", methods=["POST"])
def nearby_mechanics():
    data    = request.get_json()
    user_id = data.get("userId")
    lat     = float(data.get("latitude"))
    lon     = float(data.get("longitude"))

    profile = resolve_user(user_id=user_id) if user_id else {
        "name": "Unknown", "vehicleNumber": "", "emergencyPhone": "", "contactNumber": ""
    }

    mechanics = list(mongo.db.mechanics.find({"status": "ACTIVE"}, {"_id": 0}))
    result = []
    for m in mechanics:
        dist = ((float(m["latitude"]) - lat) ** 2 +
                (float(m["longitude"]) - lon) ** 2) ** 0.5
        result.append({
            "name":     m["name"],
            "type":     m["type"],
            "phone":    m["phone"],
            "distance": round(dist * 111, 2)
        })

    result.sort(key=lambda x: x["distance"])
    print(f"[Mechanic] Mechanic search | {profile['name']} | {len(result)} found")
    send_whatsapp(msg_mechanic(profile, len(result), lat, lon))

    return jsonify(result), 200


# ================================================================
#  ADD MECHANIC
# ================================================================
@app.route("/api/add-mechanic", methods=["POST"])
def add_mechanic():
    data      = request.get_json()
    name      = data.get("name")
    type_     = data.get("type")
    latitude  = data.get("latitude")
    longitude = data.get("longitude")
    phone     = data.get("phone")

    if not name or not type_ or not latitude or not longitude or not phone:
        return jsonify({"error": "Missing fields"}), 400

    mongo.db.mechanics.insert_one({
        "name": name, "type": type_, "latitude": latitude,
        "longitude": longitude, "phone": phone,
        "status": "ACTIVE", "timestamp": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })
    print("🔧 Mechanic Added:", name)
    return jsonify({"message": "Mechanic added"}), 200


# ================================================================
#  USER LOCATION UPDATE
# ================================================================
@app.route("/api/user-location", methods=["POST"])
def update_user_location():
    data    = request.get_json()
    user_id = data.get("userId")
    lat     = data.get("latitude")
    lng     = data.get("longitude")

    if not user_id or lat is None or lng is None:
        return jsonify({"error": "userId, latitude, longitude required"}), 400

    mongo.db.users.update_one(
        {"userId": user_id},
        {"$set": {
            "latitude":       float(lat),
            "longitude":      float(lng),
            "lastLocationAt": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
        }}
    )
    print(f"[Location] User location updated: {user_id} -> ({lat}, {lng})")
    return jsonify({"message": "Location updated"}), 200


# ================================================================
#  HELPER LOCATION UPDATE
# ================================================================
@app.route("/api/helper-location", methods=["POST"])
def update_helper_location():
    data      = request.get_json()
    helper_id = data.get("helperId")
    lat       = data.get("latitude")
    lng       = data.get("longitude")

    if not helper_id or lat is None or lng is None:
        return jsonify({"error": "helperId, latitude, longitude required"}), 400

    mongo.db.users.update_one(
        {"userId": helper_id},
        {"$set": {"latitude": float(lat), "longitude": float(lng),
                  "lastLocationAt": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()}}
    )
    return jsonify({"message": "Location updated"}), 200


# ================================================================
#  ESP32 CRASH — legacy endpoint
# ================================================================
@app.route("/api/esp32-crash", methods=["POST"])
def esp32_crash():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    iot_device_id = data.get("iotDeviceId")
    latitude      = data.get("latitude")
    longitude     = data.get("longitude")

    if not iot_device_id or not latitude or not longitude:
        return jsonify({"error": "Missing ESP32 data fields"}), 400

    profile = resolve_user(device_id=iot_device_id)

    try:
        lat = float(latitude)
        lng = float(longitude)
    except (ValueError, TypeError):
        lat = latitude
        lng = longitude

    assigned_helper = auto_assign_helper(lat, lng)
    helper_id   = assigned_helper.get("userId") if assigned_helper else None
    helper_name = assigned_helper.get("name")   if assigned_helper else None

    nearest_hospital = {}
    try:
        nearest_hospital = get_nearest_hospital(float(lat), float(lng))
    except Exception:
        pass

    mongo.db.accidents.insert_one({
        "iotDeviceId":    iot_device_id,
        "userId":         profile["userId"],
        "name":           profile["name"],
        "bloodGroup":     profile["bloodGroup"],
        "vehicleNumber":  profile["vehicleNumber"],
        "vehicleModel":   profile["vehicleModel"],
        "conditions":     profile["conditions"],
        "allergies":      profile["allergies"],
        "emergencyPhone": profile["emergencyPhone"],
        "latitude":       lat,
        "longitude":      lng,
        "status":         "ASSIGNED" if helper_id else "REPORTED",
        "source":         "ESP32_LEGACY",
        "assignedHelper": helper_id,
        "helperName":     helper_name,
        "nearestHospital": nearest_hospital,
        "timestamp":      datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })

    print(f"[Alert] Legacy ESP32 | {iot_device_id} | {profile['name']} | Helper: {helper_id}")
    send_whatsapp(msg_accident(profile, "High-G_or_Airbag", "Critical", "GPS_FIXED", lat, lng, helper_name, iot_device_id))

    return jsonify({"message": "ESP32 crash alert logged", "assignedHelper": helper_id}), 200


# ================================================================
#  ADMIN — ACTIVE MISSIONS
# ================================================================
@app.route("/api/admin/missions", methods=["GET"])
def admin_get_missions():
    active_accidents = list(mongo.db.accidents.find(
        {"assignedHelper": {"$exists": True, "$ne": None},
         "status": {"$nin": ["COMPLETED", "CANCELLED", "completed", "cancelled"]}},
        {"_id": 1, "userId": 1, "name": 1, "latitude": 1, "longitude": 1,
         "severity": 1, "status": 1, "assignedHelper": 1, "helperName": 1, "timestamp": 1}
    ))

    result = []
    for acc in active_accidents:
        acc["accidentId"] = str(acc["_id"])
        del acc["_id"]
        helper = mongo.db.users.find_one(
            {"userId": acc.get("assignedHelper")},
            {"_id": 0, "latitude": 1, "longitude": 1, "name": 1, "vehicleNumber": 1, "lastLocationAt": 1}
        )
        if helper:
            acc["helperLat"]         = helper.get("latitude")
            acc["helperLng"]         = helper.get("longitude")
            acc["helperLastUpdated"] = helper.get("lastLocationAt")
        result.append(acc)

    return jsonify(result), 200


# ================================================================
#  ADMIN — ALL ACCIDENTS
# ================================================================
@app.route("/api/admin/accidents", methods=["GET"])
def admin_get_accidents():
    status_filter = request.args.get("status")
    query = {}
    if status_filter:
        query["status"] = {"$nin": ["COMPLETED", "CANCELLED"]} if status_filter == "active" else status_filter

    accidents = list(mongo.db.accidents.find(query, {
        "_id": 1, "userId": 1, "name": 1, "latitude": 1, "longitude": 1,
        "severity": 1, "trigger": 1, "status": 1, "assignedHelper": 1,
        "helperName": 1, "timestamp": 1, "source": 1, "imagePath": 1
    }))
    for a in accidents:
        a["_id"] = str(a["_id"])
        a["accidentId"] = a["_id"]
    return jsonify(accidents), 200


# ================================================================
#  ADMIN — ALL HELPERS
# ================================================================
@app.route("/api/admin/helpers", methods=["GET"])
def admin_get_helpers():
    helpers = list(mongo.db.users.find(
        {"userType": {"$in": ["Ambulance", "Helper", "ambulance", "helper", "Emergency Assistant"]}},
        {"password": 0}
    ))
    for h in helpers:
        h["_id"] = str(h["_id"])
    return jsonify(helpers), 200


# ================================================================
#  ADMIN — HOSPITALS
# ================================================================
@app.route("/api/admin/hospitals", methods=["GET"])
def admin_get_hospitals():
    hospitals = list(mongo.db.hospitals.find({}, {
        "_id": 1, "name": 1, "latitude": 1, "longitude": 1, "phone": 1, "type": 1
    }))
    for h in hospitals:
        h["_id"] = str(h["_id"])
        h["id"]  = h["_id"]
    return jsonify(hospitals), 200


@app.route("/api/admin/hospitals", methods=["POST"])
def admin_add_hospital():
    data  = request.get_json()
    name  = data.get("name")
    lat   = data.get("latitude")
    lng   = data.get("longitude")
    phone = data.get("phone", "Not Available")

    if not name or not lat or not lng:
        return jsonify({"error": "name, latitude, longitude required"}), 400

    result = mongo.db.hospitals.insert_one({
        "name": name, "latitude": float(lat), "longitude": float(lng),
        "phone": phone, "addedAt": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    })
    return jsonify({"message": "Hospital added", "id": str(result.inserted_id)}), 200


# ================================================================
#  PENDING VERIFICATIONS  (admin / helper dashboard polling)
# ================================================================
@app.route("/api/pending-verifications", methods=["GET"])
def pending_verifications():
    """
    Optional query params:
      ?helperId=IVR-XXX  - filter to accidents assigned to this helper
      ?limit=50          - cap results (default 50)
    """
    helper_id = request.args.get("helperId")
    try:
        limit = int(request.args.get("limit", 50))
    except (ValueError, TypeError):
        limit = 50

    query = {"status": {"$in": ["REPORTED", "ASSIGNED", "EN_ROUTE"]}}
    if helper_id:
        query["assignedHelper"] = helper_id

    accidents = list(mongo.db.accidents.find(
        query,
        {
            "_id": 1, "userId": 1, "name": 1,
            "latitude": 1, "longitude": 1,
            "severity": 1, "trigger": 1, "alertCategory": 1,
            "status": 1, "source": 1,
            "assignedHelper": 1, "helperName": 1,
            "timestamp": 1, "imagePath": 1,
            "aiSeverity": 1, "aiConfidence": 1, "aiLabel": 1,
            "nearestHospital": 1,
        }
    ).sort("timestamp", -1).limit(limit))

    for a in accidents:
        a["accidentId"] = str(a.pop("_id"))

    return jsonify(accidents), 200


# ================================================================
#  ADMIN — ACCIDENT ACTION
# ================================================================
@app.route("/api/admin/accident-action", methods=["POST"])
def admin_accident_action():
    data        = request.get_json()
    accident_id = data.get("accidentId")
    action      = data.get("action")

    if not accident_id or not action:
        return jsonify({"error": "accidentId and action required"}), 400

    try:
        mongo.db.accidents.update_one(
            {"_id": ObjectId(accident_id)},
            {"$set": {"status": action, "lastUpdated": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()}}
        )
        return jsonify({"message": f"Accident {action}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================================================================
#  CHAT API (using Google Generative AI instead of ADK)
# ================================================================
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "AIzaSyA0hl0Gl_oikAva1r3_iQl1emg-NK-mqG0")
genai.configure(api_key=api_key)

import sys
# Temporary path hack to import the agent without messy pythonpaths
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'AiAgents', 'IVAI'))
try:
    from agent import INSTRUCTION_TEXT
except ImportError:
    # Fallback if agent.py fails to load for any reason
    INSTRUCTION_TEXT = "You are the IVERAS Assistant. Only answer questions related to the IVERAS emergency system. Keep answers helpful and clear."

genai_model = genai.GenerativeModel(
    'gemini-3-flash-preview',
    system_instruction=INSTRUCTION_TEXT
)

@app.route("/api/chat", methods=["POST"])
def ivai_chat():
    data = request.get_json()
    message = data.get("message", "")
    session_id = data.get("session_id", "default")
    
    if not message:
        return jsonify({"reply": "No message provided", "session_id": session_id}), 400
        
    try:
        response = genai_model.generate_content(message)
        return jsonify({"reply": response.text, "session_id": session_id}), 200
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}", "session_id": session_id}), 500

# ================================================================
#  RUN
# ================================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)