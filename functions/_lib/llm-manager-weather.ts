import { GoogleGenAI, Type } from "@google/genai";
import { generateSimulatedWeatherData } from "../_shared/simulated-weather";

export interface Env {
  GEMINI_API_KEY?: string;
}

function getGeminiClient(env: Env): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      return new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error(
        "LLMManagerWeather: Failed to initialize GoogleGenAI client:",
        e,
      );
    }
  }
  return null;
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errStr = String(error?.message || error);
    const isQuota =
      errStr.includes("429") ||
      errStr.includes("quota") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.includes("Limit");

    if (isQuota) {
      console.log(
        `[LLMManagerWeather] Gemini API quota reached. Skipping retries to fall back gracefully.`,
      );
      throw error;
    }

    if (retries > 0) {
      const isTransient =
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("demand") ||
        errStr.includes("temporary") ||
        errStr.includes("overloaded");

      if (isTransient) {
        console.log(
          `[LLMManagerWeather] Gemini API transient error (${errStr.slice(0, 150)}). Retrying in ${delayMs}ms... (${retries} retries left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return callWithRetry(fn, retries - 1, delayMs * 2);
      }
    }
    throw error;
  }
}

const decisionCenterSectorSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ["optimal", "warning", "critical"] },
    recommendation: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
  },
  required: ["status", "recommendation", "confidence"],
};

export async function generateConsolidatedPrediction(
  city: string,
  state: string,
  country: string,
  openMeteoData: any,
  inmetObs: any,
  lang: string = "pt-BR",
  env: Env = {},
): Promise<any> {
  const ai = getGeminiClient(env);
  if (!ai) {
    console.warn(
      `[LLMManagerWeather] GEMINI_API_KEY missing or invalid. Using simulated weather data for ${city}.`,
    );
    return generateSimulatedWeatherData(city, state, country, lang);
  }

  try {
    const prompt = `Você é o Motor de Consenso Preditivo do ClimaAgora IA.
Analise a telemetria bruta recebida do Open-Meteo e da Estação Oficial do INMET para a localidade: ${city}, ${state}, ${country}.

Dados Open-Meteo: ${JSON.stringify(openMeteoData || {})}
Observação INMET: ${JSON.stringify(inmetObs || {})}
Idioma de resposta desejado: ${lang}

Consolide e retorne um objeto JSON completo respeitando a estrutura climática com:
- temp, feelsLike, max, min, condition (Sunny, Clear, PartlyCloudy, Cloudy, Rainy, Storm)
- humidity, windSpeed, windDirection, pressure, uvIndex, visibility, dewPoint, pop, rainMm, cloudCover
- aiSummary: Resumo do consenso para os setores
- daily: array de previsões para os próximos 5 dias
- hourly: array de previsão hora a hora para 24 horas
- decisionCenter: para CADA setor (agriculture, livestock, solar, fishing, navigation, alerts), retorne um objeto com "status" ("optimal", "warning" ou "critical"), "recommendation" (texto) e "confidence" (número de 0 a 100).`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              feelsLike: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
              min: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              humidity: { type: Type.NUMBER },
              windSpeed: { type: Type.NUMBER },
              windDirection: { type: Type.STRING },
              pressure: { type: Type.NUMBER },
              uvIndex: { type: Type.NUMBER },
              visibility: { type: Type.NUMBER },
              dewPoint: { type: Type.NUMBER },
              pop: { type: Type.NUMBER },
              rainMm: { type: Type.NUMBER },
              cloudCover: { type: Type.NUMBER },
              aiSummary: { type: Type.STRING },
              daily: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              hourly: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              decisionCenter: {
                type: Type.OBJECT,
                properties: {
                  agriculture: decisionCenterSectorSchema,
                  livestock: decisionCenterSectorSchema,
                  solar: decisionCenterSectorSchema,
                  fishing: decisionCenterSectorSchema,
                  navigation: decisionCenterSectorSchema,
                  alerts: decisionCenterSectorSchema,
                },
                required: [
                  "agriculture",
                  "livestock",
                  "solar",
                  "fishing",
                  "navigation",
                  "alerts",
                ],
              },
            },
            required: ["temp", "condition", "humidity", "decisionCenter"],
          },
        },
      }),
    );

    const text = response.text || "";
    return JSON.parse(
      text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim(),
    );
  } catch (err: any) {
    console.error(
      "[LLMManagerWeather] Error calling Gemini, falling back to simulated data:",
      err?.message || err,
    );
    return generateSimulatedWeatherData(city, state, country, lang);
  }
}
