import { GoogleGenAI } from "@google/genai";

const getEnvApiKey = (): string | undefined => {
    // Safety check for process.env availability in browser
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY;
        }
    } catch (e) {
        console.warn("process.env not available");
    }
    return undefined;
};

export const checkApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    return await win.aistudio.hasSelectedApiKey();
  }
  // Fallback for development if window.aistudio is not present
  return !!getEnvApiKey();
};

export const promptForApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    await win.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selection not available in this environment.");
  }
};

/**
 * Generates or edits an image using Gemini 3 Pro Image Preview.
 * If inputImageBase64 is provided, it performs an edit/variation.
 * Otherwise, it generates from scratch.
 */
export const generateImageWithGemini = async (
  prompt: string,
  inputImageBase64?: string
): Promise<string> => {
  const apiKey = getEnvApiKey();
  if (!apiKey) {
    throw new Error("API Key not found.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-image-preview'; // Use Pro for high quality

  const parts: any[] = [];
  
  if (inputImageBase64) {
    // Extract mime type dynamically if present in the data URL
    const mimeMatch = inputImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
    // Clean base64 string
    const cleanBase64 = inputImageBase64.split(',')[1] || inputImageBase64;
    
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    });
    parts.push({ text: `Edit this image: ${prompt}` });
  } else {
    parts.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" 
        }
      }
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image generated.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};