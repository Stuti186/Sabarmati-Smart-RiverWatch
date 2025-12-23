/**
 * Biodiversity Module - Types and Utilities
 * Species, Sightings, Migration, and Invasive Species Management
 */

// ===========================================
// TYPES
// ===========================================

export type SpeciesCategory = 'fish' | 'bird' | 'plant' | 'reptile' | 'mammal' | 'amphibian' | 'insect';
export type ConservationStatus = 'least_concern' | 'near_threatened' | 'vulnerable' | 'endangered' | 'critically_endangered';
export type EcologicalHealthStatus = 'healthy' | 'moderate' | 'declining';
export type InvasiveAlertLevel = 'low' | 'moderate' | 'high' | 'critical';
export type SightingVerificationStatus = 'pending' | 'verified' | 'rejected' | 'citizen';

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: SpeciesCategory;
  habitat: string[];
  status: ConservationStatus;
  image: string;
  similarSpecies: string[];
  description: string;
  behavior?: string;
  diet?: string;
  size?: string;
  color?: string;
}

export interface WildlifeSighting {
  id: string;
  speciesId?: string; // Optional if unknown
  speciesName?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  image: string;
  timestamp: Date;
  verified: boolean;
  verificationStatus: SightingVerificationStatus;
  notes?: string;
  userId?: string;
  confidence?: number; // For AI-identified sightings
}

export interface MigrationPattern {
  speciesId: string;
  speciesName: string;
  month: number; // 1-12
  pathCoordinates: Array<{ latitude: number; longitude: number }>;
  activityLevel: 'low' | 'moderate' | 'high';
  startMonth: number;
  endMonth: number;
}

export interface InvasiveAlert {
  id: string;
  speciesId: string;
  speciesName: string;
  level: InvasiveAlertLevel;
  description: string;
  affectedZones: Array<{ latitude: number; longitude: number; radius: number }>;
  impact: string;
  recommendedAction: string;
  reportedDate: Date;
  image?: string;
}

export interface EcologicalHealthScore {
  score: number; // 0-100
  status: EcologicalHealthStatus;
  factors: {
    speciesDiversity: number;
    populationHealth: number;
    habitatQuality: number;
    invasiveThreat: number;
  };
  lastUpdated: Date;
}

export interface AISpeciesIdentification {
  primaryMatch: {
    speciesId: string;
    speciesName: string;
    confidence: number;
  };
  alternativeMatches: Array<{
    speciesId: string;
    speciesName: string;
    confidence: number;
  }>;
}

// ===========================================
// MOCK DATA GENERATORS
// ===========================================

const SPECIES_DATABASE: Species[] = [
  {
    id: '1',
    name: 'Indian Cormorant',
    scientificName: 'Phalacrocorax fuscicollis',
    category: 'bird',
    habitat: ['river edge', 'wetland'],
    status: 'least_concern',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    similarSpecies: ['Little Cormorant', 'Great Cormorant'],
    description: 'A medium-sized waterbird commonly found along riverbanks. Excellent diver and fisher.',
    behavior: 'Diurnal, often seen in groups diving for fish',
    diet: 'Primarily fish',
    size: '50-60 cm',
    color: 'Dark brown to black with white throat',
  },
  {
    id: '2',
    name: 'Sabarmati Mahseer',
    scientificName: 'Tor tor',
    category: 'fish',
    habitat: ['river', 'deep pools'],
    status: 'vulnerable',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    similarSpecies: ['Golden Mahseer', 'Deccan Mahseer'],
    description: 'Large freshwater fish, important indicator of river health. Sensitive to water quality.',
    behavior: 'Carnivorous, prefers fast-flowing water',
    diet: 'Small fish, insects, crustaceans',
    size: 'Up to 1.5 meters',
    color: 'Golden to olive green',
  },
  {
    id: '3',
    name: 'River Tern',
    scientificName: 'Sterna aurantia',
    category: 'bird',
    habitat: ['river edge', 'sandbars'],
    status: 'near_threatened',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    similarSpecies: ['Common Tern', 'Little Tern'],
    description: 'Elegant river bird with distinctive black cap. Nests on sandbars.',
    behavior: 'Dives for fish, nests in colonies',
    diet: 'Small fish and aquatic insects',
    size: '38-43 cm',
    color: 'White body, black cap, orange-yellow bill',
  },
  {
    id: '4',
    name: 'Water Hyacinth',
    scientificName: 'Eichhornia crassipes',
    category: 'plant',
    habitat: ['river', 'still water'],
    status: 'least_concern',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    similarSpecies: ['Water Lettuce', 'Duckweed'],
    description: 'Floating aquatic plant. Can become invasive if not managed.',
    behavior: 'Rapid growth, forms dense mats',
    diet: 'Photosynthetic',
    size: '30-100 cm tall',
    color: 'Green leaves, purple-blue flowers',
  },
  {
    id: '5',
    name: 'Mugger Crocodile',
    scientificName: 'Crocodylus palustris',
    category: 'reptile',
    habitat: ['river', 'wetland'],
    status: 'vulnerable',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    similarSpecies: ['Gharial', 'Saltwater Crocodile'],
    description: 'Large freshwater crocodile. Important apex predator in river ecosystem.',
    behavior: 'Ambush predator, basks on riverbanks',
    diet: 'Fish, birds, mammals',
    size: '3-4 meters',
    color: 'Dark olive to brown',
  },
  {
    id: '6',
    name: 'Indian Flapshell Turtle',
    scientificName: 'Lissemys punctata',
    category: 'reptile',
    habitat: ['river', 'ponds'],
    status: 'least_concern',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
    similarSpecies: ['Indian Softshell Turtle'],
    description: 'Common freshwater turtle. Indicator of healthy aquatic ecosystem.',
    behavior: 'Omnivorous, basks on logs',
    diet: 'Fish, plants, insects',
    size: '25-35 cm',
    color: 'Olive to brown with yellow spots',
  },
];

export function getSpeciesByCategory(category?: SpeciesCategory): Species[] {
  if (!category) return SPECIES_DATABASE;
  return SPECIES_DATABASE.filter(s => s.category === category);
}

export function getSpeciesById(id: string): Species | undefined {
  return SPECIES_DATABASE.find(s => s.id === id);
}

export function searchSpecies(query: string): Species[] {
  const lowerQuery = query.toLowerCase();
  return SPECIES_DATABASE.filter(
    s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.scientificName.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
  );
}

export function generateRecentSightings(count: number = 10): WildlifeSighting[] {
  const sightings: WildlifeSighting[] = [];
  const species = SPECIES_DATABASE;
  
  for (let i = 0; i < count; i++) {
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    const hoursAgo = Math.floor(Math.random() * 72); // Last 3 days
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    
    sightings.push({
      id: `sighting-${i + 1}`,
      speciesId: randomSpecies.id,
      speciesName: randomSpecies.name,
      location: {
        latitude: 23.0225 + (Math.random() - 0.5) * 0.1,
        longitude: 72.5714 + (Math.random() - 0.5) * 0.1,
      },
      image: randomSpecies.image,
      timestamp,
      verified: Math.random() > 0.5,
      verificationStatus: Math.random() > 0.7 ? 'verified' : 'citizen',
      notes: Math.random() > 0.5 ? 'Spotted near riverbank' : undefined,
    });
  }
  
  return sightings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateEcologicalHealthScore(): EcologicalHealthScore {
  const score = 65 + Math.random() * 25; // 65-90 range
  let status: EcologicalHealthStatus;
  
  if (score >= 80) status = 'healthy';
  else if (score >= 60) status = 'moderate';
  else status = 'declining';
  
  return {
    score: Math.round(score),
    status,
    factors: {
      speciesDiversity: 70 + Math.random() * 20,
      populationHealth: 65 + Math.random() * 25,
      habitatQuality: 60 + Math.random() * 30,
      invasiveThreat: 30 + Math.random() * 40, // Lower is better
    },
    lastUpdated: new Date(),
  };
}

export function generateMigrationPatterns(): MigrationPattern[] {
  const patterns: MigrationPattern[] = [];
  const migratoryBirds = SPECIES_DATABASE.filter(s => s.category === 'bird');
  
  migratoryBirds.forEach((species, index) => {
    patterns.push({
      speciesId: species.id,
      speciesName: species.name,
      month: (index % 12) + 1,
      pathCoordinates: [
        { latitude: 23.0, longitude: 72.5 },
        { latitude: 23.02, longitude: 72.55 },
        { latitude: 23.04, longitude: 72.6 },
        { latitude: 23.06, longitude: 72.65 },
      ],
      activityLevel: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as any,
      startMonth: 10, // October
      endMonth: 3, // March
    });
  });
  
  return patterns;
}

export function generateInvasiveAlerts(): InvasiveAlert[] {
  return [
    {
      id: 'inv-1',
      speciesId: '4',
      speciesName: 'Water Hyacinth',
      level: 'high',
      description: 'Rapid spread observed in northern river section. Dense mats blocking water flow.',
      affectedZones: [
        { latitude: 23.05, longitude: 72.58, radius: 500 },
        { latitude: 23.03, longitude: 72.60, radius: 300 },
      ],
      impact: 'Reducing oxygen levels, blocking navigation, affecting fish populations',
      recommendedAction: 'Mechanical removal recommended. Report new sightings immediately.',
      reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
  ];
}

export function getSeasonalMigrationEvents(): Array<{
  species: string;
  month: string;
  description: string;
}> {
  const currentMonth = new Date().getMonth() + 1;
  
  return [
    {
      species: 'River Tern',
      month: currentMonth >= 3 && currentMonth <= 6 ? 'Now' : 'March-June',
      description: 'Breeding season - nesting on sandbars',
    },
    {
      species: 'Migratory Waterfowl',
      month: currentMonth >= 10 || currentMonth <= 2 ? 'Now' : 'October-February',
      description: 'Winter migration - increased bird activity',
    },
  ];
}

export function mockAISpeciesIdentification(imageUri: string): Promise<AISpeciesIdentification> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomSpecies = SPECIES_DATABASE[Math.floor(Math.random() * SPECIES_DATABASE.length)];
      const confidence = 75 + Math.random() * 20; // 75-95%
      
      resolve({
        primaryMatch: {
          speciesId: randomSpecies.id,
          speciesName: randomSpecies.name,
          confidence: Math.round(confidence),
        },
        alternativeMatches: [
          {
            speciesId: SPECIES_DATABASE[0].id,
            speciesName: SPECIES_DATABASE[0].name,
            confidence: Math.round(confidence - 15),
          },
          {
            speciesId: SPECIES_DATABASE[1].id,
            speciesName: SPECIES_DATABASE[1].name,
            confidence: Math.round(confidence - 25),
          },
        ],
      });
    }, 2000); // Simulate API call
  });
}

export function getStatusColor(status: EcologicalHealthStatus): string {
  switch (status) {
    case 'healthy':
      return '#22C55E';
    case 'moderate':
      return '#FACC15';
    case 'declining':
      return '#EF4444';
    default:
      return '#94A3B8';
  }
}

export function getStatusGradient(status: EcologicalHealthStatus): string[] {
  switch (status) {
    case 'healthy':
      return ['#4ADE80', '#22C55E'];
    case 'moderate':
      return ['#FDE047', '#FACC15'];
    case 'declining':
      return ['#F87171', '#EF4444'];
    default:
      return ['#94A3B8', '#64748B'];
  }
}

export function getCategoryIcon(category: SpeciesCategory): string {
  const icons: Record<SpeciesCategory, string> = {
    fish: 'fish',
    bird: 'bird',
    plant: 'leaf',
    reptile: 'paw',
    mammal: 'paw',
    amphibian: 'water',
    insect: 'bug',
  };
  return icons[category] || 'help-circle';
}

export function getCategoryColor(category: SpeciesCategory): string {
  const colors: Record<SpeciesCategory, string> = {
    fish: '#3B82F6',
    bird: '#8B5CF6',
    plant: '#22C55E',
    reptile: '#F59E0B',
    mammal: '#EF4444',
    amphibian: '#06B6D4',
    insect: '#EC4899',
  };
  return colors[category] || '#94A3B8';
}

