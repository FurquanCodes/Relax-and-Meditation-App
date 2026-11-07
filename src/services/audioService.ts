import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  State,
  Track,
} from 'react-native-track-player';

export interface AmbientTrack {
  id: string;
  title: string;
  subtitle: string;
  artworkIcon: string;
  fileRequire: any;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'white_noise',
    title: 'White Noise',
    subtitle: 'Gentle low-frequency static for calm focus',
    artworkIcon: '💨',
    fileRequire: require('../../assets/audio/ambient/white_noise.wav'),
  },
  {
    id: 'rain',
    title: 'Gentle Rain',
    subtitle: 'Soft falling raindrops on a quiet evening',
    artworkIcon: '🌧️',
    fileRequire: require('../../assets/audio/ambient/rain.wav'),
  },
  {
    id: 'ocean',
    title: 'Ocean Waves',
    subtitle: 'Rhythmic rolling swells and receding foam',
    artworkIcon: '🌊',
    fileRequire: require('../../assets/audio/ambient/ocean.wav'),
  },
  {
    id: 'forest',
    title: 'Forest Breeze',
    subtitle: 'Warm wind whispering through trees',
    artworkIcon: '🍃',
    fileRequire: require('../../assets/audio/ambient/forest.wav'),
  },
];

let isPlayerSetup = false;
let sleepTimerStopAt: number | null = null;
let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
const sleepTimerListeners = new Set<(remainingSeconds: number | null) => void>();

export const audioService = {
  async setupPlayerIfNeeded(): Promise<boolean> {
    if (isPlayerSetup) return true;
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
      });

      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      isPlayerSetup = true;
      return true;
    } catch (e: any) {
      if (e?.message?.includes('already been initialized')) {
        isPlayerSetup = true;
        return true;
      }
      console.warn('audioService setup error:', e);
      return false;
    }
  },

  async playTrack(trackId: string): Promise<void> {
    await this.setupPlayerIfNeeded();
    const trackConfig = AMBIENT_TRACKS.find((t) => t.id === trackId);
    if (!trackConfig) return;

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: trackConfig.id,
      url: trackConfig.fileRequire,
      title: trackConfig.title,
      artist: 'Q9 Relax Ambient',
      album: 'Calm & Relaxation',
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Track);
    await TrackPlayer.play();
  },

  async pause(): Promise<void> {
    await TrackPlayer.pause();
  },

  async resume(): Promise<void> {
    await TrackPlayer.play();
  },

  async stop(): Promise<void> {
    this.cancelSleepTimer();
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  },

  async setVolume(vol: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, vol));
    await TrackPlayer.setVolume(clamped);
  },

  // Sleep Timer logic
  startSleepTimer(minutes: number): void {
    this.cancelSleepTimer();
    if (minutes <= 0) return;

    sleepTimerStopAt = Date.now() + minutes * 60 * 1000;
    this.notifySleepTimerListeners();

    sleepTimerInterval = setInterval(async () => {
      if (!sleepTimerStopAt) {
        this.cancelSleepTimer();
        return;
      }

      const diff = sleepTimerStopAt - Date.now();
      if (diff <= 0) {
        this.cancelSleepTimer();
        await this.stop();
      } else {
        this.notifySleepTimerListeners();
      }
    }, 1000);
  },

  cancelSleepTimer(): void {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    sleepTimerStopAt = null;
    this.notifySleepTimerListeners();
  },

  getSleepTimerRemainingSeconds(): number | null {
    if (!sleepTimerStopAt) return null;
    const diff = sleepTimerStopAt - Date.now();
    return diff > 0 ? Math.ceil(diff / 1000) : 0;
  },

  subscribeSleepTimer(listener: (remainingSeconds: number | null) => void): () => void {
    sleepTimerListeners.add(listener);
    listener(this.getSleepTimerRemainingSeconds());
    return () => sleepTimerListeners.delete(listener);
  },

  notifySleepTimerListeners(): void {
    const remaining = this.getSleepTimerRemainingSeconds();
    sleepTimerListeners.forEach((l) => l(remaining));
  },
};
