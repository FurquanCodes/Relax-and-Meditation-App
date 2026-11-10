import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../shared/theme/ThemeContext';
import { Header } from '../shared/components/Header';
import { settingsStore, ThemePreference, SceneId } from '../shared/store/settingsStore';
import { progressStore } from '../data/progressStore';
import { ScenicBackground, SCENIC_IMAGES } from '../shared/components/ScenicBackground';
import { BottomNavBar } from '../shared/components/BottomNavBar';
import { ResetConfirmModal } from '../shared/components/ResetConfirmModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SceneOption {
  id: SceneId;
  title: string;
  subtitle: string;
  image?: any;
  icon: string;
}

const SCENE_OPTIONS: SceneOption[] = [
  {
    id: 'auto',
    title: 'Time of Day',
    subtitle: 'Changes softly from morning to starry night',
    icon: '⏳',
  },
  {
    id: 'meadow',
    title: 'Sunrise Meadow',
    subtitle: 'Golden morning warmth & soft mist',
    image: SCENIC_IMAGES.meadow,
    icon: '🌅',
  },
  {
    id: 'forest',
    title: 'Misty Forest',
    subtitle: 'Deep tranquil evergreens',
    image: SCENIC_IMAGES.forest,
    icon: '🌲',
  },
  {
    id: 'ocean',
    title: 'Sunset Coast',
    subtitle: 'Gentle pastel tidal shores',
    image: SCENIC_IMAGES.ocean,
    icon: '🌊',
  },
  {
    id: 'rain',
    title: 'Rain Window',
    subtitle: 'Quiet droplets on window glass',
    image: SCENIC_IMAGES.rain,
    icon: '🌧️',
  },
  {
    id: 'night',
    title: 'Starry Cosmos',
    subtitle: 'Tranquil deep night sky',
    image: SCENIC_IMAGES.night,
    icon: '✨',
  },
];

export const SettingsScreen: React.FC = () => {
  const { colors, isDark, themePreference, setThemePreference } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [bellEnabled, setBellEnabled] = useState<boolean>(settingsStore.isBellEnabled());
  const [selectedScene, setSelectedScene] = useState<SceneId>(settingsStore.getScenePreference());
  const [completedSessions, setCompletedSessions] = useState<number>(
    progressStore.getCompletedSessions()
  );
  const [totalMinutes, setTotalMinutes] = useState<number>(
    progressStore.getTotalMinutes()
  );

  useEffect(() => {
    const unsubSettings = settingsStore.subscribe(() => {
      setBellEnabled(settingsStore.isBellEnabled());
      setSelectedScene(settingsStore.getScenePreference());
    });
    const unsubProgress = progressStore.subscribe(() => {
      setCompletedSessions(progressStore.getCompletedSessions());
      setTotalMinutes(progressStore.getTotalMinutes());
    });
    return () => {
      unsubSettings();
      unsubProgress();
    };
  }, []);

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

  const handleToggleBell = async (value: boolean) => {
    setBellEnabled(value);
    await settingsStore.setBellEnabled(value);
  };

  const handleSelectScene = async (sceneId: SceneId) => {
    setSelectedScene(sceneId);
    await settingsStore.setScenePreference(sceneId);
  };

  const THEME_OPTIONS: { id: ThemePreference; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark Mode', icon: '🌙' },
    { id: 'light', label: 'Light Mode', icon: '☀️' },
    { id: 'system', label: 'Follow Device', icon: '📱' },
  ];

  return (
    <ScenicBackground scene={selectedScene} style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Header
        title="Settings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: 18, paddingBottom: Math.max(insets.bottom + 110, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SCENE THEMES PICKER */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Background Scene
        </Text>
        <Text style={[styles.sectionDesc, { color: isDark ? '#D8E8E0' : '#1E3528' }]}>
          Choose your favorite scenic environment for Home and rest screens
        </Text>

        <View style={styles.scenesGrid}>
          {SCENE_OPTIONS.map((opt) => {
            const isSelected = selectedScene === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.sceneCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#222228'
                        : '#E4F0E9'
                      : isDark
                      ? '#141418'
                      : '#FFFFFF',
                    borderColor: isSelected
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.35)'
                        : '#265C43'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.10)'
                      : '#D6E4DC',
                    borderWidth: isSelected ? 2.5 : 1.5,
                  },
                ]}
                onPress={() => handleSelectScene(opt.id)}
                activeOpacity={0.8}
              >
                {opt.image ? (
                  <Image source={opt.image} style={styles.sceneThumb} resizeMode="cover" />
                ) : (
                  <View
                    style={[
                      styles.sceneThumbFallback,
                      {
                        backgroundColor: isDark
                          ? '#1C1C22'
                          : '#EAF3EE',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{opt.icon}</Text>
                  </View>
                )}

                <View style={styles.sceneInfoWrap}>
                  <View style={styles.sceneTitleRow}>
                    <Text style={[styles.sceneTitle, { color: colors.textPrimary }]}>
                      {opt.title}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.activeCheckPill,
                          {
                            backgroundColor: isDark ? '#FFFFFF' : '#265C43',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeCheckText,
                            { color: isDark ? '#000000' : '#FFFFFF' },
                          ]}
                        >
                          Active
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.sceneSubtitle,
                      { color: isDark ? '#D8E8E0' : '#1E3528' },
                    ]}
                  >
                    {opt.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. THEME MODE */}
        <Text
          style={[
            styles.sectionHeading,
            { color: colors.textPrimary, marginTop: 24 },
          ]}
        >
          Theme Mode
        </Text>

        <View
          style={[
            styles.glassSectionCard,
            {
              backgroundColor: isDark ? '#141418' : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : '#D6E4DC',
            },
          ]}
        >
          {THEME_OPTIONS.map((opt, idx) => {
            const isSelected = themePreference === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.themeOptionRow,
                  idx < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#EDF3EF',
                  },
                ]}
                onPress={() => setThemePreference(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.themeIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      flex: 1,
                      color: colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.checkCircle,
                      { backgroundColor: isDark ? '#FFFFFF' : '#265C43' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkmarkText,
                        { color: isDark ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. SOUND & SIGNALS */}
        <Text
          style={[
            styles.sectionHeading,
            { color: colors.textPrimary, marginTop: 24 },
          ]}
        >
          Sound & Signals
        </Text>

        <View
          style={[
            styles.glassSectionCard,
            {
              backgroundColor: isDark ? '#141418' : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : '#D6E4DC',
            },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.settingRowTitle, { color: colors.textPrimary }]}>
                Singing Bowl Bell
              </Text>
              <Text
                style={[
                  styles.settingRowDesc,
                  { color: isDark ? '#C8C8D4' : '#1E3528' },
                ]}
              >
                Soft chime at the start and completion of each meditation
              </Text>
            </View>

            <Switch
              value={bellEnabled}
              onValueChange={handleToggleBell}
              trackColor={{
                false: isDark ? '#26262E' : '#E6DECF',
                true: isDark ? '#FFFFFF' : '#265C43',
              }}
              thumbColor={bellEnabled ? colors.accentTerracotta : '#F4F3F4'}
            />
          </View>
        </View>

        {/* 4. PROGRESS & STATISTICS */}
        <Text
          style={[
            styles.sectionHeading,
            { color: colors.textPrimary, marginTop: 24 },
          ]}
        >
          Progress & Statistics
        </Text>
        <Text style={[styles.sectionDesc, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
          Track your mindful breathing, meditation, and ambient sound sessions
        </Text>

        <View
          style={[
            styles.glassSectionCard,
            {
              backgroundColor: isDark ? '#141418' : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : '#D6E4DC',
            },
          ]}
        >
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
              Completed Sessions
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              {completedSessions} {completedSessions === 1 ? 'session' : 'sessions'}
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 12 }]}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#C8C8D4' : '#1E3528' }]}>
              Mindful Minutes
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              {totalMinutes} {totalMinutes === 1 ? 'min' : 'mins'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.resetStatsBtn,
              {
                backgroundColor: isDark ? 'rgba(248, 113, 113, 0.15)' : '#FEE2E2',
                borderColor: isDark ? 'rgba(248, 113, 113, 0.32)' : '#FCA5A5',
              },
            ]}
            onPress={handlePromptResetStats}
            activeOpacity={0.7}
          >
            <Text style={[styles.resetStatsBtnText, { color: isDark ? '#F87171' : '#B91C1C' }]}>
              ↺ Reset All Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. ABOUT */}
        <Text
          style={[
            styles.sectionHeading,
            { color: colors.textPrimary, marginTop: 24 },
          ]}
        >
          About
        </Text>

        <View
          style={[
            styles.glassSectionCard,
            {
              backgroundColor: isDark ? '#141418' : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : '#D6E4DC',
            },
          ]}
        >
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D8E8E0' : '#1E3528' }]}>
              Application
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              SOVAELI
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 10 }]}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D8E8E0' : '#1E3528' }]}>
              Design System
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              Scenic Glassmorphism
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 10 }]}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D8E8E0' : '#1E3528' }]}>
              Privacy & Network
            </Text>
            <Text style={[styles.aboutValue, { color: '#34D399', fontWeight: '700' }]}>
              ● 100% Offline
            </Text>
          </View>

          <Text
            style={[
              styles.aboutDisclaimer,
              { color: isDark ? '#B2C8BD' : '#2D4B39' },
            ]}
          >
            A calm, quiet companion designed for mindful breathing, restful meditation, and ambient relaxation. No accounts, no telemetry, no network calls.
          </Text>
        </View>
      </ScrollView>

      {/* Global Bottom Navigation */}
      <BottomNavBar activeTab="settings" />

      {/* Elegant Custom Reset Confirmation Modal */}
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
  scrollContent: {
    paddingTop: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    marginBottom: 14,
  },
  scenesGrid: {
    gap: 10,
  },
  sceneCard: {
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  sceneThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  sceneThumbFallback: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneInfoWrap: {
    flex: 1,
    marginLeft: 14,
  },
  sceneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sceneTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  sceneSubtitle: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    lineHeight: 16,
  },
  activeCheckPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  activeCheckText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  glassSectionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
    marginTop: 8,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  themeIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  themeLabel: {
    fontSize: 15,
    fontFamily: 'sans-serif',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  settingRowDesc: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    lineHeight: 17,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    fontWeight: '600',
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  aboutDisclaimer: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    marginTop: 14,
    lineHeight: 18,
  },
  resetStatsBtn: {
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetStatsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
});
