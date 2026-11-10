import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { usePlaybackState, State } from 'react-native-track-player';
import { useTheme } from '../../../shared/theme/ThemeContext';
import { Header } from '../../../shared/components/Header';
import {
  audioService,
  AMBIENT_TRACKS,
  SOUND_CATEGORIES,
  SoundCategoryId,
  AmbientTrack,
} from '../services/audioService';
import { formatTimeMMSS } from '../../../shared/logic/formatters';
import { ScenicBackground } from '../../../shared/components/ScenicBackground';
import { settingsStore, SceneId } from '../../../shared/store/settingsStore';
import { progressStore } from '../../progress';
import { BottomNavBar } from '../../../shared/components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const playbackState = usePlaybackState();

  const [selectedCategory, setSelectedCategory] = useState<SoundCategoryId>(
    settingsStore.getSoundCategory()
  );
  const [activeTrackId, setActiveTrackId] = useState<string>(
    settingsStore.getSoundTrackId()
  );
  const [volume, setVolume] = useState<number>(settingsStore.getSoundVolume());
  const [selectedSleepMin, setSelectedSleepMin] = useState<number>(
    settingsStore.getSoundSleepMinutes()
  );
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);

  const isPlaying =
    playbackState.state === State.Playing ||
    playbackState.state === State.Buffering;

  // Mindful Audio Listening Tracking
  const playbackStartRef = useRef<number | null>(null);
  const sessionCountedRef = useRef<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      playbackStartRef.current = Date.now();

      // Every 30 seconds of active playback, record progress
      interval = setInterval(() => {
        const countSession = !sessionCountedRef.current;
        sessionCountedRef.current = true;
        progressStore.recordListeningSeconds(30, countSession);
      }, 30000);
    } else {
      if (playbackStartRef.current) {
        const elapsedSec = Math.round((Date.now() - playbackStartRef.current) / 1000);
        const remainder = elapsedSec % 30;
        if (remainder >= 15) {
          const countSession = !sessionCountedRef.current && elapsedSec >= 30;
          if (countSession) sessionCountedRef.current = true;
          progressStore.recordListeningSeconds(remainder, countSession);
        }
        playbackStartRef.current = null;
      }
      sessionCountedRef.current = false;
    }

    return () => {
      if (interval) clearInterval(interval);
      if (playbackStartRef.current) {
        const elapsedSec = Math.round((Date.now() - playbackStartRef.current) / 1000);
        const remainder = elapsedSec % 30;
        if (remainder >= 15) {
          const countSession = !sessionCountedRef.current && elapsedSec >= 30;
          progressStore.recordListeningSeconds(remainder, countSession);
        }
        playbackStartRef.current = null;
      }
    };
  }, [isPlaying]);

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

  const getSceneForCategory = (cat: SoundCategoryId): SceneId => {
    switch (cat) {
      case 'rain':
        return 'rain';
      case 'forest':
        return 'forest';
      case 'ocean':
        return 'ocean';
      case 'calm':
      default:
        return 'night';
    }
  };

  const filteredTracks = AMBIENT_TRACKS.filter(
    (track) => track.categoryId === selectedCategory
  );

  const activeCategoryMeta = SOUND_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );

  const activeTrack =
    AMBIENT_TRACKS.find((t) => t.id === activeTrackId) || AMBIENT_TRACKS[0];

  const handleSelectCategory = (catId: SoundCategoryId) => {
    setSelectedCategory(catId);
    settingsStore.setSoundCategory(catId);
  };

  const handleSelectTrack = async (track: AmbientTrack) => {
    if (activeTrackId === track.id && isPlaying) {
      await audioService.pause();
    } else {
      if (playbackStartRef.current && isPlaying) {
        const elapsedSec = Math.round((Date.now() - playbackStartRef.current) / 1000);
        const remainder = elapsedSec % 30;
        if (remainder >= 15) {
          const countSession = !sessionCountedRef.current && elapsedSec >= 30;
          if (countSession) sessionCountedRef.current = true;
          await progressStore.recordListeningSeconds(remainder, countSession);
        }
        playbackStartRef.current = Date.now();
      }
      setActiveTrackId(track.id);
      settingsStore.setSoundTrackId(track.id);
      await audioService.playTrack(track.id);
    }
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.playTrack(activeTrackId);
    }
  };

  const handleVolumeChange = async (val: number) => {
    setVolume(val);
    settingsStore.setSoundVolume(val);
    await audioService.setVolume(val);
  };

  const handleVolumeStep = async (delta: number) => {
    const newVol = Math.max(0, Math.min(1, Math.round((volume + delta) * 10) / 10));
    setVolume(newVol);
    settingsStore.setSoundVolume(newVol);
    await audioService.setVolume(newVol);
  };

  const handleSelectSleep = (min: number) => {
    setSelectedSleepMin(min);
    settingsStore.setSoundSleepMinutes(min);
    if (min === 0) {
      audioService.cancelSleepTimer();
    } else {
      audioService.startSleepTimer(min);
    }
  };

  return (
    <ScenicBackground scene={getSceneForCategory(selectedCategory)} style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Header
        title="Ambient Sounds"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* 1. HORIZONTAL CATEGORY PILLS */}
      <View style={styles.categoryPillsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {SOUND_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
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
                onPress={() => handleSelectCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected
                        ? isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textPrimary,
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

      {/* 2. TRACK LIST */}
      <ScrollView
        style={styles.tracksScroll}
        contentContainerStyle={[
          styles.tracksContainer,
          { paddingBottom: Math.max(insets.bottom + 270, 290) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.categoryHeaderTitle, { color: colors.textPrimary }]}>
          {activeCategoryMeta?.icon} {activeCategoryMeta?.title} Atmosphere
        </Text>
        <Text style={[styles.categorySubtitle, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
          {activeCategoryMeta?.subtitle}
        </Text>

        {filteredTracks.map((track) => {
          const isThisActive = activeTrackId === track.id;
          const isThisPlaying = isThisActive && isPlaying;

          return (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackCard,
                {
                  backgroundColor: isThisActive
                    ? isDark
                      ? '#222228'
                      : '#E4F0E9'
                    : isDark
                    ? '#141418'
                    : '#FFFFFF',
                  borderColor: isThisActive
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.35)'
                      : '#265C43'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.10)'
                    : '#D6E4DC',
                  borderWidth: isThisActive ? 2 : 1.5,
                },
              ]}
              onPress={() => handleSelectTrack(track)}
              activeOpacity={0.88}
            >
              <View style={styles.trackCardLeft}>
                <View
                  style={[
                    styles.trackPlayIndicator,
                    {
                      backgroundColor: isThisActive
                        ? isDark
                          ? '#FFFFFF'
                          : '#265C43'
                        : isDark
                        ? '#1C1C22'
                        : '#EAF2ED',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isThisActive
                        ? isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textPrimary,
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  >
                    {isThisPlaying ? '❚❚' : '▶'}
                  </Text>
                </View>

                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: colors.textPrimary }]}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackDesc, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
                    {track.subtitle}
                  </Text>
                </View>
              </View>

              {isThisPlaying && (
                <AnimatedSoundWaves
                  isPlaying={isThisPlaying}
                  color={isDark ? '#FFFFFF' : '#265C43'}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. DOCKED BOTTOM PLAYER WITH LARGE PLAY/PAUSE, VOLUME & SLEEP */}
      <View
        style={[
          styles.dockedPlayer,
          {
            bottom: Math.max(insets.bottom + 92, 100),
            backgroundColor: isDark ? '#101014' : '#FFFFFF',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : '#D6E4DC',
          },
        ]}
      >
        <View style={styles.dockedMainRow}>
          <View style={styles.dockedTrackDetails}>
            <Text style={[styles.dockedTrackTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeTrack.title}
            </Text>
            <Text style={[styles.dockedTrackSubtitle, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
              {isPlaying ? 'Now Playing Loop' : 'Paused'}
              {sleepRemainingSeconds !== null && ` • 🌙 ${formatTimeMMSS(sleepRemainingSeconds)}`}
            </Text>
          </View>

          {/* Large Circular Play/Pause Button */}
          <TouchableOpacity
            style={[
              styles.largePlayPauseCircle,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#265C43',
                shadowColor: isDark ? '#000000' : '#265C43',
              },
            ]}
            onPress={handleTogglePlay}
            activeOpacity={0.8}
          >
            <Text style={[styles.largePlayPauseGlyph, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {isPlaying ? '❚❚' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Volume Steppers + Slider */}
        <View style={styles.playerVolumeRow}>
          <TouchableOpacity
            style={[
              styles.volStepBtn,
              { backgroundColor: isDark ? '#1C1C22' : '#EAF2ED' },
            ]}
            onPress={() => handleVolumeStep(-0.1)}
          >
            <Text style={[styles.volStepGlyph, { color: colors.textPrimary }]}>−</Text>
          </TouchableOpacity>

          <Slider
            style={{ flex: 1, marginHorizontal: 8 }}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={isDark ? '#FFFFFF' : '#265C43'}
            maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
            thumbTintColor={isDark ? '#FFFFFF' : '#265C43'}
          />

          <TouchableOpacity
            style={[
              styles.volStepBtn,
              { backgroundColor: isDark ? '#1C1C22' : '#EAF2ED' },
            ]}
            onPress={() => handleVolumeStep(0.1)}
          >
            <Text style={[styles.volStepGlyph, { color: colors.textPrimary }]}>+</Text>
          </TouchableOpacity>

          <Text style={[styles.volPercentText, { color: colors.textPrimary }]}>
            {Math.round(volume * 100)}%
          </Text>
        </View>

        {/* Sleep Timer Pills */}
        <View style={styles.sleepRow}>
          <Text style={[styles.sleepLabel, { color: isDark ? '#C8C8D4' : '#2E4638' }]}>
            🌙 Timer:
          </Text>
          <View style={styles.sleepChips}>
            {SLEEP_OPTIONS.map((min) => {
              const isSelected = selectedSleepMin === min;
              return (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.sleepChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#265C43'
                        : isDark
                        ? '#1C1C22'
                        : '#EAF2ED',
                    },
                  ]}
                  onPress={() => handleSelectSleep(min)}
                >
                  <Text
                    style={[
                      styles.sleepChipText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {min === 0 ? 'Off' : `${min}m`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* 4. Global Floating Capsule Navigation Bar */}
      <BottomNavBar activeTab="sounds" />
    </ScenicBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  categoryPillsContainer: {
    marginVertical: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  categoryPillIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  tracksScroll: {
    flex: 1,
  },
  tracksContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  categoryHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    marginBottom: 16,
  },
  trackCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 74,
  },
  trackCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackPlayIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '600',
  },
  equalizerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    gap: 3,
    marginLeft: 10,
  },
  equalizerBar: {
    width: 3.5,
    borderRadius: 2,
  },
  dockedPlayer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 0,
    zIndex: 90,
  },
  dockedMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dockedTrackDetails: {
    flex: 1,
    paddingRight: 10,
  },
  dockedTrackTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  dockedTrackSubtitle: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    marginTop: 2,
  },
  largePlayPauseCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePlayPauseGlyph: {
    fontSize: 18,
    fontWeight: '700',
  },
  playerVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  volStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volStepGlyph: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  volPercentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'sans-serif',
    minWidth: 34,
    textAlign: 'right',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sleepLabel: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    fontWeight: '600',
  },
  sleepChips: {
    flexDirection: 'row',
    gap: 6,
  },
  sleepChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sleepChipText: {
    fontSize: 11,
    fontFamily: 'sans-serif',
    fontWeight: '700',
  },
});
