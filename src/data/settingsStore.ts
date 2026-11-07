import { storage } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type SceneId = 'auto' | 'meadow' | 'forest' | 'ocean' | 'rain' | 'night';

interface SettingsData {
  themePreference: ThemePreference;
  bellEnabled: boolean;
  scenePreference: SceneId;
}

const SETTINGS_KEY = '@q9_relax_settings';

let currentSettings: SettingsData = {
  themePreference: 'dark',
  bellEnabled: true,
  scenePreference: 'auto',
};

const listeners = new Set<() => void>();

export const settingsStore = {
  async init(): Promise<void> {
    const saved = await storage.getJson<Partial<SettingsData>>(SETTINGS_KEY, {});
    currentSettings = {
      themePreference: saved.themePreference || 'dark',
      bellEnabled: saved.bellEnabled !== undefined ? saved.bellEnabled : true,
      scenePreference: saved.scenePreference || 'auto',
    };
    listeners.forEach((l) => l());
  },

  getThemePreference(): ThemePreference {
    return currentSettings.themePreference;
  },

  isBellEnabled(): boolean {
    return currentSettings.bellEnabled;
  },

  getScenePreference(): SceneId {
    return currentSettings.scenePreference;
  },

  async setThemePreference(pref: ThemePreference): Promise<void> {
    currentSettings.themePreference = pref;
    await storage.setJson(SETTINGS_KEY, currentSettings);
    listeners.forEach((l) => l());
  },

  async setBellEnabled(enabled: boolean): Promise<void> {
    currentSettings.bellEnabled = enabled;
    await storage.setJson(SETTINGS_KEY, currentSettings);
    listeners.forEach((l) => l());
  },

  async setScenePreference(scene: SceneId): Promise<void> {
    currentSettings.scenePreference = scene;
    await storage.setJson(SETTINGS_KEY, currentSettings);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
