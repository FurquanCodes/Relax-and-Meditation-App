# 03: Feature Specs and Acceptance Checks

Every feature is done only when its **Acceptance checks** pass on the emulator, and the background/screen-off ones pass on a real device.

## General UI
- Portrait only (lock orientation in `AndroidManifest.xml`).
- Slow, soft, uncluttered. One main action per screen. Large touch targets (at least 48dp).
- Theme: Light and Dark, defined as design tokens. All screens use tokens only (no hard-coded colors in screens).
- Header with a back button on inner screens.

## 1. Home screen
- Greeting by time of day: "Good morning" (5:00 to 11:59), "Good afternoon" (12:00 to 17:59), "Good evening" (otherwise), plus a soft line such as "Take a moment for yourself."
- Three large cards: **Breathe**, **Meditate**, **Sounds**. Each opens its screen.
- A small progress strip: "Sessions: N, Minutes: M" (from stored progress).
- A settings icon/button.
- Acceptance: all three cards navigate; greeting changes with time; progress strip updates after finishing a session.

## 2. Guided breathing
**Patterns (data-driven, in `patterns.ts`):**
- Box breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.
- 4-7-8: Inhale 4s, Hold 7s, Exhale 8s (no second hold).
- (Optional only if time remains) a simple 4-6 pattern: Inhale 4s, Exhale 6s.

**Setup screen:** choose pattern, choose length (1, 3, 5 minutes), press Start.

**Session screen:**
- Large circle. Inhale: grows to max scale over the phase duration. Hold: stays. Exhale: shrinks to min scale over the phase duration. Hold after exhale: stays small.
- Cue text in the circle: "Inhale", "Hold", "Exhale", with the seconds remaining in the phase.
- Elapsed/remaining time shown for the whole session.
- Buttons: Pause/Resume, Stop.
- Keep the screen awake during a session if it can be done safely with a maintained library (optional).

**Sync rule (important, part of "Done means"):** pattern phases are the single source of truth. The cue text change and the start of the circle animation for a phase must be triggered by the same function call at the same moment. Phase boundaries are computed from timestamps (`Date.now()` or the animation clock), **never** by adding up `setTimeout` durations, so there is no drift over 5 minutes.

**Rules:**
- Session ends when the chosen length is reached. Show a calm "Session complete" view and record progress.
- Stop early or app sent to background: pause the session (on return show Resume/Stop). A stopped session is **not** counted.
- Completed breathing session adds 1 session and the chosen minutes to progress.

**Acceptance:** both patterns run for 1 minute without the cue ever disagreeing with the circle; 5-minute run shows no visible drift; stop does not count; complete does.

## 3. Meditation timer
- Duration chips: 5, 10, 15, 20 minutes. (In `__DEV__` builds also a 1-minute chip for testing. Not in release.)
- Start plays a soft bell (if bell setting is on) and shows a large countdown `mm:ss`.
- Pause/Resume and Stop buttons.
- Time model: wall-clock end time (see `02`, R3). Pause stores remaining time; resume sets a new end time.
- Must keep running correctly with the screen off and the app in the background (foreground service with ongoing notification, per `02`). At the end: soft bell (if enabled), show completion, record progress once.
- Stopping early is not counted.

**Acceptance (real device):** start a 5-minute timer, lock the screen, wait. At the end the bell sounds, and unlocking shows "complete". Remaining time shown after unlocking mid-session is correct within 1 second. Bell off in settings means no bell at start or end.

## 4. Calming sounds
- At least **four** bundled looping sounds: Rain, Ocean waves, Forest, White noise (a fifth such as Stream or Wind is welcome if the file is good).
- Sounds screen: list/grid of sounds. Tap a sound to start it. Only one sound plays at a time. Show the active sound clearly.
- Play/Pause button and a volume slider (0 to 100%, default about 70%).
- Looping must be gap-free (see `02`, R2).
- Keeps playing with the screen off and the app in the background. A media notification shows the sound name with play/pause and stop controls. Stopping from the notification stops playback and removes the notification.
- Pause on phone call / other audio focus and on headphone unplug.
- Sounds do **not** add to progress (progress counts breathing and meditation sessions only).

**Acceptance (real device):** start rain, press the power button, wait 2 minutes, audio continues without gaps; the notification stop button stops it; returning to the app shows the correct state.

## 5. Sleep timer for sounds
- Options: Off, 15, 30, 60 minutes, shown as chips on the Sounds screen. Available while a sound is playing; resets when playback is stopped.
- Show the remaining time. Use a wall-clock `stopAt`.
- At the end: fade out over about 3 seconds (if easy) and stop playback, remove the notification.
- Works with the screen off (see `02`, R4). Choosing Off cancels it.
- `__DEV__` builds may include a 1-minute option for testing.

**Acceptance:** with the screen off the sound stops by itself at the chosen time (check at least the 15-minute option once on the real device).

## 6. Simple progress
- Stored on device: `completedSessions` (number) and `totalSeconds` (number). Display total as minutes.
- Updated only when a breathing or meditation session completes.
- Shown on Home. Empty state: "Sessions: 0, Minutes: 0".
- Acceptance: numbers survive force-closing and reopening the app.

## 7. Settings
- Theme: Light / Dark switch. On first launch follow the device theme; after the user chooses, keep their choice.
- Bell: on/off. Affects meditation start and end bell.
- Both saved in storage and loaded **before** the first screen renders, so there is no flash of the wrong theme.
- Small "About" text: app name (placeholder "Q9 Relax") and version.
- Acceptance: change both, force-close, reopen: values are kept.

## 8. Offline
- No network permission is needed. All audio is in the APK.
- Acceptance: install the final APK, turn on airplane mode, every feature still works.

## App text rules
- Calm, plain, short sentences. No health or medical claims.
- Allowed: "Take a moment", "Slow breathing exercise", "Calming sounds".
- Not allowed: "reduces anxiety", "treats insomnia", "lowers stress", "cures", "clinically proven", "therapy".
- If a line sounds like a health benefit, rewrite it to describe only what the app does.
