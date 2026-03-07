from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeResponse(BaseModel):
    transcript: str
    triage: str
    primary_concern: str
    secondary_concern: str
    confidence: str
    critical_question: str
    recommended_action: str
    explanation_signals: List[str]
    case_complexity: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_alert(
    transcript: str = Form(...),
    lives_alone: bool = Form(False),
    cognitive_impairment: bool = Form(False),
    caregiver_available: bool = Form(True),
    prior_falls_90d: int = Form(0),
):
    text = transcript.lower()

    triage = "GREEN"
    primary_concern = "Likely non-urgent situation"
    secondary_concern = "Possible accidental press"
    confidence = "medium"
    critical_question = "Did you press the button by mistake?"
    recommended_action = "Call back and confirm senior is safe"
    explanation_signals = ["no major red-flag phrases detected"]
    case_complexity = "LOW"

    if "cannot breathe" in text or "chest pain" in text or "can't breathe" in text:
        triage = "RED"
        primary_concern = "Possible breathing or cardiac emergency"
        secondary_concern = "Possible collapse"
        confidence = "high"
        critical_question = "Are you having trouble breathing right now?"
        recommended_action = "Dispatch ambulance and escalate to senior responder"
        explanation_signals = ["red-flag phrase detected", "possible life-threatening condition"]
        case_complexity = "HIGH"

    elif "stroke" in text or "cannot move" in text or "can't move" in text or "arm" in text:
        triage = "RED"
        primary_concern = "Possible stroke or neurological emergency"
        secondary_concern = "Possible fall with injury"
        confidence = "medium"
        critical_question = "Can you lift both arms?"
        recommended_action = "Dispatch ambulance and escalate urgently"
        explanation_signals = ["mobility-related red flag detected"]
        case_complexity = "HIGH"

    elif "fall" in text or "fell" in text or "cannot stand" in text or "bathroom" in text:
        triage = "YELLOW"
        primary_concern = "Possible fall with injury"
        secondary_concern = "Possible fracture"
        confidence = "medium"
        critical_question = "Are you able to stand up?"
        recommended_action = "Call senior immediately and prepare ambulance escalation if no response"
        explanation_signals = ["fall-related phrase detected"]
        case_complexity = "MODERATE"

    if lives_alone or cognitive_impairment or prior_falls_90d >= 2:
        if triage == "GREEN":
            case_complexity = "MODERATE"
        elif triage == "YELLOW":
            case_complexity = "HIGH"

    return AnalyzeResponse(
        transcript=transcript,
        triage=triage,
        primary_concern=primary_concern,
        secondary_concern=secondary_concern,
        confidence=confidence,
        critical_question=critical_question,
        recommended_action=recommended_action,
        explanation_signals=explanation_signals,
        case_complexity=case_complexity,
    )