import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateImageFromBase(base64Image: string, promptFragment: string): Promise<string> {
  try {
    // We use gemini-2.5-flash-image for image generation/editing
    // However, image-to-image editing requires specific prompting or using the image as context.
    // Let's use the standard generateContent with image and text parts.
    
    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Transform this image according to the following style/prompt: ${promptFragment}. Maintain the original subject's pose and basic facial features, but apply the requested style completely.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated in the response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
