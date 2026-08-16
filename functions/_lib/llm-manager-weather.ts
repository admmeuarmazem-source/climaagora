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
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
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
    if (isQuota) throw error;
    if (retries > 0) {
      const isTransient =
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("demand") ||
        errStr.includes("temporary") ||
        errStr.includes("overloaded");
      if (isTransient) {
        await new Promise((r) => setTimeout(r, delayMs));
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
      `[LLMManagerWeather] GEMINI_API_KEY ausente/inválida. Usando dados simulados para ${city}.`,
    );
    return generateSimulatedWeatherData(city, state, country, lang);
  }

  // ⚠️ Restaurado: instrução que esconde nomes reais de agência/IA nos campos de texto —
  // estava presente no server.ts original e havia sido perdida numa reescrita anterior.
  const systemInstruction = `Você é o Motor de Consenso Preditivo do ClimaAgora IA, responsável por integrar telemetria de múltiplas fontes oficiais em uma análise única e coerente.
NUNCA mencione nomes reais de agências (INMET, NOAA, GFS, ECMWF, Copernicus, etc.) nem de marcas de IA (Gemini, Claude, ChatGPT, OpenAI, Anthropic, DeepSeek, Grok, Google) em qualquer campo de texto do JSON. Use termos genéricos: "Modelo de Previsão Integrado", "Estação Nacional", "Modelo de Circulação Global".
Responda SEMPRE no idioma "${lang}". Retorne APENAS JSON puro, sem markdown.`;

  try {
    const prompt = `Analise a telemetria bruta recebida para a localidade: ${city}, ${state}, ${country}.

Dados brutos (fonte primária): ${JSON.stringify(openMeteoData || {})}
Observação de estação oficial: ${JSON.stringify(inmetObs || {})}

Consolide e retorne um objeto JSON completo com:
- temp, feelsLike, max, min, condition (Sunny, Clear, PartlyCloudy, Cloudy, Rainy, Storm)
- humidity, windSpeed, windDirection, pressure, uvIndex, visibility, dewPoint, pop, rainMm, cloudCover
- aiSummary: resumo do consenso para os setores, sem citar nomes reais de fonte/IA
- daily: array de previsões para os próximos 5 dias
- hourly: array de previsão hora a hora para 24 horas
- decisionCenter: para CADA setor (agriculture, livestock, solar, fishing, navigation, alerts): "status" ("optimal"/"warning"/"critical"), "recommendation", "confidence" (0-100)
- cie: objeto com "sources" (array de nomes genéricos de modelo, nunca nomes reais), "consensus" (0-100), "justification" (texto, sem nomes reais), "confidenceIndex" ("Muito Alta"/"Alta"/"Média"/"Baixa"), "rainProbabilityConsolidated" (0-100)`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
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
              cie: {
                type: Type.OBJECT,
                properties: {
                  sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  consensus: { type: Type.NUMBER },
                  justification: { type: Type.STRING },
                  confidenceIndex: {
                    type: Type.STRING,
                    enum: ["Muito Alta", "Alta", "Média", "Baixa"],
                  },
                  rainProbabilityConsolidated: { type: Type.NUMBER },
                },
                required: [
                  "sources",
                  "consensus",
                  "justification",
                  "confidenceIndex",
                  "rainProbabilityConsolidated",
                ],
              },
            },
            required: [
              "temp",
              "condition",
              "humidity",
              "decisionCenter",
              "cie",
            ],
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
      "[LLMManagerWeather] Erro no Gemini, usando dados simulados:",
      err?.message || err,
    );
    return generateSimulatedWeatherData(city, state, country, lang);
  }
}
