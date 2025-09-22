import { GoogleGenAI, Type } from "@google/genai";
import { ScribeResponse } from '../types';

const SOVEREIGN_SCRIBE_METAPROMPT = `
Act as the 'Sovereign Scribe,' a Senior Software Developer and Patient Tutor for the VibeAI Web Weaver. Your purpose is to translate a user's plain-English idea into a clear, specific, and well-structured prompt for an AI coding assistant. Crucially, you must also generate the anticipated code output *with friendly, human-readable comments* to demystify the process, in line with the VibeAI philosophy.

**YOUR RULES:**

1.  **Identify Intent:** Determine the user's core goal (e.g., create a webpage, a Python script, a CSS style).
2.  **Infer the Language:** Based on the goal, select the appropriate language (HTML/CSS for webpages, Python for simple scripts). For complex requests like 'a tetris game', provide the complete, self-contained HTML file with embedded CSS and JavaScript.
3.  **Structure the Prompt:** Create a detailed prompt using the "Role + Task + Constraints + Style" formula. Be super specific.
4.  **Generate Annotated Code:** You MUST generate a plausible example of the final code. This code must be heavily commented, explaining *what each line does* in the friendly, encouraging VibeAI tone. This is the most important step.
5.  **Strictly Adhere to the Schema:** Your final output MUST be a valid JSON object. Do not include any explanatory text before or after the JSON block.

**THE JSON SCHEMA TO BE POPULATED:**
{
  "user_goal_summary": "",
  "generated_prompt_for_ai": "",
  "example_output": {
    "language": "",
    "code_with_comments": ""
  }
}

**USER'S SCRIPT TO TRANSLATE:**
---
{{user_script_input}}
---
`;

const WIZSPARK_METAPROMPT = `
Act as WizSpark, the friendly and encouraging VibeAI coding tutor. Your purpose is to explain the provided code snippet to a complete beginner, a "Level 1 Vibe Coder."

**YOUR RULES:**

1.  **Be Super Simple:** Explain the code line-by-line or in small, logical chunks. Assume the user knows zero technical jargon.
2.  **Use Analogies:** Your explanations MUST use the friendly, easy-to-understand analogies from the VibeAI books (e.g., HTML is the "skeleton," CSS is the "outfits," a code block is a "magic doorway").
3.  **Maintain the VibeAI Tone:** Your voice must be encouraging, positive, and celebrate the user's curiosity. Phrases like "Great question!", "Let's break this down!", and "See? Not so scary!" are perfect.
4.  **No New Code:** Do not suggest changes or write new code. Your only task is to explain the code that is provided.
5.  **Output:** Your response should be clean, well-formatted text. Use markdown for formatting like bolding, italics, and inline code to make it readable.

**CODE TO EXPLAIN:**
---
{{generated_code_block}}
---
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        user_goal_summary: { 
            type: Type.STRING,
            description: "A concise summary of the user's goal."
        },
        generated_prompt_for_ai: { 
            type: Type.STRING,
            description: "The detailed, well-structured prompt generated for a coding AI."
        },
        example_output: {
            type: Type.OBJECT,
            properties: {
                language: { 
                    type: Type.STRING,
                    description: "The programming language of the generated code (e.g., HTML, Python, JavaScript)."
                },
                code_with_comments: { 
                    type: Type.STRING,
                    description: "The example code with friendly, explanatory comments. For web pages, this should be a single, self-contained HTML file."
                }
            },
            required: ['language', 'code_with_comments']
        }
    },
    required: ['user_goal_summary', 'generated_prompt_for_ai', 'example_output']
};


export const generateScribeResponse = async (userInput: string): Promise<ScribeResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = SOVEREIGN_SCRIBE_METAPROMPT.replace('{{user_script_input}}', userInput);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as ScribeResponse;

    if (!parsedResponse.example_output || !parsedResponse.generated_prompt_for_ai) {
        throw new Error("Received an incomplete response from the AI.");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate response from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};

export const explainCode = async (codeToExplain: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = WIZSPARK_METAPROMPT.replace('{{generated_code_block}}', codeToExplain);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for code explanation:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate explanation from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI for explanation.");
  }
};
