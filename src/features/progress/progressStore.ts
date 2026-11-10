import { storage } from '../../shared/storage';

export interface ProgressData {
  completedSessions: number;
  totalSeconds: number;
}

const PROGRESS_KEY_PRIMARY = '@sovaeli_progress';
const PROGRESS_KEY_LEGACY = '@q9_relax_progress';

let currentProgress: ProgressData = {
  completedSessions: 0,
  totalSeconds: 0,
};

const listeners = new Set<() => void>();

export const progressStore = {
  async init(): Promise<void> {
    const saved = await storage.getJsonWithFallback<Partial<ProgressData>>(
      PROGRESS_KEY_PRIMARY,
      PROGRESS_KEY_LEGACY,
      {}
    );
    currentProgress = {
      completedSessions:
        typeof saved.completedSessions === 'number' && saved.completedSessions >= 0
          ? saved.completedSessions
          : 0,
      totalSeconds:
        typeof saved.totalSeconds === 'number' && saved.totalSeconds >= 0
          ? saved.totalSeconds
          : 0,
    };
    listeners.forEach((l) => l());
  },

  getCompletedSessions(): number {
    return currentProgress.completedSessions;
  },

  getTotalSeconds(): number {
    return currentProgress.totalSeconds;
  },

  getTotalMinutes(): number {
    if (currentProgress.totalSeconds <= 0) {
      return 0;
    }
    const computed = Math.round(currentProgress.totalSeconds / 60);
    // If user has completed at least 1 session, minutes should be at least 1
    return currentProgress.completedSessions > 0 ? Math.max(1, computed) : computed;
  },

  async recordCompletedSession(sessionSeconds: number): Promise<void> {
    if (typeof sessionSeconds !== 'number' || sessionSeconds <= 0 || isNaN(sessionSeconds)) {
      return;
    }
    currentProgress = {
      completedSessions: currentProgress.completedSessions + 1,
      totalSeconds: currentProgress.totalSeconds + Math.round(sessionSeconds),
    };
    await storage.setJson(PROGRESS_KEY_PRIMARY, currentProgress);
    listeners.forEach((l) => l());
  },

  async recordListeningSeconds(seconds: number, countAsSession = false): Promise<void> {
    if (typeof seconds !== 'number' || seconds <= 0 || isNaN(seconds)) {
      return;
    }
    currentProgress = {
      completedSessions: currentProgress.completedSessions + (countAsSession ? 1 : 0),
      totalSeconds: currentProgress.totalSeconds + Math.round(seconds),
    };
    await storage.setJson(PROGRESS_KEY_PRIMARY, currentProgress);
    listeners.forEach((l) => l());
  },

  async resetProgress(): Promise<void> {
    currentProgress = {
      completedSessions: 0,
      totalSeconds: 0,
    };
    await storage.setJson(PROGRESS_KEY_PRIMARY, currentProgress);
    await storage.remove(PROGRESS_KEY_LEGACY);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
