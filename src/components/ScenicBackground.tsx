import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { SceneId } from '../data/settingsStore';

export const SCENIC_IMAGES: Record<Exclude<SceneId, 'auto'>, any> = {
  meadow: require('../../assets/images/meadow_sunrise.jpg'),
  forest: require('../../assets/images/forest_mist.jpg'),
  ocean: require('../../assets/images/ocean_sunset.jpg'),
  rain: require('../../assets/images/rain_drops.jpg'),
  night: require('../../assets/images/night_stars.jpg'),
};

export const SCENIC_GRADIENTS: Record<
  Exclude<SceneId, 'auto'>,
  { light: [string, string, string]; dark: [string, string, string] }
> = {
  meadow: {
    light: ['#FCEFD5', '#F5DFC1', '#E7D1B1'],
    dark: ['#1C160F', '#2A2016', '#3D2F1E'],
  },
  forest: {
    light: ['#E6EFE9', '#D0E3D7', '#BAD4C4'],
    dark: ['#0A1610', '#102219', '#173024'],
  },
  ocean: {
    light: ['#E4EFF3', '#CBE2E9', '#B3D3DE'],
    dark: ['#091722', '#0E2333', '#16334A'],
  },
  rain: {
    light: ['#E8ECF2', '#D3DAE4', '#BDC8D6'],
    dark: ['#101720', '#16202C', '#1E2C3D'],
  },
  night: {
    light: ['#ECECF5', '#D6D5E8', '#BFBDDB'],
    dark: ['#090D18', '#0F1527', '#171F3B'],
  },
};

export function resolveScene(scenePreference: SceneId): Exclude<SceneId, 'auto'> {
  if (scenePreference && scenePreference !== 'auto') {
    return scenePreference;
  }
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'meadow';
  if (hour >= 12 && hour < 17) return 'forest';
  if (hour >= 17 && hour < 20) return 'ocean';
  return 'night';
}

interface ScenicBackgroundProps {
  scene?: SceneId;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scrimOpacity?: number;
  showParticles?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Lightweight subtle floating particle element (max 8 elements for 60fps performance)
const FloatingParticle: React.FC<{ index: number; isDark: boolean }> = ({
  index,
  isDark,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const initialX = (index * 47) % SCREEN_WIDTH;
  const initialY = ((index * 91) % (SCREEN_HEIGHT * 0.7)) + 60;
  const size = 3 + (index % 3) * 2;
  const duration = 6000 + (index % 4) * 1500;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35 - (index % 3) * 15],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, (index % 2 === 0 ? 12 : -12), 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.65, 0.15],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? '#A7F3D0' : '#FEF3C7',
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
};

export const ScenicBackground: React.FC<ScenicBackgroundProps> = ({
  scene = 'auto',
  style,
  children,
  scrimOpacity,
  showParticles = true,
}) => {
  const { isDark } = useTheme();
  const effectiveScene = resolveScene(scene);
  const imageSource = SCENIC_IMAGES[effectiveScene];
  const gradientFallback =
    SCENIC_GRADIENTS[effectiveScene][isDark ? 'dark' : 'light'];

  const scrimColors: [string, string, string] = isDark
    ? [
        `rgba(11, 19, 26, ${scrimOpacity ?? 0.50})`,
        `rgba(11, 19, 26, ${Math.min((scrimOpacity ?? 0.75) + 0.12, 0.92)})`,
        `rgba(11, 19, 26, ${Math.min((scrimOpacity ?? 0.90) + 0.08, 0.98)})`,
      ]
    : [
        `rgba(250, 246, 238, ${scrimOpacity ?? 0.52})`,
        `rgba(250, 246, 238, ${Math.min((scrimOpacity ?? 0.76) + 0.10, 0.90)})`,
        `rgba(250, 246, 238, ${Math.min((scrimOpacity ?? 0.90) + 0.06, 0.98)})`,
      ];

  return (
    <View style={[styles.container, style]}>
      {/* Background Image with Code Gradient Fallback */}
      <ImageBackground
        source={imageSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={scrimColors}
          locations={[0.0, 0.45, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* Subtle Floating Ambient Particles (Max 6 for optimal frame rate) */}
      {showParticles && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <FloatingParticle key={i} index={i} isDark={isDark} />
          ))}
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
});

