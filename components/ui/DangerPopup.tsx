/**
 * DangerPopup Component
 * Popup showing danger zone description
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '@/theme';
import { UnsafeZone, getDangerIcon, getSeverityColor } from '@/utils/unsafeZones';

const { width } = Dimensions.get('window');

interface DangerPopupProps {
  zone: UnsafeZone;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function DangerPopup({
  zone,
  onClose,
  position,
}: DangerPopupProps) {
  const severityColor = getSeverityColor(zone.severity);
  const dangerIcon = getDangerIcon(zone.dangerType);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[
        styles.container,
        position && {
          left: Math.max(10, Math.min(position.x - width / 2, width - width + 10)),
          top: position.y - 250,
        },
      ]}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: severityColor + '20' },
              ]}>
              <Ionicons name={dangerIcon} size={28} color={severityColor} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{zone.name}</Text>
              <Text style={styles.subtitle}>{zone.dangerType}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.text.primary.light} />
          </TouchableOpacity>
        </View>

        {/* Severity Badge */}
        <View style={styles.severitySection}>
          <LinearGradient
            colors={
              (zone.severity === 'critical'
                ? gradients.status.alert.colors
                : zone.severity === 'high'
                ? gradients.status.alert.colors
                : gradients.status.warning.colors) as unknown as readonly [string, string, ...string[]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.severityBadge}>
            <Ionicons
              name="warning"
              size={24}
              color={colors.text.inverse.light}
            />
            <Text style={styles.severityText}>
              {zone.severity.toUpperCase()} DANGER
            </Text>
          </LinearGradient>
        </View>

        {/* Description */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>{zone.description}</Text>

          {/* Action Required */}
          {zone.actionRequired && (
            <View
              style={[
                styles.actionSection,
                { backgroundColor: severityColor + '15' },
              ]}>
              <Ionicons
                name="information-circle"
                size={20}
                color={severityColor}
              />
              <Text
                style={[styles.actionText, { color: severityColor }]}
                numberOfLines={5}>
                {zone.actionRequired}
              </Text>
            </View>
          )}

          {/* Zone Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons
                name="location"
                size={16}
                color={colors.text.secondary.light}
              />
              <Text style={styles.infoText}>
                Radius: {zone.radius}m from center
              </Text>
            </View>
            {zone.reportedBy && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.infoText}>Reported by: {zone.reportedBy}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.text.secondary.light}
              />
              <Text style={styles.infoText}>
                Detected: {new Date(zone.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - 40,
    maxHeight: 400,
    zIndex: 1000,
    ...shadows.xl,
  },
  blurContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  severitySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    ...shadows.md,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.inverse.light,
    letterSpacing: 1,
  },
  scrollView: {
    maxHeight: 250,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  infoSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary.light,
    flex: 1,
  },
});

