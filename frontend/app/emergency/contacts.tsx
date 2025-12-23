/**
 * Emergency Contacts Screen
 * Manage personal emergency contacts with speed dial
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyUtils, type EmergencyContact } from '@/services/sosApi';
import * as Location from 'expo-location';

const CONTACTS_STORAGE_KEY = '@emergency_contacts';

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
  inputBg: '#F3F4F6',
};

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || 'Contact',
      isPrimary: contacts.length === 0,
    };

    saveContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddForm(false);
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            saveContacts(contacts.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const handleCall = async (phone: string) => {
    try {
      await emergencyUtils.callContact(phone);
    } catch (error) {
      Alert.alert('Error', 'Could not make phone call.');
    }
  };

  const handleSendSMS = async (phone: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to send your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await emergencyUtils.sendLocationSMS(
        phone,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        'Sabarmati Riverfront'
      );
      Alert.alert('Success', 'Location SMS sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not send SMS.');
    }
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
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(!showAddForm)}
            style={styles.addButton}>
            <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Add Contact Form */}
          {showAddForm && (
            <Animated.View entering={FadeInUp.duration(300)} style={styles.addForm}>
              <Text style={styles.formTitle}>Add Emergency Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={COLORS.textMuted}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={COLORS.textMuted}
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddContact}>
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={COLORS.white} />
              <Text style={styles.emptyText}>No emergency contacts</Text>
              <Text style={styles.emptySubtext}>Add contacts for quick access during emergencies</Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <Animated.View
                key={contact.id}
                entering={FadeInUp.duration(400).delay(index * 100)}
                style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>
                      {contact.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    {contact.relationship && (
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(contact.phone)}>
                    <Ionicons name="call" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smsButton}
                    onPress={() => handleSendSMS(contact.phone)}>
                    <Ionicons name="chatbubble" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteContact(contact.id)}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addForm: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  contactDetails: {
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
  contactRelationship: {
    fontSize: 12,
    color: COLORS.textMuted,
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

