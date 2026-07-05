# Quick Start Guide

This guide gets you up and running with the Smart View application as quickly as possible.

## 1. Try the Web Preview
You can preview the UI components directly in your browser.
1. Run `npm install`
2. Run `npm run dev`
3. Navigate to `http://localhost:3000`

*Note: Native networking features (like WiFi P2P and RTSP) are mocked in the browser environment.*

## 2. Build the Android APK (Colab Method - Recommended)
To quickly get a working APK without installing Android Studio:
1. Download the repository as `project.zip`.
2. Open `Colab_Build_APK.ipynb` in Google Colab.
3. Upload `project.zip` to your Colab session.
4. Run all cells. The output will be `SmartViewReceiver.apk`.

## 3. Basic Usage
1. Install the APK on a TV/Android Box and a Smartphone.
2. Open the app on the TV, select **TV (Receiver)**, and tap the Power button to start the server.
3. Open the app on the Phone, select **Phone (Sender)**, and scan the QR code displayed on the TV.
