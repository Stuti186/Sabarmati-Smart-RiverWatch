/**
 * EventCard Component
 * Card displaying a volunteer event with join button
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors, gradients, shadows } from '@/theme';
import PrimaryButton from './PrimaryButton';
import {
  VolunteerEvent,
  getEventTypeIcon,
  getEventTypeLabel,
  formatEventDate,
  isEventFull,
  getAvailableSpots,
} from '@/utils/volunteerEvents';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: VolunteerEvent;
  onPress?: () => void;
  onJoin?: (eventId: string) => void;
  delay?: number;
}

export default function EventCard({
  event,
  onPress,
  onJoin,
  delay = 0,
}: EventCardProps) {
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const eventIcon = getEventTypeIcon(event.eventType);
  const eventLabel = getEventTypeLabel(event.eventType);
  const full = isEventFull(event);
  const availableSpots = getAvailableSpots(event);

  const handleJoin = async () => {
    if (joined || full || joining) return;

    setJoining(true);
    // Simulate API call
    setTimeout(() => {
      setJoined(true);
      setJoining(false);
      if (onJoin) {
        onJoin(event.id);
      }
    }, 1000);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
      style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
        disabled={!onPress}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          {/* Image/Thumbnail */}
          <View style={styles.imageContainer}>
            {event.imageUrl ? (
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradients.water.flow.colors as unknown as readonly [string, string, ...string[]]}
                start={gradients.water.flow.start}
                end={gradients.water.flow.end}
                style={styles.placeholderImage}>
                <Ionicons
                  name={eventIcon}
                  size={48}
                  color={colors.text.inverse.light}
                />
              </LinearGradient>
            )}

            {/* Event Type Badge */}
            <View style={styles.typeBadge}>
              <Ionicons
                name={eventIcon}
                size={14}
                color={colors.text.inverse.light}
              />
              <Text style={styles.typeText}>{eventLabel}</Text>
            </View>

            {/* Full Badge */}
            {full && (
              <View style={styles.fullBadge}>
                <Text style={styles.fullText}>Full</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.description} numberOfLines={3}>
              {event.description}
            </Text>

            {/* Event Details */}
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.detailText}>
                  {formatEventDate(event.date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.detailText}>
                  {event.time} • {event.duration}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>

            {/* Participants Info */}
            <View style={styles.participantsInfo}>
              <View style={styles.participantsRow}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={colors.text.secondary.light}
                />
                <Text style={styles.participantsText}>
                  {event.currentParticipants} / {event.maxParticipants} joined
                </Text>
                {!full && (
                  <Text style={styles.availableText}>
                    ({availableSpots} spots left)
                  </Text>
                )}
              </View>
            </View>

            {/* Join Button */}
            <View style={styles.buttonContainer}>
              {joined ? (
                <View style={styles.joinedButton}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.ecoGreen[500]}
                  />
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              ) : (
                <PrimaryButton
                  title={full ? 'Event Full' : 'Join Event'}
                  onPress={handleJoin}
                  variant={full ? 'warning' : 'success'}
                  size="md"
                  icon="person-add"
                  iconPosition="left"
                  loading={joining}
                  disabled={full || joining}
                  fullWidth
                />
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  blurCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse.light,
  },
  fullBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.alert[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fullText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.inverse.light,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary.light,
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary.light,
    flex: 1,
  },
  participantsInfo: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsText: {
    fontSize: 13,
    color: colors.text.secondary.light,
  },
  availableText: {
    fontSize: 13,
    color: colors.ecoGreen[500],
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 4,
  },
  joinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ecoGreen[50],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ecoGreen[500],
    gap: 8,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ecoGreen[500],
  },
});

