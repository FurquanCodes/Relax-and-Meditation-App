import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';

const events = [Event.PlaybackState, Event.PlaybackError];

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<string>('idle');
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    async function init() {
      // 1. Request notification permission on Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      // 2. Setup TrackPlayer
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

        // 3. Add ambient track
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: 'white_noise',
          url: require('./assets/audio/ambient/white_noise.wav'),
          title: 'White Noise',
          artist: 'Q9 Relax Ambient',
        });

        await TrackPlayer.setRepeatMode(RepeatMode.Track);
        await TrackPlayer.setVolume(0.7);
        setIsReady(true);
      } catch (e) {
        console.warn('TrackPlayer init error:', e);
      }
    }

    init();
  }, []);

  useTrackPlayerEvents(events, (event) => {
    if (event.type === Event.PlaybackState) {
      setPlayerState(String(event.state));
    }
  });

  const handlePlay = async () => {
    await TrackPlayer.play();
    setPlayerState('playing');
  };

  const handlePause = async () => {
    await TrackPlayer.pause();
    setPlayerState('paused');
  };

  const handleStop = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'white_noise',
      url: require('./assets/audio/ambient/white_noise.wav'),
      title: 'White Noise',
      artist: 'Q9 Relax Ambient',
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Track);
    setPlayerState('stopped');
  };

  const handleVolume = async (val: number) => {
    setVolume(val);
    await TrackPlayer.setVolume(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.header}>
        <Text style={styles.appTitle}>Q9 Relax</Text>
        <Text style={styles.subtitle}>Spike A: Background Looping Audio</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ambient Sound: White Noise</Text>
        <Text style={styles.statusText}>
          Player Status: <Text style={styles.statusHighlight}>{playerState}</Text>
        </Text>
        <Text style={styles.readyText}>
          {isReady ? '✓ Audio Player Ready' : 'Initializing player...'}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.playBtn]}
            onPress={handlePlay}
            disabled={!isReady}
          >
            <Text style={styles.btnText}>▶ Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.pauseBtn]}
            onPress={handlePause}
            disabled={!isReady}
          >
            <Text style={styles.btnText}>❚❚ Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.stopBtn]}
            onPress={handleStop}
            disabled={!isReady}
          >
            <Text style={styles.btnText}>■ Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.volumeRow}>
          <Text style={styles.volumeLabel}>Volume: {Math.round(volume * 100)}%</Text>
          <View style={styles.volButtons}>
            <TouchableOpacity
              style={styles.volBtn}
              onPress={() => handleVolume(Math.max(0.1, volume - 0.2))}
            >
              <Text style={styles.volBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.volBtn}
              onPress={() => handleVolume(Math.min(1.0, volume + 0.2))}
            >
              <Text style={styles.volBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Acceptance Check Checklist:</Text>
        <Text style={styles.instructionItem}>1. Press "Play" to hear the looping white noise.</Text>
        <Text style={styles.instructionItem}>2. Swipe down your Android notification shade: see the media player widget with controls.</Text>
        <Text style={styles.instructionItem}>3. Press phone Power button to lock screen: sound continues uninterrupted!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  statusHighlight: {
    fontWeight: 'bold',
    color: '#38bdf8',
    textTransform: 'uppercase',
  },
  readyText: {
    fontSize: 13,
    color: '#4ade80',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  playBtn: {
    backgroundColor: '#0284c7',
  },
  pauseBtn: {
    backgroundColor: '#0d9488',
  },
  stopBtn: {
    backgroundColor: '#e11d48',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  volumeLabel: {
    color: '#e2e8f0',
    fontSize: 15,
  },
  volButtons: {
    flexDirection: 'row',
  },
  volBtn: {
    backgroundColor: '#334155',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  volBtnText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 6,
  },
});
