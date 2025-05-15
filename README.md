# 🧭 Iniyapayanam - Smart Travel Assistant

## 🌟 Introduction

Traveling to new places can be exciting, but often comes with hurdles like confusing routes, overspending, language barriers, and lack of local guidance. **Iniyapayanam** is a unified mobile app solution that addresses these problems by combining smart trip planning, expense tracking, voice translation, and emergency assistance — all in one place.

---

## 🚀 Why Iniyapayanam?

Unlike traditional travel apps that are fragmented and lack personalization, **Iniyapayanam** offers:
- Emotion-driven personalized itineraries
- Offline capabilities
- Real-time translation
- Local experience discovery
- Budget tracking
- Emergency assistance

Whether you're a solo explorer, a romantic couple, or a spiritual seeker, Iniyapayanam tailors the journey just for you.

---

## 🔑 Core Features

1. **🎭 Emotion-Driven Trip Planner**  
   Generate customized itineraries based on selected mood: Relaxing, Romantic, Adventurous, Spiritual.

2. **🗣️ Voice-to-Voice Translator**  
   Translate live conversations in 7 languages (Tamil, Hindi, Japanese, etc.), with offline support for essential phrases.

3. **📡 Offline Mode**  
   Access saved plans and emergency numbers even without internet — helpful in rural areas or low-network zones.

4. **💰 Expense Tracker**  
   Log travel spending in real time and receive alerts to prevent overspending.

5. **🔐 User Authentication & Security**  
   Uses Firebase Authentication and encryption to safeguard user data.

6. **🗺️ Real-Time Navigation**  
   Provides precise GPS routing with live traffic updates using HERE Maps.

7. **🍛 Local Experience Finder**  
   Discover hidden gems, cultural events, and authentic eateries.

8. **🚨 Emergency Services Access**  
   One-tap access to police, hospitals, embassies, and direct complaint lodging.

9. **📋 User Feedback System**  
   Allow users to rate features, report bugs, and submit improvement suggestions.

---

## 📱 How to Use

1. **Clone the project:**
   ```bash
   git clone https://github.com/your-repo/iniyapayanam.git
   cd iniyapayanam

2. **Install dependencies:**

```
npm install



If you face version conflicts or dependency errors, run:

```
npm install expo@latest
npm install --legacy-peer-deps
npm audit fix

3. **Firebase Auth Fix**
Create a metro.config.js file in the root directory:

```
const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs'); // For Firebase compatibility
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;

4. **Run the Translator (Python Server)**
The translator handles real-time translation and runs as a Python server.

Navigate to the directory containing translator.py

Update IP address in two places inside translator.py (e.g., 0.0.0.0 or your local IP)

Start the server:

```
python translator.py

⚠️ Ensure the Python server is running in the background while using translation features in the app.

5. **Start the App**
```
npx expo start
Use the QR code shown in the terminal to open the app in Expo Go on your mobile device.

If you face cache issues:

```
npx expo start -c

Android:
``` npm run android

iOS:
``` npm run ios

Web:
``` npm run web

Expo is used for cross-platform development. Make sure Expo CLI is installed (npm install -g expo-cli).

## 📦 Dependencies

Listed from your package.json

```react-native, expo, expo-location, expo-speech, expo-image-picker, firebase
axios, html2canvas, jspdf, react-native-html-to-pdf
@react-navigation/*, @react-native-async-storage/async-storage
react-leaflet, react-map-gl, leaflet
react-native-maps, react-native-share, react-native-vector-icons
emailjs-com, expo-status-bar, expo-av, expo-print

## 🧪 APIs Used

### 1️⃣ HERE Maps API
Use: Navigation, reverse geocoding, live routes

Example:

```
const url = `https://geocode.search.hereapi.com/v1/geocode?q=Marina+Beach&apiKey=YOUR_API_KEY`;
const response = await axios.get(url);
HERE Maps Documentation

### 2️⃣ Gemini API (Google AI)
Use: Generate mood-based travel itineraries, language translation

Example:

```
const prompt = `Suggest a romantic 2-day trip in Ooty under ₹5000`;
const response = await gemini.generateContent(prompt);
Gemini API Docs

## 3️⃣ ElevenLabs API
Use: Text-to-speech for native name pronunciation and emergency alerts

Example cURL:

```
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID" \
-H "xi-api-key: YOUR_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "text": "Welcome to Iniyapayanam!",
  "voice_settings": { "stability": 0.5, "similarity_boost": 0.7 }
}'
ElevenLabs API Docs

## 🧠 Future Scope
AI-based itinerary optimization based on travel behavior

AR/VR preview of destinations

Integration of multi-modal transportation (bus, metro, bike, etc.)

Community sharing of travel logs and guides

## ⚙️ GitHub Actions (CI/CD)
Basic workflow file for Expo apps:

.github/workflows/expo.yml

``
name: Expo Build and Lint

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Lint code
        run: npx eslint . --ext .js,.ts || true

      - name: Expo doctor
        run: npx expo doctor

      - name: Expo build (Web)
        run: npx expo export:web
        
## 📄 .gitignore
Ensure you’re not committing unnecessary or sensitive files:

.gitignore

```
node_modules/
.expo/
.expo-shared/
.DS_Store
android/app/debug.keystore
ios/Pods/
*.log
.env
web-build/
dist/

## 🛡️ License

This project is licensed under the **0BSD** license for internal documentation purposes only.

> ⚠️ **Strictly Private Project**  
> The source code, APIs, design, and assets of this project are proprietary and confidential.  
> **No individual, organization, or third party is permitted to copy, distribute, modify, or reuse any part of this project without explicit written consent from the original creators.**

All rights reserved. Unauthorized usage is strictly prohibited.

Happy Travels! 🌍✨
Built with love and code ❤️ by Team Iniyapayanam.
