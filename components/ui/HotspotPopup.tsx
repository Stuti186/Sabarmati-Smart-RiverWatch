/**
 * HotspotPopup Component
 * Popup showing waste hotspot statistics
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '@/theme';
import { WasteHotspot, getDensityLevel, getDensityColor } from '@/utils/wasteHotspots';

const { width } = Dimensions.get('window');

interface HotspotPopupProps {
  hotspot: WasteHotspot;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function HotspotPopup({
  hotspot,
  onClose,
  position,
}: HotspotPopupProps) {
  const densityLevel = getDensityLevel(hotspot.density);
  const densityColor = getDensityColor(densityLevel);

  const totalWaste = Object.values(hotspot.wasteTypes).reduce(
    (sum, count) => sum + count,
    0
  );

  const popupStyle = useAnimatedStyle(() => ({
    opacity: withSpring(1, { damping: 15 }),
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[
        styles.container,
        position && {
          left: Math.max(10, Math.min(position.x - width / 2, width - width + 10)),
          top: position.y - 200,
        },
      ]}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.densityBadge,
                { backgroundColor: densityColor + '20' },
              ]}>
              <View style={[styles.densityDot, { backgroundColor: densityColor }]} />
              <Text style={[styles.densityText, { color: densityColor }]}>
                {densityLevel.toUpperCase()}
              </Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{hotspot.name}</Text>
              <Text style={styles.subtitle}>
                {hotspot.detectionCount} detections
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.text.primary.light} />
          </TouchableOpacity>
        </View>

        {/* Density Score */}
        <View style={styles.densityScoreContainer}>
          <LinearGradient
            colors={
              (densityLevel === 'critical' || densityLevel === 'high'
                ? gradients.status.alert.colors
                : densityLevel === 'medium'
                ? gradients.status.warning.colors
                : gradients.status.success.colors) as unknown as readonly [string, string, ...string[]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.densityScore}>
            <Text style={styles.densityScoreValue}>{hotspot.density}</Text>
            <Text style={styles.densityScoreLabel}>Density Score</Text>
          </LinearGradient>
        </View>

        {/* Waste Types Breakdown */}
        <View style={styles.wasteTypesContainer}>
          <Text style={styles.sectionTitle}>Waste Breakdown</Text>
          {Object.entries(hotspot.wasteTypes)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => {
              const percentage = Math.round((count / totalWaste) * 100);
              return (
                <View key={type} style={styles.wasteTypeRow}>
                  <View style={styles.wasteTypeLeft}>
                    <Ionicons
                      name={
                        type === 'plastic'
                          ? 'bag'
                          : type === 'paper'
                          ? 'document'
                          : type === 'metal'
                          ? 'construct'
                          : type === 'glass'
                          ? 'cube'
                          : type === 'organic'
                          ? 'leaf'
                          : 'trash'
                      }
                      size={18}
                      color={colors.primary[500]}
                    />
                    <Text style={styles.wasteTypeName}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.wasteTypeRight}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: densityColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.wasteTypeCount}>
                      {count} ({percentage}%)
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.text.secondary.light}
          />
          <Text style={styles.footerText}>
            Updated: {new Date(hotspot.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - 40,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  densityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  densityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  densityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 2,
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
  densityScoreContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  densityScore: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...shadows.md,
  },
  densityScoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.inverse.light,
    marginBottom: 4,
  },
  densityScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse.light,
    opacity: 0.9,
  },
  wasteTypesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 12,
  },
  wasteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  wasteTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  wasteTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  wasteTypeRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  wasteTypeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary.light,
    minWidth: 60,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
});

