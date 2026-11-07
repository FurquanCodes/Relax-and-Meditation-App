import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  const { colors, typography, spacing, isDark } = useTheme();
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

    // Start background foreground service timer
    await nativeTimer.startTimer(durationSeconds, bellEnabled);
    setIsRunning(true);
    setRemainingSeconds(durationSeconds);
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
              Choose a peaceful duration. The bell will chime when you begin and
              end.
            </Text>

            <Text
              style={[
                typography.subheader,
                { color: colors.textPrimary, marginBottom: spacing.md },
              ]}
            >
              Duration
            </Text>

            {/* Duration Option Grid */}
            <View style={styles.chipsGrid}>
              {DURATION_OPTIONS_MINUTES.map((min) => {
                const isSelected = selectedDurationMin === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.chip,
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
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipNumber,
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
                        styles.chipUnit,
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

            <View
              style={[
                styles.bellStatusNotice,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' },
              ]}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>🔔</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                {settingsStore.isBellEnabled()
                  ? 'Start and end bells are enabled.'
                  : 'Start and end bells are silent.'}
              </Text>
            </View>

            <PrimaryButton
              title="Start Meditation"
              onPress={handleStartTimer}
              style={{ marginTop: spacing.xxl }}
            />
          </ScrollView>
        )}

        {isRunning && (
          <View style={styles.runningView}>
            <View style={styles.activeTopText}>
              <Text style={[typography.caption, { color: colors.textSecondary, letterSpacing: 1 }]}>
                STILLNESS IN PROGRESS
              </Text>
            </View>

            {/* Tranquil Meditation Circular Ring */}
            <View
              style={[
                styles.timerRing,
                {
                  borderColor: colors.accentLavender,
                  backgroundColor: isDark
                    ? 'rgba(133, 130, 196, 0.18)'
                    : colors.accentLavender + '25',
                },
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  { color: colors.textPrimary },
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
                Screen-off timer active
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
              You rested in stillness for {selectedDurationMin} minutes. Take a soft
              breath before continuing your day.
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
    gap: 12,
  },
  chip: {
    width: '30%',
    height: 85,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chipNumber: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  chipUnit: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bellStatusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  runningView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  activeTopText: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 60,
    fontWeight: '700',
    fontFamily: 'serif',
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
