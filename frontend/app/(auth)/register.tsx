/**
 * RegisterScreen
 * Premium modern sign up screen with clean green theme
 * Fully polished for 2024/2025 design standards
 */

import { InputField } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from '@/utils/validation';
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
  gradientStart: '#4ADE80',
  gradientMid: '#22C55E',
  gradientEnd: '#16A34A',
  buttonGradientStart: '#22C55E',
  buttonGradientEnd: '#16A34A',
  // Text
  textWhite: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLink: '#3B82F6',
  // Card
  cardBg: '#FFFFFF',
  cardShadow: '#166534',
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) {
      const validation = validateName(text);
      setNameError(validation.error || '');
    }
  };

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
    if (confirmPassword) {
      const confirmValidation = validateConfirmPassword(text, confirmPassword);
      setConfirmPasswordError(confirmValidation.error || '');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      const validation = validateConfirmPassword(password, text);
      setConfirmPasswordError(validation.error || '');
    }
  };

  const handleRegister = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || '');
      return;
    }

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      return;
    }

    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.error || '');
      return;
    }

    try {
      await register(email, password);
      Alert.alert(
        'Success',
        'Account created successfully! You are now signed in.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    }
  };

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
                  <Ionicons name="person-add" size={44} color={COLORS.textWhite} />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Smart River Watch</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.formCard}
          >
            {/* Name Input */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(300)}
              style={styles.inputWrapper}
            >
              <InputField
                label="Full Name"
                icon="person-outline"
                placeholder="Enter your full name"
                value={name}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                autoComplete="name"
                error={nameError}
              />
            </Animated.View>

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(350)}
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
                placeholder="Create a password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                error={passwordError}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                helperText="Must be at least 6 characters"
              />
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(450)}
              style={styles.inputWrapper}
            >
              <InputField
                label="Confirm Password"
                icon="lock-closed-outline"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                error={confirmPasswordError}
                rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </Animated.View>

            {/* Create Account Button */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(500)}
              style={styles.buttonWrapper}
            >
              <Pressable
                onPress={handleRegister}
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
                    <Text style={styles.primaryButtonText}>Creating Account...</Text>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Create Account</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Sign In Link */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(550)}
              style={styles.bottomLinkRow}
            >
              <Text style={styles.bottomLinkText}>Already have an account? </Text>
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
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
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
    marginBottom: 6,
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
    paddingTop: 26,
    paddingBottom: 22,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 8,
    marginBottom: 20,
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
