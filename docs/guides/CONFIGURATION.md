# Configuration Guide

## Environment Variables
The application utilizes environment variables for build configurations. Refer to `.env.example`.

```env
# .env.example
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG_LOGS=true
```

## Internal App Configuration
The `AppConfig` object in `src/App.tsx` defines default runtime behaviors:
```typescript
interface AppConfig {
  deviceName: string;      // Defaults to 'SmartTV-' + random ID
  requirePin: boolean;     // Defaults to false
  syncHotspot: boolean;    // Defaults to true
  language: 'en' | 'ar';   // Localization toggle
}
```

## Capacitor Configuration
`capacitor.config.json` dictates native build parameters:
- `appId`: `com.smartview.receiver`
- `appName`: `Smart View`
- `webDir`: `dist`
