import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { MeditationTimer } = NativeModules;

export interface TimerStatus {
  isRunning: boolean;
  remainingSeconds: number;
  totalDuration: number;
}

const timerEmitter = MeditationTimer ? new NativeEventEmitter(MeditationTimer) : null;

export const nativeTimer = {
  isAvailable(): boolean {
    return Platform.OS === 'android' && Boolean(MeditationTimer);
  },

  async startTimer(durationSeconds: number, playBell: boolean): Promise<boolean> {
    if (!MeditationTimer) return false;
    try {
      return await MeditationTimer.startTimer(durationSeconds, playBell);
    } catch (e) {
      console.warn('nativeTimer.startTimer error:', e);
      return false;
    }
  },

  async stopTimer(): Promise<boolean> {
    if (!MeditationTimer) return false;
    try {
      return await MeditationTimer.stopTimer();
    } catch (e) {
      console.warn('nativeTimer.stopTimer error:', e);
      return false;
    }
  },

  async getStatus(): Promise<TimerStatus> {
    if (!MeditationTimer) {
      return { isRunning: false, remainingSeconds: 0, totalDuration: 0 };
    }
    try {
      return await MeditationTimer.getStatus();
    } catch {
      return { isRunning: false, remainingSeconds: 0, totalDuration: 0 };
    }
  },

  async playBell(): Promise<boolean> {
    if (!MeditationTimer) return false;
    try {
      return await MeditationTimer.playBell();
    } catch {
      return false;
    }
  },

  onTick(callback: (secondsLeft: number, totalDuration: number) => void) {
    if (!timerEmitter) return () => {};
    const sub = timerEmitter.addListener('onTimerTick', (data: any) => {
      callback(data?.remainingSeconds ?? 0, data?.totalDuration ?? 0);
    });
    return () => sub.remove();
  },

  onComplete(callback: (completedDuration: number) => void) {
    if (!timerEmitter) return () => {};
    const sub = timerEmitter.addListener('onTimerComplete', (data: any) => {
      callback(data?.completedDuration ?? 0);
    });
    return () => sub.remove();
  },

  onStopped(callback: () => void) {
    if (!timerEmitter) return () => {};
    const sub = timerEmitter.addListener('onTimerStopped', callback);
    return () => sub.remove();
  },
};
