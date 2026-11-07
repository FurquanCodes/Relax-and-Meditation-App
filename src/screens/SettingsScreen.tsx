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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { settingsStore, ThemePreference, SceneId } from '../data/settingsStore';
import { ScenicBackground, SCENIC_IMAGES } from '../components/ScenicBackground';

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

  const [bellEnabled, setBellEnabled] = useState<boolean>(settingsStore.isBellEnabled());
  const [selectedScene, setSelectedScene] = useState<SceneId>(settingsStore.getScenePreference());

  useEffect(() => {
    const unsub = settingsStore.subscribe(() => {
      setBellEnabled(settingsStore.isBellEnabled());
      setSelectedScene(settingsStore.getScenePreference());
    });
    return unsub;
  }, []);

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
        contentContainerStyle={[styles.scrollContent, { padding: 18, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SCENE THEMES PICKER */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Background Scene
        </Text>
        <Text style={[styles.sectionDesc, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
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
                    backgroundColor: isDark
                      ? 'rgba(17, 29, 37, 0.70)'
                      : 'rgba(255, 255, 255, 0.75)',
                    borderColor: isSelected
                      ? isDark
                        ? '#8CD5B4'
                        : '#265C43'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.14)'
                      : 'rgba(255, 255, 255, 0.88)',
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
                          ? 'rgba(140, 213, 180, 0.20)'
                          : 'rgba(38, 92, 67, 0.12)',
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
                            backgroundColor: isDark ? '#8CD5B4' : '#265C43',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeCheckText,
                            { color: isDark ? '#0B131A' : '#FFFFFF' },
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
                      { color: isDark ? '#D0E3D9' : '#4B5F54' },
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
              backgroundColor: isDark
                ? 'rgba(17, 29, 37, 0.70)'
                : 'rgba(255, 255, 255, 0.75)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(255, 255, 255, 0.88)',
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
                      : 'rgba(0, 0, 0, 0.06)',
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
                      { backgroundColor: isDark ? '#8CD5B4' : '#265C43' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkmarkText,
                        { color: isDark ? '#0B131A' : '#FFFFFF' },
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
              backgroundColor: isDark
                ? 'rgba(17, 29, 37, 0.70)'
                : 'rgba(255, 255, 255, 0.75)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(255, 255, 255, 0.88)',
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
                  { color: isDark ? '#D0E3D9' : '#4B5F54' },
                ]}
              >
                Soft chime at the start and completion of each meditation
              </Text>
            </View>

            <Switch
              value={bellEnabled}
              onValueChange={handleToggleBell}
              trackColor={{
                false: isDark ? '#263D31' : '#E6DECF',
                true: isDark ? '#8CD5B4' : '#265C43',
              }}
              thumbColor={bellEnabled ? colors.accentTerracotta : '#F4F3F4'}
            />
          </View>
        </View>

        {/* 4. ABOUT */}
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
              backgroundColor: isDark
                ? 'rgba(17, 29, 37, 0.70)'
                : 'rgba(255, 255, 255, 0.75)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(255, 255, 255, 0.88)',
            },
          ]}
        >
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
              Application
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              Q9 Relax
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 10 }]}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
              Design System
            </Text>
            <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>
              Scenic Glassmorphism
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 10 }]}>
            <Text style={[styles.aboutLabel, { color: isDark ? '#D0E3D9' : '#4B5F54' }]}>
              Privacy & Network
            </Text>
            <Text style={[styles.aboutValue, { color: '#34D399', fontWeight: '700' }]}>
              ● 100% Offline
            </Text>
          </View>

          <Text
            style={[
              styles.aboutDisclaimer,
              { color: isDark ? '#809E90' : '#788C81' },
            ]}
          >
            A calm, quiet companion designed for mindful breathing, restful meditation, and ambient relaxation. No accounts, no telemetry, no network calls.
          </Text>
        </View>
      </ScrollView>
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    fontFamily: 'PlayfairDisplay-Bold',
  },
  sceneSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    lineHeight: 16,
  },
  activeCheckPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeCheckText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  glassSectionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    fontFamily: 'Nunito-Regular',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 2,
  },
  settingRowDesc: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    lineHeight: 17,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  aboutDisclaimer: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    marginTop: 14,
    lineHeight: 18,
  },
});
