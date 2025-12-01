/**
 * Tab Layout - Modern Floating Navigation Bar
 * Premium blue-themed bottom navigation with glass effect
 * Updated for nested directory routing
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Modern Blue Color Palette
const TAB_COLORS = {
  activeBlue: '#3B82F6',
  activeBlueBright: '#60A5FA',
  inactiveGray: '#94A3B8',
  inactiveBlue: '#64748B',
  tabBarBg: 'rgba(255, 255, 255, 0.92)',
  tabBarBorder: 'rgba(148, 163, 184, 0.2)',
  shadowColor: '#1E3A8A',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_COLORS.activeBlue,
        tabBarInactiveTintColor: TAB_COLORS.inactiveGray,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={85}
                tint="light"
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View style={styles.androidBackground} />
            )}
          </View>
        ),
        tabBarItemStyle: styles.tabItem,
      }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Monitor Tab (Nested Directory) */}
      <Tabs.Screen
        name="monitor"
        options={{
          title: 'Monitor',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'pulse' : 'pulse-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Map Tab (Nested Directory) */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Reports Tab (Nested Directory) */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Profile Tab (Nested Directory) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 70,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: TAB_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? TAB_COLORS.tabBarBg : 'transparent',
    borderWidth: 1,
    borderColor: TAB_COLORS.tabBarBorder,
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TAB_COLORS.tabBarBg,
  },
  tabItem: {
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    borderRadius: 12,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
});
