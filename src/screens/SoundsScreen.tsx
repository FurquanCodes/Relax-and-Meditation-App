import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { usePlaybackState, State } from 'react-native-track-player';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import {
  audioService,
  AMBIENT_TRACKS,
  SOUND_CATEGORIES,
  SoundCategoryId,
  AmbientTrack,
} from '../services/audioService';
import { formatTimeMMSS } from '../logic/formatters';
import {
  AtmosphereThemeView,
  AtmosphereThemeType,
  ATMOSPHERE_THEMES,
} from '../components/AtmosphereThemeView';

const SLEEP_OPTIONS = [0, 15, 30, 60];

// Animated soundwave equalizer bars that dance when playing
const AnimatedSoundWaves: React.FC<{ isPlaying: boolean; color: string }> = ({
  isPlaying,
  color,
}) => {
  const bar1 = useRef(new Animated.Value(6)).current;
  const bar2 = useRef(new Animated.Value(14)).current;
  const bar3 = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!isPlaying) {
      bar1.setValue(6);
      bar2.setValue(10);
      bar3.setValue(6);
      return;
    }

    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(bar1, {
          toValue: 20,
          duration: 400,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(bar1, {
          toValue: 6,
          duration: 400,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(bar2, {
          toValue: 6,
          duration: 350,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(bar2, {
          toValue: 22,
          duration: 350,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.timing(bar3, {
          toValue: 18,
          duration: 480,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(bar3, {
          toValue: 6,
          duration: 480,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [isPlaying]);

  return (
    <View style={styles.equalizerWrap}>
      <Animated.View style={[styles.equalizerBar, { height: bar1, backgroundColor: color }]} />
      <Animated.View style={[styles.equalizerBar, { height: bar2, backgroundColor: color }]} />
      <Animated.View style={[styles.equalizerBar, { height: bar3, backgroundColor: color }]} />
    </View>
  );
};

export const SoundsScreen: React.FC = () => {
  const { colors, typography, spacing, isDark } = useTheme();
  const navigation = useNavigation();
  const playbackState = usePlaybackState();

  const [selectedCategory, setSelectedCategory] = useState<SoundCategoryId>('rain');
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

  const getThemeForCategory = (cat: SoundCategoryId): AtmosphereThemeType => {
    switch (cat) {
      case 'rain':
        return 'rain';
      case 'forest':
        return 'forest';
      case 'ocean':
        return 'ocean';
      case 'calm':
      default:
        return 'zen';
    }
  };

  const currentTheme = getThemeForCategory(selectedCategory);
  const activeThemeMeta =
    ATMOSPHERE_THEMES.find((t) => t.id === currentTheme) || ATMOSPHERE_THEMES[0];

  const filteredTracks = AMBIENT_TRACKS.filter(
    (track) => track.categoryId === selectedCategory
  );

  const activeCategoryMeta = SOUND_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );

  const handleSelectTrack = async (track: AmbientTrack) => {
    setActiveTrackId(track.id);
    if (activeTrackId === track.id && isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playTrack(track.id);
    }
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

  const handleVolumeStep = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((volume + delta) * 10) / 10));
    handleVolumeChange(next);
  };

  const cycleSleepTimer = () => {
    const currentIndex = SLEEP_OPTIONS.indexOf(selectedSleepMin);
    const nextIndex = (currentIndex + 1) % SLEEP_OPTIONS.length;
    const nextMin = SLEEP_OPTIONS[nextIndex];
    setSelectedSleepMin(nextMin);
    if (nextMin === 0) {
      audioService.cancelSleepTimer();
    } else {
      audioService.startSleepTimer(nextMin);
    }
  };

  const currentTrack =
    AMBIENT_TRACKS.find((t) => t.id === activeTrackId) || AMBIENT_TRACKS[0];

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Calming Sounds"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* 1. Large, Tactile Category Switcher */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}
        >
          {SOUND_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? cat.pastelBgDark
                        : cat.pastelBg
                      : colors.surface,
                    borderColor: isSelected ? cat.borderColor : colors.surfaceBorder,
                    borderWidth: isSelected ? 2.5 : 1,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 22, marginRight: 8 }}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryTabText,
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
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Main Track List with generous tap targets */}
      <ScrollView
        contentContainerStyle={[styles.trackListContainer, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryHeaderTitle, { color: colors.textPrimary }]}>
            {activeCategoryMeta?.icon} {activeCategoryMeta?.title} Sounds
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {filteredTracks.length} tracks • Tap to play
          </Text>
        </View>

        {filteredTracks.map((track) => {
          const isSelected = activeTrackId === track.id;
          const isCurrentlyPlayingThis = isSelected && isPlaying;

          return (
            <Card
              key={track.id}
              style={[
                styles.trackCard,
                {
                  backgroundColor: isCurrentlyPlayingThis
                    ? isDark
                      ? 'rgba(224, 122, 95, 0.25)'
                      : colors.cardSoundsBg + '35'
                    : isSelected
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : colors.surfaceElevated
                    : colors.surface,
                  borderColor: isCurrentlyPlayingThis
                    ? colors.accentTerracotta
                    : isSelected
                    ? colors.primaryLight
                    : colors.surfaceBorder,
                  borderWidth: isCurrentlyPlayingThis ? 2.5 : 1,
                },
              ]}
              onPress={() => handleSelectTrack(track)}
            >
              <View style={styles.trackRow}>
                <View
                  style={[
                    styles.trackIconBubble,
                    {
                      backgroundColor: isCurrentlyPlayingThis
                        ? colors.accentTerracotta + '35'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
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
                      {
                        color: colors.textPrimary,
                        fontFamily: 'serif',
                        fontSize: 17,
                      },
                    ]}
                  >
                    {track.title}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, marginTop: 3 },
                    ]}
                    numberOfLines={1}
                  >
                    {track.subtitle}
                  </Text>
                </View>

                {/* Generous Play / Pause indicator button */}
                <View style={styles.playStateBtn}>
                  {isCurrentlyPlayingThis ? (
                    <View style={[styles.playingBadge, { backgroundColor: colors.accentTerracotta }]}>
                      <Text style={styles.playingBadgeText}>❚❚ Pause</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.playCircle,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.14)'
                            : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary, marginLeft: 2 }}>▶</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        })}

        <View style={{ height: 270 }} />
      </ScrollView>

      {/* 3. DOCKED BOTTOM PLAYER WITH BIG BUTTONS & ANIMATED SOUNDWAVES */}
      <View style={styles.dockedPlayerWrapper}>
        <AtmosphereThemeView
          theme={currentTheme}
          isActive={isPlaying}
          height={225}
          style={styles.dockedPlayerCard}
        >
          <View
            style={[
              styles.playerInterior,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 27, 21, 0.90)'
                  : 'rgba(255, 255, 255, 0.94)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.16)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            {/* Top row: Track Title, Soundwaves, Sleep Timer */}
            <View style={styles.playerTopRow}>
              <View style={styles.playerTrackTitleBox}>
                <View style={styles.titleWithWaveRow}>
                  <Text
                    style={[
                      styles.playerTrackTitle,
                      { color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {currentTrack.title}
                  </Text>
                  <AnimatedSoundWaves
                    isPlaying={isPlaying}
                    color={activeThemeMeta.accent}
                  />
                </View>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary, marginTop: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {activeThemeMeta.name} • {isPlaying ? 'Playing loop' : 'Paused'}
                </Text>
              </View>

              {/* Large sleep timer button */}
              <TouchableOpacity
                style={[
                  styles.sleepBtn,
                  {
                    backgroundColor: selectedSleepMin > 0
                      ? colors.accentTerracotta + '30'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.10)'
                      : 'rgba(0, 0, 0, 0.06)',
                    borderColor: selectedSleepMin > 0
                      ? colors.accentTerracotta
                      : colors.surfaceBorder,
                  },
                ]}
                onPress={cycleSleepTimer}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>🌙</Text>
                <Text
                  style={[
                    styles.sleepBtnText,
                    {
                      color: selectedSleepMin > 0
                        ? colors.accentTerracotta
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {sleepRemainingSeconds !== null && sleepRemainingSeconds > 0
                    ? formatTimeMMSS(sleepRemainingSeconds)
                    : selectedSleepMin > 0
                    ? `${selectedSleepMin}m`
                    : 'Timer'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Middle row: Large Volume Stepper (+ / - buttons) */}
            <View style={styles.volumeStepperRow}>
              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.14)'
                      : 'rgba(0, 0, 0, 0.08)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'rgba(0, 0, 0, 0.15)',
                  },
                ]}
                onPress={() => handleVolumeStep(-0.1)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: '100%', height: 36 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor={activeThemeMeta.accent}
                  maximumTrackTintColor={colors.surfaceBorder}
                  thumbTintColor={activeThemeMeta.accent}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.14)'
                      : 'rgba(0, 0, 0, 0.08)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'rgba(0, 0, 0, 0.15)',
                  },
                ]}
                onPress={() => handleVolumeStep(0.1)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>

              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textPrimary,
                    width: 44,
                    textAlign: 'right',
                    fontWeight: '700',
                  },
                ]}
              >
                {Math.round(volume * 100)}%
              </Text>
            </View>

            {/* Bottom row: Big, Juicy Play/Pause and Stop buttons */}
            <View style={styles.playerButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.mainPlayBtn,
                  {
                    backgroundColor: isPlaying
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.18)'
                        : 'rgba(0, 0, 0, 0.10)'
                      : colors.accentTerracotta,
                  },
                ]}
                onPress={handleTogglePlayPause}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.mainPlayBtnText,
                    {
                      color: isPlaying
                        ? colors.textPrimary
                        : '#FFFFFF',
                    },
                  ]}
                >
                  {isPlaying ? '❚❚ Pause' : '▶ Play Now'}
                </Text>
              </TouchableOpacity>

              {isPlaying && (
                <TouchableOpacity
                  style={[
                    styles.stopBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(222, 119, 91, 0.25)'
                        : 'rgba(222, 119, 91, 0.2)',
                    },
                  ]}
                  onPress={handleStop}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.stopBtnText, { color: colors.accentTerracotta }]}>
                    ◼ Stop
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </AtmosphereThemeView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  categoryTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  categoryTabText: {
    fontSize: 15,
  },
  trackListContainer: {
    paddingBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  trackCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 22,
    minHeight: 82,
    justifyContent: 'center',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackIcon: {
    fontSize: 24,
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  playStateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  playingBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  playCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
    marginLeft: 8,
  },
  equalizerBar: {
    width: 3.5,
    borderRadius: 2,
  },
  dockedPlayerWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  dockedPlayerCard: {
    borderRadius: 28,
  },
  playerInterior: {
    width: '94%',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 14,
    alignSelf: 'center',
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playerTrackTitleBox: {
    flex: 1,
    marginRight: 10,
  },
  titleWithWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTrackTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'serif',
    maxWidth: '78%',
  },
  sleepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  sleepBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  volumeStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mainPlayBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mainPlayBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stopBtn: {
    width: 86,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
