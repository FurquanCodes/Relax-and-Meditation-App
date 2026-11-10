import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type AtmosphereThemeType = 'rain' | 'river' | 'forest' | 'ocean' | 'zen';

export interface AtmosphereThemeMeta {
  id: AtmosphereThemeType;
  name: string;
  subtitle: string;
  icon: string;
  tagline: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  accent: string;
  associatedTrackId: string;
}

export const ATMOSPHERE_THEMES: AtmosphereThemeMeta[] = [
  {
    id: 'river',
    name: 'Mountain River',
    subtitle: 'Babbling stream & birds',
    icon: '🏞️',
    tagline: 'Flowing water gently washing away mental clutter',
    lightBg: '#E2F3F5',
    darkBg: '#132C33',
    lightBorder: '#84C7D0',
    darkBorder: '#235964',
    accent: '#3FA9B5',
    associatedTrackId: 'forest_river_birds',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    subtitle: 'Soft drops & night mist',
    icon: '🌧️',
    tagline: 'Quiet raindrops falling steadily into the cool night',
    lightBg: '#E6EFF4',
    darkBg: '#16252F',
    lightBorder: '#8FB4C9',
    darkBorder: '#294557',
    accent: '#5B8FA8',
    associatedTrackId: 'gentle_night_rain',
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    subtitle: 'Breezy leaves & songbirds',
    icon: '🌲',
    tagline: 'Ancient trees swaying softly in the morning canopy',
    lightBg: '#E9F4EC',
    darkBg: '#183022',
    lightBorder: '#88C096',
    darkBorder: '#2D593E',
    accent: '#4EA365',
    associatedTrackId: 'forest_ambience_birds',
  },
  {
    id: 'ocean',
    name: 'Ocean Tide',
    subtitle: 'Rolling swells & seafoam',
    icon: '🌊',
    tagline: 'Slow rhythmic waves washing in harmony with your breath',
    lightBg: '#E3F0F7',
    darkBg: '#14293D',
    lightBorder: '#82B4D6',
    darkBorder: '#284F75',
    accent: '#4A92C2',
    associatedTrackId: 'ocean_waves',
  },
  {
    id: 'zen',
    name: 'Zen Twilight',
    subtitle: 'Harmonic chords & stillness',
    icon: '🧘',
    tagline: 'Radiant peaceful aura to ground your present awareness',
    lightBg: '#F1ECF9',
    darkBg: '#251F3D',
    lightBorder: '#B29ED8',
    darkBorder: '#45356E',
    accent: '#8967BA',
    associatedTrackId: 'meditation_audio',
  },
];

interface AtmosphereThemeViewProps {
  theme: AtmosphereThemeType;
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  height?: number;
}

export const AtmosphereThemeView: React.FC<AtmosphereThemeViewProps> = ({
  theme,
  isActive = true,
  style,
  children,
  height = 220,
}) => {
  const { isDark } = useTheme();
  const themeMeta = ATMOSPHERE_THEMES.find((t) => t.id === theme) || ATMOSPHERE_THEMES[0];

  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const rainAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Slow breathing pulse (for Zen aura & overall gentle life)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Horizontal flowing wave motion (for River & Ocean)
    const flowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Floating drifting leaves/fireflies (for Forest)
    const floatLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const floatLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Rain falling cycle
    const rainLoop = Animated.loop(
      Animated.timing(rainAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    if (isActive) {
      pulseLoop.start();
      flowLoop.start();
      floatLoop1.start();
      floatLoop2.start();
      rainLoop.start();
    } else {
      pulseLoop.stop();
      flowLoop.stop();
      floatLoop1.stop();
      floatLoop2.stop();
      rainLoop.stop();
    }

    return () => {
      pulseLoop.stop();
      flowLoop.stop();
      floatLoop1.stop();
      floatLoop2.stop();
      rainLoop.stop();
    };
  }, [isActive]);

  const bg = isDark ? themeMeta.darkBg : themeMeta.lightBg;
  const borderColor = isDark ? themeMeta.darkBorder : themeMeta.lightBorder;

  // Render Theme Specific Atmosphere
  const renderAtmosphereVisuals = () => {
    switch (theme) {
      case 'rain': {
        const drop1Y = rainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, height + 10],
        });
        const drop2Y = rainAnim.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [height * 0.4, height + 10, -20],
        });
        const drop3Y = rainAnim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [height * 0.7, height + 10, -10],
        });

        const rippleScale = rainAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 1.3, 1.8],
        });
        const rippleOpacity = rainAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 0.3, 0],
        });

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Soft night rain mist overlay */}
            <View
              style={[
                styles.mistLayer,
                { backgroundColor: isDark ? 'rgba(22, 37, 47, 0.5)' : 'rgba(230, 239, 244, 0.4)' },
              ]}
            />

            {/* Falling rain streaks */}
            <Animated.View
              style={[
                styles.rainDrop,
                { left: '15%', transform: [{ translateY: drop1Y }], backgroundColor: themeMeta.accent },
              ]}
            />
            <Animated.View
              style={[
                styles.rainDrop,
                { left: '32%', transform: [{ translateY: drop2Y }], backgroundColor: themeMeta.accent, height: 26 },
              ]}
            />
            <Animated.View
              style={[
                styles.rainDrop,
                { left: '48%', transform: [{ translateY: drop3Y }], backgroundColor: themeMeta.accent, height: 20 },
              ]}
            />
            <Animated.View
              style={[
                styles.rainDrop,
                { left: '68%', transform: [{ translateY: drop1Y }], backgroundColor: themeMeta.accent, height: 24 },
              ]}
            />
            <Animated.View
              style={[
                styles.rainDrop,
                { left: '84%', transform: [{ translateY: drop2Y }], backgroundColor: themeMeta.accent, height: 18 },
              ]}
            />

            {/* Ground ripples */}
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  left: '25%',
                  bottom: 18,
                  borderColor: themeMeta.accent,
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  left: '70%',
                  bottom: 24,
                  borderColor: themeMeta.accent,
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
            />
          </View>
        );
      }

      case 'river': {
        const wave1X = flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 25],
        });
        const wave2X = flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, -35],
        });
        const shimmerOpacity = pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.8],
        });

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* River current wave 1 */}
            <Animated.View
              style={[
                styles.riverCurrent,
                {
                  bottom: 35,
                  backgroundColor: isDark ? 'rgba(63, 169, 181, 0.16)' : 'rgba(63, 169, 181, 0.22)',
                  borderColor: themeMeta.accent,
                  transform: [{ translateX: wave1X }],
                },
              ]}
            />
            {/* River current wave 2 */}
            <Animated.View
              style={[
                styles.riverCurrent,
                {
                  bottom: 12,
                  height: 45,
                  backgroundColor: isDark ? 'rgba(63, 169, 181, 0.25)' : 'rgba(63, 169, 181, 0.35)',
                  borderColor: themeMeta.accent,
                  transform: [{ translateX: wave2X }],
                },
              ]}
            />
            {/* Shimmering water reflections */}
            <Animated.View
              style={[
                styles.waterGlint,
                { left: '20%', bottom: 45, opacity: shimmerOpacity, backgroundColor: '#FFFFFF' },
              ]}
            />
            <Animated.View
              style={[
                styles.waterGlint,
                { left: '60%', bottom: 25, opacity: shimmerOpacity, backgroundColor: '#E0F7FA', width: 28 },
              ]}
            />
            <Animated.View
              style={[
                styles.waterGlint,
                { left: '78%', bottom: 50, opacity: shimmerOpacity, backgroundColor: '#FFFFFF', width: 16 },
              ]}
            />
          </View>
        );
      }

      case 'forest': {
        const leaf1X = floatAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: [-15, 15],
        });
        const leaf1Y = floatAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 20],
        });
        const leaf1Rot = floatAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: ['-12deg', '14deg'],
        });

        const fireflyOpacity = pulseAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.2, 0.9, 0.3],
        });
        const fireflyFloat = floatAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -18],
        });

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Floating leaf 1 */}
            <Animated.View
              style={[
                styles.leafMote,
                {
                  top: 25,
                  left: '18%',
                  transform: [
                    { translateX: leaf1X },
                    { translateY: leaf1Y },
                    { rotate: leaf1Rot },
                  ],
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🍃</Text>
            </Animated.View>

            {/* Floating leaf 2 */}
            <Animated.View
              style={[
                styles.leafMote,
                {
                  top: 65,
                  right: '20%',
                  transform: [
                    { translateX: leaf1X },
                    { translateY: leaf1Y },
                    { rotate: leaf1Rot },
                  ],
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>🌿</Text>
            </Animated.View>

            {/* Glowing fireflies */}
            <Animated.View
              style={[
                styles.firefly,
                {
                  left: '30%',
                  bottom: 45,
                  opacity: fireflyOpacity,
                  transform: [{ translateY: fireflyFloat }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.firefly,
                {
                  right: '35%',
                  top: 40,
                  opacity: fireflyOpacity,
                  transform: [{ translateY: fireflyFloat }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.firefly,
                {
                  left: '75%',
                  bottom: 30,
                  opacity: fireflyOpacity,
                  width: 6,
                  height: 6,
                  transform: [{ translateY: fireflyFloat }],
                },
              ]}
            />
          </View>
        );
      }

      case 'ocean': {
        const tideScaleY = pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1.25],
        });
        const waveShift = flowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-25, 25],
        });

        return (
          <View style={StyleFillNoPointer}>
            {/* Ocean back swell */}
            <Animated.View
              style={[
                styles.oceanSwell,
                {
                  bottom: 25,
                  height: 60,
                  backgroundColor: isDark ? 'rgba(74, 146, 194, 0.18)' : 'rgba(74, 146, 194, 0.25)',
                  transform: [{ scaleY: tideScaleY }, { translateX: waveShift }],
                },
              ]}
            />
            {/* Ocean front wave */}
            <Animated.View
              style={[
                styles.oceanSwell,
                {
                  bottom: 0,
                  height: 40,
                  backgroundColor: isDark ? 'rgba(74, 146, 194, 0.32)' : 'rgba(74, 146, 194, 0.45)',
                  transform: [{ scaleY: tideScaleY }],
                },
              ]}
            />
            {/* Foam lines */}
            <View style={[styles.foamLine, { bottom: 38, borderColor: themeMeta.accent }]} />
          </View>
        );
      }

      case 'zen':
      default: {
        const auraScale1 = pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.2],
        });
        const auraScale2 = pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1.1, 1.45],
        });
        const auraOpacity = pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.35, 0.12],
        });

        return (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Radiant outer halo ring */}
            <Animated.View
              style={[
                styles.zenAuraRing,
                {
                  borderColor: themeMeta.accent,
                  opacity: auraOpacity,
                  transform: [{ scale: auraScale2 }],
                },
              ]}
            />
            {/* Radiant inner halo ring */}
            <Animated.View
              style={[
                styles.zenAuraRing,
                {
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderColor: themeMeta.accent,
                  opacity: auraOpacity,
                  transform: [{ scale: auraScale1 }],
                },
              ]}
            />
          </View>
        );
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: borderColor,
          height: height,
        },
        style,
      ]}
    >
      {renderAtmosphereVisuals()}

      {/* Foreground content / Children */}
      {children ? (
        <View style={styles.childContainer}>{children}</View>
      ) : (
        <View style={styles.defaultContent}>
          <Text style={styles.themeIcon}>{themeMeta.icon}</Text>
          <Text style={[styles.themeTitle, { color: isDark ? '#FFFFFF' : '#1A2E22' }]}>
            {themeMeta.name}
          </Text>
          <Text style={[styles.themeTagline, { color: isDark ? '#C5D8CF' : '#4A5D52' }]}>
            {themeMeta.tagline}
          </Text>
        </View>
      )}
    </View>
  );
};

const StyleFillNoPointer = {
  ...StyleSheet.absoluteFill,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  childContainer: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 2,
  },
  themeIcon: {
    fontSize: 34,
    marginBottom: 6,
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  themeTagline: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  // Rain visual styles
  mistLayer: {
    ...StyleSheet.absoluteFill,
  },
  rainDrop: {
    position: 'absolute',
    width: 2.5,
    height: 22,
    borderRadius: 1.5,
    opacity: 0.65,
  },
  rippleRing: {
    position: 'absolute',
    width: 38,
    height: 14,
    borderRadius: 19,
    borderWidth: 1.5,
  },

  // River visual styles
  riverCurrent: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 38,
    borderTopWidth: 1.5,
    borderBottomWidth: 1,
    borderRadius: 24,
  },
  waterGlint: {
    position: 'absolute',
    height: 3,
    width: 20,
    borderRadius: 2,
  },

  // Forest visual styles
  leafMote: {
    position: 'absolute',
    opacity: 0.85,
  },
  firefly: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE57F',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  // Ocean visual styles
  oceanSwell: {
    position: 'absolute',
    left: -50,
    right: -50,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  foamLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    opacity: 0.4,
  },

  // Zen visual styles
  zenAuraRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '25%',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
});

