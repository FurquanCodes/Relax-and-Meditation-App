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
  const { colors, typography } = useTheme();

  let bgColor = colors.accentTerracotta;
  let textColor = '#FFFFFF';

  if (variant === 'secondary') {
    bgColor = colors.surface;
    textColor = colors.textPrimary;
  } else if (variant === 'danger') {
    bgColor = '#C7513B';
    textColor = '#FFFFFF';
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.surfaceBorder : bgColor,
          borderRadius: 26,
        },
        variant === 'secondary' && {
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.3,
    fontSize: 16,
    fontWeight: '700',
  },
});
