/**
 * WasteFeedScreen
 * Modern premium waste detection feed with AI-powered monitoring
 * Updated to match the modern blue-themed design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { WasteCard } from '@/components/ui';
import { useRouter } from 'expo-router';
import { generateWasteDetections, type WasteDetection } from '@/utils/wasteData';

const { width } = Dimensions.get('window');

// Modern Blue Color Palette (consistent with other screens)
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#1E3A8A',
  headerGradientStart: '#38BDF8',
  headerGradientEnd: '#2563EB',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  // Severity colors
  severityHigh: '#EF4444',
  severityHighBg: 'rgba(239, 68, 68, 0.12)',
  severityMedium: '#FACC15',
  severityMediumBg: 'rgba(250, 204, 21, 0.15)',
  severityLow: '#22C55E',
  severityLowBg: 'rgba(34, 197, 94, 0.12)',
  // Info card
  infoBg: '#E0F2FE',
  infoBorder: 'rgba(56, 189, 248, 0.3)',
  infoIcon: '#0EA5E9',
};

export default function WasteFeedScreen() {
  const router = useRouter();
  const [wasteDetections, setWasteDetections] = useState<WasteDetection[]>(
    generateWasteDetections()
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setWasteDetections(generateWasteDetections());
      setRefreshing(false);
    }, 1000);
  };

  // Count by severity
  const severityCounts = {
    low: wasteDetections.filter((w) => w.severity === 'low').length,
    medium: wasteDetections.filter((w) => w.severity === 'medium').length,
    high: wasteDetections.filter((w) => w.severity === 'high').length,
  };

  const renderHeaderCard = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
      {/* Header Card with Gradient */}
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        {/* Title Section */}
        <View style={styles.headerTitleSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="trash-bin" size={24} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Waste Detection Feed</Text>
            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>AI-powered waste monitoring</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{wasteDetections.length} detections</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Severity Summary Bar */}
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
      {/* High Severity */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.severityHigh }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.high}</Text>
          <Text style={styles.severityLabel}>High</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.severityDivider} />

      {/* Medium Severity */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.severityMedium }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.medium}</Text>
          <Text style={styles.severityLabel}>Medium</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.severityDivider} />

      {/* Low Severity */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.severityLow }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.low}</Text>
          <Text style={styles.severityLabel}>Low</Text>
        </View>
      </View>
    </View>
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

      {/* Header Section */}
      {renderHeaderCard()}

      {/* Quick Actions */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(150)}
        style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/reports/upload')}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="scan" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.actionButtonText} numberOfLines={1} ellipsizeMode="tail">
            AI Upload
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/reports/my-reports')}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.actionButtonText} numberOfLines={1} ellipsizeMode="tail">
            My Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/reports/trends')}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="trending-up" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.actionButtonText} numberOfLines={1} ellipsizeMode="tail">
            Trends
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Horizontal Scroll Feed */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.headerGradientEnd]}
          />
        }
      >
        {wasteDetections.map((waste, index) => (
          <WasteCard
            key={waste.id}
            imageUrl={waste.imageUrl}
            severity={waste.severity}
            wasteType={waste.wasteType}
            timestamp={waste.timestamp}
            location={waste.location}
            delay={index * 80}
          />
        ))}
      </ScrollView>

      {/* Info Footer */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.footer}
      >
        <View style={styles.footerCard}>
          <View style={styles.footerIconContainer}>
            <Ionicons
              name="information-circle"
              size={22}
              color={COLORS.infoIcon}
            />
          </View>
          <Text style={styles.footerText}>
            Swipe horizontally to view all detections. Images are AI-detected and verified.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
    borderRadius: 22,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Severity Summary Styles
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
    paddingHorizontal: 12,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 10,
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
    alignItems: 'flex-start',
  },
  severityCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },

  // Quick Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140, // Space for footer + nav bar
  },

  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 100, // Above the nav bar
    left: 20,
    right: 20,
    zIndex: 9,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  footerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});
