/**
 * Incident History Screen
 * View past SOS incidents and their status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { sosApi, type SOSIncident } from '@/services/sosApi';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  gradientStart: '#EF4444',
  gradientEnd: '#DC2626',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return COLORS.danger;
    case 'responded':
      return COLORS.warning;
    case 'resolved':
      return COLORS.success;
    case 'false_alarm':
      return COLORS.textMuted;
    default:
      return COLORS.textMuted;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return 'alert-circle';
    case 'responded':
      return 'time';
    case 'resolved':
      return 'checkmark-circle';
    case 'false_alarm':
      return 'close-circle';
    default:
      return 'help-circle';
  }
};

export default function IncidentHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const result = await sosApi.getMyIncidents(50, 0);
      setIncidents(result.data || []);
    } catch (error: any) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incident History</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.white}
            />
          }>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading incidents...</Text>
            </View>
          ) : incidents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color={COLORS.white} />
              <Text style={styles.emptyText}>No incidents found</Text>
              <Text style={styles.emptySubtext}>
                Your SOS incidents and their status will appear here
              </Text>
            </View>
          ) : (
            incidents.map((incident, index) => (
              <Animated.View
                key={incident.id}
                entering={FadeInUp.duration(400).delay(index * 100)}
                style={styles.incidentCard}>
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentInfo}>
                    <View style={styles.statusBadge}>
                      <Ionicons
                        name={getStatusIcon(incident.status) as any}
                        size={16}
                        color={getStatusColor(incident.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(incident.status) },
                        ]}>
                        {incident.status.toUpperCase().replace('_', ' ')}
                      </Text>
                    </View>
                    <Text style={styles.incidentType}>
                      {incident.eventType === 'manual_sos'
                        ? 'Manual SOS'
                        : incident.eventType === 'drowning_detection'
                        ? 'AI Drowning Detection'
                        : 'Emergency'}
                    </Text>
                  </View>
                  <Text style={styles.incidentDate}>
                    {formatDate(incident.timestamp)}
                  </Text>
                </View>

                <View style={styles.incidentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                      {incident.zone || 'Sabarmati Riverfront'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="map" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                      {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                    </Text>
                  </View>
                  {incident.responseTime && (
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>
                        Response time: {incident.responseTime} seconds
                      </Text>
                    </View>
                  )}
                  {incident.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{incident.notes}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            ))
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  incidentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  incidentDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  incidentDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.textMuted + '10',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});

