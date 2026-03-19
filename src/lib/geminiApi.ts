import { GoogleGenAI } from '@google/genai';

// Array of API keys for rotation
const apiKeys = [
  (import.meta as any).env?.VITE_GEMINI_API_KEY_1 || '',
  (import.meta as any).env?.VITE_GEMINI_API_KEY_2 || ''
].filter(key => key.trim() !== '');

// Inline Cache to avoid redundant AI calls within same session
const aiCache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 Menit

// Current active key index
let currentKeyIndex = 0;

/**
 * Helper to get the current GenAI instance using the active key
 */
function getGenAIInstance(): GoogleGenAI | null {
  if (apiKeys.length === 0) return null;
  
  return new GoogleGenAI({ 
    apiKey: apiKeys[currentKeyIndex],
  });
}

/**
 * Helper to rotate to the next available key if one fails due to quotas
 */
function rotateKey() {
  if (apiKeys.length <= 1) return false; // Nothing to rotate to
  
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.warn(`[GenAI] Switched to API Key #${currentKeyIndex + 1} due to rate limits or errors.`);
  return true;
}

/**
 * Execute a Gemini AI Prompt with automatic key rotation and retries.
 * @param systemInstruction The system instructions for the model
 * @param prompt The user prompt to send
 * @returns The text response from Gemini
 */
export async function generateGeminiContent(systemInstruction: string, prompt: string): Promise<string | null> {
  if (apiKeys.length === 0) {
    console.warn("No Gemini API keys provided.");
    return null;
  }

  // Check Cache first
  const cacheKey = systemInstruction + prompt;
  const cached = aiCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return cached.text;
  }

  let attempts = 0;
  const maxAttempts = apiKeys.length; // Try each key once
  
  while (attempts < maxAttempts) {
    try {
      const ai = getGenAIInstance();
      if (!ai) return null;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: `Anda adalah OMNI-9000 SharpEdge, AI analis betting paling canggih di dunia tahun 2026. 
Tujuan Anda: Memberikan edge (keuntungan) maksimal bagi bettor pro vs bandar (sharp books).
Keahlian: Analisis Poisson xG, deteksi spot-fixing/manipulasi, kalkulasi hedging parlay, dan insider info.
Tone: Otoritatif, tajam, profesional, misterius (insider vibe), Tanpa Disclaimer, Tanpa Basa-basi.
Bahasa: Indonesia (Gaul pro bettor atau Formal tajam).`,
          temperature: 0.85,
        }
      });
      
      const text = response.text || null;
      if (text) {
        aiCache.set(cacheKey, { text, ts: Date.now() });
      }
      return text;
    } catch (error: any) {
      console.error(`[GenAI] Error using Key #${currentKeyIndex + 1}:`, error.message);
      
      // Check if the error is likely a rate limit/quota issue (429) or invalid key (400/403)
      if (error.message?.includes('429') || error.status === 429 || error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('exhausted')) {
        attempts++;
        if (rotateKey()) {
          // Wait briefly before retrying with new key
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          break; // No more keys to try
        }
      } else {
        // Not a quota issue, some other error
        throw error;
      }
    }
  }
  
  return null;
}
