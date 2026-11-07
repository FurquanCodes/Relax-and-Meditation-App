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

  // Glassmorphic tokens
  glassSurface: string;
  glassBorder: string;
  glassTextSecondary: string;

  // Gradients
  bgGradient: [string, string, ...string[]];
  scrimGradient: [string, string, ...string[]];
  cardHeroGradient: [string, string, ...string[]];
  cardBreatheGradient: [string, string, ...string[]];
  cardMeditateGradient: [string, string, ...string[]];
  cardSoundsGradient: [string, string, ...string[]];

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
  background: '#FAF6EE', // Warm organic ivory mist
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E6DECF',
  primary: '#14221A', // Deep forest obsidian
  primaryLight: '#789F8E',
  primaryMuted: '#EBF2EE',
  secondary: '#43584C',
  textPrimary: '#14221A',
  textSecondary: '#2C4235',
  textMuted: '#5C7365',
  accentGreen: '#265C43',
  accentRed: '#D66D52',
  cardShadow: 'rgba(20, 34, 26, 0.08)',

  glassSurface: 'rgba(255, 255, 255, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.92)',
  glassTextSecondary: '#2C4235',

  bgGradient: ['#FAF6EE', '#F3ECE0', '#E7DDD0'],
  scrimGradient: ['rgba(250, 246, 238, 0.82)', 'rgba(250, 246, 238, 0.94)'],
  cardHeroGradient: ['#8EAFA1', '#729888'],
  cardBreatheGradient: ['#92B5A5', '#769D8C'],
  cardMeditateGradient: ['#CFCEF5', '#AEAEE8'],
  cardSoundsGradient: ['#E68B74', '#CD7058'],

  accentTerracotta: '#D66D52',
  accentSage: '#8EAFA1',
  accentLavender: '#CFCEF5',
  accentPeach: '#FAD5C0',
  accentButter: '#F7E5A9',

  cardHeroBg: '#8EAFA1',
  cardHeroBtn: '#D66D52',
  cardBreatheBg: '#8EAFA1',
  cardMeditateBg: '#CFCEF5',
  cardSoundsBg: '#E68B74',

  navActive: '#14221A',
  navInactive: '#7C8E84',
  navBackground: '#FFFFFF',
  navBorder: '#E6DECF',

  statsSessionsBg: '#F8E8B6',
  statsSessionsText: '#2C220E',
  statsSessionsIcon: '#96791E',
  statsMinutesBg: '#FCD8C4',
  statsMinutesText: '#3B1E12',
  statsMinutesIcon: '#AC5F3A',

  iconBtnBg: '#FFFFFF',
  iconBtnBorder: '#E6DECF',
};

export const darkColors: ThemeColors = {
  background: '#0B131A', // Deep night navy-teal
  surface: '#111D25',
  surfaceElevated: '#172732',
  surfaceBorder: '#203442',
  primary: '#FFFFFF',
  primaryLight: '#8CD5B4',
  primaryMuted: '#14252D',
  secondary: '#ADC7BA',
  textPrimary: '#FFFFFF',
  textSecondary: '#D8E8E0',
  textMuted: '#809E90',
  accentGreen: '#4ADE80',
  accentRed: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.55)',

  glassSurface: 'rgba(17, 29, 37, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.16)',
  glassTextSecondary: '#D8E8E0',

  bgGradient: ['#0B131A', '#0F1A24', '#152431'],
  scrimGradient: ['rgba(11, 19, 26, 0.70)', 'rgba(11, 19, 26, 0.92)'],
  cardHeroGradient: ['#1C372D', '#132820'],
  cardBreatheGradient: ['#1E3A2F', '#152C23'],
  cardMeditateGradient: ['#28234D', '#1A1736'],
  cardSoundsGradient: ['#48231B', '#32150E'],

  accentTerracotta: '#E07A5F',
  accentSage: '#76A691',
  accentLavender: '#8D8AC9',
  accentPeach: '#E29775',
  accentButter: '#E6C665',

  cardHeroBg: '#1C372D',
  cardHeroBtn: '#E07A5F',
  cardBreatheBg: '#1E3A2F',
  cardMeditateBg: '#28234D',
  cardSoundsBg: '#48231B',

  navActive: '#FFFFFF',
  navInactive: '#769485',
  navBackground: '#0F1A24',
  navBorder: '#203442',

  statsSessionsBg: '#2A2412',
  statsSessionsText: '#FDE68A',
  statsSessionsIcon: '#F59E0B',
  statsMinutesBg: '#2F1B15',
  statsMinutesText: '#FFEDD5',
  statsMinutesIcon: '#F97316',

  iconBtnBg: 'rgba(255, 255, 255, 0.10)',
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
  xl: 20,
  xxl: 26,
  huge: 32,
  full: 9999,
};

export const typography = {
  hero: {
    fontSize: 34,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 42,
    letterSpacing: -0.3,
  },
  header: {
    fontSize: 26,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  subheader: {
    fontSize: 20,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'serif',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    fontFamily: 'sans-serif',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '700' as const,
    fontFamily: 'sans-serif',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontFamily: 'sans-serif',
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'sans-serif',
    lineHeight: 15,
  },
};
