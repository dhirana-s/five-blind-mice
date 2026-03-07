from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import tempfile
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

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

def run_triage_model(
    transcript: str,
    lives_alone: bool,
    cognitive_impairment: bool,
    caregiver_available: bool,
    prior_falls_90d: int,
) -> AnalyzeResponse:
    prompt = f"""
You are an AI triage copilot for hotline responders handling Personal Alert Button distress cases from seniors.

Your job:
- classify the case into RED, YELLOW, or GREEN
- identify a primary concern
- identify a secondary concern
- provide confidence as low, medium, or high
- ask exactly one critical follow-up question
- recommend the next action
- provide 2 to 4 short explanation signals
- provide a case complexity as LOW, MODERATE, or HIGH

Important rules:
- RED = possible life-threatening issue cannot be ruled out
- YELLOW = urgent but not clearly life-threatening
- GREEN = likely non-urgent or accidental
- be conservative when worst-case risk is high
- consider senior vulnerability such as living alone, cognitive issues, and repeated falls
- do not pretend certainty
- return valid JSON only
- no markdown
- no code fences

Case transcript:
{transcript}

Senior context:
- lives_alone: {lives_alone}
- cognitive_impairment: {cognitive_impairment}
- caregiver_available: {caregiver_available}
- prior_falls_90d: {prior_falls_90d}

Return JSON in exactly this shape:
{{
  "triage": "RED or YELLOW or GREEN",
  "primary_concern": "string",
  "secondary_concern": "string",
  "confidence": "low or medium or high",
  "critical_question": "string",
  "recommended_action": "string",
  "explanation_signals": ["string", "string"],
  "case_complexity": "LOW or MODERATE or HIGH"
}}
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    model_text = response.output_text.strip()
    parsed = json.loads(model_text)

    return AnalyzeResponse(
        transcript=transcript,
        triage=parsed["triage"],
        primary_concern=parsed["primary_concern"],
        secondary_concern=parsed["secondary_concern"],
        confidence=parsed["confidence"],
        critical_question=parsed["critical_question"],
        recommended_action=parsed["recommended_action"],
        explanation_signals=parsed["explanation_signals"],
        case_complexity=parsed["case_complexity"],
    )

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_alert(
    transcript: Optional[str] = Form(None),
    lives_alone: bool = Form(False),
    cognitive_impairment: bool = Form(False),
    caregiver_available: bool = Form(True),
    prior_falls_90d: int = Form(0),
    audio: Optional[UploadFile] = File(None),
):
    if not api_key:
        return AnalyzeResponse(
            transcript=transcript or "",
            triage="YELLOW",
            primary_concern="OpenAI API key missing",
            secondary_concern="Backend configuration issue",
            confidence="low",
            critical_question="Are you safe right now?",
            recommended_action="Fix OPENAI_API_KEY in backend .env file",
            explanation_signals=["OPENAI_API_KEY not found"],
            case_complexity="HIGH",
        )

    final_transcript = transcript.strip() if transcript else ""

    try:
        # If audio is uploaded, transcribe it first
        if audio is not None:
            suffix = os.path.splitext(audio.filename or "audio.wav")[1] or ".wav"

            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await audio.read()
                tmp.write(content)
                temp_path = tmp.name

            try:
                with open(temp_path, "rb") as f:
                    transcription = client.audio.transcriptions.create(
                        model="gpt-4o-mini-transcribe",
                        file=f,
                    )

                # SDK may expose text as .text
                final_transcript = getattr(transcription, "text", "").strip()
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        if not final_transcript:
            return AnalyzeResponse(
                transcript="",
                triage="GREEN",
                primary_concern="No transcript available",
                secondary_concern="No audio or text provided",
                confidence="low",
                critical_question="Can you describe what happened?",
                recommended_action="Ask for input and retry",
                explanation_signals=["empty input"],
                case_complexity="LOW",
            )

        return run_triage_model(
            transcript=final_transcript,
            lives_alone=lives_alone,
            cognitive_impairment=cognitive_impairment,
            caregiver_available=caregiver_available,
            prior_falls_90d=prior_falls_90d,
        )

    except Exception as e:
        return AnalyzeResponse(
            transcript=final_transcript,
            triage="YELLOW",
            primary_concern="Processing error",
            secondary_concern="Needs manual review",
            confidence="low",
            critical_question="Are you safe right now?",
            recommended_action="Escalate to responder for manual review",
            explanation_signals=[f"backend error: {str(e)}"],
            case_complexity="HIGH",
        )