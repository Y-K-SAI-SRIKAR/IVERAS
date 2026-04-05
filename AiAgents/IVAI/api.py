import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# API key fallback, using the one from the original agent.py if missing in env
api_key = os.getenv("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "AIzaSyA0hl0Gl_oikAva1r3_iQl1emg-NK-mqG0")
genai.configure(api_key=api_key)

from agent import INSTRUCTION_TEXT

model = genai.GenerativeModel(
    'gemini-3.0-flash-preview',
    system_instruction=INSTRUCTION_TEXT
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    reply: str
    session_id: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Starting a chat session keeps context
        # For simplicity, we just generate content since standard adk session was just doing runner.
        response = model.generate_content(request.message)
        return ChatResponse(reply=response.text, session_id=request.session_id)
    except Exception as e:
        return ChatResponse(reply=f"Error: {str(e)}", session_id=request.session_id)

@app.get("/health")
async def health():
    return {"status": "ok"}