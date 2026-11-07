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

  // Organic calm pastel tokens
  accentTerracotta: string;
  accentSage: string;
  accentLavender: string;
  accentPeach: string;
  accentButter: string;

  cardHeroBg: string;
  cardHeroBtn: string;
  cardBreatheBg: string;
  cardMeditateBg: string;
  cardSoundsBg: string;

  navActive: string;
  navInactive: string;
  navBackground: string;
  navBorder: string;

  statsSessionsBg: string;
  statsSessionsText: string;
  statsSessionsIcon: string;
  statsMinutesBg: string;
  statsMinutesText: string;
  statsMinutesIcon: string;
}

export const lightColors: ThemeColors = {
  background: '#FAF7F0', // Warm organic ivory / linen
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#EAE4D8',
  primary: '#1C2E24', // Deep elegant forest green / charcoal
  primaryLight: '#8FB4A4',
  primaryMuted: '#EBF2EE',
  secondary: '#5C6E63',
  textPrimary: '#1C2E24', // Deep forest charcoal
  textSecondary: '#5C6E63', // Soft slate moss
  textMuted: '#8E9E95',
  accentGreen: '#3C7359',
  accentRed: '#DE775B',
  cardShadow: 'rgba(28, 46, 36, 0.06)',

  accentTerracotta: '#DE775B', // Warm terracotta / coral
  accentSage: '#9BBBAE', // Soothing sage green
  accentLavender: '#D4D3F8', // Calm lavender / lilac
  accentPeach: '#FAD5C0', // Soft peach apricot
  accentButter: '#F7E5A9', // Creamy buttercup yellow

  cardHeroBg: '#9BBBAE',
  cardHeroBtn: '#DE775B',
  cardBreatheBg: '#9BBBAE',
  cardMeditateBg: '#D4D3F8',
  cardSoundsBg: '#E28168',

  navActive: '#1C2E24',
  navInactive: '#8E9E95',
  navBackground: '#FFFFFF',
  navBorder: '#EAE4D8',

  statsSessionsBg: '#F7E5A9',
  statsSessionsText: '#2B2310',
  statsSessionsIcon: '#9E8024',
  statsMinutesBg: '#FAD5C0',
  statsMinutesText: '#3A1E11',
  statsMinutesIcon: '#B06540',
};

export const darkColors: ThemeColors = {
  background: '#121A16', // Deep forest slate night
  surface: '#1A2520',
  surfaceElevated: '#212F29',
  surfaceBorder: '#2B3D35',
  primary: '#C4E1D4', // Luminous soft sage
  primaryLight: '#8FB4A4',
  primaryMuted: '#1E3228',
  secondary: '#A5B9AE',
  textPrimary: '#F2F7F4',
  textSecondary: '#B2C4BC',
  textMuted: '#7A9185',
  accentGreen: '#4FA47D',
  accentRed: '#E58A72',
  cardShadow: 'rgba(0, 0, 0, 0.35)',

  accentTerracotta: '#E58A72',
  accentSage: '#587A6C',
  accentLavender: '#5A5885',
  accentPeach: '#613E30',
  accentButter: '#574B2A',

  cardHeroBg: '#263D33',
  cardHeroBtn: '#DE775B',
  cardBreatheBg: '#263D33',
  cardMeditateBg: '#322F50',
  cardSoundsBg: '#593429',

  navActive: '#F2F7F4',
  navInactive: '#71877C',
  navBackground: '#18231E',
  navBorder: '#26372F',

  statsSessionsBg: '#443A1F',
  statsSessionsText: '#F7E5A9',
  statsSessionsIcon: '#E2C96C',
  statsMinutesBg: '#4D3125',
  statsMinutesText: '#FAD5C0',
  statsMinutesIcon: '#E8A687',
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
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 38,
  },
  header: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 32,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};
