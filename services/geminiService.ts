import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AnalysisResult, DeepfakeResult, ViralityPrediction, GroundingSource, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini 2.5 Flash with Google Search & Maps Grounding to verify text.
 * This provides up-to-date fact checking with location context.
 */
export const verifyTextWithSearch = async (text: string, userLocation: { lat: number, lng: number } | undefined, lang: Language): Promise<AnalysisResult> => {
  try {
    const config: any = {
      tools: [{ googleSearch: {}, googleMaps: {} }],
      temperature: 0.3,
    };

    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }
        }
      };
    }

    const langName = lang === 'ru' ? 'Russian' : 'English';
    const langKeys = lang === 'ru'
      ? '(Return the content in Russian, but keep keys VERDICT, SCORE, RISK_LEVEL, IMPACT, EXPLANATION in English)'
      : '(Return the content in English, keeping keys VERDICT, SCORE, RISK_LEVEL, IMPACT, EXPLANATION)';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following claim or news text for truthfulness. 
      Use Google Search and Google Maps to verify facts and locations.
      
      Text to analyze: "${text}"

      Return a structured response in ${langName} ${langKeys}:
      VERDICT: [FAKE, PARTIAL, or TRUE]
      SCORE: [0-100 integer]
      RISK_LEVEL: [LOW, MEDIUM, HIGH, or CRITICAL]
      IMPACT: [A short paragraph explaining the potential harm/risk]
      EXPLANATION: [Detailed explanation of why it is fake/true citing discrepancies]
      `,
      config: config
    });

    const outputText = response.text || "";

    // Extract Grounding Sources (Web and Maps)
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || (lang === 'ru' ? "Веб-источник" : "Web Source")
          });
        }
        if (chunk.maps?.uri) {
          sources.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title || (lang === 'ru' ? "Локация Google Maps" : "Google Maps Location")
          });
        }
      });
    }

    // Manual Parsing of the structured text response
    const verdictMatch = outputText.match(/VERDICT:\s*(FAKE|PARTIAL|TRUE)/i);
    const scoreMatch = outputText.match(/SCORE:\s*(\d+)/);
    const riskMatch = outputText.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i);
    const impactMatch = outputText.match(/IMPACT:\s*([\s\S]*?)(?=EXPLANATION:|$)/i);
    const explanationMatch = outputText.match(/EXPLANATION:\s*([\s\S]*)/i);

    return {
      verdict: (verdictMatch?.[1].toUpperCase() as any) || 'PARTIAL',
      score: parseInt(scoreMatch?.[1] || "50"),
      riskLevel: (riskMatch?.[1].toUpperCase() as any) || 'MEDIUM',
      riskImpact: impactMatch?.[1].trim() || (lang === 'ru' ? "Не удалось оценить влияние." : "Could not assess impact."),
      explanation: explanationMatch?.[1].trim() || outputText,
      sources: sources
    };

  } catch (error) {
    console.error("Verification Error", error);
    throw new Error("Failed to verify text.");
  }
};

/**
 * Uses Gemini 3 Pro Preview for complex Deepfake analysis logic.
 */
export const detectDeepfake = async (base64Image: string, mimeType: string, lang: Language): Promise<DeepfakeResult> => {
  try {
    const langInstruction = lang === 'ru'
      ? 'Provide the result in Russian (values only, keep keys in English).'
      : 'Provide the result in English.';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Strong reasoning model for visual artifacts
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this image for signs of being a Deepfake or AI-generated manipulation. 
            Look for: inconsistent lighting, warped backgrounds, strange hands/fingers, skin texture issues, asymmetrical eyes.
            
            ${langInstruction}
            Format:
            IS_DEEPFAKE: [YES or NO]
            CONFIDENCE: [0-100]
            INDICATORS: [List of specific visual artifacts found, comma separated]
            ANALYSIS: [Detailed technical analysis]
            `
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    const text = response.text || "";

    const isDeepfake = text.match(/IS_DEEPFAKE:\s*YES/i) !== null;
    const confidence = parseInt(text.match(/CONFIDENCE:\s*(\d+)/)?.[1] || "0");
    const indicatorsRaw = text.match(/INDICATORS:\s*([^\n]*)/i)?.[1] || "";
    const indicators = indicatorsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const analysis = text.match(/ANALYSIS:\s*([\s\S]*)/i)?.[1] || text;

    return {
      isDeepfake,
      confidence,
      indicators,
      technicalAnalysis: analysis
    };
  } catch (e) {
    console.error(e);
    throw new Error("Deepfake detection failed");
  }
};

/**
 * Uses Gemini Flash Lite for fast Virality Prediction.
 */
export const predictVirality = async (text: string, lang: Language): Promise<ViralityPrediction> => {
  try {
    const langInstruction = lang === 'ru' ? 'in Russian' : 'in English';

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Fast model
      contents: `Predict the viral potential of this headline/text based on emotional triggers and sensationalism: "${text}".
      Response ${langInstruction} (Keys in English):
      SCORE: [0-100]
      REACH: [e.g. 10k-50k people]
      VELOCITY: [Slow, Moderate, Viral, Explosive]
      REASONING: [Brief reason]
      `,
    });

    const out = response.text || "";

    return {
      viralityScore: parseInt(out.match(/SCORE:\s*(\d+)/)?.[1] || "0"),
      estimatedReach: out.match(/REACH:\s*([^\n]*)/)?.[1] || "Unknown",
      velocity: (out.match(/VELOCITY:\s*(\w+)/)?.[1] as any) || "Moderate",
      reasoning: out.match(/REASONING:\s*([\s\S]*)/)?.[1] || out
    };
  } catch (e) {
    console.error(e);
    return { viralityScore: 0, estimatedReach: "N/A", velocity: "Slow", reasoning: lang === 'ru' ? "Анализ не удался" : "Analysis failed" };
  }
};

/**
 * Chat with Gemini 3 Pro.
 */
export const createChatSession = (lang: Language) => {
  const systemInstruction = lang === 'ru'
    ? "Вы — 'Veritas Assistant', эксперт по медиаграмотности, проверке фактов и цифровой безопасности. Ваша цель — помогать пользователям выявлять фейковые новости, объяснять логические ошибки и учить критическому мышлению. Будьте кратки, научны, но доступны. Отвечайте на русском языке."
    : "You are 'Veritas Assistant', an expert in media literacy, fact-checking, and digital safety. Your goal is to help users identify fake news, explain logical fallacies, and teach critical thinking. Be concise, scientific, yet accessible. Answer in English.";

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};