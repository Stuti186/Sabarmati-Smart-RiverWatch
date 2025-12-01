/**
 * ScreenWrapper Component
 * Reusable screen wrapper with fade-in animation and blur header
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors, gradients, shadows } from '@/theme';

interface ScreenWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  showHeader?: boolean;
  gradient?: keyof typeof gradients.water;
  scrollViewProps?: ScrollViewProps;
  headerIntensity?: number;
}

export default function ScreenWrapper({
  children,
  title,
  subtitle,
  headerRight,
  showHeader = true,
  gradient = 'flow',
  scrollViewProps,
  headerIntensity = 80,
}: ScreenWrapperProps) {
  const gradientConfig = gradients.water[gradient];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={gradientConfig.colors}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Blur Header */}
      {showHeader && (title || subtitle || headerRight) && (
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <BlurView intensity={headerIntensity} tint="light" style={styles.blurHeader}>
            <View style={styles.headerContent}>
              {(title || subtitle) && (
                <View style={styles.headerLeft}>
                  {title && <Animated.Text entering={FadeIn.duration(400).delay(100)} style={styles.headerTitle}>{title}</Animated.Text>}
                  {subtitle && <Animated.Text entering={FadeIn.duration(400).delay(200)} style={styles.headerSubtitle}>{subtitle}</Animated.Text>}
                </View>
              )}
              {headerRight && (
                <Animated.View entering={FadeIn.duration(400).delay(300)}>
                  {headerRight}
                </Animated.View>
              )}
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Content */}
      <Animated.View
        entering={FadeIn.duration(600).delay(showHeader ? 200 : 0)}
        style={styles.content}>
        {scrollViewProps ? (
          <ScrollView
            {...scrollViewProps}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              scrollViewProps.contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  blurHeader: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.lg,
  },
  headerContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
});

