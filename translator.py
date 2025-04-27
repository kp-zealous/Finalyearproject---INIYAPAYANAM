from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import assemblyai as aai
from translate import Translator
from elevenlabs import ElevenLabs, VoiceSettings
import uuid
from pathlib import Path
import os

app = Flask(__name__)
CORS(app)

# Setup API keys
aai.settings.api_key = "8393b116a9bf44a5993ac0148359df71"
eleven_client = ElevenLabs(api_key="sk_21b18d0ec663279aac1dc074b589733e8a2f854251af6b53")

OUTPUT_DIR = "audio_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/translate", methods=["POST"])
def voice_to_voice():
    print("⚙️ /translate endpoint called")
    if 'file' not in request.files:
        print("❌ No file found in request")
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    filename = f"{uuid.uuid4()}.wav"
    filepath = os.path.join(OUTPUT_DIR, filename)
    file.save(filepath)
    print(f"✅ Audio file saved at: {filepath}")

    try:
        text = transcribe_audio(filepath)
        print(f"📝 Transcribed Text: {text}")

        translations = translate_text(text)
        print("🌐 Translations done.")

        base_url = request.host_url.rstrip('/')
        audio_urls = {}

        for lang_name, translated_text in translations.items():
            if lang_name == "English":
                continue
            print(f"🔊 Synthesizing for {lang_name}: {translated_text}")
            path = text_to_speech(translated_text, lang_name)
            audio_urls[lang_name] = f"{base_url}/audio/{path.name}"

        return jsonify({
            "transcript": translations["English"],
            **audio_urls
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/audio/<filename>")
def get_audio(filename):
    return send_from_directory(OUTPUT_DIR, filename)

def transcribe_audio(filepath):
    print("🎧 Transcribing audio...")
    transcriber = aai.Transcriber()
    result = transcriber.transcribe(filepath)
    if result.status == aai.TranscriptStatus.error:
        raise Exception(result.error)
    return result.text

def translate_text(text):
    print("🌍 Translating text...")
    return {
        "English": text,
        "Spanish": Translator(from_lang="en", to_lang="es").translate(text),
        "Turkish": Translator(from_lang="en", to_lang="tr").translate(text),
        "Japanese": Translator(from_lang="en", to_lang="ja").translate(text),
        "Hindi": Translator(from_lang="en", to_lang="hi").translate(text),
        "Tamil": Translator(from_lang="en", to_lang="ta").translate(text),
        "Telugu": Translator(from_lang="en", to_lang="te").translate(text),
    }

def text_to_speech(text, lang_name):
    print(f"🗣️ Converting to speech: [{lang_name}]")
    response = eleven_client.text_to_speech.convert(
        voice_id="Qggl4b0xRMiqOwhPtVWT",  # Replace with your custom voice ID if needed
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

    file_name = f"{lang_name}_{uuid.uuid4()}.mp3"
    full_path = Path(OUTPUT_DIR) / file_name
    with open(full_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
    print(f"📁 Saved speech to: {full_path}")
    return full_path

if __name__ == '__main__':
    print("🚀 Starting Flask server on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)
