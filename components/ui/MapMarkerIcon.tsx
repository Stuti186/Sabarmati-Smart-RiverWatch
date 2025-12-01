/**
 * MapMarkerIcon Component
 * Compact, clean map marker with consistent styling
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MapMarkerIconProps {
  type: 'danger' | 'hotspot' | 'sensor';
  severity?: 'critical' | 'high' | 'moderate' | 'medium' | 'low';
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
}

const SEVERITY_COLORS: Record<string, readonly [string, string]> = {
  critical: ['#DC2626', '#B91C1C'],
  high: ['#EF4444', '#DC2626'],
  moderate: ['#FACC15', '#EAB308'],
  medium: ['#F59E0B', '#D97706'],
  low: ['#22C55E', '#16A34A'],
};

const SIZE_CONFIG = {
  small: { pin: 32, icon: 14, label: 9 },
  medium: { pin: 40, icon: 18, label: 10 },
  large: { pin: 48, icon: 22, label: 11 },
};

function MapMarkerIcon({
  type,
  severity = 'moderate',
  icon,
  label,
  size = 'medium',
  isSelected = false,
}: MapMarkerIconProps) {
  const config = SIZE_CONFIG[size];
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.moderate;
  
  const defaultIcon = type === 'danger' ? 'warning' : type === 'hotspot' ? 'flame' : 'water';
  const markerIcon = icon || defaultIcon;

  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      <LinearGradient
        colors={colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.pin,
          {
            width: config.pin,
            height: config.pin,
            borderRadius: config.pin / 2,
          },
          isSelected && styles.pinSelected,
        ]}
      >
        <Ionicons name={markerIcon} size={config.icon} color="#FFFFFF" />
      </LinearGradient>
      
      {/* Pin pointer */}
      <View style={[styles.pointer, { borderTopColor: colors[1] }]} />
      
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { fontSize: config.label }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerSelected: {
    transform: [{ scale: 1.15 }],
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinSelected: {
    borderWidth: 3,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  labelContainer: {
    marginTop: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: 80,
  },
  label: {
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
});

export default memo(MapMarkerIcon);

