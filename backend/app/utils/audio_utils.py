import os
import base64


def detect_audio_format(audio_file: str) -> str:
    _, ext = os.path.splitext(audio_file)
    ext = ext.lower()

    if ext == ".m4a":
        return "aac"
    if ext == ".mp3":
        return "mp3"
    if ext == ".wav":
        return "wav"
    if ext == ".flac":
        return "flac"

    return "mp3"


def encode_audio_base64(audio_file: str) -> str:
    with open(audio_file, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")