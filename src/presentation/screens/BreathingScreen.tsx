import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  BREATHING_PATTERNS,
  BREATHING_DURATIONS_MINUTES,
  BreathingPattern,
  BreathingPhase,
} from '../../domain/breathing/patterns';
import { formatTimeMMSS } from '../../domain/formatters';
import { progressStore } from '../../data/stores/progressStore';
import { ScenicBackground } from '../components/ScenicBackground';
import { BreatheIcon } from '../components/SvgIcons';
import { settingsStore } from '../../data/stores/settingsStore';
import { BottomNavBar } from '../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenState = 'setup' | 'active' | 'completed';

export const BreathingScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Setup state with global persistence
  const savedPatternId = settingsStore.getBreathingPatternId();
  const initialPattern =
    BREATHING_PATTERNS.find((p) => p.id === savedPatternId) || BREATHING_PATTERNS[0];
  const initialDuration = settingsStore.getBreathingDurationMinutes();

  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(initialPattern);
  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(initialDuration);
  const [screenState, setScreenState] = useState<ScreenState>('setup');

  // Active session state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(0);

  // Glowing orb animation scales & rings
  const orbScale = useRef(new Animated.Value(1.0)).current;
  const ring1Scale = useRef(new Animated.Value(1.0)).current;
  const ring2Scale = useRef(new Animated.Value(1.0)).current;
  const ring3Scale = useRef(new Animated.Value(1.0)).current;
  const bgPhaseAnim = useRef(new Animated.Value(0)).current;

  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Wall-clock refs
  const totalSessionSeconds = selectedDurationMin * 60;
  const sessionEndTimeRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhase: BreathingPhase =
    selectedPattern.phases[currentPhaseIndex] || selectedPattern.phases[0];

  const screenStateRef = useRef<ScreenState>(screenState);
  screenStateRef.current = screenState;
  const sessionSecondsLeftRef = useRef<number>(sessionSecondsLeft);
  sessionSecondsLeftRef.current = sessionSecondsLeft;
  const totalSessionSecondsRef = useRef<number>(totalSessionSeconds);
  totalSessionSecondsRef.current = totalSessionSeconds;

  useEffect(() => {
    return () => {
      if (screenStateRef.current === 'active') {
        const elapsed = totalSessionSecondsRef.current - sessionSecondsLeftRef.current;
        if (elapsed >= 15) {
          progressStore.recordCompletedSession(elapsed);
        }
      }
    };
  }, []);

  // Start breathing session
  const handleStartSession = () => {
    const totalSec = selectedDurationMin * 60;
    setSessionSecondsLeft(totalSec);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(selectedPattern.phases[0].durationSeconds);
    setIsPaused(false);
    sessionEndTimeRef.current = Date.now() + totalSec * 1000;
    setScreenState('active');

    animatePhase(selectedPattern.phases[0]);
  };

  const animatePhase = (phase: BreathingPhase) => {
    currentAnimation.current?.stop();

    if (phase.type === 'inhale') {
      const dur = phase.durationSeconds * 1000;
      currentAnimation.current = Animated.parallel([
        Animated.timing(orbScale, {
          toValue: 1.48,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring1Scale, {
          toValue: 1.65,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring2Scale, {
          toValue: 1.85,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring3Scale, {
          toValue: 2.1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgPhaseAnim, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]);
    } else if (phase.type === 'exhale') {
      const dur = phase.durationSeconds * 1000;
      currentAnimation.current = Animated.parallel([
        Animated.timing(orbScale, {
          toValue: 1.0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring1Scale, {
          toValue: 1.0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring2Scale, {
          toValue: 1.0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ring3Scale, {
          toValue: 1.0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgPhaseAnim, {
          toValue: 0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]);
    } else {
      currentAnimation.current = null;
    }

    currentAnimation.current?.start();
  };

  // Main active session ticker
  useEffect(() => {
    if (screenState !== 'active' || isPaused) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.round((sessionEndTimeRef.current - now) / 1000)
      );

      setSessionSecondsLeft(remaining);

      if (remaining <= 0) {
        handleSessionCompleted();
        return;
      }

      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (currentPhaseIndex + 1) % selectedPattern.phases.length;
          setCurrentPhaseIndex(nextIndex);
          const nextPhase = selectedPattern.phases[nextIndex];
          animatePhase(nextPhase);
          return nextPhase.durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [screenState, isPaused, currentPhaseIndex, selectedPattern]);

  const handlePauseResume = () => {
    if (isPaused) {
      sessionEndTimeRef.current = Date.now() + pausedRemainingRef.current * 1000;
      setIsPaused(false);
      animatePhase(activePhase);
    } else {
      pausedRemainingRef.current = sessionSecondsLeft;
      setIsPaused(true);
      currentAnimation.current?.stop();
    }
  };

  const handleStopSession = async () => {
    const elapsedSeconds = totalSessionSeconds - sessionSecondsLeft;
    if (elapsedSeconds >= 15) {
      await progressStore.recordCompletedSession(elapsedSeconds);
    }
    currentAnimation.current?.stop();
    Animated.parallel([
      Animated.timing(orbScale, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      Animated.timing(ring1Scale, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      Animated.timing(ring2Scale, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      Animated.timing(ring3Scale, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      Animated.timing(bgPhaseAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    setScreenState('setup');
    setIsPaused(false);
  };

  const handleSessionCompleted = async () => {
    currentAnimation.current?.stop();
    Animated.parallel([
      Animated.timing(orbScale, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      Animated.timing(ring1Scale, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      Animated.timing(ring2Scale, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      Animated.timing(ring3Scale, { toValue: 1.0, duration: 500, useNativeDriver: true }),
    ]).start();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    await progressStore.recordCompletedSession(totalSessionSeconds);
    setScreenState('completed');
  };

  const bgInhaleOpacity = bgPhaseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <ScenicBackground scene="forest" style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Header
        title="Guided Breathing"
        showBack={screenState === 'setup'}
        onBackPress={() => navigation.goBack()}
      />

      {/* Screen 1: SETUP */}
      {screenState === 'setup' && (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 110 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDark ? '#D8E8E0' : '#1E3528' },
            ]}
          >
            Select a soothing rhythm and session duration.
          </Text>

          {/* Pattern Options */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Breathing Pattern
          </Text>
          {BREATHING_PATTERNS.map((pattern) => {
            const isSelected = selectedPattern.id === pattern.id;
            return (
              <Pressable
                key={pattern.id}
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#222228'
                        : '#E4F0E9'
                      : isDark
                      ? '#141418'
                      : '#FFFFFF',
                    borderColor: isSelected
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.35)'
                        : '#265C43'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.10)'
                      : '#D6E4DC',
                    borderWidth: isSelected ? 2 : 1.5,
                  },
                ]}
                onPress={() => {
                  setSelectedPattern(pattern);
                  settingsStore.setBreathingPatternId(pattern.id);
                }}
              >
                <View style={styles.patternLeft}>
                  <View
                    style={[
                      styles.patternIconBadge,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.18)'
                            : 'rgba(38, 92, 67, 0.15)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}
                  >
                    <BreatheIcon
                      size={22}
                      color={
                        isSelected
                          ? isDark
                            ? '#FFFFFF'
                            : '#265C43'
                          : isDark
                          ? '#C8C8D4'
                          : '#1E3528'
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.patternTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {pattern.name}
                    </Text>
                    <Text
                      style={[
                        styles.patternDesc,
                        { color: isDark ? '#C8C8D4' : '#1E3528' },
                      ]}
                    >
                      {pattern.subtitle}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#265C43'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 0, 0, 0.2)',
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioDot,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : '#265C43',
                        },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* Duration Chips */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, marginTop: 22 },
            ]}
          >
            Duration
          </Text>
          <View style={styles.durationRow}>
            {BREATHING_DURATIONS_MINUTES.map((min) => {
              const isSelected = selectedDurationMin === min;
              return (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#265C43'
                        : isDark
                        ? '#141418'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#265C43'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.10)'
                        : '#D6E4DC',
                    },
                  ]}
                  onPress={() => {
                    setSelectedDurationMin(min);
                    settingsStore.setBreathingDurationMinutes(min);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textPrimary,
                      },
                    ]}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton
            title="Start Breathing"
            onPress={handleStartSession}
            style={{ marginTop: 28 }}
          />
        </ScrollView>
      )}

      {/* Screen 2: ACTIVE SESSION */}
      {screenState === 'active' && (
        <View style={styles.activeContainer}>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? '#1C1C22' : '#C7E2D5',
                opacity: bgInhaleOpacity,
              },
            ]}
          />

          {/* Top Session Progress */}
          <View style={styles.activeTopBar}>
            <Text
              style={[
                styles.patternBadgeText,
                { color: isDark ? '#E2E2EA' : '#265C43' },
              ]}
            >
              {selectedPattern.name.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.remainingTimeDigits,
                { color: colors.textPrimary },
              ]}
            >
              {formatTimeMMSS(sessionSecondsLeft)}
            </Text>
          </View>

          {/* GLOWING ORB WITH FAINT EXPANDING RINGS */}
          <View style={styles.orbSceneWrapper}>
            {/* Faint Expanding Ring 3 */}
            <Animated.View
              style={[
                styles.faintRing,
                styles.ring3,
                {
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(38, 92, 67, 0.18)',
                  transform: [{ scale: ring3Scale }],
                },
              ]}
            />

            {/* Faint Expanding Ring 2 */}
            <Animated.View
              style={[
                styles.faintRing,
                styles.ring2,
                {
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.20)'
                    : 'rgba(38, 92, 67, 0.28)',
                  transform: [{ scale: ring2Scale }],
                },
              ]}
            />

            {/* Faint Expanding Ring 1 */}
            <Animated.View
              style={[
                styles.faintRing,
                styles.ring1,
                {
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.32)'
                    : 'rgba(38, 92, 67, 0.38)',
                  transform: [{ scale: ring1Scale }],
                },
              ]}
            />

            {/* Glowing Main Center Orb */}
            <Animated.View
              style={[
                styles.mainGlowingOrb,
                {
                  transform: [{ scale: orbScale }],
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.40)' : '#265C43',
                },
              ]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ['#26262E', '#141418']
                    : ['#8EAFA1', '#6B9483']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 88 }]}
              />
              <View
                style={[
                  styles.orbInnerGlow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.18)'
                      : 'rgba(255, 255, 255, 0.35)',
                  },
                ]}
              />

              {/* Cue Text in the Center */}
              <View style={styles.cueOverlay}>
                <Text
                  style={[
                    styles.cueTitle,
                    { color: '#FFFFFF' },
                  ]}
                >
                  {activePhase.label}
                </Text>
                <Text
                  style={[
                    styles.cueSeconds,
                    { color: isDark ? '#FDE68A' : '#FCD8C4' },
                  ]}
                >
                  {phaseSecondsLeft}s
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.controlsRow}>
            <PrimaryButton
              title={isPaused ? 'Resume' : 'Pause'}
              onPress={handlePauseResume}
              variant="secondary"
              style={styles.halfButton}
            />
            <PrimaryButton
              title="Stop"
              onPress={handleStopSession}
              variant="danger"
              style={styles.halfButton}
            />
          </View>
        </View>
      )}

      {/* Screen 3: COMPLETED VIEW */}
      {screenState === 'completed' && (
        <View style={styles.completedContainer}>
          <View
            style={[
              styles.completedAuraWrap,
              {
                backgroundColor: isDark
                  ? 'rgba(140, 213, 180, 0.20)'
                  : 'rgba(38, 92, 67, 0.14)',
              },
            ]}
          >
            <Text style={styles.completedEmoji}>🌿</Text>
          </View>

          <Text
            style={[
              styles.completedTitle,
              { color: colors.textPrimary },
            ]}
          >
            Well done.
          </Text>
          <Text
            style={[
              styles.completedSubtitle,
              { color: isDark ? '#D8E8E0' : '#2E4638' },
            ]}
          >
            Take a quiet moment for yourself. You finished {selectedDurationMin} minute of{' '}
            {selectedPattern.name.toLowerCase()}.
          </Text>

          <View style={{ flex: 1 }} />

          <PrimaryButton
            title="Return Home"
            onPress={() => navigation.goBack()}
            style={{ width: '100%', marginBottom: 16 }}
          />
        </View>
      )}

      {/* Global Bottom Navigation (Visible during setup, hidden during active breathing for zero distraction) */}
      {screenState === 'setup' && (
        <BottomNavBar activeTab="practice" />
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
  screenSubtitle: {
    fontSize: 15,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  patternCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patternLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patternIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  patternDesc: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '600',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 8,
  },
  durationChip: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  activeTopBar: {
    alignItems: 'center',
    marginTop: 8,
  },
  patternBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'sans-serif',
    letterSpacing: 1.5,
  },
  remainingTimeDigits: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'serif',
    marginTop: 4,
  },
  orbSceneWrapper: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  faintRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  ring1: {
    width: 210,
    height: 210,
  },
  ring2: {
    width: 250,
    height: 250,
  },
  ring3: {
    width: 290,
    height: 290,
  },
  mainGlowingOrb: {
    width: 175,
    height: 175,
    borderRadius: 88,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cueOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  cueTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  cueSeconds: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'sans-serif',
    marginTop: 4,
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
    fontSize: 50,
  },
  completedTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
