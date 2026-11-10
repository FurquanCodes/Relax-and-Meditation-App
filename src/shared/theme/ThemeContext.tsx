import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, lightColors, darkColors, spacing, borderRadius, typography } from './tokens';
import { settingsStore, ThemePreference } from '../store/settingsStore';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  isDark: true,
  themePreference: 'dark',
  setThemePreference: async () => {},
  spacing,
  borderRadius,
  typography,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePref, setThemePref] = useState<ThemePreference>(settingsStore.getThemePreference());

  useEffect(() => {
    const unsubscribe = settingsStore.subscribe(() => {
      setThemePref(settingsStore.getThemePreference());
    });
    return unsubscribe;
  }, []);

  const isDark =
    themePref === 'dark'
      ? true
      : themePref === 'light'
      ? false
      : systemColorScheme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const handleSetThemePref = async (pref: ThemePreference) => {
    setThemePref(pref);
    await settingsStore.setThemePreference(pref);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        themePreference: themePref,
        setThemePreference: handleSetThemePref,
        spacing,
        borderRadius,
        typography,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

