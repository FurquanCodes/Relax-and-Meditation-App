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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePlaybackState, State } from 'react-native-track-player';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import {
  audioService,
  AMBIENT_TRACKS,
  SOUND_CATEGORIES,
  SoundCategoryId,
  AmbientTrack,
} from '../services/audioService';
import { formatTimeMMSS } from '../logic/formatters';
import { ScenicBackground } from '../components/ScenicBackground';
import { SceneId } from '../data/settingsStore';

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

  const getGradientForCategory = (cat: SoundCategoryId): [string, string] => {
    switch (cat) {
      case 'rain':
        return isDark
          ? ['rgba(44, 62, 80, 0.45)', 'rgba(25, 38, 50, 0.45)']
          : ['rgba(176, 196, 214, 0.35)', 'rgba(142, 166, 189, 0.35)'];
      case 'forest':
        return isDark
          ? ['rgba(29, 66, 48, 0.45)', 'rgba(16, 42, 30, 0.45)']
          : ['rgba(168, 206, 185, 0.35)', 'rgba(132, 178, 153, 0.35)'];
      case 'ocean':
        return isDark
          ? ['rgba(20, 68, 84, 0.45)', 'rgba(11, 44, 55, 0.45)']
          : ['rgba(165, 209, 222, 0.35)', 'rgba(128, 183, 199, 0.35)'];
      case 'calm':
      default:
        return isDark
          ? ['rgba(54, 42, 82, 0.45)', 'rgba(34, 25, 54, 0.45)']
          : ['rgba(203, 194, 235, 0.35)', 'rgba(172, 160, 214, 0.35)'];
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

  const handleSelectTrack = async (track: AmbientTrack) => {
    setActiveTrackId(track.id);
    if (activeTrackId === track.id && isPlaying) {
      await audioService.pause();
    } else {
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
    await audioService.setVolume(val);
  };

  const handleVolumeStep = async (delta: number) => {
    const newVol = Math.max(0, Math.min(1, Math.round((volume + delta) * 10) / 10));
    setVolume(newVol);
    await audioService.setVolume(newVol);
  };

  const handleSelectSleep = (min: number) => {
    setSelectedSleepMin(min);
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
                        ? '#8CD5B4'
                        : '#265C43'
                      : isDark
                      ? 'rgba(17, 29, 37, 0.65)'
                      : 'rgba(255, 255, 255, 0.75)',
                    borderColor: isSelected
                      ? isDark
                        ? '#8CD5B4'
                        : '#265C43'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'rgba(255, 255, 255, 0.90)',
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected
                        ? isDark
                          ? '#0B131A'
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
        contentContainerStyle={[styles.tracksContainer, { paddingBottom: 220 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.categoryHeaderTitle, { color: colors.textPrimary }]}>
          {activeCategoryMeta?.icon} {activeCategoryMeta?.title} Atmosphere
        </Text>
        <Text style={[styles.categorySubtitle, { color: isDark ? '#D8E8E0' : '#2A3F33' }]}>
          {activeCategoryMeta?.subtitle}
        </Text>

        {filteredTracks.map((track) => {
          const isThisActive = activeTrackId === track.id;
          const isThisPlaying = isThisActive && isPlaying;
          const categoryGradient = getGradientForCategory(track.categoryId);

          return (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackCard,
                {
                  backgroundColor: isThisActive
                    ? isDark
                      ? 'rgba(140, 213, 180, 0.22)'
                      : 'rgba(38, 92, 67, 0.14)'
                    : isDark
                    ? 'rgba(17, 29, 37, 0.65)'
                    : 'rgba(255, 255, 255, 0.75)',
                  borderColor: isThisActive
                    ? isDark
                      ? '#8CD5B4'
                      : '#265C43'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(255, 255, 255, 0.88)',
                  borderWidth: isThisActive ? 2 : 1.5,
                },
              ]}
              onPress={() => handleSelectTrack(track)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={categoryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.trackCardLeft}>
                <View
                  style={[
                    styles.trackPlayIndicator,
                    {
                      backgroundColor: isThisActive
                        ? isDark
                          ? '#8CD5B4'
                          : '#265C43'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isThisActive
                        ? isDark
                          ? '#0B131A'
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
                  <Text style={[styles.trackDesc, { color: isDark ? '#D8E8E0' : '#2C4235' }]}>
                    {track.subtitle}
                  </Text>
                </View>
              </View>

              {isThisPlaying && (
                <AnimatedSoundWaves
                  isPlaying={isThisPlaying}
                  color={isDark ? '#8CD5B4' : '#265C43'}
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
            backgroundColor: isDark
              ? 'rgba(15, 26, 34, 0.92)'
              : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.16)'
              : 'rgba(255, 255, 255, 0.95)',
          },
        ]}
      >
        <View style={styles.dockedMainRow}>
          <View style={styles.dockedTrackDetails}>
            <Text style={[styles.dockedTrackTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeTrack.title}
            </Text>
            <Text style={[styles.dockedTrackSubtitle, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
              {isPlaying ? 'Now Playing Loop' : 'Paused'}
              {sleepRemainingSeconds !== null && ` • 🌙 ${formatTimeMMSS(sleepRemainingSeconds)}`}
            </Text>
          </View>

          {/* Large Circular Play/Pause Button */}
          <TouchableOpacity
            style={[
              styles.largePlayPauseCircle,
              {
                backgroundColor: isDark ? '#8CD5B4' : '#265C43',
                shadowColor: isDark ? '#8CD5B4' : '#265C43',
              },
            ]}
            onPress={handleTogglePlay}
            activeOpacity={0.8}
          >
            <Text style={[styles.largePlayPauseGlyph, { color: isDark ? '#0B131A' : '#FFFFFF' }]}>
              {isPlaying ? '❚❚' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Volume Steppers + Slider */}
        <View style={styles.playerVolumeRow}>
          <TouchableOpacity
            style={[
              styles.volStepBtn,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' },
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
            minimumTrackTintColor={isDark ? '#8CD5B4' : '#265C43'}
            maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
            thumbTintColor={isDark ? '#8CD5B4' : '#265C43'}
          />

          <TouchableOpacity
            style={[
              styles.volStepBtn,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' },
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
          <Text style={[styles.sleepLabel, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
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
                          ? '#8CD5B4'
                          : '#265C43'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(0, 0, 0, 0.05)',
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
                            ? '#0B131A'
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
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
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  dockedMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dockedTrackDetails: {
    flex: 1,
    paddingRight: 12,
  },
  dockedTrackTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  dockedTrackSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    marginTop: 2,
  },
  largePlayPauseCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  largePlayPauseGlyph: {
    fontSize: 20,
    fontWeight: '700',
  },
  playerVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  volStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volStepGlyph: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  volPercentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    minWidth: 36,
    textAlign: 'right',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sleepLabel: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
  },
  sleepChips: {
    flexDirection: 'row',
    gap: 6,
  },
  sleepChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  sleepChipText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
  },
});
