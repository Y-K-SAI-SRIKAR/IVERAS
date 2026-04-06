from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import random
import string
import boto3
from boto3.dynamodb.conditions import Attr

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
# DYNAMODB CONNECTION
# ======================================================
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "NexVitals-Users")

try:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    users_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    print("✅ Connected to AWS DynamoDB")
except Exception as e:
    users_table = None
    print(f"⚠️  Error connecting to DynamoDB: {e}")

def require_db():
    """Return a 503 response if DynamoDB is not configured."""
    if users_table is None:
        return jsonify({"error": "Database not configured properly."}), 503
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
    err = require_db()
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
        # Note: Partition key is specified as 'eamil'
        response = users_table.get_item(Key={"eamil": email})
        if "Item" in response:
            return jsonify({"error": "User already exists"}), 400

        # Hash password
        hashed_password = generate_password_hash(password)

        # Generate ID
        user_id = "IVR-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Extract ALL optional profile fields for every user type
        phone        = data.get("phone", "")
        blood        = data.get("blood", "")
        conditions   = data.get("conditions", "")
        allergies    = data.get("allergies", "")
        emergency1   = data.get("emergency1", "")
        emergency2   = data.get("emergency2", "")
        vehicle      = data.get("vehicle", "")
        vehicle_type = data.get("vehicleType", "")
        # Responder-specific
        badge         = data.get("badge", "")
        responder_type = data.get("responderType", "")
        agency        = data.get("agency", "")
        # Hospital-specific
        hospital_name = data.get("hospitalName", "")
        hospital_reg  = data.get("hospitalReg", "")
        # Patient-specific
        mrn           = data.get("mrn", "")

        # Save user with full profile
        users_table.put_item(Item={
            "eamil": email,        # Partition key (intentional typo in DB schema)
            "userId": user_id,
            "name": name,
            "password": hashed_password,
            "userType": user_type,
            "phone": phone,
            "blood": blood,
            "conditions": conditions,
            "allergies": allergies,
            "emergency1": emergency1,
            "emergency2": emergency2,
            "vehicle": vehicle,
            "vehicleType": vehicle_type,
            "badge": badge,
            "responderType": responder_type,
            "agency": agency,
            "hospitalName": hospital_name,
            "hospitalReg": hospital_reg,
            "mrn": mrn,
        })

        return jsonify({
            "message": "Registration successful",
            "userId": user_id,
            "name": name,
            "email": email,
            "userType": user_type,
            "phone": phone,
            "blood": blood,
            "conditions": conditions,
            "allergies": allergies,
            "emergency1": emergency1,
            "emergency2": emergency2,
            "vehicle": vehicle,
            "vehicleType": vehicle_type,
            "redirectUrl": ROLE_ROUTES.get(user_type, "/dashboard")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# LOGIN
# ======================================================
@app.route("/api/login", methods=["POST"])
def login():
    err = require_db()
    if err: return err
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

        # Note: Partition key is 'eamil'
        response = users_table.get_item(Key={"eamil": email})
        
        if "Item" not in response:
            return jsonify({"error": "User not found"}), 400
            
        user = response["Item"]

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Wrong password"}), 400

        user_type = user.get("userType", "User")

        return jsonify({
            "message": "Login successful",
            "userId": user.get("userId"),
            "name": user.get("name"),
            "email": user.get("eamil"),   # Send back as 'email' for the frontend
            "userType": user_type,
            "phone": user.get("phone", ""),
            "blood": user.get("blood", ""),
            "conditions": user.get("conditions", ""),
            "allergies": user.get("allergies", ""),
            "emergency1": user.get("emergency1", ""),
            "emergency2": user.get("emergency2", ""),
            "vehicle": user.get("vehicle", ""),
            "vehicleType": user.get("vehicleType", ""),
            "badge": user.get("badge", ""),
            "responderType": user.get("responderType", ""),
            "agency": user.get("agency", ""),
            "hospitalName": user.get("hospitalName", ""),
            "hospitalReg": user.get("hospitalReg", ""),
            "mrn": user.get("mrn", ""),
            "redirectUrl": ROLE_ROUTES.get(user_type, "/dashboard")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET USER
# ======================================================
@app.route("/api/user/<user_id>", methods=["GET"])
def get_user(user_id):
    err = require_db()
    if err: return err
    try:
        # Since userId is not the partition key, we need to scan the table
        response = users_table.scan(
            FilterExpression=Attr('userId').eq(user_id)
        )
        
        if not response.get("Items"):
            return jsonify({"error": "User not found"}), 404
            
        user = response["Items"][0]

        # Cleanup data before sending to frontend
        user.pop("password", None)
        if "eamil" in user:
            user["email"] = user.pop("eamil")  # Rename back to standard term

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# UPDATE USER PROFILE
# ======================================================
@app.route("/api/user/<user_id>", methods=["PATCH"])
def update_user(user_id):
    err = require_db()
    if err: return err
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        # Find the user by userId (scan since partition key is email)
        response = users_table.scan(
            FilterExpression=Attr('userId').eq(user_id)
        )
        if not response.get("Items"):
            return jsonify({"error": "User not found"}), 404

        user = response["Items"][0]
        email = user["eamil"]

        # Build update expression for allowed fields only
        ALLOWED = ["name", "phone", "blood", "conditions", "allergies",
                   "emergency1", "emergency2", "vehicle", "vehicleType",
                   "badge", "responderType", "agency", "hospitalName", "hospitalReg", "mrn"]

        updates = {k: v for k, v in data.items() if k in ALLOWED}
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        expr_parts = []
        expr_values = {}
        expr_names = {}
        for i, (k, v) in enumerate(updates.items()):
            placeholder = f":v{i}"
            name_placeholder = f"#n{i}"
            expr_parts.append(f"{name_placeholder} = {placeholder}")
            expr_values[placeholder] = v
            expr_names[name_placeholder] = k

        users_table.update_item(
            Key={"eamil": email},
            UpdateExpression="SET " + ", ".join(expr_parts),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

        return jsonify({"message": "Profile updated successfully"}), 200

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

