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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getDaytimeGreeting } from '../logic/formatters';
import { progressStore } from '../data/progressStore';
import { NavigationProp } from '../navigation/types';

// Custom clean vector icons matching high-end design
const VectorAvatarIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={styles.vectorAvatarWrap}>
    <View style={[styles.vectorAvatarHead, { backgroundColor: color }]} />
    <View style={[styles.vectorAvatarBody, { backgroundColor: color }]} />
  </View>
);

const VectorClockIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={[styles.vectorClockCircle, { borderColor: color }]}>
    <View style={[styles.vectorClockHandH, { backgroundColor: color }]} />
    <View style={[styles.vectorClockHandV, { backgroundColor: color }]} />
  </View>
);

// Animated nature landscape illustration with floating glowing sun and swaying leaves
const HeroIllustration: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const sunColor = isDark ? '#F59E0B' : '#EE886B';
  const hill1Color = isDark ? '#2E5743' : '#7FA293';
  const hill2Color = isDark ? '#244736' : '#6A9081';
  const hill3Color = isDark ? '#1B3629' : '#567A6B';
  const outlineColor = isDark ? 'rgba(255,255,255,0.18)' : '#334D40';

  const sunFloatAnim = useRef(new Animated.Value(0)).current;
  const leafSwayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sun floating pulse animation
    const sunLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sunFloatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sunFloatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Leaf gentle swaying animation
    const leafLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(leafSwayAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(leafSwayAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    sunLoop.start();
    leafLoop.start();

    return () => {
      sunLoop.stop();
      leafLoop.stop();
    };
  }, []);

  const sunY = sunFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  const sunScale = sunFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.08],
  });

  const leafRotate = leafSwayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '12deg'],
  });

  const leafY = leafSwayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <View style={styles.heroGraphicContainer}>
      {/* Sun rays & Morning/Evening Sun with animation */}
      <Animated.View
        style={[
          styles.sunWrapper,
          {
            transform: [{ translateY: sunY }, { scale: sunScale }],
          },
        ]}
      >
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '-45deg' }] }]} />
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '0deg' }] }]} />
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.sunCircle, { backgroundColor: sunColor }]} />
      </Animated.View>

      {/* Floating leaves with swaying animation */}
      <Animated.View
        style={[
          styles.floatingLeaf,
          styles.leaf1,
          {
            borderColor: outlineColor,
            backgroundColor: hill1Color,
            transform: [{ rotate: leafRotate }, { translateY: leafY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingLeaf,
          styles.leaf2,
          {
            borderColor: outlineColor,
            backgroundColor: hill2Color,
            transform: [{ rotate: leafRotate }, { translateY: leafY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingLeaf,
          styles.leaf3,
          {
            borderColor: outlineColor,
            backgroundColor: hill3Color,
            transform: [{ rotate: leafRotate }, { translateY: leafY }],
          },
        ]}
      />

      {/* Layered Rolling Hills with organic outlines */}
      <View style={[styles.backHill, { backgroundColor: hill1Color, borderColor: outlineColor }]} />
      <View style={[styles.midHill, { backgroundColor: hill2Color, borderColor: outlineColor }]} />
      <View style={[styles.frontHill, { backgroundColor: hill3Color, borderColor: outlineColor }]} />
    </View>
  );
};

// Interactive Animated Practice Card Component
const AnimatedPracticeCard: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  titleColor: string;
  subColor: string;
  arrowColor: string;
  onPress: () => void;
  isDark: boolean;
}> = ({
  title,
  subtitle,
  icon,
  bgColor,
  titleColor,
  subColor,
  arrowColor,
  onPress,
  isDark,
}) => {
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
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <Pressable
        style={[
          styles.practiceCard,
          {
            backgroundColor: bgColor,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            borderWidth: isDark ? 1.5 : 0,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.practiceLeft}>
          <View
            style={[
              styles.practiceIconBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(255, 255, 255, 0.45)',
              },
            ]}
          >
            <Text style={styles.practiceBadgeIcon}>{icon}</Text>
          </View>
          <View style={styles.practiceTextWrap}>
            <Text style={[styles.practiceTitle, { color: titleColor }]}>
              {title}
            </Text>
            <Text style={[styles.practiceSubtitle, { color: subColor }]}>
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Large, stylish circular arrow button */}
        <View
          style={[
            styles.whiteArrowCircle,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : '#FFFFFF',
            },
          ]}
        >
          <Text style={[styles.whiteArrowText, { color: arrowColor }]}>
            ›
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Animated Floating Island Navigation Bar
const FloatingIslandNav: React.FC<{
  activeTab: 'home' | 'practice' | 'sounds' | 'settings';
  onNavigate: (tab: 'home' | 'practice' | 'sounds' | 'settings') => void;
  isDark: boolean;
  insetsBottom: number;
}> = ({ activeTab, onNavigate, isDark, insetsBottom }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: '🌿' },
    { id: 'practice' as const, label: 'Practice', icon: '🫁' },
    { id: 'sounds' as const, label: 'Sounds', icon: '🎵' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View
      style={[
        styles.floatingNavContainer,
        {
          bottom: Math.max(insetsBottom + 8, 16),
          backgroundColor: isDark ? '#14251B' : '#FFFFFF',
          borderColor: isDark ? '#274332' : '#E8E1D5',
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
                  ? 'rgba(155, 187, 174, 0.22)'
                  : '#EAF3EF',
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
                      : '#1A2E22'
                    : isDark
                    ? '#7D9E8D'
                    : '#7A8C81',
                  fontWeight: isActive ? '700' : '500',
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
                    backgroundColor: isDark ? '#8FD0B2' : '#2E684C',
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
  const { colors, typography, spacing, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [completedSessions, setCompletedSessions] = useState(
    progressStore.getCompletedSessions()
  );
  const [totalMinutes, setTotalMinutes] = useState(
    progressStore.getTotalMinutes()
  );

  useEffect(() => {
    const unsubscribe = progressStore.subscribe(() => {
      setCompletedSessions(progressStore.getCompletedSessions());
      setTotalMinutes(progressStore.getTotalMinutes());
    });
    return unsubscribe;
  }, []);

  const { greeting, subtitle } = getDaytimeGreeting();

  const handleNavPress = (tab: 'home' | 'practice' | 'sounds' | 'settings') => {
    if (tab === 'home') return;
    if (tab === 'practice') navigation.navigate('Breathing');
    if (tab === 'sounds') navigation.navigate('Sounds');
    if (tab === 'settings') navigation.navigate('Settings');
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* 1. Header Bar: Leaf Brand Title + Outlined Settings Gear */}
      <View
        style={[
          styles.headerBar,
          {
            paddingHorizontal: spacing.xl,
            paddingTop: insets.top + 8,
            height: 64 + insets.top,
          },
        ]}
      >
        <View style={styles.brandContainer}>
          <Text style={styles.brandLeaf}>🌿</Text>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            Q9 Relax
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsCircleBtn,
            {
              backgroundColor: colors.iconBtnBg,
              borderColor: colors.iconBtnBorder,
            },
          ]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.settingsGear, { color: colors.textPrimary }]}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 120, // Generous padding for floating nav bar
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Daytime Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.heroGreeting, { color: colors.textPrimary }]}>
            {greeting}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>

        {/* Hero Featured Card: "Start your day with calm" */}
        <TouchableOpacity
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.cardHeroBg,
              borderColor: isDark ? 'rgba(155, 187, 174, 0.25)' : 'transparent',
              borderWidth: isDark ? 1.5 : 0,
            },
          ]}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('Breathing')}
        >
          <View style={styles.heroLeftContent}>
            <Text style={[styles.heroCardTitle, { color: colors.textPrimary }]}>
              Start your day{'\n'}with calm
            </Text>

            {/* Large, attractive pill button */}
            <TouchableOpacity
              style={[
                styles.heroPillBtn,
                { backgroundColor: colors.cardHeroBtn },
              ]}
              onPress={() => navigation.navigate('Breathing')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroPillBtnText}>Begin breathing ›</Text>
            </TouchableOpacity>
          </View>

          <HeroIllustration isDark={isDark} />
        </TouchableOpacity>

        {/* Progress Stats Split Cards (Sessions & Minutes) */}
        <View style={styles.statsRow}>
          {/* Sessions Card */}
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.statsSessionsBg,
                borderColor: isDark ? 'rgba(253, 230, 138, 0.25)' : 'transparent',
                borderWidth: isDark ? 1.5 : 0,
              },
            ]}
          >
            <View style={styles.statsHeaderRow}>
              <View
                style={[
                  styles.statsIconBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.2)'
                      : '#F0DD9E',
                  },
                ]}
              >
                <VectorAvatarIcon color={colors.statsSessionsIcon} />
              </View>
              <Text style={[styles.statsNumber, { color: colors.statsSessionsText }]}>
                {completedSessions}
              </Text>
            </View>
            <Text style={[styles.statsLabel, { color: colors.statsSessionsText, opacity: 0.9 }]}>
              Sessions
            </Text>
          </View>

          {/* Minutes Card */}
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.statsMinutesBg,
                borderColor: isDark ? 'rgba(255, 237, 213, 0.25)' : 'transparent',
                borderWidth: isDark ? 1.5 : 0,
              },
            ]}
          >
            <View style={styles.statsHeaderRow}>
              <View
                style={[
                  styles.statsIconBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(249, 115, 22, 0.2)'
                      : '#F3CBB5',
                  },
                ]}
              >
                <VectorClockIcon color={colors.statsMinutesIcon} />
              </View>
              <Text style={[styles.statsNumber, { color: colors.statsMinutesText }]}>
                {totalMinutes}
              </Text>
            </View>
            <Text style={[styles.statsLabel, { color: colors.statsMinutesText, opacity: 0.9 }]}>
              Minutes
            </Text>
          </View>
        </View>

        {/* Section Heading: "Choose a practice" */}
        <Text
          style={[
            styles.practiceHeader,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Choose a practice
        </Text>

        {/* Practice Cards with interactive scale feedback and large tactile buttons */}
        <View style={styles.practiceStack}>
          {/* Practice Card 1: Breathe */}
          <AnimatedPracticeCard
            title="Breathe"
            subtitle="Guided rhythmic breathing with visual cues"
            icon="🫧"
            bgColor={colors.cardBreatheBg}
            titleColor={colors.textPrimary}
            subColor={isDark ? '#D1E6DC' : '#2A4337'}
            arrowColor={colors.textPrimary}
            onPress={() => navigation.navigate('Breathing')}
            isDark={isDark}
          />

          {/* Practice Card 2: Meditate */}
          <AnimatedPracticeCard
            title="Meditate"
            subtitle="Quiet timer with soothing background sounds"
            icon="🧘"
            bgColor={colors.cardMeditateBg}
            titleColor={isDark ? '#FFFFFF' : '#1E1B4B'}
            subColor={isDark ? '#E2E0FD' : '#3E3A6D'}
            arrowColor={isDark ? '#FFFFFF' : '#1E1B4B'}
            onPress={() => navigation.navigate('Meditation')}
            isDark={isDark}
          />

          {/* Practice Card 3: Sounds */}
          <AnimatedPracticeCard
            title="Sounds"
            subtitle="Calming ambient loops with sleep timer"
            icon="🎧"
            bgColor={colors.cardSoundsBg}
            titleColor="#FFFFFF"
            subColor="#FFEBE4"
            arrowColor={colors.cardSoundsBg}
            onPress={() => navigation.navigate('Sounds')}
            isDark={isDark}
          />
        </View>
      </ScrollView>

      {/* 3. STUNNING FLOATING ISLAND NAVIGATION BAR */}
      <FloatingIslandNav
        activeTab="home"
        onNavigate={handleNavPress}
        isDark={isDark}
        insetsBottom={insets.bottom}
      />
    </View>
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
  },
  brandLeaf: {
    fontSize: 26,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.2,
  },
  settingsCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGear: {
    fontSize: 22,
    lineHeight: 24,
  },
  scrollContent: {
    paddingTop: 8,
  },
  greetingSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  heroGreeting: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    marginTop: 4,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroLeftContent: {
    flex: 1.1,
    zIndex: 2,
    justifyContent: 'center',
  },
  heroCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'serif',
    lineHeight: 30,
    marginBottom: 16,
  },
  heroPillBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  heroPillBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroGraphicContainer: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunWrapper: {
    position: 'absolute',
    top: 15,
    right: 30,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  sunCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  sunRay: {
    position: 'absolute',
    width: 4,
    height: 8,
    borderRadius: 2,
    top: -4,
  },
  floatingLeaf: {
    position: 'absolute',
    borderWidth: 1.2,
    borderRadius: 12,
  },
  leaf1: {
    width: 22,
    height: 14,
    top: 20,
    right: 12,
  },
  leaf2: {
    width: 20,
    height: 12,
    top: 40,
    right: 2,
  },
  leaf3: {
    width: 26,
    height: 16,
    bottom: 45,
    right: 18,
  },
  backHill: {
    position: 'absolute',
    bottom: -15,
    right: -20,
    width: 150,
    height: 90,
    borderTopLeftRadius: 85,
    borderTopRightRadius: 65,
    borderWidth: 1.2,
  },
  midHill: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    width: 130,
    height: 80,
    borderTopLeftRadius: 75,
    borderTopRightRadius: 55,
    borderWidth: 1.2,
  },
  frontHill: {
    position: 'absolute',
    bottom: -25,
    right: -10,
    width: 170,
    height: 75,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 40,
    borderWidth: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statsCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    minHeight: 105,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  vectorAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorAvatarHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  vectorAvatarBody: {
    width: 18,
    height: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  vectorClockCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vectorClockHandH: {
    position: 'absolute',
    width: 6,
    height: 2,
    top: 7,
    left: 8,
    borderRadius: 1,
  },
  vectorClockHandV: {
    position: 'absolute',
    width: 2,
    height: 6,
    top: 4,
    left: 8,
    borderRadius: 1,
  },
  practiceHeader: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  practiceStack: {
    gap: 12,
  },
  practiceCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  practiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  practiceIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  practiceBadgeIcon: {
    fontSize: 26,
  },
  practiceTextWrap: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  practiceSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  whiteArrowCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  whiteArrowText: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },

  // Floating Island Navbar Styles
  floatingNavContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 99,
  },
  navTabPill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    position: 'relative',
    minWidth: 64,
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navTabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
