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
import { SceneId } from '../store/settingsStore';

export const SCENIC_IMAGES: Record<Exclude<SceneId, 'auto'>, any> = {
  meadow: require('../../../assets/images/meadow_sunrise.jpg'),
  forest: require('../../../assets/images/forest_mist.jpg'),
  ocean: require('../../../assets/images/ocean_sunset.jpg'),
  rain: require('../../../assets/images/rain_drops.jpg'),
  night: require('../../../assets/images/night_stars.jpg'),
};

export const SCENIC_GRADIENTS: Record<
  Exclude<SceneId, 'auto'>,
  { light: [string, string, string]; dark: [string, string, string] }
> = {
  meadow: {
    light: ['#FAF4E8', '#F2ECE0', '#EAE0D0'],
    dark: ['#12100E', '#181412', '#201B18'],
  },
  forest: {
    light: ['#F2F6F3', '#E4ECE6', '#D6E2D9'],
    dark: ['#0A0A0E', '#121216', '#181820'],
  },
  ocean: {
    light: ['#F2F6F8', '#E3EDF1', '#D4E3E8'],
    dark: ['#0A0B10', '#101218', '#161822'],
  },
  rain: {
    light: ['#F3F5F7', '#E5E9EE', '#D7DEE5'],
    dark: ['#0A0A0E', '#121216', '#1A1A22'],
  },
  night: {
    light: ['#F5F5FA', '#E8E8F2', '#DCDCE8'],
    dark: ['#08080C', '#0E0E14', '#14141E'],
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

// Lightweight subtle floating particle element (max 6 elements, 60fps)
const FloatingParticle: React.FC<{ index: number; isDark: boolean }> = ({
  index,
  isDark,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const initialX = (index * 59) % SCREEN_WIDTH;
  const initialY = ((index * 97) % (SCREEN_HEIGHT * 0.65)) + 80;
  const size = 3 + (index % 3) * 2;
  const duration = 6500 + (index % 4) * 1500;

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
    outputRange: [0, -30 - (index % 3) * 12],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, index % 2 === 0 ? 10 : -10, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.15, 0.55, 0.15],
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
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.45)' : '#D1A858',
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

  // High-contrast, glare-free scrim over scenic imagery:
  // In Light Theme: 92-98% soft ivory scrim ensures subtitle and body text is 100% crisp and readable
  // In Dark Theme: 88-97% pure obsidian black scrim ensures text is crisp, clean and glare-free
  const scrimColors: [string, string, string] = isDark
    ? [
        `rgba(9, 9, 11, ${scrimOpacity ?? 0.88})`,
        `rgba(9, 9, 11, ${Math.min((scrimOpacity ?? 0.88) + 0.06, 0.94)})`,
        `rgba(9, 9, 11, ${Math.min((scrimOpacity ?? 0.88) + 0.10, 0.98)})`,
      ]
    : [
        `rgba(250, 246, 238, ${scrimOpacity ?? 0.92})`,
        `rgba(250, 246, 238, ${Math.min((scrimOpacity ?? 0.92) + 0.04, 0.96)})`,
        `rgba(250, 246, 238, ${Math.min((scrimOpacity ?? 0.92) + 0.06, 0.98)})`,
      ];

  return (
    <View style={[styles.container, style]}>
      {/* Background Scenic Image with Soft Scrim */}
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

      {/* Subtle Floating Ambient Particles (without Android elevation artifacts) */}
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
  },
});
