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
          
          {/* Header Section */}
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

          {/* River Health Card - Premium Design */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.healthCardContainer}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push('/(tabs)/monitor')}>
              <View style={styles.healthCard}>
                <View style={styles.healthCardGradient}>
                  
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>River Health Index</Text>
                      <Text style={styles.cardSubtitle}>Sabarmati River • Ahmedabad</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Good</Text>
                    </View>
                  </View>

                  {/* Score Display */}
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>82</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>

                  {/* Metrics Row */}
                  <View style={styles.metricsContainer}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>pH Level</Text>
                      <Text style={styles.metricValue}>7.2</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Dissolved O₂</Text>
                      <Text style={styles.metricValue}>6.5 mg/L</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Turbidity</Text>
                      <Text style={styles.metricValue}>12 NTU</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions Section */}
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
                    <View style={styles.actionCard}>
                      <View style={[styles.actionIconContainer, { backgroundColor: action.bgColor }]}>
                        <Ionicons name={action.icon as any} size={26} color={action.color} />
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

          {/* Bottom Spacing for Tab Bar */}
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileGradient: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textWhite,
  },

  // Health Card Styles
  healthCardContainer: {
    marginBottom: 28,
  },
  healthCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthCardGradient: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    color: COLORS.textWhite,
    letterSpacing: -2,
  },
  scoreMax: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 8,
  },

  // Section Styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Quick Actions Styles
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  actionButton: {
    borderRadius: 18,
  },
  actionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Alert Card Styles
  alertCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? COLORS.cardBg : 'transparent',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  alertBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  alertCardAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  alertContent: {
    padding: 18,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accentOrangeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  alertDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});
