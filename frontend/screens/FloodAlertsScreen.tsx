/**
 * FloodAlertsScreen
 * Modern premium flood alerts display with color-coded severity badges
 * Fully redesigned for 2024/2025 design standards
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
import {
  generateFloodAlerts,
  getSeverityColor,
  getSeverityStatus,
  formatAlertTimestamp,
  type FloodAlert,
} from '@/utils/floodAlerts';

// Premium color palette
const COLORS = {
  // Gradients
  bgGradientStart: '#38BDF8',
  bgGradientEnd: '#2563EB',
  headerGradientStart: '#3B82F6',
  headerGradientEnd: '#1E40AF',
  // Severity
  highRed: '#EF4444',
  highRedLight: '#FEE2E2',
  highRedDark: '#B91C1C',
  moderateYellow: '#FACC15',
  moderateYellowLight: '#FEF9C3',
  moderateYellowDark: '#B45309',
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#6B7280',
  textWhite: '#FFFFFF',
  // Card
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  cardBorderLight: 'rgba(226, 232, 240, 0.5)',
  // Status
  success: '#22C55E',
  primaryBlue: '#3B82F6',
  deepBlue: '#1E40AF',
  // Shadow
  shadowColor: '#1E3A8A',
};

// Severity Badge Component
const SeverityBadge = ({ severity }: { severity: 'high' | 'moderate' }) => {
  const isHigh = severity === 'high';
  const colors = isHigh
    ? [COLORS.highRed, '#DC2626']
    : [COLORS.moderateYellow, '#EAB308'];

  return (
    <LinearGradient
      colors={colors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.severityBadge}
    >
      <Ionicons
        name={isHigh ? 'warning' : 'alert-circle'}
        size={14}
        color={COLORS.textWhite}
      />
      <Text style={styles.severityBadgeText}>{severity.toUpperCase()}</Text>
    </LinearGradient>
  );
};

// Attribute Row Component
const AttributeItem = ({
  icon,
  iconColor,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.attributeItem}>
    <View style={[styles.attributeIconContainer, { backgroundColor: iconColor + '15' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.attributeContent}>
      <Text style={styles.attributeLabel}>{label}</Text>
      <Text style={[styles.attributeValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  </View>
);

// Warning Box Component
const WarningBox = ({
  message,
  severity,
}: {
  message: string;
  severity: 'high' | 'moderate';
}) => {
  const isHigh = severity === 'high';
  const bgColor = isHigh ? COLORS.highRedLight : COLORS.moderateYellowLight;
  const textColor = isHigh ? COLORS.highRedDark : COLORS.moderateYellowDark;
  const iconColor = isHigh ? COLORS.highRed : COLORS.moderateYellowDark;

  return (
    <View style={[styles.warningBox, { backgroundColor: bgColor }]}>
      <View style={styles.warningIconContainer}>
        <Ionicons name="information-circle" size={20} color={iconColor} />
      </View>
      <Text style={[styles.warningText, { color: textColor }]}>{message}</Text>
    </View>
  );
};

export default function FloodAlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<FloodAlert[]>(generateFloodAlerts());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(generateFloodAlerts());
      setRefreshing(false);
    }, 1000);
  };

  // Count alerts by severity
  const severityCounts = {
    high: alerts.filter((a) => a.severity === 'high').length,
    moderate: alerts.filter((a) => a.severity === 'moderate').length,
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
            <Ionicons name="warning" size={26} color={COLORS.textWhite} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Flood Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </Text>
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
        <View style={[styles.severityDot, { backgroundColor: COLORS.highRed }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.high}</Text>
          <Text style={styles.severityLabel}>High</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.severityDivider} />

      {/* Moderate Severity */}
      <View style={styles.severityPill}>
        <View style={[styles.severityDot, { backgroundColor: COLORS.moderateYellow }]} />
        <View style={styles.severityInfo}>
          <Text style={styles.severityCount}>{severityCounts.moderate}</Text>
          <Text style={styles.severityLabel}>Moderate</Text>
        </View>
      </View>
    </View>
  );

  const renderAlertCard = (alert: FloodAlert, index: number) => {
    const isHigh = alert.severity === 'high';
    const severityColor = isHigh ? COLORS.highRed : COLORS.moderateYellow;

    return (
      <Animated.View
        key={alert.id}
        entering={FadeInDown.duration(600).delay(index * 80)}
        style={styles.alertContainer}
      >
        <View style={styles.alertCard}>
          {/* Alert Header */}
          <View style={styles.alertHeader}>
            <View style={styles.alertHeaderLeft}>
              <View
                style={[
                  styles.alertIconContainer,
                  { backgroundColor: severityColor + '18' },
                ]}
              >
                <Ionicons
                  name={isHigh ? 'warning' : 'alert-circle'}
                  size={26}
                  color={severityColor}
                />
              </View>
              <View style={styles.alertTitleContainer}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <View style={styles.alertLocationRow}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.alertLocation}>{alert.location}</Text>
                </View>
              </View>
            </View>
            <SeverityBadge severity={alert.severity} />
          </View>

          {/* Alert Description */}
          <Text style={styles.alertDescription}>{alert.description}</Text>

          {/* Alert Attributes */}
          <View style={styles.alertAttributes}>
            <AttributeItem
              icon="water"
              iconColor={severityColor}
              label="Risk Level"
              value={`${alert.riskLevel}%`}
              valueColor={severityColor}
            />
            {alert.waterLevel && (
              <AttributeItem
                icon="speedometer"
                iconColor={COLORS.primaryBlue}
                label="Water Level"
                value={`${alert.waterLevel}m`}
              />
            )}
            {alert.rainfall && (
              <AttributeItem
                icon="rainy"
                iconColor={COLORS.deepBlue}
                label="Rainfall"
                value={`${alert.rainfall}mm`}
              />
            )}
          </View>

          {/* Warning Box */}
          {alert.actionRequired && (
            <WarningBox message={alert.actionRequired} severity={alert.severity} />
          )}

          {/* Timestamp Footer */}
          <View style={styles.alertFooter}>
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.alertTimestamp}>
                {formatAlertTimestamp(alert.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
        </View>
        <Text style={styles.emptyTitle}>No Active Alerts</Text>
        <Text style={styles.emptyText}>
          All flood conditions are normal. Continue monitoring for updates.
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]}
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
        <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
      </TouchableOpacity>

      {/* Header */}
      {renderHeaderCard()}

      {/* Prediction Button */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(150)}
        style={styles.predictionButtonContainer}>
        <TouchableOpacity
          style={styles.predictionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/alerts/flood-prediction')}>
          <LinearGradient
            colors={['#0EA5E9', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.predictionButtonGradient}>
            <Ionicons name="analytics" size={22} color="#FFFFFF" />
            <Text style={styles.predictionButtonText}>View 48-Hour Prediction</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Alert List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.textWhite}
            colors={[COLORS.primaryBlue]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {alerts.length > 0
          ? alerts.map((alert, index) => renderAlertCard(alert, index))
          : renderEmptyState()}

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
    paddingTop: 35,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
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
    color: COLORS.textWhite,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Prediction Button
  predictionButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  predictionButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  predictionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  predictionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  severitySummaryAndroid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  severitySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  severityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityDivider: {
    width: 1,
    height: 40,
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

  // Alert Card
  alertContainer: {
    marginBottom: 18,
  },
  alertCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 14,
    marginRight: 12,
  },
  alertIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  alertLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  alertDescription: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 23,
    marginBottom: 18,
    fontWeight: '500',
  },

  // Severity Badge
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.6,
  },

  // Attributes
  alertAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorderLight,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    gap: 10,
  },
  attributeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributeContent: {
    flex: 1,
  },
  attributeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  warningIconContainer: {
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },

  // Footer
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorderLight,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTimestamp: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
