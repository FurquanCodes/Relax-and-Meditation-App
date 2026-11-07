export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentGreen: string;
  accentRed: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E2E8F0',
  primary: '#1E6F78', // Calm Teal
  primaryLight: '#319795',
  primaryMuted: '#E6FFFA',
  secondary: '#4A5568',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  accentGreen: '#38A169',
  accentRed: '#E53E3E',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
};

export const darkColors: ThemeColors = {
  background: '#0D141C', // Deep Navy / Slate
  surface: '#17222F',
  surfaceElevated: '#1F2E3E',
  surfaceBorder: '#27384A',
  primary: '#38B2AC', // Bright Soothing Teal
  primaryLight: '#4FD1C5',
  primaryMuted: '#1A3636',
  secondary: '#A0AEC0',
  textPrimary: '#F7FAFC',
  textSecondary: '#CBD5E0',
  textMuted: '#A0AEC0',
  accentGreen: '#48BB78',
  accentRed: '#F56565',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
};

