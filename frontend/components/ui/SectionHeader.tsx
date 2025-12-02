/**
 * SectionHeader Component
 * Premium section header with optional icon and action
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/theme';

interface SectionHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onActionPress?: () => void;
  variant?: 'default' | 'gradient';
}

export default function SectionHeader({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionPress,
  variant = 'default',
  style,
  ...props
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.leftSection}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={colors.primary[500]} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}
          activeOpacity={0.7}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.text.primary.light,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary.light,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionLabel: {
    ...typography.textStyles.label,
    color: colors.primary[500],
    marginRight: 4,
  },
});

