# Developer Onboarding

Welcome to the Engineering Team! This document will guide you through setting up your local environment.

## 1. Prerequisites
- **Node.js**: v20+
- **Java**: JDK 17
- **Android Studio**: Ladybug or newer.
- **Android SDK**: API Level 34.
- **Git**: For version control.

## 2. Local Environment Setup
```bash
git clone <repository_url>
cd applet
npm install
npm run build
npx cap init "Smart View" "com.smartview.receiver" --web-dir dist
npx cap add android
npx cap sync android
```

## 3. Running the App
- **Web UI (Mocked Native):** `npm run dev`
- **Android Emulator:** Open `android/` in Android Studio and hit Run, or use `npx cap run android`.

## 4. First Task Suggestion
Familiarize yourself with the React component structure in `src/App.tsx` and the Lucide icons mapping. Try modifying a tooltip or adding a new localization string.
