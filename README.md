# Q9 Relax

A simple, soothing Android app designed to help users relax in a few minutes with guided breathing exercises, a quiet meditation timer, and calming ambient background sounds. 100% offline, privacy-first with no sign-up or accounts required.

## How to Build

### Prerequisites
- Windows 10/11
- Node.js v22+ (tested with v24.21.0) and npm 11+
- Microsoft OpenJDK 17 (`JAVA_HOME` configured)
- Android Studio with Android SDK (API 34+ / 36+) and Android Emulator
- `ANDROID_HOME` pointing to Android SDK directory and platform-tools on `PATH`

### Installation
```powershell
cd Q9Relax
npm install
```

### Run on Emulator or Connected Android Device
```powershell
npm run start
# In a second terminal:
npm run android
```

### Build Standalone Release APK
```powershell
cd android
./gradlew assembleRelease
# The standalone APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

## What is Done (MVP Features)
- [x] Initial React Native TypeScript setup with `com.q9.relax` package name.
- [ ] Guided Breathing with synced visual cues (Box, 4-7-8).
- [ ] Meditation Timer with start/end bell, running reliably with screen off.
- [ ] Calming Ambient Sounds with gap-free looping, background playback, and media notifications.
- [ ] Sleep Timer for ambient sounds (15, 30, 60 minutes).
- [ ] Offline Progress Tracking (completed sessions and minutes).
- [ ] Settings (Light/Dark theme, Bell toggle).

## What is Pending / Known Issues
- Pending implementation of core modules (Breathing, Meditation, Ambient Sounds, Storage).

## Sources and Licences of Audio and Assets
All audio files used in this project are strictly CC0, royalty-free, or self-generated. Detailed records are documented in [assets/audio/SOURCES.md](assets/audio/SOURCES.md).

## Notes for Technical Lead
- **Framework:** React Native bare workflow (TypeScript).
- **Audio Engine:** `react-native-track-player` (backed by Android Media3/ExoPlayer) with foreground service for seamless background looping and lockscreen/notification controls.
- **Timer Mechanism:** Wall-clock based calculation (`endAt = Date.now() + duration`) combined with an Android foreground service to prevent process suspension when the screen is turned off.

## Tested On
- Devices: Android Emulator (Medium Phone API 37.0)
