import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FileData } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateQtiFromText = async (text: string): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Task: Analyze the following text and extract assessment questions (Multiple Choice, True/False).
    Output: Convert these questions into a single valid IMS QTI 2.1 XML string (imsqti_v2p1).
    Requirements:
    1. Root element should be <assessmentItem> or a container if multiple items.
    2. Include <responseDeclaration>, <outcomeDeclaration>, and <itemBody>.
    3. Mark the correct answer in <correctResponse>.
    4. Provide the output strictly as XML. Do not wrap in markdown code blocks (remove \`\`\`xml ... \`\`\`).
    
    Content to process:
    ${text}
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return cleanOutput(response.text || "");
};

export const generateQtiFromUrl = async (url: string): Promise<string> => {
  const ai = getClient();
  // Use search grounding to process the link content
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Task: Access the information provided in the context or search for the content of this URL: ${url}.
    Action: Extract key concepts and generate 5 multiple choice questions based on the content.
    Output: Format these questions as a valid IMS QTI 2.1 XML file.
    Requirements:
    1. Structure must be valid QTI 2.1.
    2. Include scoring logic (responseDeclaration).
    3. Provide ONLY the XML code.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Enable search to "read" or find info about the link
    },
  });

  return cleanOutput(response.text || "");
};

export const generateQtiFromFile = async (file: FileData): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Task: Analyze the attached document. Extract all questions and answers found, or generate questions if the text is informational.
    Output: Valid IMS QTI 2.1 XML format.
    Requirements:
    1. Ensure all tags are properly closed.
    2. Define correct answers in responseDeclaration.
    3. Provide ONLY the XML code.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType: file.mimeType,
            data: file.data,
          },
        },
      ],
    },
  });

  return cleanOutput(response.text || "");
};

// Helper to strip markdown code fences if the model returns them
const cleanOutput = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```xml")) {
    cleaned = cleaned.replace(/^```xml/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```$/, "");
  }
  return cleaned.trim();
};
