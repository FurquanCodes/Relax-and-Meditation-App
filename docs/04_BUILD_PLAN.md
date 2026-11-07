# 04: Build Plan (do in this order)

Deadline: **Monday 9 November 2026, before office time.** Aim to be fully done by Sunday night, leaving Monday morning as buffer only.

After **every** milestone: the app builds, runs on the emulator, changes are committed, and `PROGRESS.md` is updated. Report to Hashim in three lines (did / check / next).

## Milestone 0: Setup and risk spike (Friday night)
1. Check the environment: `node -v`, `java -version`, `git --version`, Android SDK path, `ANDROID_HOME`, `adb` on PATH, an emulator (AVD) exists. Fix what is missing, one step at a time with Hashim.
2. Create the React Native TypeScript project `Q9Relax` (see `02`). Run it on the emulator. Run `git init`, add a proper `.gitignore`, first commit: `chore: initial React Native project`.
3. Create `PROGRESS.md` and `README.md` skeletons.
4. **Spike A (background audio):** install the audio library, play one looping test sound, confirm background playback, media notification with controls, and screen-off behavior on Hashim's **real phone** (USB debugging).
5. **Spike B (timer with screen off):** a 2-minute test timer using the wall-clock approach and the chosen background mechanism. Confirm it finishes correctly with the screen off.
6. Write the decisions and any problems in `PROGRESS.md`. Prepare a short message for Hashim to send to the Technical Lead: confirm (1) React Native is approved, (2) the background audio and timer approach.

## Milestone 1: Foundation
- Create the folder structure from `02`.
- Theme tokens (light and dark), typography, spacing.
- Navigation with the five screens as stubs.
- Storage layer: `settingsStore` and `progressStore`, with load-before-render.
- Settings screen working (theme + bell) and saved.
- Home screen: greeting, three cards, progress strip, settings button.
- Commit examples: `feat: add theme tokens and navigation`, `feat: persist settings`.

## Milestone 2: Guided breathing
- `patterns.ts` data, then the `useBreathingSession` engine (timestamp-based phases).
- `BreathingCircle` component with `Animated`.
- Setup screen (pattern + length), session screen, pause/resume/stop, complete view.
- Record progress on completion only.
- Test both patterns for 1 minute, then one 5-minute run.

## Milestone 3: Meditation timer
- Duration chips, countdown display, start/pause/stop.
- Wall-clock timer logic and the background mechanism proven in Spike B.
- Start and end bell (respect the bell setting).
- Record progress once on completion. Test with the screen off on the real device.

## Milestone 4: Sounds and sleep timer
- Source and prepare at least four looping OGG files (see `05`). Fill `assets/audio/SOURCES.md`.
- Sounds screen, play/pause, volume slider, one sound at a time.
- Playback service, media notification with controls, audio focus handling.
- Sleep timer (Off/15/30/60) with wall-clock `stopAt` working in the background.
- Test with the screen off and the app in the background on the real device.

## Milestone 5: Polish
- Empty and error states (for example notification permission denied: explain softly and continue).
- Placeholder app icon and name (`Q9 Relax`).
- Check text against the "App text rules" in `03`.
- Remove unused code, `console.log`s, and TODOs that no longer apply.

## Milestone 6: Testing
Run the full checklist in `05` on **one real device and one emulator**, in portrait and in dark mode. Fix what fails. Record results in `PROGRESS.md`.

## Milestone 7: Release and submission
1. Build the shareable APK (see `02`, R5). Install it on the real phone. Turn on airplane mode, close Metro, and re-test core features.
2. Finish `README.md` (see `05`).
3. Final `PROGRESS.md`. Commit and tag: `git tag v0.1.0`.
4. Tell Hashim: where the APK file is, how to share it with the Technical Lead, and that the Git repository access must be given to the Technical Lead (ask Hashim for the remote URL; do not push anywhere without his OK).

## Time guide
- Friday night: Milestone 0 and Milestone 1.
- Saturday: Milestones 2, 3, 4.
- Sunday: Milestones 5, 6, 7.
- If behind schedule: keep all MVP items working, drop optional items (third breathing pattern, fade-out, keep-awake), and list them under "Pending" in the README. Never drop the background and screen-off requirements.
