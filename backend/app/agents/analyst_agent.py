import json
from app.config import client
from app.schemas import AnalystResult


def run_analyst_agent(transcript: str) -> AnalystResult:
    print("\n[STEP 2] Analyst is interpreting medical severity...")

    analyst_system_prompt = """
    You are a Senior Emergency Medical Dispatcher.

    Analyze the provided transcript (which includes clinical sound labels).

    SPECIAL RULE: If the transcript contains '[SILENCE_DETECTED]', treat this as a potentially UNCONSCIOUS patient. This is a high-severity indicator unless background noise suggests the device was simply left on.

    You must return a JSON object with the following keys:
        1. "triage_category": Urgent/Uncertain/Non-urgent
        3. "primary_medical_concern": (String) A short clinical summary.
        4. "detected_signals": (Array) List of specific cues found.
        5. "recommended_action": (String) Specific instruction for the operator.
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": analyst_system_prompt},
            {
                "role": "user",
                "content": f"Analyze this transcript and provide the assessment in JSON format:\n\n{transcript}"
            }
        ],
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)

    return AnalystResult(
        triage_category=data.get("triage_category", "Uncertain"),
        primary_medical_concern=data.get("primary_medical_concern", "Unclear concern"),
        detected_signals=data.get("detected_signals", []),
        recommended_action=data.get("recommended_action", "Manual review recommended")
    )