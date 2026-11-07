# 01: Project Brief (summary of the official Q9 brief)

This is the source of truth. Everything else must follow it.

| Item | Value |
|---|---|
| Project | Calm and Relaxation App |
| Developer | Muhammad Furqan (Intern Android Developer) |
| Technical Lead | Raja Husnain Ali |
| Platform | Android (phone) |
| Brief issued | 29 October 2026 |
| First APK due | Monday 9 November 2026, before office time |
| Reference app | Calm on Google Play, for understanding the category only |

## Concept
A simple, soothing app that helps a user relax in a few minutes: a guided breathing exercise, a quiet meditation timer, or calming background sounds. The design should feel **slow, soft, and uncluttered**, with **no sign-up** needed to start.
Target users: people who feel stressed, want a short break during work, or want calm sounds to relax or fall asleep.

## MVP features (must have for first APK)
1. **Home screen:** calm greeting and three clear entry points: Breathe, Meditate (timer), Sounds.
2. **Guided breathing:** animated circle that expands and contracts with on-screen cues (Inhale, Hold, Exhale). At least two patterns (for example 4-4-4-4 box breathing and 4-7-8). Session length choice: 1, 3, or 5 minutes.
3. **Meditation timer:** choose a duration (for example 5, 10, 15, 20 minutes), start, pause, stop. Soft bell at start and end. The timer must keep running correctly if the screen turns off.
4. **Calming sounds:** at least four looping ambient sounds (rain, ocean waves, forest, white noise, etc.) with play/pause and a volume control. Playback continues when the app is in the background, with a media notification to stop it.
5. **Sleep timer for sounds:** stop the sound automatically after 15, 30, or 60 minutes.
6. **Simple progress:** count of completed sessions and total minutes, stored on the device.
7. **Settings:** light/dark theme and bell on/off. Settings are saved.
8. **Works offline:** all audio bundled in the app.

## Later features (NOT for the first APK, do not build now)
Mixing multiple sounds, daily reminder notification, mood check-in, guided voice sessions, streaks and weekly calendar, home screen widget, haptic feedback with breathing.

## Content and technical notes
- Only royalty-free or properly licensed audio (for example CC0). Record each source and licence in the README.
- Sounds must loop without an audible gap. Media3/ExoPlayer with a foreground service is a good starting point; confirm the approach with the Technical Lead.
- Keep app size reasonable: compress audio (OGG or AAC), keep loops short.
- No health or medical claims in app text.
- Do not copy the reference app's name, logo, icons, screens, text, artwork, or audio.
- Use only content and assets we are allowed to use (open licences, royalty-free, or created by us). Note each source in the README.
- Use a placeholder name and icon until final branding is decided.

## Expectations
- Work independently and own the project from setup to APK. Plan tasks and keep moving.
- Discuss technical questions, blockers, or design decisions with the Technical Lead. Ask early rather than staying stuck.
- Default stack in the brief is Kotlin + Jetpack Compose + Material 3 **unless the Technical Lead agrees on something else**. This project uses **React Native** (the team asked for it). Hashim should keep a written confirmation from the Technical Lead.
- Git repository with small, regular commits and clear messages.
- Clean, readable code with simple structure (UI, data, logic in separate layers).
- Test on at least one real Android device and one emulator, in both portrait orientation and dark mode.

## What to submit by 9 November 2026
- An installable APK (debug build is fine for this first version) shared with the Technical Lead.
- Access to the Git repository.
- A short README: how to build, what is done, what is pending, and sources of any content or assets.

## Done means
- The APK installs and runs without crashes on a real device.
- Breathing animation and cues stay in sync for each pattern.
- The timer and sounds behave correctly with the screen off and the app in the background.
- Progress and settings survive closing and reopening the app.
