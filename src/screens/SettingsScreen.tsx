import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
                    { flex: 1, color: isSelected ? colors.primary : colors.textPrimary },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
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
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Singing Bowl Bell
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Chime soft 528Hz bell at start and end of meditation
              </Text>
            </View>
            <Switch
              value={bellEnabled}
              onValueChange={handleToggleBell}
              trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
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
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Q9 Relax
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Version 1.0.0
            </Text>
          </View>

          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 18 },
            ]}
          >
            A calm, distraction-free relaxation companion built for offline daily breaks.
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.surfaceBorder, marginVertical: spacing.md },
            ]}
          />

          <View style={styles.infoBadge}>
            <Text style={styles.badgeIcon}>🔒</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              100% Offline • Zero data collection • No sign-in required
            </Text>
          </View>

          <View style={[styles.infoBadge, { marginTop: spacing.sm }]}>
            <Text style={styles.badgeIcon}>🎵</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              All audio assets are CC0 Public Domain, created by Q9 Technologies
            </Text>
          </View>
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
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  themeIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  divider: {
    height: 1,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
});

