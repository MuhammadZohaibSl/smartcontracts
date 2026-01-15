/**
 * Card Component (Premium / Glassmorphism)
 * 
 * A reusable card container with support for glassmorphism and premium shadows.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../../config/theme';

 
// Types
 

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined' | 'success';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

 
// Component
 

export function Card({
  children,
  variant = 'default',
  padding = '2xl',
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: theme.spacing[padding] },
        style,
      ]}
    >
      {variant === 'glass' && <View style={styles.glassHighlight} />}
      {children}
    </View>
  );
}

 
// Styles
 

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.background.secondary,
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  
  glass: {
    backgroundColor: theme.colors.background.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  elevated: {
    borderWidth: 0,
    ...theme.shadows.lg,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  
  success: {
    borderWidth: 1,
    borderColor: theme.colors.secondary.main,
    backgroundColor: theme.colors.secondary.light,
  },
});
