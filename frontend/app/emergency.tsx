/**
 * Emergency SOS Screen
 * Full emergency interface with location sharing, contacts, and incident tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { sosApi, emergencyUtils } from '@/services/sosApi';
import { useAuth } from '@/contexts/AuthContext';
import Snackbar from '@/components/ui/Snackbar';
import SOSButton from '@/components/ui/SOSButton';

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
};

export default function EmergencyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [zone, setZone] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const loc = await emergencyUtils.getCurrentLocation();
      setLocation(loc);
      
      // Determine zone (simplified - would use actual zone detection)
      setZone('Sabarmati Riverfront');
    } catch (error: any) {
      Alert.alert('Location Error', 'Could not get your location. Please enable location services.');
    }
  };

  const handleSOS = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait for location to be determined.');
      return;
    }

    setLoading(true);
    try {
      const result = await sosApi.submitSOS(location);
      setSosSent(true);
      setSnackbarMessage(result.message || 'Emergency alert sent to Sabarmati authorities. Help is on the way.');
      setShowSnackbar(true);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        router.back();
      }, 5000);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send SOS. Please try again or call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEmergency = async (phone: string) => {
    try {
      await emergencyUtils.callContact(phone);
    } catch (error) {
      Alert.alert('Error', 'Could not make phone call.');
    }
  };

  const handleSendLocationSMS = async (phone: string) => {
    if (!location) {
      Alert.alert('Location Required', 'Please wait for location to be determined.');
      return;
    }

    try {
      await emergencyUtils.sendLocationSMS(phone, location, zone);
      setSnackbarMessage('Location SMS sent successfully');
      setShowSnackbar(true);
    } catch (error) {
      Alert.alert('Error', 'Could not send SMS.');
    }
  };

  const emergencyContacts = [
    { name: 'Sabarmati Control Room', phone: '+91-79-2658-XXXX', type: 'authority' },
    { name: 'Police Emergency', phone: '100', type: 'police' },
    { name: 'Fire & Rescue', phone: '101', type: 'fire' },
    { name: 'Ambulance', phone: '102', type: 'ambulance' },
  ];

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
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Location Info */}
          {location && (
            <Animated.View entering={FadeInUp.duration(500)} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={24} color={COLORS.danger} />
                <Text style={styles.locationTitle}>Your Location</Text>
              </View>
              <Text style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.zoneText}>Zone: {zone}</Text>
            </Animated.View>
          )}

          {/* SOS Button */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.sosSection}>
            <SOSButton
              onConfirm={handleSOS}
              disabled={loading || !location || sosSent}
            />
            {sosSent && (
              <View style={styles.successMessage}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.successText}>SOS Sent Successfully</Text>
              </View>
            )}
          </Animated.View>

          {/* Emergency Contacts */}
          <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={() => handleCallEmergency(contact.phone)}>
                <View style={styles.contactInfo}>
                  <Ionicons
                    name={
                      contact.type === 'police'
                        ? 'shield'
                        : contact.type === 'fire'
                        ? 'flame'
                        : contact.type === 'ambulance'
                        ? 'medical'
                        : 'call'
                    }
                    size={24}
                    color={COLORS.danger}
                  />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallEmergency(contact.phone)}>
                    <Ionicons name="call" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  {location && (
                    <TouchableOpacity
                      style={styles.smsButton}
                      onPress={() => handleSendLocationSMS(contact.phone)}>
                      <Ionicons name="chatbubble" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/emergency/contacts')}>
              <Ionicons name="people" size={24} color={COLORS.danger} />
              <Text style={styles.actionText}>My Emergency Contacts</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/emergency/history')}>
              <Ionicons name="time" size={24} color={COLORS.danger} />
              <Text style={styles.actionText}>Incident History</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Animated.View>

          {/* Safety Instructions */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)} style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Sabarmati Safety Instructions</Text>
            <Text style={styles.instructionsText}>
              • Stay calm and follow instructions from authorities{'\n'}
              • Move to a safe location if possible{'\n'}
              • Keep your phone charged and location enabled{'\n'}
              • Wait for help to arrive{'\n'}
              • Do not enter the water if you are not a trained lifeguard
            </Text>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Snackbar */}
        <Snackbar
          visible={showSnackbar}
          message={snackbarMessage}
          type="success"
          onDismiss={() => setShowSnackbar(false)}
          duration={4000}
        />
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
  locationCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  zoneText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  contactsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  instructionsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 20,
  },
});

