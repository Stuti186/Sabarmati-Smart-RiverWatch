/**
 * Sabarmati Riverfront Zones
 * Defines zones along the Sabarmati Riverfront for emergency routing
 */

export interface SabarmatiZone {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  radius: number; // in meters
  emergencyContact: string;
  policeStation: string;
  lifeguardPost?: string;
}

export const SABARMATI_ZONES: SabarmatiZone[] = [
  {
    id: 'subhash-bridge',
    name: 'Subhash Bridge',
    centerLat: 23.028,
    centerLon: 72.578,
    radius: 500,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Subhash Bridge Police Station',
    lifeguardPost: 'Subhash Bridge Lifeguard Post',
  },
  {
    id: 'gandhi-bridge',
    name: 'Gandhi Bridge',
    centerLat: 23.030,
    centerLon: 72.580,
    radius: 500,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Gandhi Bridge Police Station',
    lifeguardPost: 'Gandhi Bridge Lifeguard Post',
  },
  {
    id: 'ellis-bridge',
    name: 'Ellis Bridge',
    centerLat: 23.025,
    centerLon: 72.575,
    radius: 500,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Ellis Bridge Police Station',
    lifeguardPost: 'Ellis Bridge Lifeguard Post',
  },
  {
    id: 'sardar-bridge',
    name: 'Sardar Bridge',
    centerLat: 23.022,
    centerLon: 72.572,
    radius: 500,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Sardar Bridge Police Station',
    lifeguardPost: 'Sardar Bridge Lifeguard Post',
  },
  {
    id: 'flower-park',
    name: 'Flower Park Stretch',
    centerLat: 23.035,
    centerLon: 72.585,
    radius: 800,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Riverfront Police Station',
    lifeguardPost: 'Flower Park Lifeguard Post',
  },
  {
    id: 'biodiversity-park',
    name: 'Biodiversity Park Zone',
    centerLat: 23.032,
    centerLon: 72.582,
    radius: 800,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Riverfront Police Station',
    lifeguardPost: 'Biodiversity Park Lifeguard Post',
  },
  {
    id: 'vasna-barrage',
    name: 'Vasna Barrage Area',
    centerLat: 23.015,
    centerLon: 72.565,
    radius: 1000,
    emergencyContact: '+91-79-2658-XXXX',
    policeStation: 'Vasna Police Station',
    lifeguardPost: 'Vasna Barrage Lifeguard Post',
  },
];

/**
 * Get Sabarmati zone for a given location
 */
export function getSabarmatiZone(latitude: number, longitude: number): string | null {
  for (const zone of SABARMATI_ZONES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.centerLat,
      zone.centerLon
    );

    if (distance <= zone.radius) {
      return zone.name;
    }
  }

  return null;
}

/**
 * Get zone details for a given location
 */
export function getZoneDetails(latitude: number, longitude: number): SabarmatiZone | null {
  for (const zone of SABARMATI_ZONES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.centerLat,
      zone.centerLon
    );

    if (distance <= zone.radius) {
      return zone;
    }
  }

  return null;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

