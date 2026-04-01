
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import random
import string

# ======================================================
# LOAD ENV — local .env only (Vercel injects env vars directly)
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=ENV_PATH, override=False)  # won't override Vercel env vars

# ======================================================
# INIT APP
# ======================================================
app = Flask(__name__)
CORS(app)

# ======================================================
# MONGODB CONNECTION
# ======================================================
mongo_uri = os.getenv("MONGO_URI")

mongo = None
if mongo_uri:
    app.config["MONGO_URI"] = mongo_uri
    mongo = PyMongo(app)
    print("✅ Connected to MongoDB")
else:
    print("⚠️  MONGO_URI not set — add it in Vercel Environment Variables")

def require_mongo():
    """Return a 503 response if MongoDB is not configured."""
    if mongo is None:
        return jsonify({"error": "Database not configured. Set MONGO_URI in Vercel Environment Variables."}), 503
    return None

# ======================================================
# ROLE → ROUTE MAPPING
# ======================================================
ROLE_ROUTES = {
    "Admin": "/admin",
    "Responder": "/helper",
    "Hospital": "/hospital",
    "Patient": "/patient",
    "User": "/dashboard"
}

# ======================================================
# HOME
# ======================================================
@app.route("/")
def home():
    return "🚀 NexVitals Backend Running"

# ======================================================
# REGISTER
# ======================================================
@app.route("/api/register", methods=["POST"])
def register():
    err = require_mongo()
    if err: return err
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        user_type = data.get("userType", "User")

        if not name or not email or not password:
            return jsonify({"error": "Missing required fields"}), 400

        # Check existing user
        if mongo.db.users.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        # Hash password
        hashed_password = generate_password_hash(password)

        # Generate ID
        user_id = "IVR-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Save user
        mongo.db.users.insert_one({
            "userId": user_id,
            "name": name,
            "email": email,
            "password": hashed_password,
            "userType": user_type
        })

        return jsonify({
            "message": "Registration successful",
            "userId": user_id,
            "userType": user_type,
            "redirectUrl": ROLE_ROUTES.get(user_type, "/dashboard")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# LOGIN
# ======================================================
@app.route("/api/login", methods=["POST"])
def login():
    err = require_mongo()
    if err: return err
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        user = mongo.db.users.find_one({"email": email})

        if not user:
            return jsonify({"error": "User not found"}), 400

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Wrong password"}), 400

        user_type = user.get("userType", "User")

        return jsonify({
            "message": "Login successful",
            "userId": user.get("userId"),
            "name": user.get("name"),
            "email": user.get("email"),
            "userType": user_type,
            "redirectUrl": ROLE_ROUTES.get(user_type, "/dashboard")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET USER
# ======================================================
@app.route("/api/user/<user_id>", methods=["GET"])
def get_user(user_id):
    err = require_mongo()
    if err: return err
    try:
        user = mongo.db.users.find_one({"userId": user_id})

        if not user:
            return jsonify({"error": "User not found"}), 404

        user["_id"] = str(user["_id"])
        user.pop("password", None)

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# TEST PROTECTED ROUTE
# ======================================================
@app.route("/api/protected", methods=["GET"])
def protected():
    user_type = request.headers.get("userType")

    if not user_type:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"message": f"Access granted for {user_type}"}), 200

# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
