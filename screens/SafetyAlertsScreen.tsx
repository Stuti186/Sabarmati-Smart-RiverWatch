/**
 * SafetyAlertsScreen
 * Modern premium safety alerts display with expandable items
 * Updated for 2024/2025 design standards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ExpandableAlert } from '@/components/ui';
import { useRouter } from 'expo-router';
import {
  generateSafetyAlerts,
  getSafetySeverityColor,
  type SafetyAlert,
} from '@/utils/safetyAlerts';

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#EF4444',
  headerGradientEnd: '#DC2626',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Severity colors
  critical: '#DC2626',
  high: '#EF4444',
  moderate: '#FACC15',
  low: '#22C55E',
  // Soft backgrounds
  softBlue: '#E0F2FE',
  softGreen: '#DCFCE7',
  emptyIcon: '#94A3B8',
  success: '#22C55E',
};

export default function SafetyAlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<SafetyAlert[]>(generateSafetyAlerts());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setAlerts(generateSafetyAlerts());
      setRefreshing(false);
    }, 1000);
  };

  const severityCounts = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    moderate: alerts.filter((a) => a.severity === 'moderate').length,
    low: alerts.filter((a) => a.severity === 'low').length,
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTitleSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="shield-checkmark" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Safety Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Severity Summary */}
      <View style={styles.severitySummaryContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} tint="light" style={styles.severitySummaryBlur}>
            {renderSeveritySummary()}
          </BlurView>
        ) : (
          <View style={styles.severitySummaryAndroid}>
            {renderSeveritySummary()}
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderSeveritySummary = () => (
    <View style={styles.severitySummaryRow}>
      {/* Critical */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.critical }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.critical}</Text>
          <Text style={styles.severityLabel}>Critical</Text>
        </View>
      </View>

      <View style={styles.severityDivider} />

      {/* High */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.high }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.high}</Text>
          <Text style={styles.severityLabel}>High</Text>
        </View>
      </View>

      <View style={styles.severityDivider} />

      {/* Moderate */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.moderate }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.moderate}</Text>
          <Text style={styles.severityLabel}>Moderate</Text>
        </View>
      </View>

      <View style={styles.severityDivider} />

      {/* Low */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.low }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.low}</Text>
          <Text style={styles.severityLabel}>Low</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
        </View>
        <Text style={styles.emptyTitle}>No Active Alerts</Text>
        <Text style={styles.emptyText}>
          All safety conditions are normal. Continue monitoring for updates.
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Custom Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Header */}
      {renderHeader()}

      {/* CCTV Button */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(150)}
        style={styles.cctvButtonContainer}>
        <TouchableOpacity
          style={styles.cctvButton}
          activeOpacity={0.8}
          onPress={() => router.push('/alerts/cctv')}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cctvButtonGradient}>
            <Ionicons name="videocam" size={22} color="#FFFFFF" />
            <Text style={styles.cctvButtonText}>View CCTV Feeds</Text>
            <View style={styles.cctvLiveBadge}>
              <View style={styles.cctvLiveDot} />
              <Text style={styles.cctvLiveText}>LIVE</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Alerts List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.headerGradientEnd]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <Animated.View
              key={alert.id}
              entering={FadeInDown.duration(600).delay(index * 60)}
            >
              <ExpandableAlert alert={alert} delay={0} />
            </Animated.View>
          ))
        ) : (
          renderEmptyState()
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Custom Back Button
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // CCTV Button
  cctvButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cctvButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cctvButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  cctvButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  cctvLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  cctvLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  cctvLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Severity Summary
  severitySummaryContainer: {
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  severitySummaryBlur: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  severitySummaryAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  severitySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  severityPill: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  severityDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  severityInfo: {
    alignItems: 'center',
  },
  severityCount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  severityLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  severityDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Empty State
  emptyState: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '500',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});

