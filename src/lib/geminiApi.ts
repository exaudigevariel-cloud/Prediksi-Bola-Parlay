import { GoogleGenAI } from '@google/genai';

// Array of API keys for rotation
const apiKeys = [
  process.env.GEMINI_API_KEY_1 || '',
  process.env.GEMINI_API_KEY_2 || ''
].filter(key => key.trim() !== '');

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

  let attempts = 0;
  const maxAttempts = apiKeys.length; // Try each key once
  
  while (attempts < maxAttempts) {
    try {
      const ai = getGenAIInstance();
      if (!ai) return null;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      return response.text || null;
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
