from app.config import client


def run_dialect_fallback_agent(original_transcript: str) -> str:
    print("\nTriggering dialect fallback agent for Singlish/Dialect verification...")

    prompt = f"""
    You are a Singapore medical language interpreter.

    You will receive a noisy, incomplete, or dialect-heavy emergency transcript.
    Your job is to reinterpret Singlish, dialect markers, Singapore languages (Chinese, Malay, Tamil) and unclear colloquial phrasing into clear medical English.

    Important rules:
    - Do not invent symptoms that are not supported by the text.
    - If meaning is still unclear, preserve uncertainty explicitly.
    - Keep distress-related non-verbal cues if relevant.

    Transcript:
    {original_transcript}

    Return only the refined transcript in plain English.
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a careful Singapore medical transcription assistant."},
            {"role": "user", "content": prompt}
        ]
    )

    refined = response.choices[0].message.content
    print(f">> DIALECT FALLBACK OUTPUT: {refined}")
    return refined