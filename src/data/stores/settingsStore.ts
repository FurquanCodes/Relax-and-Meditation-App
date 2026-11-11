import { storage } from '../storage/storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type SceneId = 'auto' | 'meadow' | 'forest' | 'ocean' | 'rain' | 'night';
export type SoundCategoryId = 'rain' | 'forest' | 'ocean' | 'calm';

export interface SettingsData {
  themePreference: ThemePreference;
  bellEnabled: boolean;
  scenePreference: SceneId;
  // Sound preferences
  soundCategory: SoundCategoryId;
  soundTrackId: string;
  soundVolume: number;
  soundSleepMinutes: number;
  // Breathing preferences
  breathingPatternId: string;
  breathingDurationMinutes: number;
  // Meditation preferences
  meditationDurationMinutes: number;
  meditationThemeId: string;
}

const SETTINGS_KEY_PRIMARY = '@sovaeli_settings';
const SETTINGS_KEY_LEGACY = '@q9_relax_settings';

const DEFAULT_SETTINGS: SettingsData = {
  themePreference: 'light', // Light is the signature warm aesthetic for SOVAELI
  bellEnabled: true,
  scenePreference: 'auto',
  soundCategory: 'rain',
  soundTrackId: 'gentle_night_rain',
  soundVolume: 0.7,
  soundSleepMinutes: 0,
  breathingPatternId: 'box',
  breathingDurationMinutes: 1,
  meditationDurationMinutes: 5,
  meditationThemeId: 'forest',
};

let currentSettings: SettingsData = { ...DEFAULT_SETTINGS };

const listeners = new Set<() => void>();

export const settingsStore = {
  async init(): Promise<void> {
    const saved = await storage.getJsonWithFallback<Partial<SettingsData>>(
      SETTINGS_KEY_PRIMARY,
      SETTINGS_KEY_LEGACY,
      {}
    );

    currentSettings = {
      themePreference: saved.themePreference || DEFAULT_SETTINGS.themePreference,
      bellEnabled: saved.bellEnabled !== undefined ? saved.bellEnabled : DEFAULT_SETTINGS.bellEnabled,
      scenePreference: saved.scenePreference || DEFAULT_SETTINGS.scenePreference,
      soundCategory: saved.soundCategory || DEFAULT_SETTINGS.soundCategory,
      soundTrackId: saved.soundTrackId || DEFAULT_SETTINGS.soundTrackId,
      soundVolume: typeof saved.soundVolume === 'number' ? Math.max(0, Math.min(1, saved.soundVolume)) : DEFAULT_SETTINGS.soundVolume,
      soundSleepMinutes: typeof saved.soundSleepMinutes === 'number' ? saved.soundSleepMinutes : DEFAULT_SETTINGS.soundSleepMinutes,
      breathingPatternId: saved.breathingPatternId || DEFAULT_SETTINGS.breathingPatternId,
      breathingDurationMinutes: saved.breathingDurationMinutes || DEFAULT_SETTINGS.breathingDurationMinutes,
      meditationDurationMinutes: saved.meditationDurationMinutes || DEFAULT_SETTINGS.meditationDurationMinutes,
      meditationThemeId: saved.meditationThemeId || DEFAULT_SETTINGS.meditationThemeId,
    };

    listeners.forEach((l) => l());
  },

  // 1. Theme
  getThemePreference(): ThemePreference {
    return currentSettings.themePreference;
  },
  async setThemePreference(pref: ThemePreference): Promise<void> {
    currentSettings.themePreference = pref;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // 2. Bell
  isBellEnabled(): boolean {
    return currentSettings.bellEnabled;
  },
  async setBellEnabled(enabled: boolean): Promise<void> {
    currentSettings.bellEnabled = enabled;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // 3. Scene
  getScenePreference(): SceneId {
    return currentSettings.scenePreference;
  },
  async setScenePreference(scene: SceneId): Promise<void> {
    currentSettings.scenePreference = scene;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // 4. Sound Preferences
  getSoundCategory(): SoundCategoryId {
    return currentSettings.soundCategory;
  },
  async setSoundCategory(category: SoundCategoryId): Promise<void> {
    currentSettings.soundCategory = category;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  getSoundTrackId(): string {
    return currentSettings.soundTrackId;
  },
  async setSoundTrackId(trackId: string): Promise<void> {
    currentSettings.soundTrackId = trackId;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  getSoundVolume(): number {
    return currentSettings.soundVolume;
  },
  async setSoundVolume(volume: number): Promise<void> {
    currentSettings.soundVolume = Math.max(0, Math.min(1, volume));
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  getSoundSleepMinutes(): number {
    return currentSettings.soundSleepMinutes;
  },
  async setSoundSleepMinutes(minutes: number): Promise<void> {
    currentSettings.soundSleepMinutes = minutes;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // 5. Breathing Preferences
  getBreathingPatternId(): string {
    return currentSettings.breathingPatternId;
  },
  async setBreathingPatternId(patternId: string): Promise<void> {
    currentSettings.breathingPatternId = patternId;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  getBreathingDurationMinutes(): number {
    return currentSettings.breathingDurationMinutes;
  },
  async setBreathingDurationMinutes(minutes: number): Promise<void> {
    currentSettings.breathingDurationMinutes = minutes;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // 6. Meditation Preferences
  getMeditationDurationMinutes(): number {
    return currentSettings.meditationDurationMinutes;
  },
  async setMeditationDurationMinutes(minutes: number): Promise<void> {
    currentSettings.meditationDurationMinutes = minutes;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  getMeditationThemeId(): string {
    return currentSettings.meditationThemeId;
  },
  async setMeditationThemeId(themeId: string): Promise<void> {
    currentSettings.meditationThemeId = themeId;
    await storage.setJson(SETTINGS_KEY_PRIMARY, currentSettings);
    listeners.forEach((l) => l());
  },

  // Listener management
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
