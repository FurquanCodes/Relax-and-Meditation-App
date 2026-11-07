import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import { nativeTimer } from '../services/nativeTimer';
import { settingsStore } from '../data/settingsStore';
import { progressStore } from '../data/progressStore';
import { formatTimeMMSS } from '../logic/formatters';

const DURATION_OPTIONS_MINUTES = [1, 5, 10, 15, 20];

export const MeditationScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const durationSeconds = selectedDurationMin * 60;
  const isMountedRef = useRef(true);

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

    // Listen to native timer events
    const unsubTick = nativeTimer.onTick((secondsLeft) => {
      if (!isMountedRef.current) return;
      setIsRunning(true);
      setRemainingSeconds(secondsLeft);
    });

    const unsubComplete = nativeTimer.onComplete(async (completedDuration) => {
      if (!isMountedRef.current) return;
      setIsRunning(false);
      setRemainingSeconds(0);
      setIsCompleted(true);
      await progressStore.recordCompletedSession(completedDuration);
    });

    const unsubStop = nativeTimer.onStopped(() => {
      if (!isMountedRef.current) return;
      setIsRunning(false);
      setRemainingSeconds(0);
    });

    // Check on app state change (e.g. returning to foreground)
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

  const handleStartTimer = async () => {
    setIsCompleted(false);
    const bellEnabled = settingsStore.isBellEnabled();

    // Play start bell if enabled
    if (bellEnabled) {
      await nativeTimer.playBell();
    }

    setRemainingSeconds(durationSeconds);
    setIsRunning(true);

    // Start background foreground service with wake lock
    await nativeTimer.startTimer(durationSeconds, bellEnabled);
  };

  const handleStopTimer = async () => {
    await nativeTimer.stopTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Meditation Timer"
        showBack={!isRunning}
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.container, { padding: spacing.xl }]}>
        {!isRunning && !isCompleted && (
          <View style={styles.setupView}>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },
              ]}
            >
              Set your timer. The end bell will chime even with your screen turned off.
            </Text>

            {/* Duration Selector */}
            <Text
              style={[
                typography.subheader,
                { color: colors.textPrimary, marginBottom: spacing.md },
              ]}
            >
              Session Duration
            </Text>

            <View style={styles.chipsGrid}>
              {DURATION_OPTIONS_MINUTES.map((min) => {
                const isSelected = selectedDurationMin === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                        borderRadius: borderRadius.lg,
                      },
                    ]}
                    onPress={() => setSelectedDurationMin(min)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        typography.header,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {min}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: isSelected ? '#E6FFFA' : colors.textSecondary, marginTop: 2 },
                      ]}
                    >
                      minutes
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flex: 1 }} />

            <PrimaryButton
              title="Start Meditation"
              onPress={handleStartTimer}
              style={{ width: '100%', marginBottom: spacing.md }}
            />
          </View>
        )}

        {isRunning && (
          <View style={styles.runningView}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              MEDITATING IN QUIET
            </Text>

            <View style={styles.timerDisplayContainer}>
              <Text
                style={[
                  styles.timerText,
                  { color: colors.primary, fontWeight: '300' },
                ]}
              >
                {formatTimeMMSS(remainingSeconds)}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: spacing.xs },
                ]}
              >
                Background service active with screen off
              </Text>
            </View>

            <PrimaryButton
              title="End Session"
              onPress={handleStopTimer}
              variant="danger"
              style={{ width: '100%', marginBottom: spacing.lg }}
            />
          </View>
        )}

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
            <Text
              style={[
                typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.sm,
                  paddingHorizontal: spacing.lg,
                },
              ]}
            >
              You rested in stillness for {selectedDurationMin} minutes. Take a soft breath before continuing your day.
            </Text>

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
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chip: {
    width: '31%',
    height: 90,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  runningView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  timerDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 68,
    fontVariant: ['tabular-nums'],
  },
  completedView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedEmoji: {
    fontSize: 64,
  },
});

