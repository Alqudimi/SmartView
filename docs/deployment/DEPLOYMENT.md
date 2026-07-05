# Deployment Guide

This document outlines the operational steps for deploying Smart View.

## End-User Deployment (Android)
Smart View is distributed as an APK file.
1. Users must enable "Install from Unknown Sources" on their Android TV or Smartphone.
2. Transfer the APK via USB, Google Drive, or ADB:
   `adb install SmartViewReceiver.apk`

## Enterprise Fleet Deployment
For deploying to multiple company-owned displays:
- Utilize an MDM (Mobile Device Management) solution.
- Push the APK silently.
- Pre-configure device settings using Android App Restrictions (Managed Configurations) if implemented in future versions.

## Updating
Updates are currently manual over-the-installation. The new APK must have a higher `versionCode` in `android/app/build.gradle` to install successfully over an existing version without wiping data.
