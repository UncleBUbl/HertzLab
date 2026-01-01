import { GoogleGenAI } from "@google/genai";

export const generateAudioInsight = async (frequency: number, waveform: string, prompt?: string): Promise<string> => {
  // Initialize on demand to access the latest process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-3-flash-preview for fast, reliable responses
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert Audio Engineer and Physicist at HertzLab. 
  Your goal is to explain audio frequencies, waveforms, and their uses in real life (music, testing, physics, healing, etc.).
  Keep answers concise, scientific, yet accessible. 
  If the user asks about a specific frequency, focus on that.
  Current Context: Frequency=${frequency}Hz, Waveform=${waveform}.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt || `Tell me interesting facts about ${frequency}Hz.`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    const errorMessage = error.message || JSON.stringify(error);

    // Handle auth errors specifically
    if (errorMessage.includes("401") || errorMessage.includes("UNAUTHENTICATED") || errorMessage.includes("API keys are not supported")) {
        return "Authentication Error: Please click 'Connect Key' to configure your access.";
    }
    
    // Return the specific error message to help with debugging
    return `AI Error (${model}): ${errorMessage}`;
  }
};