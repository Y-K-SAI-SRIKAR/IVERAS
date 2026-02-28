#!/bin/bash
# Start AI Agents
python /app/AiAgents/AccidentSeverityModel.py &
python /app/AiAgents/NearestHospitalModel.py &

# Wait for 3 seconds to let AI models initialize
sleep 3

# Start backend using gunicorn
cd /app/backend
gunicorn --bind 0.0.0.0:8080 --timeout 120 app:app
