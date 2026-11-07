import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

  // Map category to matching atmosphere theme
  const getThemeForCategory = (cat: SoundCategoryId): AtmosphereThemeType => {
    switch (cat) {
      case 'rain':
        return 'rain';
      case 'river':
        return 'river';
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

  // Cycle sleep timer: 0 -> 15m -> 30m -> 60m -> 0
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

      {/* 1. Category Switcher (Horizontal scrollable pill tabs) */}
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
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18, marginRight: 6 }}>{cat.icon}</Text>
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

      {/* 2. Main Track List */}
      <ScrollView
        contentContainerStyle={[styles.trackListContainer, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryHeader}>
          <Text style={[typography.subheader, { color: colors.textPrimary }]}>
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
                      ? 'rgba(224, 122, 95, 0.22)'
                      : colors.cardSoundsBg + '30'
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
                  borderWidth: isCurrentlyPlayingThis ? 2 : 1,
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
                        fontSize: 16,
                      },
                    ]}
                  >
                    {track.title}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                    numberOfLines={1}
                  >
                    {track.subtitle}
                  </Text>
                </View>

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
                            ? 'rgba(255, 255, 255, 0.12)'
                            : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 13, color: colors.textPrimary, marginLeft: 2 }}>▶</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        })}

        <View style={{ height: 260 }} />
      </ScrollView>

      {/* 3. DOCKED BOTTOM PLAYER (With Live Animated Atmosphere Theme Behind It!) */}
      <View style={styles.dockedPlayerWrapper}>
        <AtmosphereThemeView
          theme={currentTheme}
          isActive={isPlaying}
          height={210}
          style={styles.dockedPlayerCard}
        >
          <View
            style={[
              styles.playerInterior,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 27, 21, 0.88)'
                  : 'rgba(255, 255, 255, 0.92)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            {/* Top row: Track Title & Sleep Timer Pill */}
            <View style={styles.playerTopRow}>
              <View style={styles.playerTrackTitleBox}>
                <Text
                  style={[
                    styles.playerTrackTitle,
                    { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {currentTrack.title}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {activeThemeMeta.name} • {isPlaying ? 'Playing' : 'Paused'}
                </Text>
              </View>

              {/* Sleep timer button */}
              <TouchableOpacity
                style={[
                  styles.sleepBtn,
                  {
                    backgroundColor: selectedSleepMin > 0
                      ? colors.accentTerracotta + '30'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderColor: selectedSleepMin > 0
                      ? colors.accentTerracotta
                      : colors.surfaceBorder,
                  },
                ]}
                onPress={cycleSleepTimer}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13 }}>🌙</Text>
                <Text
                  style={[
                    styles.sleepBtnText,
                    {
                      color: selectedSleepMin > 0
                        ? colors.accentTerracotta
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {sleepRemainingSeconds !== null && sleepRemainingSeconds > 0
                    ? formatTimeMMSS(sleepRemainingSeconds)
                    : selectedSleepMin > 0
                    ? `${selectedSleepMin}m`
                    : 'Sleep'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Middle row: Clean Volume Stepper */}
            <View style={styles.volumeStepperRow}>
              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.06)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.18)'
                      : 'rgba(0, 0, 0, 0.12)',
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
                  style={{ width: '100%', height: 32 }}
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
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.06)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.18)'
                      : 'rgba(0, 0, 0, 0.12)',
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
                    color: colors.textSecondary,
                    width: 38,
                    textAlign: 'right',
                    fontWeight: '700',
                  },
                ]}
              >
                {Math.round(volume * 100)}%
              </Text>
            </View>

            {/* Bottom row: Play/Pause and Stop buttons */}
            <View style={styles.playerButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.mainPlayBtn,
                  {
                    backgroundColor: isPlaying
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.08)'
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
                  {isPlaying ? '❚❚ Pause' : '▶ Play'}
                </Text>
              </TouchableOpacity>

              {isPlaying && (
                <TouchableOpacity
                  style={[
                    styles.stopBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(222, 119, 91, 0.2)'
                        : 'rgba(222, 119, 91, 0.15)',
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
    paddingVertical: 10,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryTabText: {
    fontSize: 14,
  },
  trackListContainer: {
    paddingBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
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
    marginRight: 12,
  },
  trackIcon: {
    fontSize: 22,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  playingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockedPlayerWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dockedPlayerCard: {
    borderRadius: 24,
  },
  playerInterior: {
    width: '94%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignSelf: 'center',
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerTrackTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  playerTrackTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  sleepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  sleepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  volumeStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainPlayBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  stopBtn: {
    width: 75,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
