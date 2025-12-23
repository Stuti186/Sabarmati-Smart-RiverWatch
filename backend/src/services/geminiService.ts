/**
 * Google Gemini AI Service
 * Handles AI-powered species identification using Google Gemini Vision API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { isSabarmatiSpecies } from './sabarmatiSpeciesService';

// Initialize Gemini
const genAI = config.googleGeminiApiKey
  ? new GoogleGenerativeAI(config.googleGeminiApiKey)
  : null;

const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

export interface AISpeciesIdentification {
  primaryMatch: {
    speciesId?: string;
    speciesName: string;
    scientificName?: string;
    confidence: number;
    description?: string;
  };
  alternativeMatches: Array<{
    speciesId?: string;
    speciesName: string;
    scientificName?: string;
    confidence: number;
    description?: string;
  }>;
  sabarmatiValidated: boolean;
  validationMessage?: string;
}

/**
 * Identify species from image using Google Gemini Vision
 * @param imageBase64 - Base64 encoded image
 * @param imageMimeType - MIME type of image (e.g., 'image/jpeg', 'image/png')
 * @returns AI species identification with confidence scores
 */
export async function identifySpeciesWithGemini(
  imageBase64: string,
  imageMimeType: string = 'image/jpeg'
): Promise<AISpeciesIdentification> {
  try {
    if (!model) {
      throw new Error('Google Gemini API key not configured. Please set GOOGLE_GEMINI_API_KEY in .env');
    }

    // Prepare the prompt for Sabarmati-specific identification
    const prompt = `You are an expert biologist specializing in the biodiversity of the Sabarmati Riverfront in Ahmedabad, India (coordinates: 23.0300°N, 72.5800°E, 8km radius).

Analyze this image and identify the species shown. Focus ONLY on species that are known to exist in the Sabarmati Riverfront ecosystem.

Common species in this region include:
- Fish: Tilapia, Catla, Rohu, Silver Carp, Common Carp, Mrigal, Catfish, Mahseer
- Birds: Egret, Cormorant, Kingfisher, Black-winged Stilt, River Tern, Common Pochard, Northern Shoveler, Little Grebe, Indian Pond Heron, White-throated Kingfisher
- Plants: Water Hyacinth, Typha, Phragmites, Ipomoea, Prosopis, Acacia
- Reptiles: Water Snakes, Turtles
- Mammals: Otters (rare), Bats

Provide your response in the following JSON format:
{
  "primaryMatch": {
    "speciesName": "Common name of the species",
    "scientificName": "Scientific name (genus species)",
    "confidence": 85,
    "description": "Brief description of identifying features"
  },
  "alternativeMatches": [
    {
      "speciesName": "Alternative species name",
      "scientificName": "Scientific name",
      "confidence": 70,
      "description": "Brief description"
    }
  ],
  "category": "fish|bird|plant|reptile|mammal|amphibian|insect"
}

Important:
- If the species is NOT found in Sabarmati Riverfront, set confidence to 0 and speciesName to "Unknown - Not a Sabarmati species"
- Provide confidence scores (0-100) based on image clarity and identification certainty
- Include 2-3 alternative matches with lower confidence scores
- Be specific about identifying features visible in the image`;

    // Convert base64 to format expected by Gemini
    const imageData = imageBase64.includes('data:') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Call Gemini Vision API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: imageMimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response from Gemini
    let geminiResponse: any;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      geminiResponse = JSON.parse(jsonText.trim());
    } catch (parseError) {
      // If JSON parsing fails, try to extract information from text
      logger.warn('Failed to parse Gemini JSON response, attempting text extraction');
      geminiResponse = extractSpeciesFromText(text);
    }

    // Validate primary match is Sabarmati species
    const primarySpecies = geminiResponse.primaryMatch?.speciesName;
    let sabarmatiValidated = false;
    let validationMessage = '';

    if (primarySpecies && primarySpecies !== 'Unknown - Not a Sabarmati species') {
      const validation = await isSabarmatiSpecies(
        primarySpecies,
        geminiResponse.primaryMatch?.scientificName
      );
      
      sabarmatiValidated = validation.valid;
      if (!validation.valid) {
        validationMessage = validation.reason || 'Not a Sabarmati species — recheck image';
        // Reduce confidence if not Sabarmati species
        geminiResponse.primaryMatch.confidence = Math.max(0, (geminiResponse.primaryMatch.confidence || 0) - 50);
      }
    } else {
      validationMessage = 'Species not identified or not found in Sabarmati Riverfront';
      sabarmatiValidated = false;
    }

    // Format response
    const identification: AISpeciesIdentification = {
      primaryMatch: {
        speciesName: geminiResponse.primaryMatch?.speciesName || 'Unknown',
        scientificName: geminiResponse.primaryMatch?.scientificName,
        confidence: Math.round(geminiResponse.primaryMatch?.confidence || 0),
        description: geminiResponse.primaryMatch?.description,
      },
      alternativeMatches: (geminiResponse.alternativeMatches || []).map((alt: any) => ({
        speciesName: alt.speciesName || 'Unknown',
        scientificName: alt.scientificName,
        confidence: Math.round(alt.confidence || 0),
        description: alt.description,
      })),
      sabarmatiValidated,
      validationMessage: validationMessage || undefined,
    };

    logger.info(`Gemini species identification: ${identification.primaryMatch.speciesName} (${identification.primaryMatch.confidence}% confidence)`);

    return identification;
  } catch (error: any) {
    logger.error('Error in Gemini species identification:', error);
    throw new Error(`AI identification failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract species information from text response (fallback)
 */
function extractSpeciesFromText(text: string): any {
  // Try to extract species name and scientific name from text
  const speciesMatch = text.match(/(?:species|name)[:\s]+([A-Z][a-z]+(?:\s+[a-z]+)?)/i);
  const scientificMatch = text.match(/([A-Z][a-z]+\s+[a-z]+)/);
  const confidenceMatch = text.match(/(\d+)%?\s*(?:confidence|certainty)/i);

  return {
    primaryMatch: {
      speciesName: speciesMatch ? speciesMatch[1] : 'Unknown',
      scientificName: scientificMatch ? scientificMatch[1] : undefined,
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
      description: text.substring(0, 200),
    },
    alternativeMatches: [],
  };
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!config.googleGeminiApiKey && !!model;
}

