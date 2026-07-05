# System Architecture

This document outlines the technical architecture of the Smart View Receiver and Sender ecosystem.

## High-Level Architecture

The system operates on a localized Peer-to-Peer (P2P) network, ensuring that video data never leaves the local environment. It consists of two primary actors:
1. **The Sender (Caster):** Typically an Android smartphone capturing its screen via `MediaProjection`.
2. **The Receiver (Sink):** A Smart TV, Android Box, or Tablet running the Smart View Receiver daemon.

### Connection Pipeline

1. **Discovery (WiFi Direct):** 
   - The Receiver advertises itself as a WiFi Direct Group Owner (GO).
   - The Sender scans for available GOs and requests a connection.
2. **Authentication:**
   - Optional PIN-based authentication ensures secure pairing.
3. **Session Establishment (RTSP):**
   - Once connected to the GO's network (typically `192.168.49.1`), the Sender initiates an RTSP `ANNOUNCE` and `SETUP` sequence.
4. **Streaming (RTP/UDP):**
   - Video payload (H.264/HEVC) and Audio payload (AAC) are multiplexed and streamed over UDP sockets to minimize latency.

## Component Breakdown

### 1. Network Manager (Native Module)
Handles the Android `WifiP2pManager` lifecycle. Responsible for creating the autonomous group, broadcasting the SSID, and managing client connection states.

### 2. RTSP Server Core
A lightweight, custom-built RTSP server operating on Port `8554`. It negotiates media formats and manages UDP socket buffers.

### 3. Media Presentation (ExoPlayer)
Uses Android's native `ExoPlayer` wrapped in a React Native / Capacitor UI view. Configured with a custom `LoadControl` to minimize buffering and prioritize real-time playback.

## State Management

The React frontend utilizes a finite state machine approach to manage UI views seamlessly:
- `splash` -> `home` -> `receiver`
- Settings overrides and hotspot synchronization flags are managed via a persistent `AppConfig` object.

## Security Considerations
- **WPA2 Encryption:** All WiFi Direct communication is secured using WPA2-PSK.
- **PIN Authorization:** Prevents unauthorized devices from hijacking the display stream.
