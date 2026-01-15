/**
 * Button Component (Premium)
 * 
 * A reusable button component with support for gradients and micro-animations.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, theme } from '../../config/theme';

 
// Types
 

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'vibrant';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  fullWidth?: boolean;
}

 
// Component
 

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  activeOpacity = 0.7,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary.main : theme.colors.text.primary} 
          size="small" 
        />
      ) : (
        <React.Fragment>
          {leftIcon}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </React.Fragment>
      )}
    </>
  );

  const Container = Animated.createAnimatedComponent(TouchableOpacity);

  if (variant === 'primary' || variant === 'vibrant') {
    const gradientColors = variant === 'vibrant' 
      ? theme.colors.gradients.vibrant 
      : theme.colors.gradients.primary;

    return (
      <Container
        activeOpacity={activeOpacity}
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled ? [theme.colors.text.tertiary, theme.colors.text.tertiary] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            styles[`${size}Size`],
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </Container>
    );
  }

  return (
    <Container
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        styles[variant],
        styles[`${size}Size`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {renderContent()}
    </Container>
  );
}

 
// Styles
 

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  
  // Variants (Non-gradient)
  secondary: {
    backgroundColor: theme.colors.secondary.light,
    borderWidth: 1,
    borderColor: theme.colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  danger: {
    backgroundColor: theme.colors.status.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  smSize: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
  },
  mdSize: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 52,
  },
  lgSize: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    minHeight: 64,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  text: {
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Text variants
  primaryText: { color: theme.colors.text.primary },
  vibrantText: { color: theme.colors.text.primary },
  secondaryText: { color: theme.colors.secondary.main },
  outlineText: { color: theme.colors.primary.main },
  dangerText: { color: theme.colors.text.primary },
  ghostText: { color: theme.colors.primary.main },
  
  // Text sizes
  smText: { fontSize: theme.typography.fontSize.sm },
  mdText: { fontSize: theme.typography.fontSize.lg },
  lgText: { fontSize: theme.typography.fontSize.xl },
  
  disabledText: {
    color: theme.colors.text.tertiary,
  },
});
