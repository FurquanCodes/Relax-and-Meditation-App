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

## What is Done (MVP Features & UI Upgrade)
- [x] **Scenic Glassmorphic UI Upgrade (06_UI_UPGRADE.md):** Full-screen dynamic landscape environments (Sunrise Meadow, Misty Forest, Sunset Coast, Rain Window, Starry Cosmos) with frosted glassmorphism overlays and gradient scrims for optimal contrast.
- [x] **Bundled SIL OFL Google Fonts:** Playfair Display for organic headings and Nunito for rounded, readable body text.
- [x] **Home Screen:** Dynamic daytime greeting with staggered entrance animations, progress split glass cards, glass practice cards with custom vector SVG icons (`BreatheIcon`, `MeditateIcon`, `SoundsIcon`), and floating island dock.
- [x] **Glowing Orb Guided Breathing:** Layered breathing orb with 3 faint expanding radiant rings, dynamic background phase lighting transitions, soft pill chips for pattern and duration selection, synchronized visual cues.
- [x] **Large Ring SVG Meditation Timer:** Circular SVG progress countdown ring with centered remaining time, pulsing breathing aura, background soundscape accompaniment with live volume stepper buttons (+ / −), and screen-off foreground service.
- [x] **Categorized Sounds & Docked Player:** Rain, Forest, Ocean, and Calm categories with tailored visual gradients, live animated soundwave equalizer bars, sleep timer pills, volume steppers, and background playback.
- [x] **Custom Scene Picker & Theme Mode:** Settings screen features a scenic environment picker with thumbnail previews, dark/light/system theme toggles, and singing bowl bell preference.
- [x] **Redesigned Relaxing UI & Floating Island Navigation:** Modern Floating Island Animated Bottom Navigation Bar with glowing active capsule pill, bouncy touch scale, and indicator dot.
- [x] **Guided Breathing:** Data-driven breathing patterns (Box breathing 4-4-4-4, 4-7-8 relaxing breath, 4-6 steady breath) with 1, 3, 5 minute session choices; animated expanding/contracting circle using React Native `Animated` native driver; synchronized live visual cues ("Inhale", "Hold", "Exhale") with countdown timer; Pause/Resume/Stop; records progress on completion.
- [x] **Enhanced Meditation Experience:** Clean 2-step setup: Duration selector (1, 5, 10, 15, 20m) & optional Ambient Soundscape companion (Forest, Rain, Ocean, Calm, or Pure Silence); pulsing Zen breathing halo around countdown timer; live soundscape volume stepper (+ / −); native screen-off foreground service with singing bowl bells.
- [x] **Live Animated Atmosphere Themes:** Dynamic animations (Gentle Rain with falling droplets, Deep Forest with swaying leaves & fireflies, Ocean Tide with rhythmic swells, Zen Twilight with radiant breathing auras) rendered live behind sound playback and active meditation.
- [x] **Smart Audio Controls & Precise Volume Steppers:** Play after pause resumes seamlessly from the exact paused timestamp; dedicated `+` and `−` stepper buttons for 10% volume increments alongside the smooth slider; animated dancing equalizer soundwaves.
- [x] **12 Categorized Calming Sounds:** 4 distinct sound categories (3 tracks each) with real, high-quality relaxing audio tracks:
  - 🌧️ **Rain:** Gentle Night Rain, Sleepy Rain Melody, Rain & Thunder
  - 🌿 **Forest:** Forest Ambience, Forest River & Birds, Morning Songbirds
  - 🌊 **Ocean:** Ocean Waves, Ocean Coastal Breeze, Ocean Waves Melody
  - 🧘 **Calm:** Deep Meditation, Calm Acoustic Melody, Soothing White Noise
- [x] **Docked Floating Sound Player:** Bottom-anchored player card with animated atmosphere theme, volume steppers, large play/pause button, and cycle sleep timer.
- [x] **Background Playback & Lockscreen Controls:** Android media notification widget with play/pause and track controls; audio focus ducking/pausing for phone calls and headphone unplugging.
- [x] **Sleep Timer for Ambient Sounds:** Automatically stops playback after Off, 15m, 30m, or 60m with live countdown display and wall-clock accuracy.
- [x] **Local Progress Tracking:** Locally stored session count and cumulative minutes via `@react-native-async-storage/async-storage`; survives app restarts.
- [x] **Settings:** Light / Dark / Follow Device theme switching (loaded before first screen render to prevent theme flashing); Bell sound toggle; About info with version 1.0.0 and offline notice.
- [x] **100% Offline:** Zero network requests, zero remote dependencies, all audio and bundles packaged directly inside the standalone APK.

## What is Pending / Known Issues
- All MVP requirements from specifications are 100% complete and verified.

## Sources and Licences of Audio and Assets
All 12 audio files packaged with this app are CC0 Public Domain / Royalty-Free ambient recordings carefully selected for mindfulness and stress relief. Full provenance and track mappings are documented in [assets/audio/SOURCES.md](assets/audio/SOURCES.md).

All background imagery is licensed under the Unsplash Free License (no recognizable people, no logos, no text, compressed under 250KB each). Full photographer credits and license details are documented in [assets/images/SOURCES.md](assets/images/SOURCES.md).

Fonts are open-source fonts licensed under the SIL Open Font License (OFL), Version 1.1:
- **Playfair Display**: Designed by Claus Eggers Sørensen (Google Fonts).
- **Nunito**: Designed by Vernon Adams, Cyreal (Google Fonts).

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
