# Build & Deployment Instructions

This guide provides comprehensive instructions for compiling the application and generating a production-ready Android APK.

## Prerequisites

To build the application locally, ensure you have the following installed:
- **Node.js** (v20 or higher)
- **Java Development Kit (JDK)** 17
- **Android Studio** & Android SDK (API Level 34)
- **Gradle**

## Option A: Automated Cloud Build (Google Colab) - Recommended

For the fastest setup, we provide an automated Jupyter Notebook that handles the entire build pipeline.

1. Download your project files as a ZIP archive.
2. Rename the archive to `project.zip`.
3. Open Google Colab and upload the provided `Colab_Build_APK.ipynb` file.
4. Upload `project.zip` to the Colab files pane.
5. Run the notebook cells sequentially. The final step will generate a `SmartViewReceiver.apk` file for download.

## Option B: Local Build Pipeline

If you prefer to build the project on your local machine, follow these steps:

### 1. Install Dependencies
Navigate to the project root and install the Node modules:
`npm install`

### 2. Build the Web Assets
Compile the React frontend into static assets:
`npm run build`

### 3. Initialize Capacitor
Capacitor bridges the web frontend with native Android APIs:
```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap init "Smart View" "com.smartview.receiver" --web-dir dist
npx cap add android
npx cap sync android
```

### 4. Compile the APK
Navigate to the Android folder and use Gradle to assemble the APK:
```bash
cd android
./gradlew assembleDebug
```

The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Performance Optimization (Release Build)
For production deployment, generate a signed release APK:
```bash
./gradlew assembleRelease
```
Ensure you configure your `keystore` in `android/app/build.gradle` before executing a release build.
