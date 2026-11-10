import React, { useEffect, useState } from 'react';
import {
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/shared/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { settingsStore } from './src/shared/store/settingsStore';
import { progressStore } from './src/features/progress';
import { audioService } from './src/features/sounds';

const MainAppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <AppNavigator />
    </>
  );
};

export default function App() {
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      // 1. Request notification permission on Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        } catch {}
      }

      // 2. Pre-load all settings and session progress before rendering main UI
      // This completely guarantees ZERO theme flash or lost state on launch.
      await Promise.all([
        settingsStore.init(),
        progressStore.init(),
        audioService.setupPlayerIfNeeded(),
      ]);

      setIsBootstrapped(true);
    }

    bootstrap();
  }, []);

  // Display warm, light, elegant splash screen during startup and initialization
  if (!isBootstrapped || !isSplashDone) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setIsSplashDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
