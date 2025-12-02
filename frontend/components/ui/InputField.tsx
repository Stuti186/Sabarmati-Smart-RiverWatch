/**
 * InputField Component
 * Premium modern input field with high contrast and proper alignment
 * Updated for 2024/2025 design system
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Modern color constants for high contrast
const INPUT_COLORS = {
  // Background
  bgDefault: '#FFFFFF',
  bgFocused: '#FFFFFF',
  // Border
  borderDefault: '#E2E8F0',
  borderFocused: '#3B82F6',
  borderError: '#EF4444',
  // Text
  textPrimary: '#1E293B',
  textPlaceholder: '#94A3B8',
  textLabel: '#334155',
  textError: '#EF4444',
  textHelper: '#64748B',
  // Icon
  iconDefault: '#94A3B8',
  iconFocused: '#3B82F6',
  // Shadow
  shadowColor: '#1E3A8A',
};

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'glass';
}

export default function InputField({
  label,
  icon,
  error,
  helperText,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  style,
  ...textInputProps
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Container */}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {/* Left Icon */}
        {icon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? INPUT_COLORS.iconFocused : INPUT_COLORS.iconDefault}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.textInput,
            !icon && styles.textInputNoLeftIcon,
            rightIcon && styles.textInputWithRightIcon,
            style,
          ]}
          placeholderTextColor={INPUT_COLORS.textPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {/* Right Icon (e.g., password toggle) */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={22}
              color={INPUT_COLORS.iconDefault}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Text */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0, // Let parent control spacing
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: INPUT_COLORS.textLabel,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_COLORS.bgDefault,
    borderWidth: 1.5,
    borderColor: INPUT_COLORS.borderDefault,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: INPUT_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: INPUT_COLORS.borderFocused,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperError: {
    borderColor: INPUT_COLORS.borderError,
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: INPUT_COLORS.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 18 : 14,
    paddingLeft: 12,
    paddingRight: 16,
  },
  textInputNoLeftIcon: {
    paddingLeft: 18,
  },
  textInputWithRightIcon: {
    paddingRight: 50, // Extra space for right icon
  },
  rightIconContainer: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: INPUT_COLORS.textError,
    marginTop: 6,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
    color: INPUT_COLORS.textHelper,
    marginTop: 6,
    marginLeft: 4,
  },
});
