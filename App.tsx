import React, { useEffect, useState } from 'react';
import {
  Platform,
  PermissionsAndroid,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { settingsStore } from './src/data/settingsStore';
import { progressStore } from './src/data/progressStore';
import { audioService } from './src/services/audioService';

const MainAppContent: React.FC = () => {
  const { colors, isDark } = useTheme();

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
  const [isInitialized, setIsInitialized] = useState(false);

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

      // 2. Load settings and progress before rendering UI (prevents theme flash)
      await Promise.all([
        settingsStore.init(),
        progressStore.init(),
        audioService.setupPlayerIfNeeded(),
      ]);

      setIsInitialized(true);
    }

    bootstrap();
  }, []);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0D141C',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#38B2AC" />
      </View>
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
