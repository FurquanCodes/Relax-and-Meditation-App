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

const DURATION_OPTIONS_MINUTES = [1, 5, 10, 15, 20];

interface MeditationIntention {
  id: string;
  label: string;
  icon: string;
  mantra: string;
}

const INTENTIONS: MeditationIntention[] = [
  {
    id: 'calm',
    label: 'Peace & Calm',
    icon: '🌿',
    mantra: 'Allow all tension in your body to softly dissolve.',
  },
  {
    id: 'stress',
    label: 'Release Stress',
    icon: '🍃',
    mantra: 'With each slow exhale, let go of what you cannot control.',
  },
  {
    id: 'sleep',
    label: 'Deep Rest',
    icon: '🌙',
    mantra: 'Quiet the busy mind and welcome restorative stillness.',
  },
  {
    id: 'focus',
    label: 'Clarity & Focus',
    icon: '☀️',
    mantra: 'Gently guide wandering thoughts back to the present breath.',
  },
];

interface MeditationSoundscape {
  id: string;
  name: string;
  icon: string;
  trackId: string | null;
  theme: AtmosphereThemeType;
  subtitle: string;
}

const SOUNDSCAPES: MeditationSoundscape[] = [
  {
    id: 'silence',
    name: 'Quiet Silence',
    icon: '🤫',
    trackId: null,
    theme: 'zen',
    subtitle: 'Pure stillness with bell',
  },
  {
    id: 'river',
    name: 'River Stream',
    icon: '🏞️',
    trackId: 'forest_river_birds',
    theme: 'river',
    subtitle: 'Babbling brook & birds',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: '🌧️',
    trackId: 'gentle_night_rain',
    theme: 'rain',
    subtitle: 'Soft evening rainfall',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: '🌲',
    trackId: 'forest_ambience_birds',
    theme: 'forest',
    subtitle: 'Woodland canopy breeze',
  },
  {
    id: 'ocean',
    name: 'Ocean Tide',
    icon: '🌊',
    trackId: 'ocean_waves',
    theme: 'ocean',
    subtitle: 'Rhythmic coastal surf',
  },
  {
    id: 'zen',
    name: 'Zen Harmony',
    icon: '🧘',
    trackId: 'meditation_audio',
    theme: 'zen',
    subtitle: 'Resonant soothing chords',
  },
];

const MINDFUL_QUOTES = [
  '“Peace comes from within. Do not seek it without.”',
  '“Quiet minds can hear the gentle wisdom of the world.”',
  '“In the midst of movement and noise, keep stillness inside of you.”',
  '“Feel the calm you cultivated and carry it softly into your day.”',
  '“Surrender what was, release what will be, and rest in what is.”',
];

export const MeditationScreen: React.FC = () => {
  const { colors, typography, spacing, isDark } = useTheme();
  const navigation = useNavigation();

  const [selectedDurationMin, setSelectedDurationMin] = useState<number>(5);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string>('calm');
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
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 4500,
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

    // Listen to native timer events
    const unsubTick = nativeTimer.onTick((secondsLeft) => {
      if (!isMountedRef.current) return;
      setIsRunning(true);
      setRemainingSeconds(secondsLeft);
    });

    const unsubComplete = nativeTimer.onComplete(async (completedDuration) => {
      if (!isMountedRef.current) return;
      // Stop ambient sound
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

  const selectedSoundscape =
    SOUNDSCAPES.find((s) => s.id === selectedSoundscapeId) || SOUNDSCAPES[0];
  const selectedIntention =
    INTENTIONS.find((i) => i.id === selectedIntentionId) || INTENTIONS[0];

  const handleStartTimer = async () => {
    setIsCompleted(false);
    const bellEnabled = settingsStore.isBellEnabled();

    // Play start bell if enabled
    if (bellEnabled) {
      await nativeTimer.playBell();
    }

    // Start ambient background sound if selected
    if (selectedSoundscape.trackId) {
      await audioService.setupPlayerIfNeeded();
      await audioService.playTrack(selectedSoundscape.trackId);
      await audioService.setVolume(ambientVolume);
    }

    // Start background foreground service timer
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

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Meditation"
        showBack={!isRunning}
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.container, { padding: spacing.lg }]}>
        {!isRunning && !isCompleted && (
          <ScrollView
            style={styles.setupView}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header intro */}
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginBottom: spacing.md },
              ]}
            >
              Set your intention, choose an atmospheric backdrop, and settle into
              serene stillness.
            </Text>

            {/* 1. Intention Selector */}
            <Text
              style={[
                typography.subheader,
                { color: colors.textPrimary, marginBottom: spacing.xs },
              ]}
            >
              Session Intention
            </Text>
            <View style={styles.intentionsGrid}>
              {INTENTIONS.map((intention) => {
                const isSelected = selectedIntentionId === intention.id;
                return (
                  <TouchableOpacity
                    key={intention.id}
                    style={[
                      styles.intentionChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(155, 187, 174, 0.22)'
                            : colors.accentSage + '35'
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.accentSage
                          : colors.surfaceBorder,
                        borderWidth: isSelected ? 1.8 : 1,
                      },
                    ]}
                    onPress={() => setSelectedIntentionId(intention.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 18, marginRight: 6 }}>
                      {intention.icon}
                    </Text>
                    <Text
                      style={[
                        styles.intentionLabel,
                        {
                          color: isSelected
                            ? isDark
                              ? '#FFFFFF'
                              : '#1A2E22'
                            : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {intention.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Intention Mantra banner */}
            <View
              style={[
                styles.mantraBox,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : colors.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    lineHeight: 18,
                  },
                ]}
              >
                “{selectedIntention.mantra}”
              </Text>
            </View>

            {/* 2. Atmospheric Soundscape Selector */}
            <Text
              style={[
                typography.subheader,
                {
                  color: colors.textPrimary,
                  marginTop: spacing.lg,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Atmosphere & Soundscape
            </Text>
            <View style={styles.soundscapeGrid}>
              {SOUNDSCAPES.map((soundscape) => {
                const isSelected = selectedSoundscapeId === soundscape.id;
                return (
                  <TouchableOpacity
                    key={soundscape.id}
                    style={[
                      styles.soundscapeCard,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(212, 211, 248, 0.22)'
                            : colors.accentLavender + '35'
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.accentLavender
                          : colors.surfaceBorder,
                        borderWidth: isSelected ? 1.8 : 1,
                      },
                    ]}
                    onPress={() => setSelectedSoundscapeId(soundscape.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.soundscapeIcon}>{soundscape.icon}</Text>
                    <Text
                      style={[
                        styles.soundscapeName,
                        {
                          color: isSelected
                            ? isDark
                              ? '#FFFFFF'
                              : '#1E1B4B'
                            : colors.textPrimary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {soundscape.name}
                    </Text>
                    <Text
                      style={[
                        styles.soundscapeSub,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {soundscape.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Duration Selector */}
            <Text
              style={[
                typography.subheader,
                {
                  color: colors.textPrimary,
                  marginTop: spacing.lg,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Duration
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

            {/* Bell notice */}
            <View
              style={[
                styles.bellStatusNotice,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.03)',
                },
              ]}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>🔔</Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, flex: 1 },
                ]}
              >
                {settingsStore.isBellEnabled()
                  ? 'Singing bowl bell will chime at start and finish.'
                  : 'Start and end bells are muted in settings.'}
              </Text>
            </View>

            <PrimaryButton
              title="Begin Meditation"
              onPress={handleStartTimer}
              style={{ marginTop: spacing.xl }}
            />
          </ScrollView>
        )}

        {/* ACTIVE MEDITATION VIEW WITH THEME BACKDROP */}
        {isRunning && (
          <View style={styles.runningView}>
            {/* Top Intention Pill */}
            <View
              style={[
                styles.activeIntentionBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>
                {selectedIntention.icon}
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textPrimary,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {selectedIntention.label.toUpperCase()}
              </Text>
            </View>

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
                  {selectedSoundscape.name}
                </Text>
              </Animated.View>
            </AtmosphereThemeView>

            {/* Active Mantra Reminder */}
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  paddingHorizontal: 20,
                  marginTop: 10,
                },
              ]}
            >
              “{selectedIntention.mantra}”
            </Text>

            {/* Live Volume Slider if soundscape is playing */}
            {selectedSoundscape.trackId && (
              <View style={styles.ambientVolumeRow}>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary, marginRight: 8 },
                  ]}
                >
                  🔊 {Math.round(ambientVolume * 100)}%
                </Text>
                <Slider
                  style={{ flex: 1, height: 36 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={ambientVolume}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor={colors.accentTerracotta}
                  maximumTrackTintColor={colors.surfaceBorder}
                  thumbTintColor={colors.accentTerracotta}
                />
              </View>
            )}

            <PrimaryButton
              title="End Session"
              onPress={handleStopTimer}
              variant="danger"
              style={{ width: '100%', marginTop: 12 }}
            />
          </View>
        )}

        {/* COMPLETION VIEW */}
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
                  typography.caption,
                  {
                    color: colors.accentSage,
                    fontWeight: '700',
                    letterSpacing: 1,
                  },
                ]}
              >
                MINDFUL PAUSE OBSERVED
              </Text>
              <Text
                style={[
                  styles.completedTime,
                  { color: colors.textPrimary, marginTop: 4 },
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
                    marginTop: 12,
                    lineHeight: 22,
                  },
                ]}
              >
                {completedQuote}
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <View style={{ width: '100%', gap: 10, marginBottom: spacing.sm }}>
              <PrimaryButton
                title="Meditate Again"
                onPress={() => setIsCompleted(false)}
                variant="secondary"
              />
              <PrimaryButton
                title="Return Home"
                onPress={() => navigation.goBack()}
              />
            </View>
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
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  intentionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    flexBasis: '48%',
  },
  intentionLabel: {
    fontSize: 13,
  },
  mantraBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
  },
  soundscapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  soundscapeCard: {
    width: '31%',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundscapeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  soundscapeName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  soundscapeSub: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  chip: {
    width: '30%',
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chipNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  chipUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  bellStatusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
  },
  runningView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activeIntentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeAtmosphereCard: {
    width: '100%',
    marginTop: 8,
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
    fontSize: 26,
    marginBottom: 2,
  },
  timerText: {
    fontSize: 46,
    fontWeight: '700',
    fontFamily: 'serif',
    fontVariant: ['tabular-nums'],
  },
  ambientVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 6,
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
