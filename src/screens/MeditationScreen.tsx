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
  StatusBar,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import { nativeTimer } from '../services/nativeTimer';
import { audioService } from '../services/audioService';
import { settingsStore, SceneId } from '../data/settingsStore';
import { progressStore } from '../data/progressStore';
import { formatTimeMMSS } from '../logic/formatters';
import { ScenicBackground } from '../components/ScenicBackground';

const DURATION_OPTIONS = [1, 5, 10, 15, 20];

interface MeditationSoundscape {
  id: string;
  name: string;
  icon: string;
  trackId: string | null;
  scene: SceneId;
}

const SOUNDSCAPES: MeditationSoundscape[] = [
  { id: 'forest', name: 'Forest', icon: '🌿', trackId: 'forest_ambience_birds', scene: 'forest' },
  { id: 'rain', name: 'Rain', icon: '🌧️', trackId: 'gentle_night_rain', scene: 'rain' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', trackId: 'ocean_waves', scene: 'ocean' },
  { id: 'zen', name: 'Calm', icon: '🧘', trackId: 'meditation_audio', scene: 'night' },
  { id: 'silence', name: 'Silent', icon: '🤫', trackId: null, scene: 'night' },
];

const MINDFUL_QUOTES = [
  '“Peace comes from within. Do not seek it without.”',
  '“Quiet minds can hear the gentle wisdom of the world.”',
  '“In the midst of movement and noise, keep stillness inside of you.”',
  '“Feel the calm you cultivated and carry it softly into your day.”',
];

export const MeditationScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();

  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(5);
  const [selectedSoundscapeId, setSelectedSoundscapeId] = useState<string>('forest');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.6);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedQuote, setCompletedQuote] = useState<string>(MINDFUL_QUOTES[0]);

  const durationSeconds = selectedDurationMin * 60;
  const isMountedRef = useRef(true);

  // Soft pulsing breathing halo
  const haloAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    if (isRunning && !isPaused) {
      haloLoop.start();
    } else {
      haloLoop.stop();
    }

    return () => {
      haloLoop.stop();
    };
  }, [isRunning, isPaused]);

  // Sync with native timer on load & foreground
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
      setIsPaused(false);
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
      setIsPaused(false);
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
    setIsPaused(false);
    const bellEnabled = settingsStore.isBellEnabled();

    if (bellEnabled) {
      await nativeTimer.playBell();
    }

    if (selectedSoundscape.trackId) {
      await audioService.setupPlayerIfNeeded();
      await audioService.playTrack(selectedSoundscape.trackId);
      await audioService.setVolume(ambientVolume);
    }

    await nativeTimer.startTimer(durationSeconds, bellEnabled);
    setIsRunning(true);
    setRemainingSeconds(durationSeconds);
  };

  const handleToggleSound = async () => {
    if (isPaused) {
      if (selectedSoundscape.trackId) {
        await audioService.play();
      }
      setIsPaused(false);
    } else {
      if (selectedSoundscape.trackId) {
        await audioService.pause();
      }
      setIsPaused(true);
    }
  };

  const handleStopTimer = async () => {
    await nativeTimer.stopTimer();
    await audioService.stop();
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(0);
  };

  const handleVolumeStep = async (delta: number) => {
    const newVol = Math.max(0, Math.min(1, Math.round((ambientVolume + delta) * 10) / 10));
    setAmbientVolume(newVol);
    await audioService.setVolume(newVol);
  };

  // SVG Ring Progress Calculations
  const RING_SIZE = 270;
  const STROKE_WIDTH = 10;
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress =
    durationSeconds > 0
      ? Math.max(0, Math.min(1, (durationSeconds - remainingSeconds) / durationSeconds))
      : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const haloScale = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.08],
  });

  const haloOpacity = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  return (
    <ScenicBackground
      scene={isRunning ? selectedSoundscape.scene : 'night'}
      style={styles.safeArea}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Header
        title="Meditation Timer"
        showBack={!isRunning}
        onBackPress={() => navigation.goBack()}
      />

      {/* Screen 1: SETUP */}
      {!isRunning && !isCompleted && (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: DURATION */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Select Duration
          </Text>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((min) => {
              const isSelected = selectedDurationMin === min;
              return (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.durationCard,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(174, 174, 232, 0.35)'
                          : 'rgba(90, 88, 168, 0.18)'
                        : isDark
                        ? 'rgba(17, 29, 37, 0.65)'
                        : 'rgba(255, 255, 255, 0.72)',
                      borderColor: isSelected
                        ? isDark
                          ? '#AEAEE8'
                          : '#5A58A8'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.14)'
                        : 'rgba(255, 255, 255, 0.85)',
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                  onPress={() => setSelectedDurationMin(min)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.durationNumber,
                      {
                        color: isSelected
                          ? isDark
                            ? '#FFFFFF'
                            : '#14221A'
                          : colors.textPrimary,
                      },
                    ]}
                  >
                    {min}
                  </Text>
                  <Text
                    style={[
                      styles.durationUnit,
                      { color: isDark ? '#D0E3D9' : '#4B5F54' },
                    ]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* STEP 2: BACKGROUND SOUNDSCAPE */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, marginTop: 24, marginBottom: 12 },
            ]}
          >
            Soundscape Companion
          </Text>
          <View style={styles.soundscapesRow}>
            {SOUNDSCAPES.map((s) => {
              const isSelected = selectedSoundscapeId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.soundscapeChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(174, 174, 232, 0.35)'
                          : 'rgba(90, 88, 168, 0.18)'
                        : isDark
                        ? 'rgba(17, 29, 37, 0.65)'
                        : 'rgba(255, 255, 255, 0.72)',
                      borderColor: isSelected
                        ? isDark
                          ? '#AEAEE8'
                          : '#5A58A8'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.14)'
                        : 'rgba(255, 255, 255, 0.85)',
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                  onPress={() => setSelectedSoundscapeId(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.soundscapeIcon}>{s.icon}</Text>
                  <Text
                    style={[
                      styles.soundscapeName,
                      {
                        color: isSelected
                          ? isDark
                            ? '#FFFFFF'
                            : '#14221A'
                          : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Soundscape Volume */}
          {selectedSoundscape.trackId && (
            <View
              style={[
                styles.volumeGlassCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(17, 29, 37, 0.65)'
                    : 'rgba(255, 255, 255, 0.72)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(255, 255, 255, 0.85)',
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🔈</Text>
              <Slider
                style={{ flex: 1, marginHorizontal: 12 }}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={ambientVolume}
                onValueChange={(val) => setAmbientVolume(val)}
                minimumTrackTintColor={isDark ? '#AEAEE8' : '#5A58A8'}
                maximumTrackTintColor={
                  isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }
                thumbTintColor={isDark ? '#AEAEE8' : '#5A58A8'}
              />
              <Text
                style={[
                  styles.volumePercentText,
                  { color: colors.textPrimary },
                ]}
              >
                {Math.round(ambientVolume * 100)}%
              </Text>
            </View>
          )}

          <PrimaryButton
            title="Begin Meditation"
            onPress={handleStartTimer}
            style={{ marginTop: 32 }}
          />
        </ScrollView>
      )}

      {/* Screen 2: ACTIVE SESSION (LARGE RING SVG COUNTDOWN) */}
      {isRunning && (
        <View style={styles.activeContainer}>
          {/* Active Soundscape Badge */}
          <View
            style={[
              styles.activeSoundscapeBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(17, 29, 37, 0.75)'
                  : 'rgba(255, 255, 255, 0.80)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.16)'
                  : 'rgba(255, 255, 255, 0.90)',
              },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{selectedSoundscape.icon}</Text>
            <Text
              style={[
                styles.activeBadgeText,
                { color: colors.textPrimary },
              ]}
            >
              {selectedSoundscape.name} Companion
            </Text>
          </View>

          {/* Large Ring SVG Countdown with Aura */}
          <View style={styles.ringCenterWrapper}>
            {/* Pulsing Breathing Aura */}
            <Animated.View
              style={[
                styles.pulsingAuraCircle,
                {
                  transform: [{ scale: haloScale }],
                  opacity: haloOpacity,
                  backgroundColor: isDark
                    ? 'rgba(174, 174, 232, 0.22)'
                    : 'rgba(90, 88, 168, 0.15)',
                },
              ]}
            />

            {/* SVG Circular Ring Progress */}
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              {/* Background faint track circle */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke={
                  isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.08)'
                }
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Active animated progress ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke={isDark ? '#AEAEE8' : '#5A58A8'}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>

            {/* Centered Countdown Time Digits */}
            <View style={styles.ringCenterContent}>
              <Text
                style={[
                  styles.centerDigits,
                  { color: colors.textPrimary },
                ]}
              >
                {formatTimeMMSS(remainingSeconds)}
              </Text>
              <Text
                style={[
                  styles.centerStatusLabel,
                  { color: isDark ? '#D0E3D9' : '#4B5F54' },
                ]}
              >
                {isPaused ? 'Paused' : 'Meditation'}
              </Text>
            </View>
          </View>

          {/* Volume Steppers for active soundscape */}
          {selectedSoundscape.trackId && (
            <View
              style={[
                styles.activeVolumeRow,
                {
                  backgroundColor: isDark
                    ? 'rgba(17, 29, 37, 0.70)'
                    : 'rgba(255, 255, 255, 0.75)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.90)',
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.stepperCircleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
                onPress={() => handleVolumeStep(-0.1)}
              >
                <Text style={[styles.stepperGlyph, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.activeVolLabel, { color: colors.textPrimary }]}>
                Volume: {Math.round(ambientVolume * 100)}%
              </Text>
              <TouchableOpacity
                style={[styles.stepperCircleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
                onPress={() => handleVolumeStep(0.1)}
              >
                <Text style={[styles.stepperGlyph, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pill Buttons for Pause Sound and End Session */}
          <View style={styles.controlsRow}>
            {selectedSoundscape.trackId && (
              <PrimaryButton
                title={isPaused ? 'Resume Music' : 'Pause Music'}
                onPress={handleToggleSound}
                variant="secondary"
                style={styles.halfButton}
              />
            )}
            <PrimaryButton
              title="End Meditation"
              onPress={handleStopTimer}
              variant="danger"
              style={selectedSoundscape.trackId ? styles.halfButton : { flex: 1 }}
            />
          </View>
        </View>
      )}

      {/* Screen 3: COMPLETED VIEW */}
      {isCompleted && (
        <View style={styles.completedContainer}>
          <View
            style={[
              styles.completedAuraWrap,
              {
                backgroundColor: isDark
                  ? 'rgba(174, 174, 232, 0.22)'
                  : 'rgba(90, 88, 168, 0.14)',
              },
            ]}
          >
            <Text style={styles.completedEmoji}>🧘</Text>
          </View>

          <Text
            style={[
              styles.completedTitle,
              { color: colors.textPrimary },
            ]}
          >
            Session Complete
          </Text>

          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: isDark
                  ? 'rgba(17, 29, 37, 0.70)'
                  : 'rgba(255, 255, 255, 0.80)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.16)'
                  : 'rgba(255, 255, 255, 0.90)',
              },
            ]}
          >
            <Text
              style={[
                styles.quoteText,
                { color: colors.textPrimary },
              ]}
            >
              {completedQuote}
            </Text>
          </View>

          <Text
            style={[
              styles.completedStatsSummary,
              { color: isDark ? '#D0E3D9' : '#4B5F54' },
            ]}
          >
            Completed {selectedDurationMin} minutes of quiet meditation.
          </Text>

          <View style={{ flex: 1 }} />

          <PrimaryButton
            title="Return Home"
            onPress={() => {
              setIsCompleted(false);
              navigation.goBack();
            }}
            style={{ width: '100%', marginBottom: 16 }}
          />
        </View>
      )}
    </ScenicBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    height: 82,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  durationNumber: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  durationUnit: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    marginTop: 2,
  },
  soundscapesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  soundscapeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  soundscapeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  soundscapeName: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
  },
  volumeGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    marginTop: 18,
  },
  volumePercentText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    minWidth: 40,
    textAlign: 'right',
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  activeSoundscapeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  ringCenterWrapper: {
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulsingAuraCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  ringCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDigits: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  centerStatusLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    marginTop: 4,
    letterSpacing: 1,
  },
  activeVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1.5,
    width: '85%',
  },
  stepperCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperGlyph: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  activeVolLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  controlsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  halfButton: {
    flex: 1,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  completedAuraWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completedEmoji: {
    fontSize: 48,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 16,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    width: '100%',
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  completedStatsSummary: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    marginTop: 8,
  },
});
