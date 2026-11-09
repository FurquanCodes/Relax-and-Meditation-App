import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },

  async getJson<T>(key: string, fallback: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return fallback;
      const parsed = JSON.parse(value);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      return fallback;
    }
  },

  async setJson<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  /**
   * Retrieves JSON with legacy key fallback for seamless backward compatibility.
   * If legacy key exists, migrates data to the primary key.
   */
  async getJsonWithFallback<T>(
    primaryKey: string,
    legacyKey: string,
    fallback: T
  ): Promise<T> {
    try {
      const primaryVal = await AsyncStorage.getItem(primaryKey);
      if (primaryVal) {
        return JSON.parse(primaryVal);
      }

      const legacyVal = await AsyncStorage.getItem(legacyKey);
      if (legacyVal) {
        const parsed = JSON.parse(legacyVal);
        // Migrate to primary key in the background
        await AsyncStorage.setItem(primaryKey, legacyVal);
        return parsed;
      }

      return fallback;
    } catch {
      return fallback;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};
