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
import { PrimaryButton } from '../components/PrimaryButton';
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

const SLEEP_TIMER_OPTIONS = [0, 1, 15, 30, 60];

export const SoundsScreen: React.FC = () => {
  const { colors, typography, spacing, isDark } = useTheme();
  const navigation = useNavigation();
  const playbackState = usePlaybackState();

  // Active Category state (Rain, Ocean, Forest, Calm)
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

  // Compute theme for current track
  const currentTheme: AtmosphereThemeType =
    activeTrackId === 'forest_river_birds'
      ? 'river'
      : selectedCategory === 'rain'
      ? 'rain'
      : selectedCategory === 'forest'
      ? 'forest'
      : selectedCategory === 'ocean'
      ? 'ocean'
      : 'zen';

  const activeThemeMeta =
    ATMOSPHERE_THEMES.find((t) => t.id === currentTheme) || ATMOSPHERE_THEMES[0];

  // Filter tracks by currently selected category
  const filteredTracks = AMBIENT_TRACKS.filter(
    (track) => track.categoryId === selectedCategory
  );

  const activeCategoryMeta = SOUND_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );

  const handleSelectTrack = async (track: AmbientTrack) => {
    setActiveTrackId(track.id);
    await audioService.playTrack(track.id);
  };

  const handleSelectThemePill = async (themeType: AtmosphereThemeType) => {
    const meta = ATMOSPHERE_THEMES.find((t) => t.id === themeType);
    if (!meta) return;

    const track = AMBIENT_TRACKS.find((t) => t.id === meta.associatedTrackId);
    if (track) {
      setSelectedCategory(track.categoryId);
      setActiveTrackId(track.id);
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

  const handleSelectSleepTimer = (minutes: number) => {
    setSelectedSleepMin(minutes);
    if (minutes === 0) {
      audioService.cancelSleepTimer();
    } else {
      audioService.startSleepTimer(minutes);
    }
  };

  const currentTrack = AMBIENT_TRACKS.find((t) => t.id === activeTrackId);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Calming Sounds"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing.md },
          ]}
        >
          Choose a soothing sound category or theme, then relax with live ambient
          atmospheres.
        </Text>

        {/* 1. Quick Atmospheric Themes Bar */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginBottom: spacing.xs },
          ]}
        >
          Atmosphere Themes
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themeChipsRow}
        >
          {ATMOSPHERE_THEMES.map((theme) => {
            const isThemeActive = currentTheme === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themePill,
                  {
                    backgroundColor: isThemeActive
                      ? isDark
                        ? theme.darkBg
                        : theme.lightBg
                      : colors.surface,
                    borderColor: isThemeActive
                      ? theme.accent
                      : colors.surfaceBorder,
                    borderWidth: isThemeActive ? 1.8 : 1,
                  },
                ]}
                onPress={() => handleSelectThemePill(theme.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18, marginRight: 6 }}>{theme.icon}</Text>
                <Text
                  style={[
                    styles.themePillText,
                    {
                      color: isThemeActive
                        ? isDark
                          ? '#FFFFFF'
                          : '#1A2E22'
                        : colors.textPrimary,
                      fontWeight: isThemeActive ? '700' : '500',
                    },
                  ]}
                >
                  {theme.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. LIVE THEMATIC BACKDROP BEHIND ACTIVE SOUND PLAYING */}
        <AtmosphereThemeView
          theme={currentTheme}
          isActive={isPlaying}
          height={260}
          style={[styles.playerThematicCard, { marginTop: spacing.md }]}
        >
          <View
            style={[
              styles.playerInterior,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 27, 21, 0.82)'
                  : 'rgba(255, 255, 255, 0.88)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            {/* Header pill inside player */}
            <View style={styles.thematicBadgeRow}>
              <View
                style={[
                  styles.atmosphereTag,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : activeThemeMeta.lightBg,
                    borderColor: activeThemeMeta.accent,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, marginRight: 4 }}>
                  {activeThemeMeta.icon}
                </Text>
                <Text
                  style={[
                    styles.atmosphereTagText,
                    { color: isDark ? '#FFFFFF' : '#1A2E22' },
                  ]}
                >
                  {activeThemeMeta.name.toUpperCase()} THEME
                </Text>
              </View>

              <Text
                style={[
                  typography.caption,
                  {
                    color: isPlaying ? colors.accentTerracotta : colors.textMuted,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {isPlaying ? '● PLAYING' : 'PAUSED'}
              </Text>
            </View>

            {/* Track Info */}
            <View style={styles.thematicTrackInfo}>
              <Text
                style={[
                  styles.nowPlayingTitle,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {currentTrack?.title}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
                numberOfLines={1}
              >
                {currentTrack?.subtitle}
              </Text>
            </View>

            {/* Volume Control with + and - buttons */}
            <View style={styles.volumeContainer}>
              <View style={styles.volumeHeaderRow}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  VOLUME
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  🔊 {Math.round(volume * 100)}%
                </Text>
              </View>

              <View style={styles.volumeControlsRow}>
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
                  <Text style={[styles.volStepText, { color: colors.textPrimary }]}>−</Text>
                </TouchableOpacity>

                <View style={styles.sliderWrapper}>
                  <Slider
                    style={styles.slider}
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
                  <Text style={[styles.volStepText, { color: colors.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
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
          </View>
        </AtmosphereThemeView>

        {/* 3. Category Selector Strip */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.xs },
          ]}
        >
          Categories
        </Text>

        <View style={styles.categoryGrid}>
          {SOUND_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const bg = isDark
              ? isSelected
                ? cat.pastelBgDark
                : colors.surface
              : isSelected
              ? cat.pastelBg
              : colors.surface;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: bg,
                    borderColor: isSelected
                      ? cat.borderColor
                      : colors.surfaceBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryTitle,
                    {
                      color: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#1A2E22'
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {cat.title}
                </Text>
                <Text
                  style={[
                    styles.categorySubtitle,
                    {
                      color: isSelected
                        ? isDark
                          ? '#C5D8CF'
                          : '#4A5D52'
                        : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {cat.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Audios in Selected Category */}
        <View style={styles.trackSectionHeader}>
          <Text
            style={[
              typography.subheader,
              { color: colors.textPrimary },
            ]}
          >
            {activeCategoryMeta?.icon} {activeCategoryMeta?.title} Sounds
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {filteredTracks.length} tracks
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
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(224, 122, 95, 0.22)'
                      : colors.cardSoundsBg + '25'
                    : colors.surface,
                  borderColor: isSelected
                    ? colors.accentTerracotta
                    : colors.surfaceBorder,
                  borderWidth: isSelected ? 1.8 : 1,
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
                  >
                    {track.subtitle}
                  </Text>
                </View>

                <View style={styles.statusIndicator}>
                  {isCurrentlyPlayingThis ? (
                    <Text style={{ fontSize: 20 }}>🔊</Text>
                  ) : isSelected ? (
                    <Text style={{ fontSize: 18, color: colors.accentTerracotta }}>✓</Text>
                  ) : (
                    <Text style={[styles.playArrow, { color: colors.textSecondary }]}>▶</Text>
                  )}
                </View>
              </View>
            </Card>
          );
        })}

        {/* 5. Sleep Timer Section */}
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
          Automatically stop sound playback after chosen duration
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
                    backgroundColor: isSelected ? colors.accentTerracotta : colors.surface,
                    borderColor: isSelected ? colors.accentTerracotta : colors.surfaceBorder,
                    borderRadius: 24,
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
              {
                backgroundColor: isDark
                  ? 'rgba(224, 122, 95, 0.2)'
                  : colors.accentPeach,
                borderColor: isDark ? 'rgba(224, 122, 95, 0.35)' : 'transparent',
                borderWidth: isDark ? 1 : 0,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                typography.bodyBold,
                { color: isDark ? '#FFD4C4' : '#4A2616' },
              ]}
            >
              ⏳ Stops in: {formatTimeMMSS(sleepRemainingSeconds)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  themeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  themePillText: {
    fontSize: 13,
  },
  playerThematicCard: {
    width: '100%',
    borderRadius: 24,
  },
  playerInterior: {
    width: '92%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignSelf: 'center',
  },
  thematicBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  atmosphereTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  atmosphereTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  thematicTrackInfo: {
    marginBottom: 10,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  volumeContainer: {
    marginBottom: 12,
  },
  volumeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  volumeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  slider: {
    width: '100%',
    height: 36,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfBtn: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
  },
  categoryIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  categorySubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  trackSectionHeader: {
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
  },
  statusIndicator: {
    paddingLeft: 8,
  },
  playArrow: {
    fontSize: 16,
  },
  sleepChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  sleepChip: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sleepTimerActiveBanner: {
    marginTop: 14,
    padding: 12,
    alignItems: 'center',
  },
});
