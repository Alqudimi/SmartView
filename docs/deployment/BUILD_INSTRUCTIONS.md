# Build Instructions

Detailed guide for compiling the application.

## Web Build
Produces static assets in the `/dist` directory.
```bash
npm run build
```

## Android Capacitor Build
Ensure your web assets are built first.
```bash
npx cap sync android
```
This copies the `/dist` contents into the Android project web assets.

## Generating the APK
### Debug Build
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (Signed)
You must configure a keystore.
1. Generate Keystore: `keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000`
2. Configure `android/app/build.gradle` with signing configs.
3. Run:
```bash
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`
