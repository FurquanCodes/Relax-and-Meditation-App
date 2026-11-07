import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  BREATHING_PATTERNS,
  BREATHING_DURATIONS_MINUTES,
  BreathingPattern,
  BreathingPhase,
} from '../logic/patterns';
import { formatTimeMMSS } from '../logic/formatters';
import { progressStore } from '../data/progressStore';

type ScreenState = 'setup' | 'active' | 'completed';

export const BreathingScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  // Setup state
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(
    BREATHING_PATTERNS[0]
  );
  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(1);
  const [screenState, setScreenState] = useState<ScreenState>('setup');

  // Active session state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(0);

  // Animation scale: 1.0 (min / exhaled) to 1.6 (max / inhaled)
  const circleScale = useRef(new Animated.Value(1.0)).current;
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Wall-clock refs
  const totalSessionSeconds = selectedDurationMin * 60;
  const sessionEndTimeRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhase: BreathingPhase =
    selectedPattern.phases[currentPhaseIndex] || selectedPattern.phases[0];

  // Start breathing session
  const handleStartSession = () => {
    const totalSec = selectedDurationMin * 60;
    setSessionSecondsLeft(totalSec);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(selectedPattern.phases[0].durationSeconds);
    setIsPaused(false);
    sessionEndTimeRef.current = Date.now() + totalSec * 1000;
    setScreenState('active');

    // Start initial phase animation
    animatePhase(selectedPattern.phases[0]);
  };

  const animatePhase = (phase: BreathingPhase) => {
    currentAnimation.current?.stop();

    if (phase.type === 'inhale') {
      currentAnimation.current = Animated.timing(circleScale, {
        toValue: 1.6,
        duration: phase.durationSeconds * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    } else if (phase.type === 'exhale') {
      currentAnimation.current = Animated.timing(circleScale, {
        toValue: 1.0,
        duration: phase.durationSeconds * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
    } else {
      // Hold stays at current scale
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
      const remainingTotal = Math.max(
        0,
        Math.ceil((sessionEndTimeRef.current - now) / 1000)
      );
      setSessionSecondsLeft(remainingTotal);

      if (remainingTotal <= 0) {
        // Session complete!
        handleSessionCompleted();
        return;
      }

      setPhaseSecondsLeft((prevPhaseSec) => {
        if (prevPhaseSec <= 1) {
          // Advance to next phase
          setCurrentPhaseIndex((prevIdx) => {
            const nextIdx = (prevIdx + 1) % selectedPattern.phases.length;
            const nextPhase = selectedPattern.phases[nextIdx];
            animatePhase(nextPhase);
            return nextIdx;
          });
          const nextPhaseIdx =
            (currentPhaseIndex + 1) % selectedPattern.phases.length;
          return selectedPattern.phases[nextPhaseIdx].durationSeconds;
        }
        return prevPhaseSec - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [screenState, isPaused, currentPhaseIndex, selectedPattern]);

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      sessionEndTimeRef.current = Date.now() + pausedRemainingRef.current * 1000;
      setIsPaused(false);
      animatePhase(activePhase);
    } else {
      // Pause
      pausedRemainingRef.current = sessionSecondsLeft;
      setIsPaused(true);
      currentAnimation.current?.stop();
    }
  };

  const handleStopSession = () => {
    currentAnimation.current?.stop();
    Animated.timing(circleScale, {
      toValue: 1.0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setScreenState('setup');
    setIsPaused(false);
  };

  const handleSessionCompleted = async () => {
    currentAnimation.current?.stop();
    Animated.timing(circleScale, {
      toValue: 1.0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Record progress once
    await progressStore.recordCompletedSession(totalSessionSeconds);
    setScreenState('completed');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Guided Breathing"
        showBack={screenState === 'setup'}
        onBackPress={() => navigation.goBack()}
      />

      {screenState === 'setup' && (
        <View style={[styles.contentContainer, { padding: spacing.xl }]}>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            Select a breathing rhythm and session duration.
          </Text>

          {/* Pattern Options */}
          <Text style={[typography.subheader, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Breathing Pattern
          </Text>
          {BREATHING_PATTERNS.map((pattern) => {
            const isSelected = selectedPattern.id === pattern.id;
            return (
              <Card
                key={pattern.id}
                style={[
                  styles.optionCard,
                  isSelected && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
                onPress={() => setSelectedPattern(pattern)}
              >
                <View style={styles.optionRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: isSelected ? colors.primary : colors.textPrimary },
                      ]}
                    >
                      {pattern.name}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      {pattern.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: isSelected ? colors.primary : colors.surfaceBorder },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>
                </View>
              </Card>
            );
          })}

          {/* Duration Options */}
          <Text
            style={[
              typography.subheader,
              { color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
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
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                  onPress={() => setSelectedDurationMin(min)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          <PrimaryButton
            title="Start Breathing"
            onPress={handleStartSession}
            style={{ marginBottom: spacing.md }}
          />
        </View>
      )}

      {screenState === 'active' && (
        <View style={[styles.activeContainer, { padding: spacing.xl }]}>
          {/* Header indicator */}
          <View style={styles.activeHeader}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {selectedPattern.name.toUpperCase()}
            </Text>
            <Text style={[typography.header, { color: colors.textPrimary, marginTop: 2 }]}>
              {formatTimeMMSS(sessionSecondsLeft)}
            </Text>
          </View>

          {/* Central Breathing Circle Animation */}
          <View style={styles.circleWrapper}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: colors.primary,
                  transform: [{ scale: circleScale }],
                },
              ]}
            />
            {/* Visual Text Overlay */}
            <View style={styles.cueOverlay}>
              <Text
                style={[
                  typography.hero,
                  { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {activePhase.label}
              </Text>
              <Text
                style={[
                  typography.bodyBold,
                  { color: colors.textSecondary, marginTop: 4 },
                ]}
              >
                {phaseSecondsLeft}s
              </Text>
            </View>
          </View>

          {/* Controls */}
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

      {screenState === 'completed' && (
        <View style={[styles.completedContainer, { padding: spacing.xl }]}>
          <Text style={styles.completedEmoji}>🌿</Text>
          <Text style={[typography.hero, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Well done.
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
            ]}
          >
            You completed {selectedDurationMin} minute of {selectedPattern.name.toLowerCase()}.
          </Text>

          <View style={{ flex: 1 }} />

          <PrimaryButton
            title="Return Home"
            onPress={() => navigation.goBack()}
            style={{ width: '100%', marginBottom: spacing.md }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  optionCard: {
    marginVertical: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginVertical: 8,
  },
  durationChip: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeHeader: {
    alignItems: 'center',
    marginTop: 12,
  },
  circleWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    position: 'absolute',
  },
  cueOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfButton: {
    flex: 0.48,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedEmoji: {
    fontSize: 64,
  },
});

