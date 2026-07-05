# Troubleshooting & FAQs

This document addresses common issues encountered during the setup and usage of Smart View.

## Connectivity Issues

### 1. The Receiver is stuck on "Starting..."
- **Cause:** The Android OS is denying WiFi Direct permissions, or the hardware does not support P2P GO intent.
- **Solution:** Ensure location services are enabled on the device. Android requires `ACCESS_FINE_LOCATION` to utilize WiFi Direct APIs.

### 2. The Sender cannot find the TV
- **Cause:** Both devices are not on the same network subnet, or the TV's Group Owner broadcast failed.
- **Solution:** Try toggling the "Sync Hotspot" feature in the Receiver's settings. Alternatively, use the QR Code scanning method for a direct connection bypass.

## Streaming Performance

### 1. High Latency (Lag)
- **Cause:** Network congestion or inefficient decoding.
- **Solution:** 
  - Ensure both devices are connected via a 5GHz WiFi band, not 2.4GHz.
  - Disable any active VPNs on either device, as they interfere with local UDP routing.

### 2. Video artifacts or stuttering
- **Cause:** UDP packet loss.
- **Solution:** Move the devices closer to each other. If using the "Sync Hotspot" feature, ensure the area has minimal wireless interference.

## Build Errors

### 1. "cmdline-tools not found" during Colab Build
- **Cause:** The Colab instance failed to download the Android SDK properly.
- **Solution:** Re-run the SDK installation cell in the Jupyter Notebook. Ensure the Colab runtime has internet access.

### 2. "Capacitor command not found"
- **Cause:** Global dependencies are missing.
- **Solution:** Run `npx cap` instead of `cap`, or install the CLI globally via `npm install -g @capacitor/cli`.

---

If you continue to experience issues, please review the device logs using `adb logcat` and filter for `SmartView` or `ExoPlayer` tags.
