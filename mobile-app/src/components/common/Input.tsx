/**
 * Input Component (Premium)
 * 
 * A reusable text input component with a minimalist design and premium focus states.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { theme } from '../../config/theme';

 
// Types
 

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

 
// Component
 

export function Input({
  label,
  error,
  helperText,
  rightElement,
  containerStyle,
  disabled = false,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useState(new Animated.Value(0))[0];
  const hasError = !!error;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border.primary, theme.colors.primary.main],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || rightElement) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {rightElement}
        </View>
      )}
      
      <Animated.View style={[
        styles.inputWrapper,
        { borderColor: hasError ? theme.colors.status.error : borderColor },
        isFocused && styles.inputWrapperFocused,
        disabled && styles.inputWrapperDisabled,
      ]}>
        <TextInput
          style={[
            styles.input,
            disabled && styles.inputDisabled,
            style,
          ]}
          placeholderTextColor={theme.colors.text.tertiary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
      </Animated.View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

 
// Styles
 

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 4,
  },
  
  inputWrapper: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
  },
  
  inputWrapperFocused: {
    backgroundColor: theme.colors.background.tertiary,
  },
  
  inputWrapperError: {
    borderColor: theme.colors.status.error,
  },
  
  inputWrapperDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.background.primary,
  },
  
  input: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  inputDisabled: {
    color: theme.colors.text.tertiary,
  },
  
  helperText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginLeft: 4,
  },
  
  errorText: {
    color: theme.colors.status.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
