/**
 * River Health Calculation - Usage Examples
 */

import { calculateRiverHealth, getHealthStatusColor, getHealthStatusText } from './riverHealth';

// Example 1: Basic usage with all data
const example1 = () => {
  const waterData = {
    pH: 7.2,
    DO: 8.5,
    BOD: 2.1,
    COD: 180,
    turbidity: 3.2,
    temperature: 24,
    TDS: 320,
  };

  const wasteData = {
    detectionLevel: 12,
    floatingWaste: 8,
    plasticCount: 15,
  };

  const floodData = {
    riskLevel: 15,
    waterLevel: 2.8,
    rainfall: 12,
  };

  const biodiversityData = {
    speciesCount: 18,
    diversityIndex: 0.75,
    aquaticLife: 82,
  };

  const result = calculateRiverHealth(waterData, wasteData, floodData, biodiversityData);

  console.log('River Health Score:', result.score); // e.g., 78
  console.log('Status:', result.status); // e.g., "Good"
  console.log('Color:', result.color); // e.g., "#1E90FF"
  console.log('Rating:', result.rating); // e.g., "good"
  console.log('Breakdown:', result.breakdown);
  // {
  //   waterQuality: 85,
  //   waste: 88,
  //   flood: 85,
  //   biodiversity: 82
  // }
};

// Example 2: Partial data (some parameters missing)
const example2 = () => {
  const waterData = {
    pH: 7.5,
    DO: 7.0,
    // Other parameters missing - will use neutral score
  };

  const wasteData = {
    detectionLevel: 25, // Higher waste
  };

  const floodData = {
    riskLevel: 30,
  };

  const biodiversityData = {
    speciesCount: 12,
  };

  const result = calculateRiverHealth(waterData, wasteData, floodData, biodiversityData);
  // Will still calculate a score based on available data
};

// Example 3: Using helper functions
const example3 = () => {
  const score = 85;

  const color = getHealthStatusColor(score); // Returns color code
  const status = getHealthStatusText(score); // Returns "Excellent"

  // Use in UI components
  // <View style={{ backgroundColor: color }}>
  //   <Text>{status}</Text>
  // </View>
};

// Example 4: Real-time calculation from API data
const example4 = async () => {
  // Fetch data from API
  // const waterData = await fetchWaterQuality();
  // const wasteData = await fetchWasteData();
  // const floodData = await fetchFloodData();
  // const biodiversityData = await fetchBiodiversityData();

  // Calculate health score
  // const health = calculateRiverHealth(waterData, wasteData, floodData, biodiversityData);

  // Update UI
  // setRiverHealth(health);
};

export { example1, example2, example3, example4 };

