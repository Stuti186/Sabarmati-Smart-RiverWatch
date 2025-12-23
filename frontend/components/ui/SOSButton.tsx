/**
 * SOS Emergency Button Component
 * One-tap SOS button with countdown and confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SOSButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export default function SOSButton({ onConfirm, disabled = false }: SOSButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isActive && countdown === 0) {
      onConfirm();
      setIsActive(false);
      setCountdown(3);
    }
  }, [isActive, countdown, onConfirm]);

  useEffect(() => {
    if (isActive) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const handlePress = () => {
    if (disabled) return;
    setIsActive(true);
    setCountdown(3);
  };

  const handleCancel = () => {
    setIsActive(false);
    setCountdown(3);
    pulseAnim.setValue(1);
  };

  return (
    <View style={styles.container}>
      {isActive ? (
        <View style={styles.countdownContainer}>
          <Animated.View
            style={[
              styles.countdownCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </Animated.View>
          <Text style={styles.countdownLabel}>SOS will trigger in...</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
          style={[styles.sosButton, disabled && styles.sosButtonDisabled]}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}>
            <Ionicons name="warning" size={32} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>Emergency</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonDisabled: {
    opacity: 0.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  sosSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});

