/**
 * ChartContainer Component
 * Premium container for charts with glass/blur effect
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, gradients } from '@/theme';

interface ChartContainerProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'glass' | 'gradient' | 'default';
  icon?: keyof typeof Ionicons.glyphMap;
  headerAction?: React.ReactNode;
}

export default function ChartContainer({
  title,
  subtitle,
  children,
  variant = 'glass',
  icon,
  headerAction,
  style,
  ...props
}: ChartContainerProps) {
  const renderContainer = () => {
    if (variant === 'glass') {
      return (
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.content}>{children}</View>
        </BlurView>
      );
    } else if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradients.primary.light.colors as unknown as readonly [string, string, ...string[]]}
          start={gradients.primary.light.start}
          end={gradients.primary.light.end}
          style={styles.gradientContainer}>
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      );
    } else {
      return <View style={styles.defaultContainer}>{children}</View>;
    }
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'glass' && styles.glassBorder,
        shadows.lg,
        style,
      ]}
      {...props}>
      {(title || subtitle || icon || headerAction) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color={colors.primary[500]} />
              </View>
            )}
            <View>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {headerAction && <View>{headerAction}</View>}
        </View>
      )}
      {renderContainer()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.background.light,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: 2,
  },
  blurContainer: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientContainer: {
    borderRadius: 20,
  },
  defaultContainer: {
    borderRadius: 20,
    backgroundColor: colors.background.light,
  },
  content: {
    padding: 16,
  },
});

