/**
 * DashboardScreen
 * Modern premium dashboard with blue gradient theme
 */

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SOSButton from '@/components/ui/SOSButton';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesignSystem } from '@/theme/designSystem';

const { width } = Dimensions.get('window');

// Modern Blue Color Palette
const COLORS = {
  // Primary blues
  primaryDark: '#1E3A8A',
  primaryMid: '#2563EB',
  primaryLight: '#3B82F6',
  primaryBright: '#60A5FA',
  
  // Gradient blues
  gradientStart: '#38BDF8',
  gradientMid: '#3B82F6',
  gradientEnd: '#1E3A8A',
  
  // Soft backgrounds
  softBlue: '#E0F2FE',
  softBlueMid: '#BAE6FD',
  background: '#F0F9FF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  
  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Accent colors (soft tones)
  accentRed: '#F87171',
  accentRedBg: '#FEE2E2',
  accentOrange: '#FB923C',
  accentOrangeBg: '#FFEDD5',
  accentGreen: '#4ADE80',
  accentGreenBg: '#DCFCE7',
  accentBlue: '#60A5FA',
  accentBlueBg: '#DBEAFE',
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const quickActions = [
    {
      id: 'report',
      title: 'Report Issue',
      icon: 'camera-outline',
      color: COLORS.accentRed,
      bgColor: COLORS.accentRedBg,
      route: '/submit-report',
    },
    {
      id: 'alerts',
      title: 'Flood Alerts',
      icon: 'warning-outline',
      color: COLORS.accentOrange,
      bgColor: COLORS.accentOrangeBg,
      route: '/alerts/flood',
    },
    {
      id: 'safety',
      title: 'Safety Alerts',
      icon: 'shield-checkmark-outline',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      route: '/alerts/safety',
    },
    {
      id: 'upload',
      title: 'AI Waste Scan',
      icon: 'scan-outline',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      route: '/(tabs)/reports/upload',
    },
    {
      id: 'map',
      title: 'View Map',
      icon: 'map-outline',
      color: COLORS.primaryMid,
      bgColor: COLORS.accentBlueBg,
      route: '/(tabs)/map',
    },
    {
      id: 'cctv',
      title: 'CCTV Feed',
      icon: 'videocam-outline',
      color: '#475569',
      bgColor: '#F1F5F9',
      route: '/alerts/cctv',
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      icon: 'people-outline',
      color: COLORS.accentGreen,
      bgColor: COLORS.accentGreenBg,
      route: '/(tabs)/profile/volunteer',
    },
    {
      id: 'awareness',
      title: 'Awareness',
      icon: 'book-outline',
      color: '#0EA5E9',
      bgColor: '#E0F2FE',
      route: '/awareness',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Premium Blue Gradient Background */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.textWhite}
            />
          }>
          
          {/* Header Section - Fixed spacing */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100)}
            style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>
                {user?.displayName || 'River Guardian'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primaryBright, COLORS.primaryMid]}
                style={styles.profileGradient}>
                <Text style={styles.profileInitials}>
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* SOS Emergency Button - Centered */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(150)}
            style={styles.sosContainer}>
            <View style={styles.sosWrapper}>
              <SOSButton
                onConfirm={async () => {
                  router.push('/emergency');
                }}
              />
            </View>
          </Animated.View>

          {/* River Health Card - Redesigned */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.healthCardContainer}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push('/(tabs)/monitor')}>
              <View style={styles.healthCard}>
                <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint="light" style={styles.healthCardBlur}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                    style={styles.healthCardGradient}>
                    
                    {/* Card Header - Title and Status in one line */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardTitle}>River Health Index</Text>
                        <Text style={styles.cardSubtitle}>Sabarmati River · Ahmedabad</Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Good</Text>
                      </View>
                    </View>

                    {/* Score Display - Improved typography */}
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreValue}>82</Text>
                      <Text style={styles.scoreMax}>/100</Text>
                    </View>

                    {/* Metrics Row - Equal width, better spacing */}
                    <View style={styles.metricsContainer}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>pH Level</Text>
                        <Text style={styles.metricValue}>7.2</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Dissolved O₂</Text>
                        <Text style={styles.metricValue}>6.5</Text>
                        <Text style={styles.metricUnit}>mg/L</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Turbidity</Text>
                        <Text style={styles.metricValue}>12</Text>
                        <Text style={styles.metricUnit}>NTU</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions Section - Improved grid */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.id}
                  entering={FadeInUp.duration(400).delay(350 + index * 80)}
                  style={styles.actionWrapper}>
                  <TouchableOpacity
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.85}
                    style={styles.actionButton}>
                    <View style={[styles.actionCard, { backgroundColor: COLORS.cardBg }]}>
                      <View style={[styles.actionIconContainer, { backgroundColor: action.bgColor }]}>
                        <Ionicons name={action.icon as any} size={28} color={action.color} />
                      </View>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Recent Alerts Section */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(550)}
            style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <View style={styles.alertCard}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={80} tint="light" style={styles.alertBlur}>
                  <AlertContent />
                </BlurView>
              ) : (
                <View style={styles.alertCardAndroid}>
                  <AlertContent />
                </View>
              )}
            </View>
          </Animated.View>

          {/* Bottom Spacing for Tab Bar - Increased padding */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Alert Content Component
function AlertContent() {
  return (
    <View style={styles.alertContent}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons name="rainy" size={22} color={COLORS.accentOrange} />
        </View>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>Heavy Rainfall Warning</Text>
          <Text style={styles.alertTime}>2 hours ago</Text>
        </View>
      </View>
      <Text style={styles.alertDescription}>
        Heavy rainfall predicted in catchment areas. Water levels may rise by 2-3 meters in the next 24 hours.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignSystem.spacing.screenPadding,
    paddingTop: Platform.OS === 'ios' ? DesignSystem.spacing.xxxl : DesignSystem.spacing.xxl,
    paddingBottom: 120, // Extra padding for tab bar
  },

  // Header Styles - Fixed spacing
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxl,
    paddingTop: Platform.OS === 'ios' ? DesignSystem.spacing.md : DesignSystem.spacing.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: DesignSystem.spacing.xs,
    letterSpacing: DesignSystem.typography.letterSpacing.wide,
  },
  userName: {
    fontSize: DesignSystem.typography.sizes.xxxl,
    fontWeight: DesignSystem.typography.weights.bold,
    color: COLORS.textWhite,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: DesignSystem.radius.avatar / 2,
    ...DesignSystem.shadows.md,
  },
  profileGradient: {
    flex: 1,
    borderRadius: DesignSystem.radius.avatar / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  profileInitials: {
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.bold,
    color: COLORS.textWhite,
  },

  // SOS Button Styles - Centered
  sosContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxl,
    marginTop: DesignSystem.spacing.lg,
  },
  sosWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Health Card Styles - Redesigned
  healthCardContainer: {
    marginBottom: DesignSystem.spacing.xxl,
  },
  healthCard: {
    borderRadius: DesignSystem.radius.xxl,
    overflow: 'hidden',
    ...DesignSystem.shadows.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthCardBlur: {
    borderRadius: DesignSystem.radius.xxl,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  },
  healthCardGradient: {
    padding: DesignSystem.spacing.xxl,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.lg,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  cardTitle: {
    fontSize: DesignSystem.typography.sizes.xxl,
    fontWeight: DesignSystem.typography.weights.bold,
    color: COLORS.textWhite,
    marginBottom: DesignSystem.spacing.xs,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  cardSubtitle: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: DesignSystem.typography.letterSpacing.normal,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: DesignSystem.spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginRight: DesignSystem.spacing.xs,
  },
  statusText: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: COLORS.textWhite,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignSystem.spacing.xxl,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: DesignSystem.typography.weights.extrabold,
    color: COLORS.textWhite,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: 80,
  },
  scoreMax: {
    fontSize: DesignSystem.typography.sizes.xxl,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: DesignSystem.spacing.xs,
    lineHeight: 28,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: DesignSystem.typography.letterSpacing.wider,
  },
  metricValue: {
    fontSize: DesignSystem.typography.sizes.base,
    fontWeight: DesignSystem.typography.weights.bold,
    color: COLORS.textWhite,
    lineHeight: 20,
  },
  metricUnit: {
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: DesignSystem.spacing.sm,
  },

  // Section Styles
  sectionContainer: {
    marginBottom: DesignSystem.spacing.xxl,
    marginTop: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    color: COLORS.textWhite,
    marginBottom: DesignSystem.spacing.lg,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },

  // Quick Actions Styles - Responsive grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -DesignSystem.spacing.xs,
  },
  actionWrapper: {
    width: width < 375 ? '50%' : '33.333%', // 2 columns on small, 3 on larger
    paddingHorizontal: DesignSystem.spacing.xs,
    marginBottom: DesignSystem.spacing.md,
  },
  actionButton: {
    borderRadius: DesignSystem.radius.button,
    overflow: 'hidden',
  },
  actionCard: {
    height: 110,
    borderRadius: DesignSystem.radius.button,
    padding: DesignSystem.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  actionTitle: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Alert Card Styles
  alertCard: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? COLORS.cardBg : 'transparent',
    ...DesignSystem.shadows.md,
  },
  alertBlur: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  alertCardAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  alertContent: {
    padding: DesignSystem.spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: DesignSystem.radius.md,
    backgroundColor: COLORS.accentOrangeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: DesignSystem.typography.sizes.base,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    color: COLORS.textMuted,
  },
  alertDescription: {
    fontSize: DesignSystem.typography.sizes.md,
    fontWeight: DesignSystem.typography.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: DesignSystem.typography.lineHeights.relaxed * DesignSystem.typography.sizes.md,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: DesignSystem.spacing.xxxl,
  },
});
