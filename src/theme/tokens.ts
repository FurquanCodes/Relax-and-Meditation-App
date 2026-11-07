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

  iconBtnBg: string;
  iconBtnBorder: string;
}

export const lightColors: ThemeColors = {
  background: '#FAF7F0', // Warm organic ivory / linen
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#EAE4D8',
  primary: '#1A2E22', // Deep forest charcoal
  primaryLight: '#8FB4A4',
  primaryMuted: '#EBF2EE',
  secondary: '#4A5D52',
  textPrimary: '#1A2E22', // Deep forest charcoal
  textSecondary: '#4A5D52', // Slate moss
  textMuted: '#7B8F84',
  accentGreen: '#2E684C',
  accentRed: '#DE775B',
  cardShadow: 'rgba(26, 46, 34, 0.08)',

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

  navActive: '#1A2E22',
  navInactive: '#8E9E95',
  navBackground: '#FFFFFF',
  navBorder: '#EAE4D8',

  statsSessionsBg: '#F7E5A9',
  statsSessionsText: '#2B2310',
  statsSessionsIcon: '#9E8024',
  statsMinutesBg: '#FAD5C0',
  statsMinutesText: '#3A1E11',
  statsMinutesIcon: '#B06540',

  iconBtnBg: '#FFFFFF',
  iconBtnBorder: '#EAE4D8',
};

export const darkColors: ThemeColors = {
  background: '#0D1712', // Deep Midnight Botanical Forest
  surface: '#15241C',
  surfaceElevated: '#1B2E24',
  surfaceBorder: '#263D31',
  primary: '#FFFFFF', // Pure luminous white
  primaryLight: '#8FD0B2',
  primaryMuted: '#1A3326',
  secondary: '#A3C2B3',
  textPrimary: '#FFFFFF', // Ultra crisp white
  textSecondary: '#C5D8CF', // Highly legible soft mint-slate
  textMuted: '#7E9C8E',
  accentGreen: '#4ADE80',
  accentRed: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.45)',

  accentTerracotta: '#E07A5F', // Glowing coral terracotta
  accentSage: '#76A691',
  accentLavender: '#8582C4',
  accentPeach: '#E29775',
  accentButter: '#E6C665',

  // Cards in Dark Mode: Rich jewel tones with ambient glow
  cardHeroBg: '#193327',
  cardHeroBtn: '#DE775B',
  cardBreatheBg: '#1B372B', // Enchanted Pine
  cardMeditateBg: '#252147', // Twilight Violet
  cardSoundsBg: '#442118', // Warm Sunset Ember

  navActive: '#FFFFFF',
  navInactive: '#769485',
  navBackground: '#111F18',
  navBorder: '#1F3429',

  statsSessionsBg: '#262112',
  statsSessionsText: '#FDE68A',
  statsSessionsIcon: '#F59E0B',
  statsMinutesBg: '#2D1B15',
  statsMinutesText: '#FFEDD5',
  statsMinutesIcon: '#F97316',

  iconBtnBg: 'rgba(255, 255, 255, 0.1)',
  iconBtnBorder: 'rgba(255, 255, 255, 0.18)',
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
