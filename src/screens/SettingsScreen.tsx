import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { settingsStore, ThemePreference } from '../data/settingsStore';

export const SettingsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius, themePreference, setThemePreference } = useTheme();
  const navigation = useNavigation();

  const [bellEnabled, setBellEnabled] = useState<boolean>(settingsStore.isBellEnabled());

  useEffect(() => {
    const unsub = settingsStore.subscribe(() => {
      setBellEnabled(settingsStore.isBellEnabled());
    });
    return unsub;
  }, []);

  const handleToggleBell = async (value: boolean) => {
    setBellEnabled(value);
    await settingsStore.setBellEnabled(value);
  };

  const THEME_OPTIONS: { id: ThemePreference; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark Mode', icon: '🌙' },
    { id: 'light', label: 'Light Mode', icon: '☀️' },
    { id: 'system', label: 'Follow Device', icon: '📱' },
  ];

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={[typography.subheader, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
          Appearance
        </Text>

        <Card style={styles.sectionCard}>
          {THEME_OPTIONS.map((opt, idx) => {
            const isSelected = themePreference === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.themeOptionRow,
                  idx < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.surfaceBorder,
                  },
                ]}
                onPress={() => setThemePreference(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.themeIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    typography.body,
                    {
                      flex: 1,
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.accentSage }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Audio Preferences */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
          ]}
        >
          Sound & Signals
        </Text>

        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Singing Bowl Bell
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Chime at the start and end of each meditation session
              </Text>
            </View>

            <Switch
              value={bellEnabled}
              onValueChange={handleToggleBell}
              trackColor={{ false: colors.surfaceBorder, true: colors.accentSage }}
              thumbColor={bellEnabled ? colors.accentTerracotta : '#F4F3F4'}
            />
          </View>
        </Card>

        {/* About App */}
        <Text
          style={[
            typography.subheader,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
          ]}
        >
          About
        </Text>

        <Card style={styles.sectionCard}>
          <View style={styles.aboutRow}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Application
            </Text>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Q9 Relax
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 12 }]}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Version
            </Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>
              1.0.0 (Offline)
            </Text>
          </View>

          <View style={[styles.aboutRow, { marginTop: 12 }]}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Network Status
            </Text>
            <Text style={[typography.caption, { color: colors.accentGreen, fontWeight: '700' }]}>
              ● 100% Offline
            </Text>
          </View>

          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, marginTop: 16, lineHeight: 18 },
            ]}
          >
            A calm, quiet companion designed for mindful breathing, restful meditation, and ambient relaxation. No accounts, no data collection.
          </Text>
        </Card>
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
  sectionCard: {
    paddingVertical: 4,
    borderRadius: 22,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  themeIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});
