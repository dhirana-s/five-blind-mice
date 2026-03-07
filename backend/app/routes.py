import os
import shutil
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.schemas import TriageState
from app.utils.audio_utils import detect_audio_format
from app.agents.orchestrator_agent import run_orchestrator

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_audio(
    transcript: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    lives_alone: bool = Form(False),
    cognitive_impairment: bool = Form(False),
    caregiver_available: bool = Form(True),
    prior_falls_90d: int = Form(0),
):
    if not transcript and not audio:
        raise HTTPException(status_code=400, detail="Provide either transcript or audio.")

    file_path = None
    audio_format = "mp3"

    if audio:
        file_path = os.path.join(UPLOAD_DIR, audio.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        audio_format = detect_audio_format(file_path)

    state = TriageState(
        audio_file=file_path or "",
        audio_format=audio_format,
    )

    # Optional: attach patient-history fields if your schema supports them
    # state.lives_alone = lives_alone
    # state.cognitive_impairment = cognitive_impairment
    # state.caregiver_available = caregiver_available
    # state.prior_falls_90d = prior_falls_90d

    if transcript and not audio:
        state.transcript = transcript
        state.refined_transcript = transcript

        # If no audio, route directly to analyst
        from app.agents.analyst_agent import run_analyst_agent
        analysis = run_analyst_agent(transcript)
        state.analysis = analysis
    else:
        state = run_orchestrator(state)

    return {
        "transcript": state.refined_transcript or state.transcript or "",
        "triage": state.analysis.triage_category if state.analysis else "Unknown",
        "primary_concern": state.analysis.primary_medical_concern if state.analysis else "Unknown",
        "secondary_concern": "Needs further assessment",
        "confidence": "Medium",
        "critical_question": "Are you able to move or speak clearly right now?",
        "recommended_action": state.analysis.recommended_action if state.analysis else "Manual review recommended",
        "explanation_signals": state.analysis.detected_signals if state.analysis else [],
        "case_complexity": "Moderate",
    }