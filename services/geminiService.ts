import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SovereignInsight } from "../types";

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface EnhancedSovereignInsight extends SovereignInsight {
  sources?: GroundingSource[];
  riskScore?: number;
}

export const sanitizeInput = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>'"&;]/g, (tag) => {
      const chars: Record<string, string> = {
        '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;', ';': '&#59;'
      };
      return chars[tag] || tag;
    })
    .replace(/(System:|Instruction:|Ignore all previous)/gi, "[REDACTED]")
    .slice(0, 1000);
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "NO_KEY_PROVIDED") {
    console.warn("Gemini API Key is missing. AI features will be degraded.");
  }
  return new GoogleGenAI({ apiKey: apiKey as string });
};

// Manual Base64 Decoding for PCM data
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM bytes to AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const scanForAdversarialIntent = async (query: string): Promise<{ safe: boolean; reason?: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform high-fidelity security analysis on the following user query: "${query}". Return JSON: {"safe": boolean, "reason": "string"}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["safe"]
        }
      }
    });
    return JSON.parse(response.text || '{"safe": true}');
  } catch (e) {
    return { safe: true };
  }
};

export const resolveLocation = async (query: string): Promise<{ lat: number; lng: number; name: string } | null> => {
  const ai = getAI();
  const securityCheck = await scanForAdversarialIntent(query);
  if (!securityCheck.safe) throw new Error(`SECURITY_BLOCK: ${securityCheck.reason}`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Geocode: "${sanitizeInput(query)}". Return JSON: {"lat": number, "lng": number, "name": "string"}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            name: { type: Type.STRING }
          },
          required: ["lat", "lng", "name"]
        }
      }
    });
    return JSON.parse(response.text || 'null');
  } catch (error) {
    return null;
  }
};

export const getSovereignInsight = async (countryName: string): Promise<EnhancedSovereignInsight> => {
  const ai = getAI();
  const safeName = sanitizeInput(countryName);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Geopolitical report for ${safeName}. JSON format required.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          politicalStatus: { type: Type.STRING },
          economicOutlook: { type: Type.STRING },
          riskScore: { type: Type.NUMBER },
          recentEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyRisks: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, severity: { type: Type.INTEGER } },
              required: ["name", "severity"]
            }
          }
        },
        required: ["summary", "politicalStatus", "economicOutlook", "recentEvents", "keyRisks", "riskScore"]
      }
    }
  });

  const insight = JSON.parse(response.text || '{}');
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources: GroundingSource[] = [];
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: sanitizeInput(chunk.web.title), uri: chunk.web.uri });
    });
  }
  return { ...insight, sources };
};

export const generateIdentityManifesto = async (role: string, location: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Manifesto for role '${role}' at '${location}'. 50 words.`,
    config: { temperature: 0.9 }
  });
  return response.text || "Security through spatial awareness.";
};

export const generateFutureScenarioImage = async (countryName: string, risks: string[]): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Future projection of ${countryName}. Impact of ${risks.join(', ')}.` }] },
    config: { imageConfig: { aspectRatio: "16:9" } },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
};

export const generateBriefingAudio = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Briefing: ${sanitizeInput(text)}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64 || '';
};

export const chatWithAnalyst = async (history: { role: string, content: string }[], query: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'IDENTITY: Geopolitical Analyst. Response should be concise.',
      tools: [{ googleSearch: {} }]
    },
  });
  const response = await chat.sendMessage({ message: sanitizeInput(query) });
  return response.text;
};