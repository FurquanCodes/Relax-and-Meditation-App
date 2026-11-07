# 02: Tech Stack and Architecture

## Stack decisions
- **React Native with TypeScript, bare workflow (React Native Community CLI, not Expo).** Reason: Android-only app that needs native background audio and a foreground service, and we want a plain Gradle build for the APK.
  - Create the project with the current official command from reactnative.dev "Set up your environment" / "Get started without a framework" (use the community CLI `init`). Use the latest stable React Native version that all chosen libraries support.
  - Project name: `Q9Relax`. Android application id (placeholder): `com.q9.relax`. App display name: `Q9 Relax`.
- **Navigation:** React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`).
- **Animation:** React Native built-in `Animated` API with `useNativeDriver: true` (fewer setup risks than adding Reanimated).
- **Storage:** `@react-native-async-storage/async-storage` for settings and progress.
- **Ambient sounds (background playback, media notification, looping, volume):** `react-native-track-player` (ExoPlayer/Media3 underneath). Check that the installed version supports the installed React Native version (including New Architecture if enabled). Verify, do not assume.
- **Volume slider:** `@react-native-community/slider`.
- **Meditation timer in the background:** see Risk R3. Candidate: a foreground service with an ongoing notification (for example via `@notifee/react-native`). Confirm the library is maintained and works with the installed React Native version before using it.
- **Bell sound:** a short audio clip played through a small, maintained audio library or the same player, chosen during the spike. The bell must not break ambient playback or the media notification.
- No Firebase, no accounts, no network calls. The app is fully offline.

## Folder structure (keep layers separate)
```
Q9Relax/
  src/
    app/            App.tsx entry wiring, navigation setup, providers
    ui/
      screens/      HomeScreen, BreatheScreen, MeditateScreen, SoundsScreen, SettingsScreen
      components/   Buttons, Card, Chip, BreathingCircle, TimerDisplay, VolumeSlider...
      theme/        colors (light + dark tokens), typography, spacing
    logic/
      breathing/    patterns.ts (data), useBreathingSession.ts (engine/hook)
      timer/        meditation timer logic (wall-clock based)
      sleepTimer/   sleep timer logic
    data/
      storage/      settingsStore.ts, progressStore.ts (AsyncStorage wrappers)
      sounds.ts     catalog of ambient sounds
    services/
      audio/        track player setup, playback service, controls
      session/      foreground service / bell helpers
  assets/
    audio/ambient/  *.ogg loops
    audio/bells/    start/end bell
    audio/SOURCES.md   source + licence of every audio file
  PROGRESS.md
  README.md
```
Rule: **UI must not talk to AsyncStorage or the player directly.** UI calls hooks/functions in `logic/`, `data/`, `services/`.

## Key technical risks (address in this order)

**R1. Background audio and media notification.** Sounds must keep playing with the screen off and app in background, with a media notification that has play/pause and stop. Use the player's playback service. On Android 13+ the notification permission (`POST_NOTIFICATIONS`) must be requested at runtime. On Android 14+ the foreground service type (`mediaPlayback`) and its permissions must be declared in `AndroidManifest.xml`.

**R2. Gap-free looping.** Use short OGG loops that are edited so the start and end join smoothly (no silence at either end). Use the player's repeat mode for a single track. Test with headphones for at least a few loop cycles. If a gap is audible, report it to Hashim and try: re-encode or re-trim the file, then, if still audible, propose a fallback (for example a longer loop file). Do not hide a known gap.

**R3. Meditation timer with screen off.**
- Never count seconds with an accumulating `setInterval`. Store the **wall-clock end time** (`endAt = Date.now() + remainingMs`) and compute remaining time from the clock on every tick and whenever the app returns to the foreground.
- To keep the process alive and ring the end bell with the screen off, run the active meditation inside a foreground service with an ongoing notification (shows time left, has a Stop action). Spike this on a real device with a 2-minute test, screen off.
- Record the completed session once only (guard against double counting if both the service and the foreground reconcile).
- If the foreground-service approach does not work with the current library, list options in `PROGRESS.md` and ask Hashim to check with the Technical Lead. Do not silently ship a timer that only works with the screen on.

**R4. Sleep timer for sounds in the background.** Same wall-clock idea: store `stopAt`. The stop must happen even with the screen off (it can live inside the playback service). Test with the 15-minute option at least once on the real device, and during development use a temporary short value behind `__DEV__`.

**R5. Debug APK needs Metro.** A normal debug APK loads JavaScript from the Metro dev server, so it shows a red screen on another phone. For the shareable APK either:
 (a) build **release** with the default debug keystore: `cd android` then `gradlew assembleRelease` (output: `android/app/build/outputs/apk/release/app-release.apk`), or
 (b) configure the debug build to embed the JS bundle.
Prefer (a). Turn off minification issues if they appear (`enableProguardInReleaseBuilds = false`). **Always test the final APK with Wi-Fi/mobile data off and Metro closed.**

**R6. Audio focus and interruptions.** Pause ambient sounds on incoming calls or when another app takes audio focus; pause when headphones are unplugged. Use the player's built-in handling and verify.

**R7. Bundled asset resolution.** Audio bundled via `require()` behaves differently in debug (served by Metro) vs release (packed into the APK). Verify audio plays in the release APK offline.

## Theming
Two token sets (light, dark). Soft palette: calm blue-green/teal and deep navy for dark. Rounded corners, generous spacing, large text, slow fades (300 to 600 ms). Text must stay clearly readable in both themes.
