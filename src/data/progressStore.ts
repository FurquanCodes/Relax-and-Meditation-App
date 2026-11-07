import { storage } from './storage';

interface ProgressData {
  completedSessions: number;
  totalSeconds: number;
}

const PROGRESS_KEY = '@q9_relax_progress';

let currentProgress: ProgressData = {
  completedSessions: 0,
  totalSeconds: 0,
};

const listeners = new Set<() => void>();

export const progressStore = {
  async init(): Promise<void> {
    const saved = await storage.getJson<Partial<ProgressData>>(PROGRESS_KEY, {});
    currentProgress = {
      completedSessions: saved.completedSessions || 0,
      totalSeconds: saved.totalSeconds || 0,
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
    return Math.floor(currentProgress.totalSeconds / 60);
  },

  async recordCompletedSession(sessionSeconds: number): Promise<void> {
    if (sessionSeconds <= 0) return;
    currentProgress = {
      completedSessions: currentProgress.completedSessions + 1,
      totalSeconds: currentProgress.totalSeconds + sessionSeconds,
    };
    await storage.setJson(PROGRESS_KEY, currentProgress);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

