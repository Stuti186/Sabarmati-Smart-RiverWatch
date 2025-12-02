/**
 * MyReportsScreen
 * Modern premium user's submitted reports with status indicators
 * Updated for 2024/2025 design standards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ReportCard } from '@/components/ui';
import {
  getUserReports,
  getReportStatusColor,
  type CitizenReport,
} from '@/services/reports';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#3B82F6',
  headerGradientEnd: '#1E40AF',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Status colors
  pending: '#FACC15',
  reviewed: '#3B82F6',
  resolved: '#22C55E',
  // Card
  softBlue: '#E0F2FE',
  emptyIcon: '#94A3B8',
  primaryBlue: '#3B82F6',
};

export default function MyReportsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      if (!user) {
        setReports([]);
        setLoading(false);
        return;
      }
      const userReports = await getUserReports();
      setReports(userReports);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
  };

  const statusCounts = {
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewed: reports.filter((r) => r.status === 'reviewed').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
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
            <Ionicons name="document-text" size={24} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Reports</Text>
            <Text style={styles.headerSubtitle}>
              {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Status Summary */}
      <View style={styles.statusSummaryContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} tint="light" style={styles.statusSummaryBlur}>
            {renderStatusSummary()}
          </BlurView>
        ) : (
          <View style={styles.statusSummaryAndroid}>
            {renderStatusSummary()}
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderStatusSummary = () => (
    <View style={styles.statusSummaryRow}>
      {/* Pending */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.pending }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.pending}</Text>
          <Text style={styles.statusLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.statusDivider} />

      {/* In Review */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.reviewed }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.reviewed}</Text>
          <Text style={styles.statusLabel}>In Review</Text>
        </View>
      </View>

      <View style={styles.statusDivider} />

      {/* Resolved */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.resolved }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.resolved}</Text>
          <Text style={styles.statusLabel}>Resolved</Text>
        </View>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="document-text-outline" size={56} color={COLORS.emptyIcon} />
        </View>
        <Text style={styles.emptyTitle}>No Reports Yet</Text>
        <Text style={styles.emptyText}>
          You haven't submitted any reports yet. Submit your first report to help keep the riverfront safe and clean!
        </Text>
      </View>
    </Animated.View>
  );

  const renderAuthRequired = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.authRequiredContainer}>
        <View style={styles.authCard}>
          <View style={styles.authIconContainer}>
            <Ionicons name="lock-closed" size={56} color={COLORS.emptyIcon} />
          </View>
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authText}>Please log in to view your reports.</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  if (!user) {
    return renderAuthRequired();
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

      {/* Reports List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.primaryBlue]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          renderLoadingState()
        ) : reports.length > 0 ? (
          reports.map((report, index) => (
            <Animated.View
              key={report.id || index}
              entering={FadeInDown.duration(500).delay(100 + index * 60)}
            >
              <ReportCard report={report} delay={0} />
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
    paddingTop: 80,
    paddingBottom: 5,
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

  // Status Summary
  statusSummaryContainer: {
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusSummaryBlur: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  statusSummaryAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  statusInfo: {
    alignItems: 'flex-start',
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Loading State
  loadingContainer: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  loadingCard: {
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    marginTop: 5,
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
    backgroundColor: COLORS.softBlue,
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

  // Auth Required
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    width: '100%',
    maxWidth: 340,
  },
  authIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  authText: {
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
