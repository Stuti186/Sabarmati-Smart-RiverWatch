/**
 * SafetyCCTVScreen
 * Modern premium CCTV grid display with fullscreen modal
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
import { useRouter } from 'expo-router';
import { CCTVFrame, FullscreenImageModal } from '@/components/ui';
import {
  generateCCTVSnapshots,
  type CCTVSnapshot,
} from '@/utils/cctvSnapshots';

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#1E293B',
  headerGradientEnd: '#0F172A',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Status colors
  active: '#22C55E',
  maintenance: '#FACC15',
  offline: '#EF4444',
  // Soft backgrounds
  softBlue: '#E0F2FE',
  emptyIcon: '#94A3B8',
};

export default function SafetyCCTVScreen() {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<CCTVSnapshot[]>(
    generateCCTVSnapshots()
  );
  const [selectedSnapshot, setSelectedSnapshot] = useState<CCTVSnapshot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setSnapshots(generateCCTVSnapshots());
      setRefreshing(false);
    }, 1000);
  };

  const handleFramePress = (snapshot: CCTVSnapshot) => {
    setSelectedSnapshot(snapshot);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedSnapshot(null), 300);
  };

  const statusCounts = {
    active: snapshots.filter((s) => s.status === 'active').length,
    offline: snapshots.filter((s) => s.status === 'offline').length,
    maintenance: snapshots.filter((s) => s.status === 'maintenance').length,
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
            <Ionicons name="videocam" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>CCTV Snapshots</Text>
            <Text style={styles.headerSubtitle}>
              {snapshots.length} camera{snapshots.length !== 1 ? 's' : ''} connected
            </Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
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
      {/* Active */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.active }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.active}</Text>
          <Text style={styles.statusLabel}>Active</Text>
        </View>
      </View>

      <View style={styles.statusDivider} />

      {/* Maintenance */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.maintenance }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.maintenance}</Text>
          <Text style={styles.statusLabel}>Maintenance</Text>
        </View>
      </View>

      <View style={styles.statusDivider} />

      {/* Offline */}
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: COLORS.offline }]} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusCount}>{statusCounts.offline}</Text>
          <Text style={styles.statusLabel}>Offline</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="videocam-off" size={56} color={COLORS.emptyIcon} />
        </View>
        <Text style={styles.emptyTitle}>No Cameras Available</Text>
        <Text style={styles.emptyText}>
          No CCTV cameras are currently active or available for viewing.
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

      {/* CCTV Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.headerGradientStart]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {snapshots.length > 0 ? (
          <View style={styles.grid}>
            {snapshots.map((snapshot, index) => (
              <Animated.View
                key={snapshot.id}
                entering={FadeInDown.duration(500).delay(100 + index * 50)}
              >
                <CCTVFrame
                  snapshot={snapshot}
                  onPress={() => handleFramePress(snapshot)}
                  delay={0}
                />
              </Animated.View>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fullscreen Modal */}
      <FullscreenImageModal
        visible={modalVisible}
        snapshot={selectedSnapshot}
        onClose={handleCloseModal}
      />
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
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
    paddingTop: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
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

  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});

