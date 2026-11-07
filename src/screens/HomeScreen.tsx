import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

const VectorHomeIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <View style={styles.navIconContainer}>
    {/* Roof */}
    <View style={[styles.homeRoof, { borderBottomColor: color }]} />
    {/* Base */}
    <View
      style={[
        styles.homeBase,
        {
          backgroundColor: active ? color : 'transparent',
          borderColor: color,
          borderWidth: active ? 0 : 1.8,
        },
      ]}
    >
      {!active && <View style={[styles.homeDoor, { backgroundColor: color }]} />}
    </View>
  </View>
);

const VectorPracticeIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <View style={[styles.navPracticeOuter, { borderColor: color }]}>
    <View
      style={[
        styles.navPracticeInner,
        { backgroundColor: active ? color : 'transparent', borderColor: color },
      ]}
    />
  </View>
);

const VectorSoundIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <View style={styles.navSoundWrap}>
    <View style={[styles.soundSpeakerBack, { backgroundColor: color }]} />
    <View style={[styles.soundSpeakerCone, { borderRightColor: color }]} />
    <View style={[styles.soundWaveArc1, { borderColor: color }]} />
    <View style={[styles.soundWaveArc2, { borderColor: color }]} />
  </View>
);

const VectorProfileIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <View style={styles.navProfileWrap}>
    <View
      style={[
        styles.profileHead,
        { borderColor: color, backgroundColor: active ? color : 'transparent' },
      ]}
    />
    <View
      style={[
        styles.profileShoulders,
        { borderColor: color, backgroundColor: active ? color : 'transparent' },
      ]}
    />
  </View>
);

// Serene nature landscape illustration matching the reference design
const HeroIllustration: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const sunColor = isDark ? '#F59E0B' : '#EE886B';
  const hill1Color = isDark ? '#2E5743' : '#7FA293';
  const hill2Color = isDark ? '#244736' : '#6A9081';
  const hill3Color = isDark ? '#1B3629' : '#567A6B';
  const outlineColor = isDark ? 'rgba(255,255,255,0.18)' : '#334D40';

  return (
    <View style={styles.heroGraphicContainer}>
      {/* Sun rays & Morning/Evening Sun */}
      <View style={styles.sunWrapper}>
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '-45deg' }] }]} />
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '0deg' }] }]} />
        <View style={[styles.sunRay, { backgroundColor: sunColor, transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.sunCircle, { backgroundColor: sunColor }]} />
      </View>

      {/* Floating leaves */}
      <View style={[styles.floatingLeaf, styles.leaf1, { borderColor: outlineColor, backgroundColor: hill1Color }]} />
      <View style={[styles.floatingLeaf, styles.leaf2, { borderColor: outlineColor, backgroundColor: hill2Color }]} />
      <View style={[styles.floatingLeaf, styles.leaf3, { borderColor: outlineColor, backgroundColor: hill3Color }]} />

      {/* Layered Rolling Hills with organic outlines */}
      <View style={[styles.backHill, { backgroundColor: hill1Color, borderColor: outlineColor }]} />
      <View style={[styles.midHill, { backgroundColor: hill2Color, borderColor: outlineColor }]} />
      <View style={[styles.frontHill, { backgroundColor: hill3Color, borderColor: outlineColor }]} />
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
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + 90, // Space for bottom tab bar
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
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Breathing')}
        >
          <View style={styles.heroLeftContent}>
            <Text style={[styles.heroCardTitle, { color: colors.textPrimary }]}>
              Start your day{'\n'}with calm
            </Text>

            <TouchableOpacity
              style={[
                styles.heroPillBtn,
                { backgroundColor: colors.cardHeroBtn },
              ]}
              onPress={() => navigation.navigate('Breathing')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroPillBtnText}>Begin breathing</Text>
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

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Choose a practice
        </Text>

        {/* Practice Card 1: Breathe */}
        <TouchableOpacity
          style={[
            styles.practiceCard,
            {
              backgroundColor: colors.cardBreatheBg,
              borderColor: isDark ? 'rgba(155, 187, 174, 0.3)' : 'transparent',
              borderWidth: isDark ? 1.5 : 0,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Breathing')}
        >
          <View style={styles.practiceLeft}>
            <View
              style={[
                styles.practiceIconBadge,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.45)' },
              ]}
            >
              <Text style={styles.practiceBadgeIcon}>🫧</Text>
            </View>
            <View style={styles.practiceTextWrap}>
              <Text
                style={[
                  styles.practiceTitle,
                  { color: isDark ? '#FFFFFF' : '#1A2E22' },
                ]}
              >
                Breathe
              </Text>
              <Text
                style={[
                  styles.practiceSubtitle,
                  { color: isDark ? '#D1E6DC' : '#2A4337' },
                ]}
              >
                Guided rhythmic breathing with visual cues
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.whiteArrowCircle,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
              },
            ]}
          >
            <Text
              style={[
                styles.whiteArrowText,
                { color: isDark ? '#FFFFFF' : '#1A2E22' },
              ]}
            >
              ›
            </Text>
          </View>
        </TouchableOpacity>

        {/* Practice Card 2: Meditate */}
        <TouchableOpacity
          style={[
            styles.practiceCard,
            {
              backgroundColor: colors.cardMeditateBg,
              borderColor: isDark ? 'rgba(212, 211, 248, 0.3)' : 'transparent',
              borderWidth: isDark ? 1.5 : 0,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Meditation')}
        >
          <View style={styles.practiceLeft}>
            <View
              style={[
                styles.practiceIconBadge,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.5)' },
              ]}
            >
              <Text style={styles.practiceBadgeIcon}>🧘</Text>
            </View>
            <View style={styles.practiceTextWrap}>
              <Text
                style={[
                  styles.practiceTitle,
                  { color: isDark ? '#FFFFFF' : '#1E1B4B' },
                ]}
              >
                Meditate
              </Text>
              <Text
                style={[
                  styles.practiceSubtitle,
                  { color: isDark ? '#E2E0FD' : '#3E3A6D' },
                ]}
              >
                Quiet timer with soft starting and ending bells
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.whiteArrowCircle,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
              },
            ]}
          >
            <Text
              style={[
                styles.whiteArrowText,
                { color: isDark ? '#FFFFFF' : '#1E1B4B' },
              ]}
            >
              ›
            </Text>
          </View>
        </TouchableOpacity>

        {/* Practice Card 3: Sounds */}
        <TouchableOpacity
          style={[
            styles.practiceCard,
            {
              backgroundColor: colors.cardSoundsBg,
              borderColor: isDark ? 'rgba(226, 129, 104, 0.3)' : 'transparent',
              borderWidth: isDark ? 1.5 : 0,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Sounds')}
        >
          <View style={styles.practiceLeft}>
            <View
              style={[
                styles.practiceIconBadge,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.45)' },
              ]}
            >
              <Text style={styles.practiceBadgeIcon}>🎧</Text>
            </View>
            <View style={styles.practiceTextWrap}>
              <Text style={[styles.practiceTitle, { color: '#FFFFFF' }]}>
                Sounds
              </Text>
              <Text style={[styles.practiceSubtitle, { color: '#FFEBE4' }]}>
                Calming ambient loops with sleep timer
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.whiteArrowCircle,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
              },
            ]}
          >
            <Text
              style={[
                styles.whiteArrowText,
                { color: isDark ? '#FFFFFF' : colors.cardSoundsBg },
              ]}
            >
              ›
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. Bottom Navigation Bar with Minimal Vector Icons matching screenshot */}
      <View
        style={[
          styles.bottomNavBar,
          {
            backgroundColor: colors.navBackground,
            borderTopColor: colors.navBorder,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <VectorHomeIcon active={true} color={colors.navActive} />
          <Text
            style={[
              styles.navLabel,
              { color: colors.navActive, fontWeight: '700' },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Breathing')}
          activeOpacity={0.7}
        >
          <VectorPracticeIcon active={false} color={colors.navInactive} />
          <Text style={[styles.navLabel, { color: colors.navInactive }]}>
            Practice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Sounds')}
          activeOpacity={0.7}
        >
          <VectorSoundIcon active={false} color={colors.navInactive} />
          <Text style={[styles.navLabel, { color: colors.navInactive }]}>
            Sounds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <VectorProfileIcon active={false} color={colors.navInactive} />
          <Text style={[styles.navLabel, { color: colors.navInactive }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLeaf: {
    fontSize: 22,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: 0.2,
  },
  settingsCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGear: {
    fontSize: 18,
  },
  scrollContent: {
    paddingTop: 10,
  },
  greetingSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  heroGreeting: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'serif',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingLeft: 20,
    marginBottom: 16,
  },
  heroLeftContent: {
    flex: 1,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  heroCardTitle: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'serif',
    lineHeight: 27,
    marginBottom: 14,
  },
  heroPillBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  heroPillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Hero Illustration
  heroGraphicContainer: {
    width: 150,
    height: 148,
    position: 'relative',
    overflow: 'hidden',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  sunWrapper: {
    position: 'absolute',
    top: 22,
    right: 36,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 48,
    opacity: 0.6,
  },
  backHill: {
    position: 'absolute',
    bottom: -15,
    right: 25,
    width: 110,
    height: 75,
    borderRadius: 55,
    borderWidth: 1.5,
    transform: [{ scaleX: 1.3 }],
  },
  midHill: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 130,
    height: 85,
    borderRadius: 65,
    borderWidth: 1.5,
    transform: [{ scaleX: 1.4 }],
  },
  frontHill: {
    position: 'absolute',
    bottom: -32,
    right: 15,
    width: 135,
    height: 80,
    borderRadius: 67,
    borderWidth: 1.5,
    transform: [{ scaleX: 1.3 }],
  },
  floatingLeaf: {
    position: 'absolute',
    width: 18,
    height: 10,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  leaf1: {
    top: 26,
    right: 12,
    transform: [{ rotate: '-25deg' }],
  },
  leaf2: {
    top: 48,
    right: 18,
    transform: [{ rotate: '15deg' }],
  },
  leaf3: {
    top: 72,
    right: 8,
    width: 22,
    height: 12,
    borderRadius: 7,
    transform: [{ rotate: '-10deg' }],
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
  },
  vectorAvatarHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 1,
  },
  vectorAvatarBody: {
    width: 12,
    height: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  vectorClockCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorClockHandH: {
    position: 'absolute',
    width: 4,
    height: 1.5,
    left: 7,
    top: 6,
  },
  vectorClockHandV: {
    position: 'absolute',
    width: 1.5,
    height: 4,
    top: 3,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  // Section
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 12,
  },

  // Practice Cards
  practiceCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  practiceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  practiceIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  practiceBadgeIcon: {
    fontSize: 24,
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
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 17,
  },
  whiteArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  whiteArrowText: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
    marginLeft: 2,
  },

  // Bottom Navigation Bar
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 3,
  },

  // Minimal Vector Nav Icons
  navIconContainer: {
    width: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  homeBase: {
    width: 14,
    height: 11,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeDoor: {
    width: 4,
    height: 5,
  },
  navPracticeOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPracticeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  navSoundWrap: {
    width: 22,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundSpeakerBack: {
    width: 5,
    height: 7,
    borderTopLeftRadius: 1.5,
    borderBottomLeftRadius: 1.5,
  },
  soundSpeakerCone: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: -1,
  },
  soundWaveArc1: {
    width: 7,
    height: 12,
    borderRightWidth: 1.8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginLeft: 2,
  },
  soundWaveArc2: {
    width: 5,
    height: 18,
    borderRightWidth: 1.8,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
    marginLeft: 1,
  },
  navProfileWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.8,
    marginBottom: 1,
  },
  profileShoulders: {
    width: 16,
    height: 7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.8,
    borderBottomWidth: 0,
  },
});
