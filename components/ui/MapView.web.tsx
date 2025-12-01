/**
 * Web fallback for MapView
 * Provides a placeholder view for web platform
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '@/theme';

interface MapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  [key: string]: any;
}

export default function MapView({ style, initialRegion, children, ...props }: MapViewProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
        start={gradients.water.flow.start}
        end={gradients.water.flow.end}
        style={styles.gradient}>
        <View style={styles.content}>
          <Ionicons name="map" size={64} color={colors.text.inverse.light} />
          <Text style={styles.text}>Map View</Text>
          <Text style={styles.subtext}>
            Maps are not available on web.{'\n'}
            Please use the mobile app for map features.
          </Text>
          {initialRegion && (
            <Text style={styles.coords}>
              Location: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
            </Text>
          )}
        </View>
        {children}
      </LinearGradient>
    </View>
  );
}

// Export Marker and Circle as simple Views for web
export const Marker = React.forwardRef<any, any>(({ coordinate, children, ...props }, ref) => (
  <View ref={ref} style={styles.marker} {...props}>
    {children}
  </View>
));

Marker.displayName = 'Marker';

export const Circle = React.forwardRef<any, any>(({ center, radius, ...props }, ref) => (
  <View ref={ref} style={styles.circle} {...props} />
));

Circle.displayName = 'Circle';

export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.inverse.light,
    marginTop: 16,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: colors.text.inverse.light,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  coords: {
    fontSize: 12,
    color: colors.text.inverse.light,
    opacity: 0.6,
    marginTop: 8,
  },
  marker: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
});

