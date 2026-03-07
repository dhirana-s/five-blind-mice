from app.schemas import TriageState
from app.utils.audio_utils import encode_audio_base64
from app.agents.scribe_agent import run_scribe_agent
from app.agents.dialect_fallback_agent import run_dialect_fallback_agent
from app.agents.analyst_agent import run_analyst_agent


def run_orchestrator(state: TriageState) -> TriageState:
    encoded_audio = encode_audio_base64(state.audio_file)

    transcript = run_scribe_agent(encoded_audio, state.audio_format)
    state.transcript = transcript

    fallback_needed = (
        "[UNCERTAIN_DIALECT]" in transcript
        or "[NO_SPEECH_DETECTED]" in transcript
        or len(transcript.strip()) < 5
    )

    if fallback_needed:
        state.used_fallback = True

        if "[UNCERTAIN_DIALECT]" in transcript:
            state.fallback_reason = "uncertain_dialect"
        elif "[NO_SPEECH_DETECTED]" in transcript:
            state.fallback_reason = "no_speech_detected"
        else:
            state.fallback_reason = "transcript_too_short"

        print(f"\nConfidence low. Switching to fallback agent due to: {state.fallback_reason}")
        refined = run_dialect_fallback_agent(transcript)
        state.refined_transcript = refined
        final_transcript = f"Original: {transcript}\nRefined: {refined}"
    else:
        print("\n✅ Scribe confidence high. Proceeding with primary transcript.")
        final_transcript = transcript
        state.refined_transcript = transcript

    analysis = run_analyst_agent(final_transcript)
    state.analysis = analysis

    return state