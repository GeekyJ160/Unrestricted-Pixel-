
import { GoogleGenAI } from "@google/genai";

export interface GenerationResult {
  image: string;
  links?: { title: string; uri: string }[];
}

const getEnvApiKey = (): string | undefined => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("process.env.API_KEY not available");
  }
  return undefined;
};

export const checkApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    return await win.aistudio.hasSelectedApiKey();
  }
  return !!getEnvApiKey();
};

export const promptForApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    await win.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selection not available.");
  }
};

/**
 * Generates or edits an image using Gemini 3 Pro Image Preview with Search Grounding.
 */
export const generateImageWithGemini = async (
  prompt: string,
  inputImageBase64?: string,
  styleImageBase64?: string,
  negativePrompt?: string
): Promise<GenerationResult> => {
  const apiKey = getEnvApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please select a valid API key.");
  }

  // Always create a new instance right before the call to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-image-preview';

  const parts: any[] = [];
  
  if (inputImageBase64) {
    const mimeMatch = inputImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = inputImageBase64.split(',')[1] || inputImageBase64;
    
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    });
    parts.push({ text: `Target Image: This is the image to be edited.` });
  }

  if (styleImageBase64) {
    const mimeMatch = styleImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = styleImageBase64.split(',')[1] || styleImageBase64;
    
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    });
    parts.push({ text: `Style Reference Image: Use the artistic style, color palette, and texture of this image as a reference for the transformation.` });
  }

  let finalPromptText = inputImageBase64 
    ? `Action: ${prompt}.` 
    : `Generate: ${prompt}.`;

  if (negativePrompt?.trim()) {
    finalPromptText += ` EXCLUSIONS/NEGATIVE PROMPT: Strictly avoid including the following elements or characteristics: ${negativePrompt}.`;
  }

  finalPromptText += " Use Google Search if you need real-world reference or current styles to ensure accuracy and high quality.";

  parts.push({ text: finalPromptText });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" 
        },
        // Enable Google Search tool for grounding and improved generation accuracy.
        tools: [{ googleSearch: {} }]
      }
    });

    let generatedImage = "";
    const candidate = response.candidates?.[0];
    
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          generatedImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    // Extract grounding links if search was used.
    const links: { title: string; uri: string }[] = [];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          links.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri
          });
        }
      });
    }
    
    if (!generatedImage) {
        throw new Error("Model failed to generate an image. Please try a more specific prompt.");
    }

    return { image: generatedImage, links: links.length > 0 ? links : undefined };

  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
        // Reset key state if the entity is not found (often indicates invalid key/project)
        await promptForApiKey();
    }
    throw error;
  }
};
