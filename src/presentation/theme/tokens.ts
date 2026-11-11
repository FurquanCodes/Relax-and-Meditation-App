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
  surfaceBorder: '#D6E4DC',
  primary: '#0F1D15', // Deep forest charcoal - ultra high contrast
  primaryLight: '#265C43',
  primaryMuted: '#E4F0E9',
  secondary: '#1E3528',
  textPrimary: '#0F1D15', // Solid readable charcoal (WCAG AAA)
  textSecondary: '#1E3528', // Deep slate moss - crisp & readable
  textMuted: '#3D5A4A', // High contrast readable muted forest
  accentGreen: '#265C43',
  accentRed: '#C7513B',
  cardShadow: 'rgba(15, 29, 21, 0.05)',

  glassSurface: '#FFFFFF',
  glassBorder: '#D6E4DC',
  glassTextSecondary: '#1E3528',

  bgGradient: ['#FAF6EE', '#F2ECE0', '#E5DDD0'],
  scrimGradient: ['rgba(250, 246, 238, 0.92)', 'rgba(250, 246, 238, 0.96)'],
  cardHeroGradient: ['#5E8574', '#456B5B'],
  cardBreatheGradient: ['#E4F0E9', '#D0E3D8'],
  cardMeditateGradient: ['#E8E7FA', '#D5D4F5'],
  cardSoundsGradient: ['#FCEBE6', '#F7D6CC'],

  cardHeroBg: '#456B5B',
  cardHeroBtn: '#D66D52',
  cardBreatheBg: '#E4F0E9',
  cardMeditateBg: '#E8E7FA',
  cardSoundsBg: '#FCEBE6',

  navActive: '#0F1D15',
  navInactive: '#4E6B5A',
  navBackground: '#FFFFFF',
  navBorder: '#D6E4DC',

  statsSessionsBg: '#F7E7B4',
  statsSessionsText: '#1A1508',
  statsSessionsIcon: '#856915',
  statsMinutesBg: '#FCD8C4',
  statsMinutesText: '#25120B',
  statsMinutesIcon: '#964E2A',

  iconBtnBg: '#FFFFFF',
  iconBtnBorder: '#D6E4DC',

  accentTerracotta: '#D66D52',
  accentSage: '#265C43',
  accentLavender: '#5A58A8',
  accentPeach: '#E29775',
  accentButter: '#D4AF37',
};

export const darkColors: ThemeColors = {
  background: '#09090B', // Pitch dark obsidian black
  surface: '#141418', // Sleek dark charcoal surface (replaces forest green)
  surfaceElevated: '#1C1C22',
  surfaceBorder: 'rgba(255, 255, 255, 0.10)',
  primary: '#FFFFFF',
  primaryLight: '#E2E2EA',
  primaryMuted: '#22222A',
  secondary: '#D0D0DA',
  textPrimary: '#FFFFFF',
  textSecondary: '#C8C8D4', // Crisp light silver
  textMuted: '#8E8E98', // Neutral soft graphite
  accentGreen: '#34D399',
  accentRed: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.60)',

  glassSurface: '#141418',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassTextSecondary: '#C8C8D4',

  bgGradient: ['#09090B', '#0E0E12', '#141418'],
  scrimGradient: ['rgba(9, 9, 11, 0.90)', 'rgba(9, 9, 11, 0.96)'],
  cardHeroGradient: ['#222228', '#141418'],
  cardBreatheGradient: ['#1C1E22', '#141518'],
  cardMeditateGradient: ['#1E1C28', '#14131C'],
  cardSoundsGradient: ['#241C1A', '#181312'],

  cardHeroBg: '#18181D',
  cardHeroBtn: '#E07A5F',
  cardBreatheBg: '#18181D',
  cardMeditateBg: '#1A1824',
  cardSoundsBg: '#201816',

  navActive: '#FFFFFF',
  navInactive: '#8E8E98',
  navBackground: '#101014', // Pure deep black capsule
  navBorder: 'rgba(255, 255, 255, 0.10)',

  statsSessionsBg: '#1C1A14',
  statsSessionsText: '#FDE68A',
  statsSessionsIcon: '#F59E0B',
  statsMinutesBg: '#221614',
  statsMinutesText: '#FFEDD5',
  statsMinutesIcon: '#F97316',

  iconBtnBg: 'rgba(255, 255, 255, 0.08)',
  iconBtnBorder: 'rgba(255, 255, 255, 0.14)',

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
