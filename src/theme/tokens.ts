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

  // Glassmorphic & Surface tokens
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

  // Card Backgrounds
  cardHeroBg: string;
  cardHeroBtn: string;
  cardBreatheBg: string;
  cardMeditateBg: string;
  cardSoundsBg: string;

  // Navigation
  navActive: string;
  navInactive: string;
  navBackground: string;
  navBorder: string;

  // Stats
  statsSessionsBg: string;
  statsSessionsText: string;
  statsSessionsIcon: string;
  statsMinutesBg: string;
  statsMinutesText: string;
  statsMinutesIcon: string;

  // Icons & Buttons
  iconBtnBg: string;
  iconBtnBorder: string;
  accentTerracotta: string;
  accentSage: string;
  accentLavender: string;
  accentPeach: string;
  accentButter: string;
}

export const lightColors: ThemeColors = {
  background: '#FAF6EE', // Warm organic ivory mist
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E0D8CB',
  primary: '#111F18', // Deep forest charcoal - ultra high contrast
  primaryLight: '#265C43',
  primaryMuted: '#E4F0E9',
  secondary: '#2E4638',
  textPrimary: '#111F18', // Solid readable charcoal
  textSecondary: '#2E4638', // Deep slate moss - crisp & readable
  textMuted: '#587063',
  accentGreen: '#265C43',
  accentRed: '#C7513B',
  cardShadow: 'rgba(17, 31, 24, 0.06)',

  glassSurface: '#FFFFFF',
  glassBorder: '#E0D8CB',
  glassTextSecondary: '#2E4638',

  bgGradient: ['#FAF6EE', '#F2ECE0', '#E5DDD0'],
  scrimGradient: ['rgba(250, 246, 238, 0.88)', 'rgba(250, 246, 238, 0.95)'],
  cardHeroGradient: ['#6B9483', '#537C6C'],
  cardBreatheGradient: ['#E4F0E9', '#D0E3D8'],
  cardMeditateGradient: ['#E8E7FA', '#D5D4F5'],
  cardSoundsGradient: ['#FCEBE6', '#F7D6CC'],

  cardHeroBg: '#537C6C',
  cardHeroBtn: '#D66D52',
  cardBreatheBg: '#E4F0E9',
  cardMeditateBg: '#E8E7FA',
  cardSoundsBg: '#FCEBE6',

  navActive: '#111F18',
  navInactive: '#587063',
  navBackground: '#FFFFFF',
  navBorder: '#E0D8CB',

  statsSessionsBg: '#F7E7B4',
  statsSessionsText: '#2C220E',
  statsSessionsIcon: '#96791E',
  statsMinutesBg: '#FCD8C4',
  statsMinutesText: '#3B1E12',
  statsMinutesIcon: '#AC5F3A',

  iconBtnBg: '#FFFFFF',
  iconBtnBorder: '#E0D8CB',

  accentTerracotta: '#D66D52',
  accentSage: '#265C43',
  accentLavender: '#5A58A8',
  accentPeach: '#E29775',
  accentButter: '#D4AF37',
};

export const darkColors: ThemeColors = {
  background: '#0B131A', // Deep night navy-teal
  surface: '#13221B',
  surfaceElevated: '#182C23',
  surfaceBorder: 'rgba(255, 255, 255, 0.12)',
  primary: '#FFFFFF',
  primaryLight: '#8CD5B4',
  primaryMuted: '#1A3327',
  secondary: '#D8E8E0',
  textPrimary: '#FFFFFF',
  textSecondary: '#D8E8E0', // Highly legible luminous mint
  textMuted: '#8CAAA0',
  accentGreen: '#4ADE80',
  accentRed: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.40)',

  glassSurface: '#13221B',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassTextSecondary: '#D8E8E0',

  bgGradient: ['#0B131A', '#0F1A24', '#152431'],
  scrimGradient: ['rgba(11, 19, 26, 0.78)', 'rgba(11, 19, 26, 0.94)'],
  cardHeroGradient: ['#1C372D', '#132820'],
  cardBreatheGradient: ['#162E23', '#0F2119'],
  cardMeditateGradient: ['#201C3E', '#16132D'],
  cardSoundsGradient: ['#351C17', '#25120E'],

  cardHeroBg: '#1C372D',
  cardHeroBtn: '#E07A5F',
  cardBreatheBg: '#162E23',
  cardMeditateBg: '#201C3E',
  cardSoundsBg: '#351C17',

  navActive: '#FFFFFF',
  navInactive: '#8CAAA0',
  navBackground: '#112019',
  navBorder: 'rgba(255, 255, 255, 0.12)',

  statsSessionsBg: '#2A2412',
  statsSessionsText: '#FDE68A',
  statsSessionsIcon: '#F59E0B',
  statsMinutesBg: '#2F1B15',
  statsMinutesText: '#FFEDD5',
  statsMinutesIcon: '#F97316',

  iconBtnBg: 'rgba(255, 255, 255, 0.10)',
  iconBtnBorder: 'rgba(255, 255, 255, 0.18)',

  accentTerracotta: '#E07A5F',
  accentSage: '#8CD5B4',
  accentLavender: '#AEAEE8',
  accentPeach: '#E29775',
  accentButter: '#FDE68A',
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
