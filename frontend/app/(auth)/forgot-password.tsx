/**
 * ForgotPasswordScreen
 * Premium modern password reset screen with clean blue theme
 * Fully polished for 2024/2025 design standards
 */

import { InputField } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Premium color palette
const COLORS = {
  // Gradients
  gradientStart: '#60A5FA',
  gradientMid: '#3B82F6',
  gradientEnd: '#1E40AF',
  buttonGradientStart: '#3B82F6',
  buttonGradientEnd: '#2563EB',
  successGradientStart: '#4ADE80',
  successGradientEnd: '#22C55E',
  // Text
  textWhite: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLink: '#3B82F6',
  textMuted: '#94A3B8',
  // Card
  cardBg: '#FFFFFF',
  cardShadow: '#1E3A8A',
  // Info
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#1D4ED8',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      const validation = validateEmail(text);
      setEmailError(validation.error || '');
    }
  };

  const handleResetPassword = async () => {
    setEmailError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Please check your email for password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const renderSuccessState = () => (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.successContainer}
    >
      <View style={styles.successIconContainer}>
        <LinearGradient
          colors={[COLORS.successGradientStart, COLORS.successGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <Text style={styles.successTitle}>Email Sent!</Text>
      <Text style={styles.successText}>
        We've sent password reset instructions to
      </Text>
      <Text style={styles.successEmail}>{email}</Text>
      <Text style={styles.successSubtext}>
        Please check your inbox and follow the instructions to reset your password.
      </Text>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            style={styles.header}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
            </TouchableOpacity>

            {/* Logo Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  <Ionicons name="key" size={44} color={COLORS.textWhite} />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive reset instructions
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.formCard}
          >
            {emailSent ? (
              renderSuccessState()
            ) : (
              <>
                {/* Email Input */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(300)}
                  style={styles.inputWrapper}
                >
                  <InputField
                    label="Email Address"
                    icon="mail-outline"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={emailError}
                  />
                </Animated.View>

                {/* Info Box */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(400)}
                  style={styles.infoBox}
                >
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name="information-circle"
                      size={22}
                      color={COLORS.infoText}
                    />
                  </View>
                  <Text style={styles.infoText}>
                    We'll send you a link to reset your password
                  </Text>
                </Animated.View>

                {/* Reset Button */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(500)}
                  style={styles.buttonWrapper}
                >
                  <Pressable
                    onPress={handleResetPassword}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryButtonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryButtonGradient}
                    >
                      {loading ? (
                        <Text style={styles.primaryButtonText}>Sending...</Text>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                          <Ionicons name="send" size={18} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </>
            )}

            {/* Sign In Link */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(600)}
              style={styles.bottomLinkRow}
            >
              <Text style={styles.bottomLinkText}>Remember your password? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomLink}>Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 36,
    position: 'relative',
    paddingTop: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    marginBottom: 20,
    marginTop: 16,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoBg,
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 78, 216, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.infoText,
    lineHeight: 20,
  },
  buttonWrapper: {
    marginBottom: 24,
  },

  // Primary Button
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.buttonGradientEnd,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.successGradientEnd,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  successEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLink,
    marginBottom: 16,
  },
  successSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // Bottom Link
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bottomLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLink,
  },
});
