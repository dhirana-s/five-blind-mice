from pydantic import BaseModel, Field
from typing import List, Optional


class ScribeResult(BaseModel):
    transcript: str
    used_fallback: bool = False
    fallback_reason: Optional[str] = None


class AnalystResult(BaseModel):
    triage_category: str
    primary_medical_concern: str
    detected_signals: List[str] = Field(default_factory=list)
    recommended_action: str


class TriageState(BaseModel):
    audio_file: str
    audio_format: str
    transcript: Optional[str] = None
    refined_transcript: Optional[str] = None
    used_fallback: bool = False
    fallback_reason: Optional[str] = None
    analysis: Optional[AnalystResult] = None