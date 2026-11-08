import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const lineScale = useRef(new Animated.Value(0)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Initial Logo Entrance (Bloom + Scale up + Fade in)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Title & Line Reveal (Staggered after 400ms)
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline Reveal
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Continuous Ambient Floating & Breathing
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 6,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 5. Rhythmic Aura Breathing Pulse
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auraPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    auraLoop.start();

    // 6. Smooth Progress Bar Animation (0 to 1 over 2.4s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2400,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // 7. Transition to Home Screen after ~2.8s
    const timeout = setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Home');
      });
    }, 2800);

    return () => {
      clearTimeout(timeout);
      floatLoop.stop();
      auraLoop.stop();
    };
  }, [navigation]);

  // Interpolations
  const auraScale1 = auraPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.35],
  });

  const auraScale2 = auraPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.15, 1.6],
  });

  const auraOpacity = auraPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.12],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <StatusBar barStyle="light-content" />

      {/* Deep, tranquil cosmic emerald background */}
      <LinearGradient
        colors={['#07140E', '#0D2118', '#091710']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Center Hero Logo & Glowing Halos */}
      <View style={styles.centerContainer}>
        {/* Outer Radiant Aura Ring */}
        <Animated.View
          style={[
            styles.auraRing,
            styles.outerAura,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale2 }],
            },
          ]}
        />

        {/* Inner Radiant Aura Ring */}
        <Animated.View
          style={[
            styles.auraRing,
            styles.innerAura,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale1 }],
            },
          ]}
        />

        {/* Main Floating Animated Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoFloat },
              ],
            },
          ]}
        >
          <Image
            source={require('../logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name: SUKOON */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>SUKOON</Text>

          {/* Delicate glowing golden/emerald divider line */}
          <Animated.View
            style={[
              styles.accentLine,
              { transform: [{ scaleX: lineScale }] },
            ]}
          />

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Breathe • Meditate • Find Peace
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress & Peaceful Message */}
      <View style={styles.bottomContainer}>
        <Text style={styles.loadingMessage}>Entering your space of peace...</Text>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07140E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  auraRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
  },
  outerAura: {
    width: 250,
    height: 250,
    borderColor: '#8CD5B4',
  },
  innerAura: {
    width: 200,
    height: 200,
    borderColor: '#4EA375',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8CD5B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#FFFFFF',
    letterSpacing: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(140, 213, 180, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  accentLine: {
    width: 90,
    height: 2,
    backgroundColor: '#8CD5B4',
    borderRadius: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'sans-serif',
    fontWeight: '600',
    color: '#B5D6C5',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    width: width * 0.7,
  },
  loadingMessage: {
    fontSize: 12,
    fontFamily: 'sans-serif',
    fontWeight: '500',
    color: '#7EA693',
    letterSpacing: 1,
    marginBottom: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8CD5B4',
    borderRadius: 2,
  },
});
