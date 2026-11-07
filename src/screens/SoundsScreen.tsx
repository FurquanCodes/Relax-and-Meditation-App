import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { usePlaybackState, State } from 'react-native-track-player';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { audioService, AMBIENT_TRACKS, AmbientTrack } from '../services/audioService';
import { formatTimeMMSS } from '../logic/formatters';

const SLEEP_TIMER_OPTIONS = [0, 1, 15, 30, 60]; // 0 = off, 1 = 1m test, 15, 30, 60

export const SoundsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const playbackState = usePlaybackState();

  const [activeTrackId, setActiveTrackId] = useState<string>(AMBIENT_TRACKS[0].id);
  const [volume, setVolume] = useState<number>(0.7);
  const [selectedSleepMin, setSelectedSleepMin] = useState<number>(0);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);

  const isPlaying =
    playbackState.state === State.Playing ||
    playbackState.state === State.Buffering;

  useEffect(() => {
    audioService.setupPlayerIfNeeded();

    const unsubSleep = audioService.subscribeSleepTimer((remaining) => {
      setSleepRemainingSeconds(remaining);
      if (remaining === null) {
        setSelectedSleepMin(0);
      }
    });

    return () => {
      unsubSleep();
    };
  }, []);

  const handleSelectTrack = async (track: AmbientTrack) => {
    setActiveTrackId(track.id);
    await audioService.playTrack(track.id);
  };

  const handleTogglePlayPause = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playTrack(activeTrackId);
    }
  };

  const handleStop = async () => {
    await audioService.stop();
    setSelectedSleepMin(0);
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    await audioService.setVolume(value);
  };

  const handleSelectSleepTimer = (minutes: number) => {
    setSelectedSleepMin(minutes);
    if (minutes === 0) {
      audioService.cancelSleepTimer();
    } else {
      audioService.startSleepTimer(minutes);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Calming Sounds"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing.lg },
          ]}
        >
          Continuous background sounds to relax or focus.
        </Text>

        {/* Ambient Track Selection Cards */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginBottom: spacing.sm },
          ]}
        >
          Select Sound
        </Text>

        {AMBIENT_TRACKS.map((track) => {
          const isSelected = activeTrackId === track.id;
          const isCurrentlyPlayingThis = isSelected && isPlaying;

          return (
            <Card
              key={track.id}
              style={[
                styles.trackCard,
                isSelected && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
              onPress={() => handleSelectTrack(track)}
            >
              <View style={styles.trackRow}>
                <View
                  style={[
                    styles.trackIconBubble,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryMuted
                        : colors.surfaceBorder,
                    },
                  ]}
                >
                  <Text style={styles.trackIcon}>{track.artworkIcon}</Text>
                </View>

                <View style={styles.trackInfo}>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: isSelected ? colors.primary : colors.textPrimary },
                    ]}
                  >
                    {track.title}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {track.subtitle}
                  </Text>
                </View>

                <View style={styles.statusIndicator}>
                  {isCurrentlyPlayingThis ? (
                    <Text style={{ fontSize: 18 }}>🔊</Text>
                  ) : isSelected ? (
                    <Text style={{ fontSize: 16, color: colors.primary }}>✓</Text>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}

        {/* Active Player Card with Play/Pause & Volume */}
        <Card
          style={[
            styles.playerCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.primary,
              marginTop: spacing.xl,
            },
          ]}
        >
          <View style={styles.playerCardHeader}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
            </Text>
            <Text style={[typography.subheader, { color: colors.textPrimary, marginTop: 2 }]}>
              {AMBIENT_TRACKS.find((t) => t.id === activeTrackId)?.title}
            </Text>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              VOLUME: {Math.round(volume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.surfaceBorder}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Control Buttons */}
          <View style={styles.playerButtonsRow}>
            <PrimaryButton
              title={isPlaying ? 'Pause' : 'Play'}
              onPress={handleTogglePlayPause}
              variant={isPlaying ? 'secondary' : 'primary'}
              style={styles.halfBtn}
            />
            <PrimaryButton
              title="Stop"
              onPress={handleStop}
              variant="danger"
              style={styles.halfBtn}
            />
          </View>
        </Card>

        {/* Sleep Timer Section */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.xs },
          ]}
        >
          Sleep Timer
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginBottom: spacing.md },
          ]}
        >
          Automatically fade out and stop sound after chosen time
        </Text>

        <View style={styles.sleepChipsRow}>
          {SLEEP_TIMER_OPTIONS.map((min) => {
            const isSelected = selectedSleepMin === min;
            const label = min === 0 ? 'Off' : `${min}m`;

            return (
              <TouchableOpacity
                key={min}
                style={[
                  styles.sleepChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => handleSelectSleepTimer(min)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Sleep Timer Countdown */}
        {sleepRemainingSeconds !== null && sleepRemainingSeconds > 0 && (
          <View
            style={[
              styles.sleepTimerActiveBanner,
              { backgroundColor: colors.primaryMuted, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={[typography.bodyBold, { color: colors.primary }]}>
              ⏳ Stops in: {formatTimeMMSS(sleepRemainingSeconds)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  trackCard: {
    marginVertical: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackIcon: {
    fontSize: 22,
  },
  trackInfo: {
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  playerCard: {
    paddingVertical: 20,
    borderWidth: 1.5,
  },
  playerCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  volumeContainer: {
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  halfBtn: {
    flex: 0.48,
  },
  sleepChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepChip: {
    flex: 1,
    height: 48,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sleepTimerActiveBanner: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
});

