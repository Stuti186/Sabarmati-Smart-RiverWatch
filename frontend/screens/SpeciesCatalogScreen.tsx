/**
 * SpeciesCatalogScreen
 * Interactive species catalog with category filters
 * Grid layout with modern cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  getCategoryIcon,
  getCategoryColor,
  type SpeciesCategory,
} from '@/utils/biodiversity';
import { biodiversityApi, type Species } from '@/services/biodiversityApi';
import Snackbar from '@/components/ui/Snackbar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

const COLORS = {
  gradientStart: '#38BDF8',
  gradientEnd: '#1E3A8A',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  shadowColor: '#1E3A8A',
};

const CATEGORIES: Array<{ id: SpeciesCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'fish', label: 'Fish' },
  { id: 'bird', label: 'Birds' },
  { id: 'plant', label: 'Plants' },
  { id: 'reptile', label: 'Reptiles' },
  { id: 'mammal', label: 'Mammals' },
];

export default function SpeciesCatalogScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<SpeciesCategory | 'all'>('all');
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const placeholderImage = 'https://placehold.co/400x300?text=No+Image';

  useEffect(() => {
    loadSpecies();
  }, [selectedCategory]);

  const loadSpecies = async () => {
    try {
      setLoading(true);
      let result;
      if (selectedCategory === 'all') {
        result = await biodiversityApi.searchSpecies('', 50);
      } else {
        result = await biodiversityApi.getSpeciesByCategory(selectedCategory, 50);
      }
      setSpecies(result.data || []);
      
      // Check if offline
      if (result.offline) {
        setIsOffline(true);
        setShowSnackbar(true);
      } else {
        setIsOffline(false);
        setShowSnackbar(false);
      }
    } catch (error: any) {
      console.error('Error loading species:', error);
      setIsOffline(true);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeciesPress = (speciesId: string) => {
    router.push({
      pathname: '/(tabs)/biodiversity/species-details',
      params: { speciesId },
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Species Catalog</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            const categoryColor = category.id === 'all' ? '#3B82F6' : getCategoryColor(category.id as SpeciesCategory);
            
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id as any)}
                style={[
                  styles.categoryChip,
                  isSelected && { backgroundColor: categoryColor },
                ]}>
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Species Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading species from GBIF...</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {species.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.duration(400).delay(index * 50)}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSpeciesPress(item.id)}
                  style={styles.speciesCard}>
                  {!!item.image && item.image.trim().length > 0 ? (
                    <Image source={{ uri: item.image }} style={styles.speciesImage} />
                  ) : (
                    <Image source={{ uri: placeholderImage }} style={styles.speciesImage} />
                  )}
                  <View style={styles.speciesContent}>
                    <View style={styles.speciesHeader}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(item.category) + '20' },
                        ]}>
                        <Ionicons
                          name={getCategoryIcon(item.category) as any}
                          size={14}
                          color={getCategoryColor(item.category)}
                        />
                      </View>
                      <Text style={styles.speciesName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={styles.speciesScientific} numberOfLines={1}>
                      {item.scientificName}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              item.status === 'least_concern'
                                ? '#22C55E'
                                : item.status === 'vulnerable'
                                ? '#FACC15'
                                : '#EF4444',
                          },
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Offline Mode Snackbar */}
        {isOffline && (
          <Snackbar
            visible={showSnackbar}
            message="Showing cached Sabarmati species — live data unavailable"
            type="warning"
            onDismiss={() => setShowSnackbar(false)}
            duration={4000}
          />
        )}
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
    color: COLORS.textWhite,
  },
  placeholder: {
    width: 40,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  categoryChipTextSelected: {
    color: COLORS.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  speciesCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    margin: 6,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  speciesImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.textMuted,
  },
  speciesContent: {
    padding: 12,
  },
  speciesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  speciesName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  speciesScientific: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textWhite,
  },
});

