# Testing Strategy

To ensure enterprise-grade stability, we employ a multi-layered testing strategy.

## 1. Static Analysis & Linting
- **TypeScript:** Enforces type safety during compile time.
- **ESLint/Prettier:** Ensures code style consistency. Run `npm run lint`.

## 2. Unit Testing (Planned)
- We will utilize **Vitest** and **React Testing Library**.
- Target: Isolate and test utility functions, state reducers, and individual UI components independently of Capacitor native plugins.

## 3. Integration Testing
- Ensures the UI interacts correctly with the mocked native bridging layer.

## 4. End-to-End (E2E) Native Testing
- **Appium** will be used to automate the Android APK running on physical test devices to verify WiFi Direct connection handshakes and RTSP packet delivery.

## 5. Manual QA
Required before any major release:
- Cast from Android 11, 12, 13, and 14 devices.
- Verify sub-100ms latency visually.
- Verify fallback UI states when P2P connection fails.
