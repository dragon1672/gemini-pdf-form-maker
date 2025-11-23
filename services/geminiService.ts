import { GoogleGenAI, Type } from "@google/genai";
import { FieldType, GeminiSuggestion } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFormText = async (text: string): Promise<GeminiSuggestion[]> => {
  if (!text || text.trim().length === 0) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the following text extracted from a PDF page.
        Identify potential form fields that a user would likely need to fill out.
        Suggest a short, unique variable name for the field (camelCase), the type of field (Text, Checkbox, Radio), and a short reason why.
        
        Text Content:
        "${text.substring(0, 8000)}" 
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["Text", "Checkbox", "Radio"] },
              reason: { type: Type.STRING }
            },
            required: ["name", "type", "reason"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Map string types to Enum
    return rawData.map((item: any) => ({
      name: item.name,
      type: item.type === 'Checkbox' ? FieldType.CHECKBOX : item.type === 'Radio' ? FieldType.RADIO : FieldType.TEXT,
      reason: item.reason
    }));

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return [];
  }
};
