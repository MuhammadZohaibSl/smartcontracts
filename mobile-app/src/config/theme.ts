/**
 * Theme Configuration
 * 
 * Centralized design tokens for consistent styling across the app.
 */

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Primary brand colors
  primary: {
    main: '#9945FF',
    light: 'rgba(153, 69, 255, 0.2)',
    dark: '#7B35D9',
  },

  // Secondary/Accent colors
  secondary: {
    main: '#14F195',
    light: 'rgba(20, 241, 149, 0.15)',
    dark: '#0FC77A',
  },

  // Background colors
  background: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    glass: 'rgba(22, 27, 34, 0.7)',
  },

  // Gradients (Represented as color pairs for use with LinearGradient components)
  gradients: {
    primary: ['#9945FF', '#14F195'] as const,
    vibrant: ['#FF00D6', '#9945FF'] as const,
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
    danger: ['#FF6B6B', '#FF8E8E'] as const,
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#8B95A8',
    tertiary: '#4A5568',
    inverse: '#0D1117',
  },

  // Status colors
  status: {
    success: '#14F195',
    warning: '#FFB800',
    error: '#FF6B6B',
    info: '#00D1FF',
  },

  // Border colors
  border: {
    primary: '#2A3142',
    secondary: '#14F195',
    error: '#FF6B6B',
  },

  // Transparent overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
};

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  fontFamily: {
    regular: 'System',
    mono: 'monospace',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// Spacing
// ============================================================================

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
};

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ============================================================================
// Animation
// ============================================================================

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// ============================================================================
// Theme Object (Combined)
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};

export type Theme = typeof theme;
