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
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  let bgColor = colors.accentTerracotta;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    bgColor = isDark ? '#162820' : '#FFFFFF';
    textColor = isDark ? '#FFFFFF' : '#111F18';
    borderColor = isDark ? 'rgba(255, 255, 255, 0.20)' : '#265C43';
    borderWidth = 1.5;
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
            borderColor,
            borderWidth,
            borderRadius: 28,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Text
          style={[
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
    minHeight: 56,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
