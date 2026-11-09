import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface SplashScreenProps {
  onFinish?: () => void;
  isStandalone?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    // Graceful fallback if rendered outside NavigationContainer during bootstrap
  }

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Gentle natural logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Brand text gentle fade-in (staggered by 300ms)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Minimal progress line animation (0 to 1 over 2.0s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // 4. Smooth transition to Home screen
    const transitionTimer = setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) {
          onFinish();
        } else if (navigation) {
          navigation.replace('Home');
        }
      });
    }, 2400);

    return () => {
      clearTimeout(transitionTimer);
    };
  }, [navigation, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <StatusBar barStyle="dark-content" />

      {/* Centered Brand Presentation */}
      <View style={styles.centerContent}>
        {/* Official SOVAELI Logo with subtle natural shadow */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>SOVAELI</Text>
          <View style={styles.accentDivider} />
          <Text style={styles.brandSubtitle}>Mindful Calm & Inner Peace</Text>
        </Animated.View>
      </View>

      {/* Minimal, elegant bottom progress cue */}
      <View style={styles.bottomArea}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E4DA',
    shadowColor: '#1A3326',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  logoImage: {
    width: 82,
    height: 82,
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#111F18',
    letterSpacing: 6,
    textAlign: 'center',
  },
  accentDivider: {
    width: 36,
    height: 2,
    backgroundColor: '#8CD5B4',
    borderRadius: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '500',
    color: '#3D5A4A',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: 100,
    height: 2.5,
    backgroundColor: 'rgba(38, 92, 67, 0.12)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#265C43',
    borderRadius: 1.5,
  },
});
