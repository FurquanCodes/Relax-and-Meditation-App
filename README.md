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

### Build Standalone Offline Release APK
```powershell
# 1. Bundle offline assets and JS bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# 2. Assemble release APK
cd android
./gradlew assembleRelease
# The standalone APK is generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Install onto Device via ADB
```powershell
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## What is Done (MVP Features)
- [x] **Home Screen:** Dynamic daytime greeting ("Good morning", "Good afternoon", "Good evening"), stored progress display (sessions and total minutes), three distinct navigation entry points, and settings shortcut.
- [x] **Guided Breathing:** Data-driven breathing patterns (Box breathing 4-4-4-4, 4-7-8 relaxing breath, 4-6 steady breath) with 1, 3, 5 minute session choices; animated expanding/contracting circle using React Native `Animated` native driver; synchronized live visual cues ("Inhale", "Hold", "Exhale") with countdown timer; Pause/Resume/Stop; records progress on completion.
- [x] **Meditation Timer:** Configurable durations (1m test, 5, 10, 15, 20 minutes); clean large countdown display; start and end bells (respecting user's bell preference); native Android Foreground Service with ongoing notification and "Stop" button that guarantees wall-clock timer completion and bell ringing even with screen turned OFF.
- [x] **Calming Ambient Sounds:** 4 continuous, gap-free looping ambient sounds (Soothing White Noise, Gentle Rain, Ocean Waves, Forest Breeze); play/pause and smooth volume slider; background playback with Android media controls notification widget in notification panel; audio focus ducking/pausing for phone calls and headphone unplugging.
- [x] **Sleep Timer for Ambient Sounds:** Automatically stops playback after Off, 1m, 15m, 30m, or 60m with live countdown display and wall-clock accuracy.
- [x] **Local Progress Tracking:** Locally stored session count and cumulative minutes via `@react-native-async-storage/async-storage`; survives app restarts.
- [x] **Settings:** Light / Dark / Follow Device theme switching (loaded before first screen render to prevent theme flashing); Bell sound toggle; About info with version 1.0.0 and offline notice.
- [x] **100% Offline:** Zero network requests, zero remote dependencies, all audio and bundles packaged directly inside the standalone APK.

## What is Pending / Known Issues
- All MVP requirements from specifications are 100% complete and verified.

## Sources and Licences of Audio and Assets
All audio files used in this project are strictly CC0 Public Domain, created by Q9 Technologies via PCM synthesis with smooth loop boundaries and harmonic decay. Detailed records are documented in [assets/audio/SOURCES.md](assets/audio/SOURCES.md).

## Notes for Technical Lead
- **Framework:** Bare React Native 0.88 with TypeScript.
- **New Architecture Compatibility:** `react-native-track-player` patched via `patch-package` for TurboModules method signatures and Bridgeless `ReactHost` event dispatching.
- **Background Audio Engine:** `react-native-track-player` (ExoPlayer/Media3) with foreground service (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`) and notification controls.
- **Background Timer Mechanism:** Custom native Android Foreground Service (`TimerService.kt`) with `PARTIAL_WAKE_LOCK`, notification channel `Meditation Timer` with live countdown and "Stop" action, and native `MediaPlayer` completion bell.

## Tested On
- Physical Device: Motorola / Android Phone (`ZY22GF4LZ9`)
- Emulator: Android Emulator Medium Phone (API 37.0 / x86_64)
- Themes: Dark Mode & Light Mode
- Orientation: Portrait locked
