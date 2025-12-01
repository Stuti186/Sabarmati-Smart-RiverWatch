/**
 * ProfileScreen
 * Modern premium profile and settings screen
 * Updated to match the 2024/2025 design system
 */

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// Modern Color Palette (consistent with other screens)
const COLORS = {
  // Background gradients
  bgGradientStart: '#E0F2FE',
  bgGradientMid: '#F0F9FF',
  bgGradientEnd: '#FFFFFF',
  // Card colors
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  // Primary blue
  primaryBlue: '#3B82F6',
  primaryBlueDark: '#2563EB',
  primaryBlueLight: '#60A5FA',
  avatarBg: '#EFF6FF',
  avatarBorder: '#BFDBFE',
  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  // Status colors
  verifiedBg: '#D1FAE5',
  verifiedBorder: '#A7F3D0',
  verifiedText: '#16A34A',
  verifiedIcon: '#22C55E',
  unverifiedBg: '#FEF3C7',
  unverifiedBorder: '#FDE68A',
  unverifiedText: '#D97706',
  unverifiedIcon: '#F59E0B',
  // Logout button
  logoutGradientStart: '#EF4444',
  logoutGradientEnd: '#DC2626',
  // Shadows
  shadowColor: '#1E3A8A',
  shadowLight: 'rgba(30, 58, 138, 0.08)',
  // Accent colors
  purple: '#8B5CF6',
  green: '#22C55E',
};

export default function ProfileScreen() {
  const { user, logout, loading, isDevMode } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation to Login is handled by root layout protection
            } catch (error: any) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const renderProfileCard = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.cardContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={85} tint="light" style={styles.cardBlur}>
          {renderProfileContent()}
        </BlurView>
      ) : (
        <View style={styles.cardAndroid}>
          {renderProfileContent()}
        </View>
      )}
    </Animated.View>
  );

  const renderProfileContent = () => (
    <View style={styles.cardContent}>
      {/* Dev Mode Badge */}
      {isDevMode && (
        <View style={styles.devModeBadge}>
          <Ionicons name="code-slash" size={12} color={COLORS.purple} />
          <Text style={styles.devModeText}>DEV MODE</Text>
        </View>
      )}

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <LinearGradient
          colors={[COLORS.primaryBlueLight, COLORS.primaryBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarGradient}
        >
          <View style={styles.avatarInner}>
            <Ionicons name="person" size={48} color={COLORS.primaryBlue} />
          </View>
        </LinearGradient>
        
        {/* Online indicator */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* User Info */}
      <View style={styles.userInfoSection}>
        <Text style={styles.userName}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'No email'}
        </Text>
        <Text style={styles.userId}>
          ID: {user?.uid ? `${user.uid.slice(0, 12)}...` : 'N/A'}
        </Text>
      </View>

      {/* Verification Badge */}
      {user?.emailVerified ? (
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.verifiedIcon} />
          <Text style={styles.verifiedText}>Email Verified</Text>
        </View>
      ) : (
        <View style={styles.unverifiedBadge}>
          <Ionicons name="alert-circle" size={16} color={COLORS.unverifiedIcon} />
          <Text style={styles.unverifiedText}>Email Not Verified</Text>
        </View>
      )}
    </View>
  );

  const renderLogoutButton = () => (
    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.logoutSection}>
      <Pressable
        onPress={handleLogout}
        disabled={loading}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
      >
        <LinearGradient
          colors={[COLORS.logoutGradientStart, COLORS.logoutGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  const renderInfoCards = () => (
    <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.infoCardsSection}>
      {/* My Rewards Card */}
      <Pressable 
        style={styles.infoCard}
        onPress={() => router.push('/(tabs)/profile/rewards')}
      >
        <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
          <Ionicons name="trophy-outline" size={22} color={COLORS.purple} />
        </View>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>My Rewards</Text>
          <Text style={styles.infoCardSubtitle}>View your points & level</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Pressable>

      {/* Volunteer Events Card */}
      <Pressable 
        style={styles.infoCard}
        onPress={() => router.push('/(tabs)/profile/volunteer')}
      >
        <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
          <Ionicons name="people-outline" size={22} color={COLORS.green} />
        </View>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>Volunteer Events</Text>
          <Text style={styles.infoCardSubtitle}>Join cleanup activities</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Pressable>

      {/* My Reports Card */}
      <Pressable 
        style={styles.infoCard}
        onPress={() => router.push('/(tabs)/reports/my-reports')}
      >
        <View style={styles.infoCardIcon}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.primaryBlue} />
        </View>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>My Reports</Text>
          <Text style={styles.infoCardSubtitle}>View submitted reports</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Pressable>

      {/* Account Settings Card */}
      <Pressable 
        style={styles.infoCard}
        onPress={() => Alert.alert(
          'Account Settings',
          'Account settings will be available in the next update.\n\n• Change password\n• Update email\n• Privacy settings\n• Notification preferences',
          [{ text: 'OK' }]
        )}
      >
        <View style={styles.infoCardIcon}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primaryBlue} />
        </View>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>Account Settings</Text>
          <Text style={styles.infoCardSubtitle}>Manage your preferences</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Pressable>

      {/* About App Card */}
      <Pressable 
        style={styles.infoCard}
        onPress={() => Alert.alert(
          'Smart River Watch',
          'Version 1.0.0\n\nSabarmati Riverfront Monitoring App\n\nBuilt for Smart India Hackathon 2024\n\n© 2024 Smart River Watch Team',
          [{ text: 'OK' }]
        )}
      >
        <View style={styles.infoCardIcon}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primaryBlue} />
        </View>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>About App</Text>
          <Text style={styles.infoCardSubtitle}>Version 1.0.0</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.bgGradientStart, COLORS.bgGradientMid, COLORS.bgGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>

        {/* Profile Card */}
        {renderProfileCard()}

        {/* Info Cards */}
        {renderInfoCards()}

        {/* Logout Button */}
        {renderLogoutButton()}

        {/* Bottom Spacing for Nav Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Profile Card
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBlur: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  cardAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardContent: {
    padding: 28,
    alignItems: 'center',
  },

  // Dev Mode Badge
  devModeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  devModeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 0.5,
  },

  // Avatar
  avatarSection: {
    marginBottom: 20,
    position: 'relative',
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 4,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: COLORS.avatarBg,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  // User Info
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  userId: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Verification Badges
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.verifiedBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.verifiedBorder,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.verifiedText,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.unverifiedBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.unverifiedBorder,
  },
  unverifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.unverifiedText,
  },

  // Info Cards Section
  infoCardsSection: {
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  infoCardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Logout Section
  logoutSection: {
    marginBottom: 20,
  },
  logoutButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.logoutGradientEnd,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});

