from app.config import client


def run_scribe_agent(encoded_audio: str, audio_format: str) -> str:
    print("\n[STEP 1] Scribe is listening for clinical sounds...")

    response = client.chat.completions.create(
        model="gpt-4o-audio-preview",
        modalities=["text"],
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
                            Analyze this audio.

                            Rules:
                            1. If there is NO clear speech, do NOT invent words. Return [NO_SPEECH_DETECTED].
                            2. Translate any non-English speech into English.
                            3. Only transcribe words if they are fully audible.
                            4. If you hear Singlish markers (eg. lor, ah, leh) or dialect or Singaporean languages
                            (Chinese, Malay, Tamil) but the meaning is unclear, use [UNCERTAIN_DIALECT].
                            5. If the audio is mostly silent or contains only faint background noise, you MUST add the tag [SILENCE_DETECTED].
                            6. Keep all non-verbal sounds including but not limited to cough, gasps, groaning, laughter, shouting in the transcript.
                            """
                    },
                    {
                        "type": "input_audio",
                        "input_audio": {
                            "data": encoded_audio,
                            "format": audio_format
                        }
                    }
                ]
            }
        ]
    )

    transcript = response.choices[0].message.content
    print(f">> SCRIBE OUTPUT: {transcript}")
    return transcript