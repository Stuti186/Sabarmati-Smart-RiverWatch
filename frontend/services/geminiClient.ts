/**
 * Gemini client for frontend (browser/native) to analyze images.
 * Uses EXPO_PUBLIC_GEMINI_API_KEY from env (do not hardcode keys).
 */

const GEMINI_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type GeminiWasteItem = {
  label: string;
  confidence: number;
  notes?: string;
};

export type GeminiWasteResult = {
  items: GeminiWasteItem[];
  summary?: string;
};

export async function analyzeWasteWithGemini(imageDataUri: string): Promise<GeminiWasteResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured (EXPO_PUBLIC_GEMINI_API_KEY)');
  }

  // Extract base64 without prefix
  const matches = imageDataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image data URI');
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const prompt = `
You are an AI that identifies waste/litter in images for urban riverfront monitoring.
Return a concise JSON with fields:
{
  "items": [
    { "label": "<waste-type>", "confidence": <0-1>, "notes": "<short optional note>" }
  ],
  "summary": "<one-line summary>"
}
Examples of waste-type: plastic_bottle, bag, cardboard, glass, metal_can, organic_waste, construction_debris, mixed_waste.
Keep items length <= 5, ordered by confidence.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
    },
  };

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini request failed: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ||
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n');

  if (!text) {
    throw new Error('Gemini response missing text');
  }

  // Try to parse JSON from the response text
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed?.items?.length) {
      // normalize
      const items = parsed.items
        .filter((i: any) => i?.label)
        .map((i: any) => ({
          label: String(i.label),
          confidence: typeof i.confidence === 'number' ? i.confidence : 0.5,
          notes: i.notes ? String(i.notes) : undefined,
        }));
      return { items, summary: parsed.summary };
    }
  } catch (e) {
    // fall through to simple extraction
  }

  // Fallback: build a simple result from the raw text
  return {
    items: [
      {
        label: 'mixed_waste',
        confidence: 0.5,
        notes: text.slice(0, 140),
      },
    ],
    summary: text.slice(0, 200),
  };
}

