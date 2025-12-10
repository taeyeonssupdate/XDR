import { GoogleGenAI } from "@google/genai";
import { UnifiedEvent } from '../types';

// Initialize Gemini
// Note: In a real production app, API keys should be handled via a proxy backend.
// For this demo, we assume the environment variable or a safe context.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeIncident = async (events: UnifiedEvent[]): Promise<string> => {
  if (!apiKey) return "API Key not configured. Please set process.env.API_KEY";

  try {
    const model = 'gemini-2.5-flash';
    
    // Prepare the context for the model
    const eventContext = JSON.stringify(events, null, 2);
    
    const prompt = `
      You are a Tier 3 Security Analyst in a SOC. 
      Analyze the following sequence of XDR (EDR/NDR) events.
      
      Events:
      ${eventContext}
      
      Please provide:
      1. A concise summary of the attack chain.
      2. The potential root cause.
      3. Recommended remediation steps (isolate host, block IP, etc.).
      4. A severity assessment justification.
      
      Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Error generating analysis. Please check console for details.";
  }
};

export const generateRemediationScript = async (platform: string, threat: string): Promise<string> => {
  if (!apiKey) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a script/query for ${platform} to mitigate the following threat: ${threat}. Return only the code block.`,
    });
    return response.text || "";
  } catch (error) {
    return "Error generating script.";
  }
};