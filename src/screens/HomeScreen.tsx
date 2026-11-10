import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../shared/theme/ThemeContext';
import { getDaytimeGreeting } from '../shared/logic/formatters';
import { progressStore } from '../data/progressStore';
import { settingsStore, SceneId } from '../shared/store/settingsStore';
import { NavigationProp } from '../navigation/types';
import { ScenicBackground } from '../shared/components/ScenicBackground';
import { BreatheIcon, MeditateIcon, SoundsIcon, LeafLogoIcon } from '../shared/components/SvgIcons';
import { BottomNavBar } from '../shared/components/BottomNavBar';
import { ResetConfirmModal } from '../shared/components/ResetConfirmModal';

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
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
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

// Clean, Consistent Practice Card (Zero rectangular artifacts)
const CleanPracticeCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  arrowBg: string;
  arrowColor: string;
  onPress: () => void;
  isDark: boolean;
}> = ({
  title,
  subtitle,
  icon,
  bgColor,
  borderColor,
  arrowBg,
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
    <Animated.View style={{ transform: [{ scale: cardScale }], marginVertical: 6 }}>
      <Pressable
        style={[
          styles.practiceCard,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.practiceLeft}>
          <View
            style={[
              styles.iconOrbBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.65)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.18)'
                  : 'rgba(255, 255, 255, 0.90)',
              },
            ]}
          >
            {icon}
          </View>
          <View style={styles.practiceTextWrap}>
            <Text
              style={[
                styles.practiceTitle,
                { color: isDark ? '#FFFFFF' : '#0F1D15' },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.practiceSubtitle,
                { color: isDark ? '#D8E8E0' : '#1E3528' },
              ]}
            >
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Tactile Circular Arrow Button */}
        <View
          style={[
            styles.arrowCircle,
            {
              backgroundColor: arrowBg,
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.20)'
                : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <Text style={[styles.arrowGlyph, { color: arrowColor }]}>
            ›
          </Text>
        </View>
      </Pressable>
    </Animated.View>
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

  // Guarantee stats refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      setCompletedSessions(progressStore.getCompletedSessions());
      setTotalMinutes(progressStore.getTotalMinutes());
    }, [])
  );

  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const handlePromptResetStats = () => {
    setIsResetModalVisible(true);
  };

  const handleConfirmReset = async () => {
    setIsResetModalVisible(false);
    await progressStore.resetProgress();
  };

  const handleCancelReset = () => {
    setIsResetModalVisible(false);
  };

  const { greeting, subtitle } = getDaytimeGreeting();

  return (
    <ScenicBackground scene={scenePreference} style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* 1. Header Bar: Leaf Brand Title + Outlined Settings Gear */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            height: 60 + insets.top,
          },
        ]}
      >
        <View style={styles.brandContainer}>
          <Image
            source={require('../logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            SOVAELI
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsCircleBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.18)'
                : 'rgba(0, 0, 0, 0.08)',
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

      {/* 2. Main Scroll Content */}
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
        <FadeSlideIn delay={60}>
          <View style={styles.greetingSection}>
            <Text style={[styles.heroGreeting, { color: colors.textPrimary }]}>
              {greeting}
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                { color: isDark ? '#D8E8E0' : '#1E3528' },
              ]}
            >
              {subtitle}
            </Text>
          </View>
        </FadeSlideIn>

        {/* Hero Featured Card: "Start your day with calm" */}
        <FadeSlideIn delay={120}>
          <TouchableOpacity
            style={[
              styles.heroFeaturedCard,
              {
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.18)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Breathing')}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['#222228', '#141418']
                  : ['#5E8574', '#456B5B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />

            <View style={styles.heroLeftContent}>
              <Text style={styles.heroCardTitle}>
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
        <FadeSlideIn delay={180}>
          <View style={styles.statsSectionHeader}>
            <Text style={[styles.statsSectionTitle, { color: colors.textPrimary }]}>
              Your Progress
            </Text>
            <TouchableOpacity
              style={[
                styles.statsResetPill,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.10)'
                    : 'rgba(255, 255, 255, 0.65)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.16)'
                    : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              onPress={handlePromptResetStats}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.statsResetPillText, { color: isDark ? '#D8E8E0' : '#1E3528' }]}>
                ↺ Reset
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            {/* Sessions Card */}
            <TouchableOpacity
              style={[
                styles.statsCard,
                {
                  backgroundColor: colors.statsSessionsBg,
                  borderColor: isDark
                    ? 'rgba(253, 230, 138, 0.25)'
                    : 'rgba(150, 121, 30, 0.20)',
                },
              ]}
              onPress={handlePromptResetStats}
              activeOpacity={0.8}
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
                  { color: colors.statsSessionsText },
                ]}
              >
                Sessions
              </Text>
            </TouchableOpacity>

            {/* Minutes Card */}
            <TouchableOpacity
              style={[
                styles.statsCard,
                {
                  backgroundColor: colors.statsMinutesBg,
                  borderColor: isDark
                    ? 'rgba(255, 237, 213, 0.25)'
                    : 'rgba(172, 95, 58, 0.20)',
                },
              ]}
              onPress={handlePromptResetStats}
              activeOpacity={0.8}
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
                  { color: colors.statsMinutesText },
                ]}
              >
                Minutes
              </Text>
            </TouchableOpacity>
          </View>
        </FadeSlideIn>

        {/* Section Heading: "Choose a practice" */}
        <FadeSlideIn delay={240}>
          <Text
            style={[
              styles.practiceHeader,
              { color: colors.textPrimary, marginTop: 20, marginBottom: 8 },
            ]}
          >
            Choose a practice
          </Text>

          {/* Three Clean Practice Cards (Zero artifact, pure smooth styling) */}
          <CleanPracticeCard
            title="Breathe"
            subtitle="Guided rhythmic breathing with visual cues"
            icon={
              <BreatheIcon
                size={26}
                color={isDark ? '#8CD5B4' : '#265C43'}
                secondaryColor={isDark ? 'rgba(140,213,180,0.3)' : 'rgba(38,92,67,0.25)'}
              />
            }
            bgColor={colors.cardBreatheBg}
            borderColor={isDark ? 'rgba(255, 255, 255, 0.14)' : '#CDE2D6'}
            arrowBg={isDark ? 'rgba(255, 255, 255, 0.16)' : '#FFFFFF'}
            arrowColor={isDark ? '#FFFFFF' : '#265C43'}
            onPress={() => navigation.navigate('Breathing')}
            isDark={isDark}
          />

          <CleanPracticeCard
            title="Meditate"
            subtitle="Quiet timer with soothing background sounds"
            icon={
              <MeditateIcon
                size={26}
                color={isDark ? '#AEAEE8' : '#5A58A8'}
                secondaryColor={isDark ? 'rgba(174,174,232,0.3)' : 'rgba(90,88,168,0.25)'}
              />
            }
            bgColor={colors.cardMeditateBg}
            borderColor={isDark ? 'rgba(255, 255, 255, 0.14)' : '#D6D5F2'}
            arrowBg={isDark ? 'rgba(255, 255, 255, 0.16)' : '#FFFFFF'}
            arrowColor={isDark ? '#FFFFFF' : '#5A58A8'}
            onPress={() => navigation.navigate('Meditation')}
            isDark={isDark}
          />

          <CleanPracticeCard
            title="Sounds"
            subtitle="Calming ambient loops with sleep timer"
            icon={
              <SoundsIcon
                size={26}
                color={isDark ? '#E07A5F' : '#D66D52'}
                secondaryColor={isDark ? 'rgba(224,122,95,0.3)' : 'rgba(214,109,82,0.25)'}
              />
            }
            bgColor={colors.cardSoundsBg}
            borderColor={isDark ? 'rgba(255, 255, 255, 0.14)' : '#F5D3C8'}
            arrowBg={isDark ? 'rgba(255, 255, 255, 0.16)' : '#FFFFFF'}
            arrowColor={isDark ? '#FFFFFF' : '#D66D52'}
            onPress={() => navigation.navigate('Sounds')}
            isDark={isDark}
          />
        </FadeSlideIn>
      </ScrollView>

      {/* 3. Global Floating Capsule Navigation Bar */}
      <BottomNavBar activeTab="home" />

      {/* 4. Elegant Custom Reset Confirmation Modal */}
      <ResetConfirmModal
        visible={isResetModalVisible}
        completedSessions={completedSessions}
        totalMinutes={totalMinutes}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
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
    gap: 10,
  },
  brandLogoImg: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: 2,
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
    marginBottom: 14,
  },
  heroGreeting: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    marginTop: 4,
  },
  heroFeaturedCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 140,
    marginBottom: 14,
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
    color: '#FFFFFF',
  },
  heroPillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  heroPillBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif',
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
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  statsResetPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statsResetPillText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
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
  practiceCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 84,
  },
  practiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconOrbBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
  },
  practiceSubtitle: {
    fontSize: 13.5,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    lineHeight: 18,
  },
  arrowCircle: {
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
});
