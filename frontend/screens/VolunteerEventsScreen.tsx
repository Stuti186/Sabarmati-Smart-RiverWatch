/**
 * VolunteerEventsScreen
 * Modern premium volunteer events display with category filtering
 * Updated for 2024/2025 design standards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { EventCard } from '@/components/ui';
import {
  getVolunteerEvents,
  getEventsByType,
  getUpcomingEvents,
  type VolunteerEvent,
} from '@/utils/volunteerEvents';

type EventFilter = 'all' | 'upcoming' | 'cleanup' | 'awareness' | 'monitoring' | 'workshop';

// Premium color palette
const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#2563EB',
  headerGradientStart: '#22C55E',
  headerGradientEnd: '#16A34A',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  shadowColor: '#1E3A8A',
  activeChip: '#3B82F6',
  chipBg: 'rgba(255, 255, 255, 0.15)',
  chipBorder: 'rgba(255, 255, 255, 0.25)',
  emptyIcon: '#94A3B8',
  softGreen: '#DCFCE7',
};

export default function VolunteerEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<VolunteerEvent[]>(getUpcomingEvents());
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      applyFilter(selectedFilter);
      setRefreshing(false);
    }, 1000);
  };

  const applyFilter = (filter: EventFilter) => {
    setSelectedFilter(filter);
    switch (filter) {
      case 'all':
        setEvents(getVolunteerEvents());
        break;
      case 'upcoming':
        setEvents(getUpcomingEvents());
        break;
      case 'cleanup':
        setEvents(getEventsByType('cleanup'));
        break;
      case 'awareness':
        setEvents(getEventsByType('awareness'));
        break;
      case 'monitoring':
        setEvents(getEventsByType('monitoring'));
        break;
      case 'workshop':
        setEvents(getEventsByType('workshop'));
        break;
      default:
        setEvents(getUpcomingEvents());
    }
  };

  const handleJoin = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      Alert.alert(
        'Event Joined!',
        `You've successfully joined "${event.title}". We'll send you event details via email.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleEventPress = (event: VolunteerEvent) => {
    Alert.alert(
      event.title,
      `${event.description}\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nContact: ${event.contactInfo || 'N/A'}`,
      [{ text: 'OK' }]
    );
  };

  const filters: { key: EventFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'upcoming', label: 'Upcoming', icon: 'calendar' },
    { key: 'cleanup', label: 'Cleanup', icon: 'trash' },
    { key: 'awareness', label: 'Awareness', icon: 'megaphone' },
    { key: 'monitoring', label: 'Monitoring', icon: 'analytics' },
    { key: 'workshop', label: 'Workshop', icon: 'school' },
  ];

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.headerGradientStart, COLORS.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTitleSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="people" size={26} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Volunteer Events</Text>
            <Text style={styles.headerSubtitle}>
              {events.length} event{events.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderFilters = () => (
    <Animated.View
      entering={FadeInUp.duration(600).delay(100)}
      style={styles.filterContainer}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => applyFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon}
              size={15}
              color={selectedFilter === filter.key ? COLORS.white : COLORS.white}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyState}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="calendar-outline" size={56} color={COLORS.emptyIcon} />
        </View>
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyText}>
          No volunteer events available in this category. Check back later for new opportunities.
        </Text>
      </View>
    </Animated.View>
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

      {/* Custom Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Header */}
      {renderHeader()}

      {/* Filters */}
      {renderFilters()}

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.headerGradientEnd]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 ? (
          events.map((event, index) => (
            <Animated.View
              key={event.id}
              entering={FadeInDown.duration(500).delay(150 + index * 60)}
            >
              <EventCard
                event={event}
                onPress={() => handleEventPress(event)}
                onJoin={handleJoin}
                delay={0}
              />
            </Animated.View>
          ))
        ) : (
          renderEmptyState()
        )}

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
    paddingTop: 40,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerCard: {
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
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Filter Styles
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterContent: {
    paddingRight: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.chipBg,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.activeChip,
    borderColor: COLORS.activeChip,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.softGreen,
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
