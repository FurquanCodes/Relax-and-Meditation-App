import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getDaytimeGreeting } from '../logic/formatters';
import { progressStore } from '../data/progressStore';
import { settingsStore, SceneId } from '../data/settingsStore';
import { NavigationProp } from '../navigation/types';
import { ScenicBackground } from '../components/ScenicBackground';
import { BreatheIcon, MeditateIcon, SoundsIcon, LeafLogoIcon } from '../components/SvgIcons';

// Staggered animated entrance wrapper
const FadeSlideIn: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: any;
}> = ({ delay, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Premium Glassmorphic Practice Card Component
const GlassPracticeCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradientColors: [string, string, ...string[]];
  tintColor: string;
  onPress: () => void;
  isDark: boolean;
}> = ({ title, subtitle, icon, gradientColors, tintColor, onPress, isDark }) => {
  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      speed: 30,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }], marginVertical: 6 }}>
      <Pressable
        style={[
          styles.glassCard,
          {
            backgroundColor: isDark
              ? 'rgba(17, 29, 37, 0.70)'
              : 'rgba(255, 255, 255, 0.75)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.16)'
              : 'rgba(255, 255, 255, 0.90)',
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradientOverlay}
        />

        <View style={styles.practiceLeft}>
          <View
            style={[
              styles.iconOrbBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.45)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.20)'
                  : 'rgba(255, 255, 255, 0.80)',
              },
            ]}
          >
            {icon}
          </View>
          <View style={styles.practiceTextWrap}>
            <Text
              style={[
                styles.practiceTitle,
                { color: isDark ? '#FFFFFF' : '#14221A' },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.practiceSubtitle,
                { color: isDark ? '#D8E8E0' : '#2C4235' },
              ]}
            >
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Tactile Circular Glass Arrow Button */}
        <View
          style={[
            styles.glassArrowCircle,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.22)'
                : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.25)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Text
            style={[
              styles.arrowGlyph,
              { color: isDark ? '#FFFFFF' : tintColor },
            ]}
          >
            ›
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Floating Island Bottom Navigation
const FloatingIslandNav: React.FC<{
  activeTab: 'home' | 'practice' | 'sounds' | 'settings';
  onNavigate: (tab: 'home' | 'practice' | 'sounds' | 'settings') => void;
  isDark: boolean;
  insetsBottom: number;
}> = ({ activeTab, onNavigate, isDark, insetsBottom }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: '🌿' },
    { id: 'practice' as const, label: 'Breathe', icon: '🫧' },
    { id: 'sounds' as const, label: 'Sounds', icon: '🎵' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View
      style={[
        styles.floatingNavContainer,
        {
          bottom: Math.max(insetsBottom + 8, 16),
          backgroundColor: isDark
            ? 'rgba(15, 26, 34, 0.88)'
            : 'rgba(255, 255, 255, 0.88)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.16)'
            : 'rgba(255, 255, 255, 0.95)',
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.navTabPill,
              isActive && {
                backgroundColor: isDark
                  ? 'rgba(140, 213, 180, 0.25)'
                  : 'rgba(38, 92, 67, 0.12)',
              },
            ]}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navTabIcon,
                { transform: [{ scale: isActive ? 1.15 : 1.0 }] },
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.navTabLabel,
                {
                  color: isActive
                    ? isDark
                      ? '#FFFFFF'
                      : '#14221A'
                    : isDark
                    ? '#809E90'
                    : '#788C81',
                  fontWeight: isActive ? '700' : '600',
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.activeDot,
                  {
                    backgroundColor: isDark ? '#8CD5B4' : '#265C43',
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [completedSessions, setCompletedSessions] = useState(
    progressStore.getCompletedSessions()
  );
  const [totalMinutes, setTotalMinutes] = useState(
    progressStore.getTotalMinutes()
  );
  const [scenePreference, setScenePreference] = useState<SceneId>(
    settingsStore.getScenePreference()
  );

  useEffect(() => {
    const unsubProgress = progressStore.subscribe(() => {
      setCompletedSessions(progressStore.getCompletedSessions());
      setTotalMinutes(progressStore.getTotalMinutes());
    });
    const unsubSettings = settingsStore.subscribe(() => {
      setScenePreference(settingsStore.getScenePreference());
    });
    return () => {
      unsubProgress();
      unsubSettings();
    };
  }, []);

  const { greeting, subtitle } = getDaytimeGreeting();

  const handleNavPress = (tab: 'home' | 'practice' | 'sounds' | 'settings') => {
    if (tab === 'home') return;
    if (tab === 'practice') navigation.navigate('Breathing');
    if (tab === 'sounds') navigation.navigate('Sounds');
    if (tab === 'settings') navigation.navigate('Settings');
  };

  return (
    <ScenicBackground scene={scenePreference} style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* 1. Header Bar: Leaf Brand Title + Outlined Settings Gear */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
            height: 64 + insets.top,
          },
        ]}
      >
        <View style={styles.brandContainer}>
          <LeafLogoIcon size={30} color={isDark ? '#8CD5B4' : '#265C43'} />
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            Q9 Relax
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsCircleBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.75)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.20)'
                : 'rgba(255, 255, 255, 0.90)',
            },
          ]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.settingsGear, { color: colors.textPrimary }]}>
            ⚙
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Scroll Content with Staggered Entrance */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: 18,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Daytime Greeting */}
        <FadeSlideIn delay={80}>
          <View style={styles.greetingSection}>
            <Text style={[styles.heroGreeting, { color: colors.textPrimary }]}>
              {greeting}
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                { color: isDark ? '#D8E8E0' : '#2A3F33' },
              ]}
            >
              {subtitle}
            </Text>
          </View>
        </FadeSlideIn>

        {/* Hero Featured Card: "Start your day with calm" */}
        <FadeSlideIn delay={160}>
          <TouchableOpacity
            style={[
              styles.heroFeaturedCard,
              {
                backgroundColor: isDark
                  ? 'rgba(28, 55, 45, 0.75)'
                  : 'rgba(142, 175, 161, 0.85)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.18)'
                  : 'rgba(255, 255, 255, 0.70)',
              },
            ]}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Breathing')}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(28, 55, 45, 0.90)', 'rgba(19, 40, 32, 0.90)']
                  : ['rgba(142, 175, 161, 0.92)', 'rgba(114, 152, 136, 0.92)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.heroLeftContent}>
              <Text
                style={[
                  styles.heroCardTitle,
                  { color: '#FFFFFF' },
                ]}
              >
                Start your day{'\n'}with calm
              </Text>

              {/* Large, tactile pill button */}
              <TouchableOpacity
                style={[
                  styles.heroPillBtn,
                  { backgroundColor: colors.accentTerracotta },
                ]}
                onPress={() => navigation.navigate('Breathing')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroPillBtnText}>Begin breathing ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroOrbGlow}>
              <View style={styles.heroOrbInner} />
            </View>
          </TouchableOpacity>
        </FadeSlideIn>

        {/* Progress Stats Split Cards (Sessions & Minutes) */}
        <FadeSlideIn delay={240}>
          <View style={styles.statsRow}>
            {/* Sessions Card */}
            <View
              style={[
                styles.statsGlassCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(42, 36, 18, 0.70)'
                    : 'rgba(248, 232, 182, 0.85)',
                  borderColor: isDark
                    ? 'rgba(253, 230, 138, 0.25)'
                    : 'rgba(255, 255, 255, 0.80)',
                },
              ]}
            >
              <View style={styles.statsHeaderRow}>
                <View
                  style={[
                    styles.statsIconBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.25)'
                        : 'rgba(150, 121, 30, 0.15)',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <Text
                  style={[
                    styles.statsNumber,
                    { color: colors.statsSessionsText },
                  ]}
                >
                  {completedSessions}
                </Text>
              </View>
              <Text
                style={[
                  styles.statsLabel,
                  { color: colors.statsSessionsText, opacity: 0.9 },
                ]}
              >
                Sessions
              </Text>
            </View>

            {/* Minutes Card */}
            <View
              style={[
                styles.statsGlassCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(47, 27, 21, 0.70)'
                    : 'rgba(252, 216, 196, 0.85)',
                  borderColor: isDark
                    ? 'rgba(255, 237, 213, 0.25)'
                    : 'rgba(255, 255, 255, 0.80)',
                },
              ]}
            >
              <View style={styles.statsHeaderRow}>
                <View
                  style={[
                    styles.statsIconBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(249, 115, 22, 0.25)'
                        : 'rgba(172, 95, 58, 0.15)',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>⏱️</Text>
                </View>
                <Text
                  style={[
                    styles.statsNumber,
                    { color: colors.statsMinutesText },
                  ]}
                >
                  {totalMinutes}
                </Text>
              </View>
              <Text
                style={[
                  styles.statsLabel,
                  { color: colors.statsMinutesText, opacity: 0.9 },
                ]}
              >
                Minutes
              </Text>
            </View>
          </View>
        </FadeSlideIn>

        {/* Section Heading: "Choose a practice" */}
        <FadeSlideIn delay={320}>
          <Text
            style={[
              styles.practiceHeader,
              { color: colors.textPrimary, marginTop: 24, marginBottom: 10 },
            ]}
          >
            Choose a practice
          </Text>

          {/* Three Big Glass-Style Practice Cards */}
          <GlassPracticeCard
            title="Breathe"
            subtitle="Guided rhythmic breathing with visual cues"
            icon={
              <BreatheIcon
                size={26}
                color={isDark ? '#8CD5B4' : '#265C43'}
                secondaryColor={isDark ? 'rgba(140,213,180,0.3)' : 'rgba(38,92,67,0.25)'}
              />
            }
            gradientColors={
              isDark
                ? ['rgba(30, 58, 47, 0.40)', 'rgba(21, 44, 35, 0.40)']
                : ['rgba(146, 181, 165, 0.25)', 'rgba(118, 157, 140, 0.25)']
            }
            tintColor={colors.accentGreen}
            onPress={() => navigation.navigate('Breathing')}
            isDark={isDark}
          />

          <GlassPracticeCard
            title="Meditate"
            subtitle="Quiet timer with soothing background sounds"
            icon={
              <MeditateIcon
                size={26}
                color={isDark ? '#AEAEE8' : '#5A58A8'}
                secondaryColor={isDark ? 'rgba(174,174,232,0.3)' : 'rgba(90,88,168,0.25)'}
              />
            }
            gradientColors={
              isDark
                ? ['rgba(40, 35, 77, 0.40)', 'rgba(26, 23, 54, 0.40)']
                : ['rgba(207, 206, 245, 0.25)', 'rgba(174, 174, 232, 0.25)']
            }
            tintColor="#5A58A8"
            onPress={() => navigation.navigate('Meditation')}
            isDark={isDark}
          />

          <GlassPracticeCard
            title="Sounds"
            subtitle="Calming ambient loops with sleep timer"
            icon={
              <SoundsIcon
                size={26}
                color={isDark ? '#E07A5F' : '#D66D52'}
                secondaryColor={isDark ? 'rgba(224,122,95,0.3)' : 'rgba(214,109,82,0.25)'}
              />
            }
            gradientColors={
              isDark
                ? ['rgba(72, 35, 27, 0.40)', 'rgba(50, 21, 14, 0.40)']
                : ['rgba(230, 139, 116, 0.25)', 'rgba(205, 112, 88, 0.25)']
            }
            tintColor={colors.accentTerracotta}
            onPress={() => navigation.navigate('Sounds')}
            isDark={isDark}
          />
        </FadeSlideIn>
      </ScrollView>

      {/* 3. Floating Island Navigation Bar */}
      <FloatingIslandNav
        activeTab="home"
        onNavigate={handleNavPress}
        isDark={isDark}
        insetsBottom={insets.bottom}
      />
    </ScenicBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.2,
  },
  settingsCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGear: {
    fontSize: 20,
    lineHeight: 22,
  },
  scrollContent: {
    paddingTop: 4,
  },
  greetingSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  heroGreeting: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
    marginTop: 4,
  },
  heroFeaturedCard: {
    borderRadius: 26,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 140,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  heroLeftContent: {
    flex: 1,
    zIndex: 2,
  },
  heroCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    lineHeight: 28,
    marginBottom: 14,
  },
  heroPillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  heroPillBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  heroOrbGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOrbInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  statsGlassCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statsIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsNumber: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  statsLabel: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '700',
  },
  practiceHeader: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 88,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  practiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconOrbBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  practiceTextWrap: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 3,
  },
  practiceSubtitle: {
    fontSize: 13.5,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
    lineHeight: 18,
  },
  glassArrowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  floatingNavContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  navTabPill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    position: 'relative',
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navTabLabel: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
});
