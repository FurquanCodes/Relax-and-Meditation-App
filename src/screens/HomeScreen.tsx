import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { getDaytimeGreeting } from '../logic/formatters';
import { progressStore } from '../data/progressStore';
import { NavigationProp } from '../navigation/types';

export const HomeScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<NavigationProp>();

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

  const insets = useSafeAreaInsets();
  const { greeting, subtitle } = getDaytimeGreeting();

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header with App Title & Settings Icon */}
      <View
        style={[
          styles.headerBar,
          {
            paddingHorizontal: spacing.xl,
            borderBottomColor: colors.surfaceBorder,
            paddingTop: insets.top,
            height: 60 + insets.top,
          },
        ]}
      >
        <Text style={[typography.header, { color: colors.textPrimary }]}>
          Q9 Relax
        </Text>
        <TouchableOpacity
          style={styles.settingsIconButton}
          onPress={() => navigation.navigate('Settings')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.gearIcon, { color: colors.textSecondary }]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Daytime Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[typography.hero, { color: colors.textPrimary }]}>
            {greeting}
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        {/* Progress Strip */}
        <Card
          style={[
            styles.progressCard,
            { backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                SESSIONS
              </Text>
              <Text
                style={[
                  typography.header,
                  { color: colors.primary, marginTop: 2 },
                ]}
              >
                {completedSessions}
              </Text>
            </View>

            <View
              style={[
                styles.progressDivider,
                { backgroundColor: colors.surfaceBorder },
              ]}
            />

            <View style={styles.progressItem}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                MINUTES
              </Text>
              <Text
                style={[
                  typography.header,
                  { color: colors.primary, marginTop: 2 },
                ]}
              >
                {totalMinutes}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Entry Cards */}
        <Text
          style={[
            typography.subheader,
            {
              color: colors.textPrimary,
              marginTop: spacing.xl,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Choose a practice
        </Text>

        {/* 1. Breathe */}
        <Card
          style={styles.actionCard}
          onPress={() => navigation.navigate('Breathing')}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text style={styles.cardIcon}>🫧</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[typography.subheader, { color: colors.textPrimary }]}>
                Breathe
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Guided rhythmic breathing with visual cues
              </Text>
            </View>
            <Text style={[styles.arrowIcon, { color: colors.primary }]}>›</Text>
          </View>
        </Card>

        {/* 2. Meditate */}
        <Card
          style={styles.actionCard}
          onPress={() => navigation.navigate('Meditation')}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text style={styles.cardIcon}>🧘</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[typography.subheader, { color: colors.textPrimary }]}>
                Meditate
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Quiet timer with soft starting and ending bells
              </Text>
            </View>
            <Text style={[styles.arrowIcon, { color: colors.primary }]}>›</Text>
          </View>
        </Card>

        {/* 3. Sounds */}
        <Card
          style={styles.actionCard}
          onPress={() => navigation.navigate('Sounds')}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text style={styles.cardIcon}>🎧</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[typography.subheader, { color: colors.textPrimary }]}>
                Sounds
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                Calming ambient loops with sleep timer
              </Text>
            </View>
            <Text style={[styles.arrowIcon, { color: colors.primary }]}>›</Text>
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
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 22,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  greetingSection: {
    marginVertical: 12,
  },
  progressCard: {
    marginTop: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    height: 36,
  },
  actionCard: {
    marginVertical: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardTextContainer: {
    flex: 1,
  },
  arrowIcon: {
    fontSize: 28,
    fontWeight: '300',
    paddingLeft: 8,
  },
});

