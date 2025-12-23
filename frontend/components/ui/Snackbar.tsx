/**
 * Snackbar Component
 * Non-blocking notification for offline mode and errors
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  action?: {
    label: string;
    onPress: () => void;
  };
  onDismiss?: () => void;
  duration?: number;
}

const COLORS = {
  info: { bg: '#3B82F6', text: '#FFFFFF' },
  warning: { bg: '#F59E0B', text: '#FFFFFF' },
  error: { bg: '#EF4444', text: '#FFFFFF' },
  success: { bg: '#22C55E', text: '#FFFFFF' },
};

export default function Snackbar({
  visible,
  message,
  type = 'info',
  action,
  onDismiss,
  duration = 4000,
}: SnackbarProps) {
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const colors = COLORS[type];
  const iconName =
    type === 'info'
      ? 'information-circle'
      : type === 'warning'
      ? 'warning'
      : type === 'error'
      ? 'close-circle'
      : 'checkmark-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <View style={[styles.snackbar, { backgroundColor: colors.bg }]}>
        <Ionicons name={iconName} size={20} color={colors.text} />
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 16,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 48,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});

