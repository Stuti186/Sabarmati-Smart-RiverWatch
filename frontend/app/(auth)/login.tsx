/**
 * LoginScreen
 * Premium modern login screen with clean blue theme
 * Fully polished for 2024/2025 design standards
 */

import { InputField } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail, validatePassword } from '@/utils/validation';
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
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  buttonGradientStart: '#3B82F6',
  buttonGradientEnd: '#2563EB',
  // Text
  textWhite: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLink: '#3B82F6',
  // Card
  cardBg: '#FFFFFF',
  cardShadow: '#1E3A8A',
  // Dev button
  devBg: 'rgba(59, 130, 246, 0.08)',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      const validation = validateEmail(text);
      setEmailError(validation.error || '');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      const validation = validatePassword(text);
      setPasswordError(validation.error || '');
    }
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      return;
    }

    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  const handleQuickDevLogin = () => {
    login('test@example.com', 'test123456').catch((err: any) =>
      Alert.alert('Login Failed', err.message)
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
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
            {/* Logo Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  <Ionicons name="water" size={52} color={COLORS.textWhite} />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Smart River Watch</Text>
            <Text style={styles.subtitle}>Sabarmati Riverfront Monitoring</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.formCard}
          >
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

            {/* Password Input */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(400)}
              style={styles.inputWrapper}
            >
              <InputField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                error={passwordError}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            </Animated.View>

            {/* Forgot Password */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(500)}
              style={styles.forgotPasswordRow}
            >
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Sign In Button */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(600)}
              style={styles.buttonWrapper}
            >
              <Pressable
                onPress={handleLogin}
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
                    <Text style={styles.primaryButtonText}>Signing in...</Text>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Quick Dev Login - Only in development */}
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.devLoginButton}
                  onPress={handleQuickDevLogin}
                  activeOpacity={0.7}
                >
                  <Ionicons name="flash" size={16} color={COLORS.textLink} />
                  <Text style={styles.devLoginText}>Quick Dev Login</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(700)}
              style={styles.bottomLinkRow}
            >
              <Text style={styles.bottomLinkText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomLink}>Sign Up</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
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
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLink,
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

  // Dev Login Button
  devLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.devBg,
    borderRadius: 14,
    gap: 8,
  },
  devLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLink,
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
