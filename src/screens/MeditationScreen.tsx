import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AppState,
  AppStateStatus,
  Animated,
  Easing,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import { nativeTimer } from '../services/nativeTimer';
import { audioService } from '../services/audioService';
import { settingsStore } from '../data/settingsStore';
import { progressStore } from '../data/progressStore';
import { formatTimeMMSS } from '../logic/formatters';
import {
  AtmosphereThemeView,
  AtmosphereThemeType,
} from '../components/AtmosphereThemeView';

const DURATION_OPTIONS = [1, 5, 10, 15, 20];

interface MeditationSoundscape {
  id: string;
  name: string;
  icon: string;
  trackId: string | null;
  theme: AtmosphereThemeType;
}

const SOUNDSCAPES: MeditationSoundscape[] = [
  { id: 'river', name: 'River', icon: '🏞️', trackId: 'forest_river_birds', theme: 'river' },
  { id: 'rain', name: 'Rain', icon: '🌧️', trackId: 'gentle_night_rain', theme: 'rain' },
  { id: 'forest', name: 'Forest', icon: '🌿', trackId: 'forest_ambience_birds', theme: 'forest' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', trackId: 'ocean_waves', theme: 'ocean' },
  { id: 'zen', name: 'Zen', icon: '🧘', trackId: 'meditation_audio', theme: 'zen' },
  { id: 'silence', name: 'Silent', icon: '🤫', trackId: null, theme: 'zen' },
];

const MINDFUL_QUOTES = [
  '“Peace comes from within. Do not seek it without.”',
  '“Quiet minds can hear the gentle wisdom of the world.”',
  '“In the midst of movement and noise, keep stillness inside of you.”',
  '“Feel the calm you cultivated and carry it softly into your day.”',
];

export const MeditationScreen: React.FC = () => {
  const { colors, typography, spacing, isDark } = useTheme();
  const navigation = useNavigation();

  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(5);
  const [selectedSoundscapeId, setSelectedSoundscapeId] = useState<string>('river');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.6);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedQuote, setCompletedQuote] = useState<string>(MINDFUL_QUOTES[0]);

  const durationSeconds = selectedDurationMin * 60;
  const isMountedRef = useRef(true);

  // Animated breathing aura for the active timer
  const haloAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    if (isRunning) {
      haloLoop.start();
    } else {
      haloLoop.stop();
    }

    return () => {
      haloLoop.stop();
    };
  }, [isRunning]);

  // Sync with native timer status on load & app foreground
  const syncWithNativeTimer = async () => {
    const status = await nativeTimer.getStatus();
    if (!isMountedRef.current) return;

    if (status.isRunning) {
      setIsRunning(true);
      setRemainingSeconds(status.remainingSeconds);
      if (status.totalDuration > 0) {
        setSelectedDurationMin(Math.round(status.totalDuration / 60));
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    syncWithNativeTimer();

    const unsubTick = nativeTimer.onTick((secondsLeft) => {
      if (!isMountedRef.current) return;
      setIsRunning(true);
      setRemainingSeconds(secondsLeft);
    });

    const unsubComplete = nativeTimer.onComplete(async (completedDuration) => {
      if (!isMountedRef.current) return;
      await audioService.stop();
      setIsRunning(false);
      setRemainingSeconds(0);
      setIsCompleted(true);
      const randomQuote =
        MINDFUL_QUOTES[Math.floor(Math.random() * MINDFUL_QUOTES.length)];
      setCompletedQuote(randomQuote);
      await progressStore.recordCompletedSession(completedDuration);
    });

    const unsubStop = nativeTimer.onStopped(async () => {
      if (!isMountedRef.current) return;
      await audioService.stop();
      setIsRunning(false);
      setRemainingSeconds(0);
    });

    const appStateSub = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          syncWithNativeTimer();
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      unsubTick();
      unsubComplete();
      unsubStop();
      appStateSub.remove();
    };
  }, []);

  const selectedSoundscape =
    SOUNDSCAPES.find((s) => s.id === selectedSoundscapeId) || SOUNDSCAPES[0];

  const handleStartTimer = async () => {
    setIsCompleted(false);
    const bellEnabled = settingsStore.isBellEnabled();

    // Play start bell if enabled
    if (bellEnabled) {
      await nativeTimer.playBell();
    }

    // Start background sound if selected
    if (selectedSoundscape.trackId) {
      await audioService.setupPlayerIfNeeded();
      await audioService.playTrack(selectedSoundscape.trackId);
      await audioService.setVolume(ambientVolume);
    }

    // Start background native timer
    await nativeTimer.startTimer(durationSeconds, bellEnabled);
    setIsRunning(true);
    setRemainingSeconds(durationSeconds);
  };

  const handleStopTimer = async () => {
    await audioService.stop();
    await nativeTimer.stopTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
  };

  const handleVolumeChange = async (val: number) => {
    setAmbientVolume(val);
    if (selectedSoundscape.trackId) {
      await audioService.setVolume(val);
    }
  };

  const handleVolumeStep = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((ambientVolume + delta) * 10) / 10));
    handleVolumeChange(next);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Meditation"
        showBack={!isRunning}
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.container, { padding: spacing.lg }]}>
        {/* 1. CLEAN, SIMPLE SETUP VIEW */}
        {!isRunning && !isCompleted && (
          <ScrollView
            style={styles.setupView}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginBottom: spacing.lg },
              ]}
            >
              Choose your time and peaceful background sound to begin.
            </Text>

            {/* Duration Selector */}
            <Text
              style={[
                typography.subheader,
                { color: colors.textPrimary, marginBottom: spacing.sm },
              ]}
            >
              Duration
            </Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((min) => {
                const isSelected = selectedDurationMin === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.durationChip,
                      {
                        backgroundColor: isSelected
                          ? colors.accentLavender
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.accentLavender
                          : colors.surfaceBorder,
                      },
                    ]}
                    onPress={() => setSelectedDurationMin(min)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationNumber,
                        {
                          color: isSelected
                            ? isDark
                              ? '#FFFFFF'
                              : '#1E1B4B'
                            : colors.textPrimary,
                        },
                      ]}
                    >
                      {min}
                    </Text>
                    <Text
                      style={[
                        styles.durationUnit,
                        {
                          color: isSelected
                            ? isDark
                              ? '#E2E0FD'
                              : '#3E3A70'
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Background Sound Selector */}
            <Text
              style={[
                typography.subheader,
                {
                  color: colors.textPrimary,
                  marginTop: spacing.xl,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              Background Sound
            </Text>
            <View style={styles.soundscapeRow}>
              {SOUNDSCAPES.map((s) => {
                const isSelected = selectedSoundscapeId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.soundscapePill,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(155, 187, 174, 0.25)'
                            : colors.accentSage + '35'
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.accentSage
                          : colors.surfaceBorder,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedSoundscapeId(s.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>{s.icon}</Text>
                    <Text
                      style={[
                        styles.soundscapeText,
                        {
                          color: isSelected
                            ? isDark
                              ? '#FFFFFF'
                              : '#1A2E22'
                            : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Start Button */}
            <PrimaryButton
              title="Begin Meditation"
              onPress={handleStartTimer}
              style={{ marginTop: spacing.xxl }}
            />
          </ScrollView>
        )}

        {/* 2. TRANQUIL ACTIVE MEDITATION VIEW */}
        {isRunning && (
          <View style={styles.runningView}>
            {/* Thematic Backdrop enclosing the Zen Breathing Ring */}
            <AtmosphereThemeView
              theme={selectedSoundscape.theme}
              isActive={true}
              height={320}
              style={styles.activeAtmosphereCard}
            >
              {/* Concentric Breathing Aura Ring 1 */}
              <Animated.View
                style={[
                  styles.auraRingOuter,
                  {
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.25)'
                      : colors.accentSage,
                    transform: [
                      {
                        scale: haloAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.94, 1.14],
                        }),
                      },
                    ],
                    opacity: haloAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.7],
                    }),
                  },
                ]}
              />

              {/* Concentric Breathing Aura Ring 2 */}
              <Animated.View
                style={[
                  styles.auraRingInner,
                  {
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.45)'
                      : colors.accentLavender,
                    transform: [
                      {
                        scale: haloAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.98, 1.08],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.themeCenterIcon}>
                  {selectedSoundscape.icon}
                </Text>
                <Text style={[styles.timerText, { color: colors.textPrimary }]}>
                  {formatTimeMMSS(remainingSeconds)}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isDark ? '#E2E0FD' : colors.textSecondary,
                      marginTop: 2,
                    },
                  ]}
                >
                  {selectedSoundscape.name} Sound
                </Text>
              </Animated.View>
            </AtmosphereThemeView>

            {/* Ambient Sound Volume Stepper (Only shown when sound is active) */}
            {selectedSoundscape.trackId ? (
              <View style={styles.ambientVolumeContainer}>
                <View style={styles.ambientVolumeHeader}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    SOUND VOLUME
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textPrimary, fontWeight: '700' },
                    ]}
                  >
                    🔊 {Math.round(ambientVolume * 100)}%
                  </Text>
                </View>

                <View style={styles.ambientVolumeRow}>
                  <TouchableOpacity
                    style={[
                      styles.volStepBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.06)',
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'rgba(0, 0, 0, 0.12)',
                      },
                    ]}
                    onPress={() => handleVolumeStep(-0.1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.volStepText, { color: colors.textPrimary }]}>
                      −
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.sliderWrapper}>
                    <Slider
                      style={{ width: '100%', height: 36 }}
                      minimumValue={0}
                      maximumValue={1}
                      value={ambientVolume}
                      onValueChange={handleVolumeChange}
                      minimumTrackTintColor={colors.accentTerracotta}
                      maximumTrackTintColor={colors.surfaceBorder}
                      thumbTintColor={colors.accentTerracotta}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.volStepBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.06)',
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'rgba(0, 0, 0, 0.12)',
                      },
                    ]}
                    onPress={() => handleVolumeStep(0.1)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.volStepText, { color: colors.textPrimary }]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ height: 40 }} />
            )}

            <PrimaryButton
              title="End Session"
              onPress={handleStopTimer}
              variant="danger"
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        )}

        {/* 3. REWARDING COMPLETION VIEW */}
        {isCompleted && (
          <View style={styles.completedView}>
            <Text style={styles.completedEmoji}>🔔</Text>
            <Text
              style={[
                typography.hero,
                { color: colors.textPrimary, marginTop: spacing.md },
              ]}
            >
              Session Complete
            </Text>

            <View
              style={[
                styles.completionCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.surfaceBorder,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <Text
                style={[
                  styles.completedTime,
                  { color: colors.textPrimary },
                ]}
              >
                {selectedDurationMin} Minutes of Stillness
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    marginTop: 10,
                    lineHeight: 22,
                  },
                ]}
              >
                {completedQuote}
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <PrimaryButton
              title="Return Home"
              onPress={() => navigation.goBack()}
              style={{ width: '100%', marginBottom: spacing.md }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  setupView: {
    flex: 1,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  durationNumber: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  durationUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  soundscapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundscapePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    flexBasis: '31%',
    justifyContent: 'center',
  },
  soundscapeText: {
    fontSize: 13,
  },
  runningView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activeAtmosphereCard: {
    width: '100%',
    marginTop: 10,
  },
  auraRingOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
  },
  auraRingInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  themeCenterIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'serif',
    fontVariant: ['tabular-nums'],
  },
  ambientVolumeContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  ambientVolumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ambientVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  volStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volStepText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  completedView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  completedEmoji: {
    fontSize: 56,
  },
  completionCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  completedTime: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
  },
});
