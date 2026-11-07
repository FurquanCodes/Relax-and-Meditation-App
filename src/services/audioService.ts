import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  Track,
} from 'react-native-track-player';

export type SoundCategoryId = 'rain' | 'ocean' | 'forest' | 'calm';

export interface SoundCategory {
  id: SoundCategoryId;
  title: string;
  subtitle: string;
  icon: string;
  pastelBg: string;
  pastelBgDark: string;
  borderColor: string;
}

export interface AmbientTrack {
  id: string;
  title: string;
  subtitle: string;
  categoryId: SoundCategoryId;
  artworkIcon: string;
  fileRequire: any;
}

export const SOUND_CATEGORIES: SoundCategory[] = [
  {
    id: 'rain',
    title: 'Rain',
    subtitle: 'Falling rain & distant thunder',
    icon: '🌧️',
    pastelBg: '#E8F1F5',
    pastelBgDark: '#1E2D34',
    borderColor: '#7FA8BD',
  },
  {
    id: 'ocean',
    title: 'Ocean',
    subtitle: 'Rolling surf & coastal tides',
    icon: '🌊',
    pastelBg: '#E4F3EE',
    pastelBgDark: '#1B352E',
    borderColor: '#6BAFA0',
  },
  {
    id: 'forest',
    title: 'Forest',
    subtitle: 'Morning woodland & birds',
    icon: '🌿',
    pastelBg: '#EAF3EB',
    pastelBgDark: '#203627',
    borderColor: '#7DAA83',
  },
  {
    id: 'calm',
    title: 'Calm & Meditate',
    subtitle: 'Peaceful acoustic chords & zen',
    icon: '🧘',
    pastelBg: '#EFEBF8',
    pastelBgDark: '#28243E',
    borderColor: '#988EC2',
  },
];

export const AMBIENT_TRACKS: AmbientTrack[] = [
  // 1. Rain Sounds
  {
    id: 'gentle_night_rain',
    title: 'Gentle Night Rain',
    subtitle: 'Soft falling raindrops on a quiet evening',
    categoryId: 'rain',
    artworkIcon: '🌧️',
    fileRequire: require('../../assets/audio/ambient/gentle_night_rain.mp3'),
  },
  {
    id: 'sleepy_rain_music',
    title: 'Sleepy Rain Melody',
    subtitle: 'Calm rain texture blended with peaceful harmony',
    categoryId: 'rain',
    artworkIcon: '🎵',
    fileRequire: require('../../assets/audio/ambient/sleepy_rain_music.mp3'),
  },
  {
    id: 'rain_thunder',
    title: 'Rain & Thunder',
    subtitle: 'Deep soothing rainfall with gentle rumble',
    categoryId: 'rain',
    artworkIcon: '⛈️',
    fileRequire: require('../../assets/audio/ambient/rain_thunder.mp3'),
  },

  // 2. Ocean Sounds
  {
    id: 'ocean_waves',
    title: 'Ocean Waves',
    subtitle: 'Rhythmic rolling swells and receding sea foam',
    categoryId: 'ocean',
    artworkIcon: '🌊',
    fileRequire: require('../../assets/audio/ambient/ocean_waves.mp3'),
  },
  {
    id: 'ocean_vibes',
    title: 'Ocean Coastal Breeze',
    subtitle: 'Gentle coastal surf with soft tidal wash',
    categoryId: 'ocean',
    artworkIcon: '🏖️',
    fileRequire: require('../../assets/audio/ambient/ocean_vibes.mp3'),
  },
  {
    id: 'ocean_waves_music',
    title: 'Ocean Waves Melody',
    subtitle: 'Soothing oceanic swells with ambient harmony',
    categoryId: 'ocean',
    artworkIcon: '🌅',
    fileRequire: require('../../assets/audio/ambient/ocean_waves_music.mp3'),
  },

  // 3. Forest Sounds
  {
    id: 'forest_ambience_birds',
    title: 'Forest Ambience',
    subtitle: 'Morning birdsong and peaceful tree canopy breeze',
    categoryId: 'forest',
    artworkIcon: '🍃',
    fileRequire: require('../../assets/audio/ambient/forest_ambience_birds.mp3'),
  },
  {
    id: 'forest_river_birds',
    title: 'Forest River Stream',
    subtitle: 'Babbling water stream with singing woodland birds',
    categoryId: 'forest',
    artworkIcon: '🏞️',
    fileRequire: require('../../assets/audio/ambient/forest_river_birds.mp3'),
  },
  {
    id: 'forest_bird_chirping',
    title: 'Morning Songbirds',
    subtitle: 'Vibrant uplifting forest birds greeting the dawn',
    categoryId: 'forest',
    artworkIcon: '🐦',
    fileRequire: require('../../assets/audio/ambient/forest_bird_chirping.mp3'),
  },

  // 4. Calm & Meditation Sounds
  {
    id: 'meditation_audio',
    title: 'Deep Meditation',
    subtitle: 'Serene resonant soundscape for mindfulness',
    categoryId: 'calm',
    artworkIcon: '🧘',
    fileRequire: require('../../assets/audio/ambient/meditation_audio.mp3'),
  },
  {
    id: 'calm_sound',
    title: 'Calm Acoustic Melody',
    subtitle: 'Slow, soothing harmonic chords to release tension',
    categoryId: 'calm',
    artworkIcon: '🎶',
    fileRequire: require('../../assets/audio/ambient/calm_sound.mp3'),
  },
  {
    id: 'white_noise_relax',
    title: 'Soothing White Noise',
    subtitle: 'Constant calming static to mask distractions',
    categoryId: 'calm',
    artworkIcon: '💨',
    fileRequire: require('../../assets/audio/ambient/white_noise_relax.mp3'),
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

      // Loop current track seamlessly
      await TrackPlayer.setRepeatMode(RepeatMode.Track);

      isPlayerSetup = true;
      return true;
    } catch (e) {
      console.warn('TrackPlayer setup failed or already initialized', e);
      return false;
    }
  },

  async playTrack(trackId: string): Promise<void> {
    await this.setupPlayerIfNeeded();
    const trackConfig = AMBIENT_TRACKS.find((t) => t.id === trackId);
    if (!trackConfig) return;

    await TrackPlayer.reset();

    const track: Track = {
      id: trackConfig.id,
      url: trackConfig.fileRequire,
      title: trackConfig.title,
      artist: 'Q9 Relax Ambient',
      album: 'Relaxation Sounds',
    };

    await TrackPlayer.add(track);
    await TrackPlayer.play();
  },

  async pause(): Promise<void> {
    await TrackPlayer.pause();
  },

  async play(): Promise<void> {
    await TrackPlayer.play();
  },

  async stop(): Promise<void> {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    this.cancelSleepTimer();
  },

  async setVolume(volume: number): Promise<void> {
    await TrackPlayer.setVolume(Math.max(0, Math.min(1, volume)));
  },

  // Sleep timer: stops playback automatically at wall-clock stopAt
  startSleepTimer(minutes: number): void {
    if (minutes <= 0) {
      this.cancelSleepTimer();
      return;
    }

    const durationMs = minutes * 60 * 1000;
    sleepTimerStopAt = Date.now() + durationMs;

    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
    }

    this.notifySleepListeners(minutes * 60);

    sleepTimerInterval = setInterval(async () => {
      if (!sleepTimerStopAt) return;

      const now = Date.now();
      const remainingMs = sleepTimerStopAt - now;
      const remainingSeconds = Math.max(0, Math.round(remainingMs / 1000));

      this.notifySleepListeners(remainingSeconds);

      if (remainingMs <= 0) {
        // Stop playback
        await this.stop();
        this.cancelSleepTimer();
      }
    }, 1000);
  },

  cancelSleepTimer(): void {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    sleepTimerStopAt = null;
    this.notifySleepListeners(null);
  },

  subscribeSleepTimer(cb: (remainingSeconds: number | null) => void): () => void {
    sleepTimerListeners.add(cb);
    return () => {
      sleepTimerListeners.delete(cb);
    };
  },

  notifySleepListeners(remainingSeconds: number | null): void {
    sleepTimerListeners.forEach((cb) => {
      try {
        cb(remainingSeconds);
      } catch (e) {
        // listener error ignored
      }
    });
  },

  getSleepTimerRemainingSeconds(): number | null {
    if (!sleepTimerStopAt) return null;
    const remainingMs = sleepTimerStopAt - Date.now();
    return Math.max(0, Math.round(remainingMs / 1000));
  },
};
