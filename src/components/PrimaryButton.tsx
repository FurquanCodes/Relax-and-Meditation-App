import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const { colors, borderRadius, typography } = useTheme();

  let bgColor = colors.primary;
  let textColor = '#FFFFFF';

  if (variant === 'secondary') {
    bgColor = colors.surfaceElevated;
    textColor = colors.textPrimary;
  } else if (variant === 'danger') {
    bgColor = colors.accentRed;
    textColor = '#FFFFFF';
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.surfaceBorder : bgColor,
          borderRadius: borderRadius.md,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          typography.bodyBold,
          styles.text,
          { color: disabled ? colors.textMuted : textColor },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52, // Large touch target > 48dp
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

