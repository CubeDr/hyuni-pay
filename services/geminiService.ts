import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "List of all items purchased from the receipt.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Name of the item.",
          },
          quantity: {
            type: Type.NUMBER,
            description: "Quantity of the item purchased.",
          },
          price: {
            type: Type.NUMBER,
            description: "Total price for the quantity of this item.",
          },
          isLikelyShared: {
            type: Type.BOOLEAN,
            description: "Set to true if this is an item typically shared by multiple people (e.g., pizza, appetizers, large stews), false for individual items (e.g., a personal drink, a single bowl of noodles)."
          },
        },
        required: ["name", "quantity", "price", "isLikelyShared"],
      },
    },
    total: {
      type: Type.NUMBER,
      description: "The final total amount on the receipt.",
    },
  },
  required: ["items", "total"],
};

export const parseReceiptFromImage = async (
  image: { mimeType: string; data: string }
): Promise<ReceiptData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          },
          {
            text: "Analyze this receipt image from Korea. The currency is KRW (Korean Won). Extract all line items with their quantity and price. For each item, determine if it is likely a shared dish (like an appetizer, pajeon, jjigae, etc.) or an individual dish (like a personal drink or a single bowl of rice). Set the 'isLikelyShared' flag accordingly. Also extract the total amount. Provide the output in the specified JSON format. All monetary values (price, total) must be integers, without any decimal points.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Validate the parsed data shape
    if (!parsedData.items) {
      throw new Error("Parsed data is missing required fields.");
    }

    return parsedData as ReceiptData;

  } catch (error) {
    console.error("Error parsing receipt with Gemini API:", error);
    throw new Error("Failed to parse the receipt. The image might be unclear or the format is not supported.");
  }
};
