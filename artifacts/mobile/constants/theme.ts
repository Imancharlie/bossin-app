import { Platform, Dimensions } from 'react-native';

// Spacing tokens (8px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Typography tokens
export const typography = {
  // Display sizes
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Inter_700Bold',
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Inter_700Bold',
  },
  
  // Screen titles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Inter_700Bold',
  },
  titleMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'Inter_600SemiBold',
  },
  titleSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  
  // Section titles
  headingLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  headingMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  headingSmall: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  
  // Card titles
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  
  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  
  // Secondary text
  secondaryLarge: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Inter_500Medium',
  },
  secondaryMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
  secondarySmall: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Inter_500Medium',
  },
  
  // Caption
  caption: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'Inter_400Regular',
  },
  
  // Label (uppercase, small)
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
} as const;

// Border radius tokens
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Shadow tokens
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation tokens
export const animations = {
  spring: {
    tension: 80,
    friction: 8,
  },
  timing: {
    duration: 300,
  },
  fade: {
    duration: 200,
  },
  scale: {
    duration: 150,
  },
} as const;

// Icon sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
} as const;

// Touch target minimum size (accessibility)
export const touchTarget = {
  min: 44,
} as const;

// Breakpoints for responsive design
const { width, height } = Dimensions.get('window');
export const breakpoints = {
  smallPhone: 360,
  mediumPhone: 380,
  largePhone: 414,
  tablet: 768,
  isSmallPhone: width < 360,
  isMediumPhone: width >= 360 && width < 380,
  isLargePhone: width >= 380 && width < 768,
  isTablet: width >= 768,
  currentWidth: width,
  currentHeight: height,
} as const;

// Z-index tokens
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Transition tokens
export const transitions = {
  fast: 150,
  base: 300,
  slow: 500,
} as const;
