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

  const handleSelectSleepTimer = (minutes: number) => {
    setSelectedSleepMin(minutes);
    if (minutes === 0) {
      audioService.cancelSleepTimer();
    } else {
      audioService.startSleepTimer(minutes);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Calming Sounds"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing.md },
          ]}
        >
          Choose a soothing sound category, then select your ambience.
        </Text>

        {/* 1. Category Selector Strip */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginBottom: spacing.sm },
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

        {/* 2. Audios in Selected Category */}
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

        {/* 3. Now Playing Card */}
        <Card
          style={[
            styles.playerCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.surfaceBorder,
              marginTop: spacing.xl,
            },
          ]}
        >
          <View style={styles.playerCardHeader}>
            <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 1 }]}>
              {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
            </Text>
            <Text
              style={[
                styles.nowPlayingTitle,
                { color: colors.textPrimary, marginTop: 2 },
              ]}
            >
              {AMBIENT_TRACKS.find((t) => t.id === activeTrackId)?.title}
            </Text>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              VOLUME: {Math.round(volume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={colors.accentTerracotta}
              maximumTrackTintColor={colors.surfaceBorder}
              thumbTintColor={colors.accentTerracotta}
            />
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
        </Card>

        {/* 4. Sleep Timer Section */}
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
          Automatically fade out and stop sound after chosen time
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackCard: {
    marginVertical: 5,
    borderRadius: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackIcon: {
    fontSize: 22,
  },
  trackInfo: {
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 8,
    paddingRight: 4,
  },
  playArrow: {
    fontSize: 14,
    opacity: 0.6,
  },
  playerCard: {
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  playerCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nowPlayingTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  volumeContainer: {
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  halfBtn: {
    flex: 0.48,
  },
  sleepChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  sleepChip: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sleepTimerActiveBanner: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
});
