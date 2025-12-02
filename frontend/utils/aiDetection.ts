/**
 * AI Detection Utilities
 * Simulate AI detection results with bounding boxes
 */

import { BoundingBoxData } from '@/components/ui/BoundingBox';

/**
 * Simulate AI detection on uploaded image
 */
export function simulateAIDetection(): BoundingBoxData[] {
  // Simulate detection with random bounding boxes
  const detections: BoundingBoxData[] = [
    {
      id: 'detection-001',
      label: 'Plastic',
      confidence: 92,
      x: 0.15,
      y: 0.25,
      width: 0.25,
      height: 0.3,
    },
    {
      id: 'detection-002',
      label: 'Paper',
      confidence: 85,
      x: 0.5,
      y: 0.4,
      width: 0.2,
      height: 0.25,
    },
    {
      id: 'detection-003',
      label: 'Plastic',
      confidence: 88,
      x: 0.7,
      y: 0.6,
      width: 0.15,
      height: 0.2,
    },
    {
      id: 'detection-004',
      label: 'Metal',
      confidence: 78,
      x: 0.3,
      y: 0.7,
      width: 0.18,
      height: 0.15,
    },
  ];

  return detections;
}

/**
 * Get detection summary
 */
export function getDetectionSummary(detections: BoundingBoxData[]) {
  const summary: Record<string, number> = {};

  detections.forEach((detection) => {
    const label = detection.label.toLowerCase();
    summary[label] = (summary[label] || 0) + 1;
  });

  return summary;
}

/**
 * Get average confidence
 */
export function getAverageConfidence(detections: BoundingBoxData[]): number {
  if (detections.length === 0) return 0;
  const sum = detections.reduce((acc, d) => acc + d.confidence, 0);
  return Math.round(sum / detections.length);
}

