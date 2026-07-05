# Data and Control Flow

## 1. Connection Establishment Flow
```mermaid
sequenceDiagram
    participant Sender
    participant Receiver
    Receiver->>Receiver: Initialize WifiP2pManager
    Receiver->>Receiver: Create Group Owner (GO)
    Receiver-->>Sender: Broadcast SSID & QR Code
    Sender->>Sender: Scan QR Code
    Sender->>Receiver: Request Connection (WPA2-PSK)
    Receiver-->>Sender: Accept Connection
```

## 2. Media Streaming Flow
```mermaid
sequenceDiagram
    participant Sender
    participant RTSP_Server
    participant Media_Codec
    Sender->>RTSP_Server: RTSP ANNOUNCE
    Sender->>RTSP_Server: RTSP SETUP
    Sender->>RTSP_Server: RTSP PLAY
    loop Streaming
        Sender->>RTSP_Server: UDP RTP Packets (H.264/AAC)
        RTSP_Server->>Media_Codec: Raw byte stream
        Media_Codec->>Media_Codec: Hardware Decode
        Media_Codec-->>Receiver_Display: Render Frame
    end
    Sender->>RTSP_Server: RTSP TEARDOWN
```

## 3. State Management
The UI state is managed via React hooks (`useState`, `useEffect`). Global configurations like Language, Theme, and Hotspot sync are maintained in a structured `AppConfig` object.
