import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
} from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  let bgColor = colors.accentTerracotta;
  let textColor = '#FFFFFF';

  if (variant === 'secondary') {
    bgColor = colors.surface;
    textColor = colors.textPrimary;
  } else if (variant === 'danger') {
    bgColor = '#C7513B';
    textColor = '#FFFFFF';
  }

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: disabled ? colors.surfaceBorder : bgColor,
            borderRadius: 28,
          },
          variant === 'secondary' && {
            borderWidth: 1.5,
            borderColor: colors.surfaceBorder,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
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
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56, // Generous, comfortable touch target
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
    fontSize: 17,
    fontWeight: '700',
  },
});
