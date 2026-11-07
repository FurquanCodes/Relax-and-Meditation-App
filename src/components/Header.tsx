import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightAction,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.surfaceBorder,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backArrow, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          typography.header,
          styles.title,
          { color: colors.textPrimary },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.rightContainer}>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 26,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

