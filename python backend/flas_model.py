from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import assemblyai as aai
from translate import Translator
from elevenlabs import ElevenLabs, VoiceSettings
import uuid
from pathlib import Path
import os

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Setup your keys here
aai.settings.api_key = "8393b116a9bf44a5993ac0148359df71"
eleven_client = ElevenLabs(api_key="sk_21b18d0ec663279aac1dc074b589733e8a2f854251af6b53")

# Create output directory
OUTPUT_DIR = "audio_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/translate", methods=["POST"])
def voice_to_voice():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    filename = f"{uuid.uuid4()}.wav"
    filepath = os.path.join(OUTPUT_DIR, filename)
    file.save(filepath)

    try:
        # Transcribe
        text = transcribe_audio(filepath)

        # Translate
        es_text, tr_text, ja_text = translate_text(text)

        # Convert to speech
        es_path = text_to_speech(es_text, "es")
        tr_path = text_to_speech(tr_text, "tr")
        ja_path = text_to_speech(ja_text, "ja")

        base_url = request.host_url.rstrip('/')  # e.g., http://192.168.1.10:5000

        return jsonify({
            "spanish": f"{base_url}/audio/{es_path.name}",
            "turkish": f"{base_url}/audio/{tr_path.name}",
            "japanese": f"{base_url}/audio/{ja_path.name}",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/audio/<filename>")
def get_audio(filename):
    return send_from_directory(OUTPUT_DIR, filename)

def transcribe_audio(filepath):
    transcriber = aai.Transcriber()
    result = transcriber.transcribe(filepath)
    if result.status == aai.TranscriptStatus.error:
        raise Exception(result.error)
    return result.text

def translate_text(text):
    translator_es = Translator(from_lang="en", to_lang="es")
    translator_tr = Translator(from_lang="en", to_lang="tr")
    translator_ja = Translator(from_lang="en", to_lang="ja")

    return (
        translator_es.translate(text),
        translator_tr.translate(text),
        translator_ja.translate(text),
    )

def text_to_speech(text, lang_code):
    response = eleven_client.text_to_speech.convert(
        voice_id="Qggl4b0xRMiqOwhPtVWT",  # Your cloned voice ID
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.8,
            style=0.5,
            use_speaker_boost=True,
        ),
    )

    file_name = f"{lang_code}_{uuid.uuid4()}.mp3"
    full_path = Path(OUTPUT_DIR) / file_name
    with open(full_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
    return full_path

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
