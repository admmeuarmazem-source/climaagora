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

// Garante que TODOS os campos que o frontend pode ler de `cie` existam sempre,
// mesmo que o Gemini omita algum. Isso é o que faltava e causou o crash de
// "Cannot read properties of undefined (reading 'includes')" na tela.
function ensureCompleteCie(cie: any): any {
  const safe = cie && typeof cie === "object" ? cie : {};
  return {
    sources: Array.isArray(safe.sources)
      ? safe.sources
      : [
          "Modelo de Previsão Integrado",
          "Estação Meteorológica Nacional",
          "Modelo de Circulação Global",
        ],
    consensus: typeof safe.consensus === "number" ? safe.consensus : 88,
    justification:
      typeof safe.justification === "string"
        ? safe.justification
        : "Análise baseada em convergência de modelos de circulação e telemetria local.",
    confidenceIndex: safe.confidenceIndex || "Alta",
    regionalHistoricalError:
      typeof safe.regionalHistoricalError === "number"
        ? safe.regionalHistoricalError
        : 1.8,
    divergenceValue:
      typeof safe.divergenceValue === "number" ? safe.divergenceValue : 4.0,
    rainProbabilityConsolidated:
      typeof safe.rainProbabilityConsolidated === "number"
        ? safe.rainProbabilityConsolidated
        : 20,
    weights:
      safe.weights && typeof safe.weights === "object"
        ? safe.weights
        : {
            ECMWF: 20,
            "NOAA/GFS": 15,
            INMET: 15,
            "CPTEC/INPE": 10,
            CEMADEN: 8,
            REDEMET: 7,
            NWS: 5,
            Copernicus: 10,
            "Météo-France": 4,
            JMA: 3,
            KMA: 3,
          },
    concordance: Array.isArray(safe.concordance)
      ? safe.concordance
      : ["Modelo de Circulação Global", "Estação Meteorológica Nacional"],
  };
}

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
- cie: objeto com "sources" (array de nomes genéricos), "consensus" (0-100), "justification" (texto, sem nomes reais), "confidenceIndex" ("Muito Alta"/"Alta"/"Média"/"Baixa"), "regionalHistoricalError" (número %), "divergenceValue" (número %), "rainProbabilityConsolidated" (0-100), "weights" (objeto com pesos numéricos por modelo genérico), "concordance" (array de nomes genéricos em concordância)`;

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
              daily: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    date: { type: Type.STRING },
                    max: { type: Type.NUMBER },
                    min: { type: Type.NUMBER },
                    pop: { type: Type.NUMBER },
                    condition: {
                      type: Type.STRING,
                      enum: [
                        "Sunny",
                        "Clear",
                        "PartlyCloudy",
                        "Cloudy",
                        "Rainy",
                        "Storm",
                      ],
                    },
                    description: { type: Type.STRING },
                  },
                  required: ["day", "date", "max", "min", "pop", "condition"],
                },
              },
              hourly: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    temp: { type: Type.NUMBER },
                    pop: { type: Type.NUMBER },
                    condition: {
                      type: Type.STRING,
                      enum: [
                        "Sunny",
                        "Clear",
                        "PartlyCloudy",
                        "Cloudy",
                        "Rainy",
                        "Storm",
                      ],
                    },
                  },
                  required: ["time", "temp", "pop", "condition"],
                },
              },
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
                  regionalHistoricalError: { type: Type.NUMBER },
                  divergenceValue: { type: Type.NUMBER },
                  rainProbabilityConsolidated: { type: Type.NUMBER },
                  weights: {
                    type: Type.OBJECT,
                    properties: {
                      ECMWF: { type: Type.NUMBER },
                      "NOAA/GFS": { type: Type.NUMBER },
                      INMET: { type: Type.NUMBER },
                      "CPTEC/INPE": { type: Type.NUMBER },
                      CEMADEN: { type: Type.NUMBER },
                      REDEMET: { type: Type.NUMBER },
                      NWS: { type: Type.NUMBER },
                      Copernicus: { type: Type.NUMBER },
                      JMA: { type: Type.NUMBER },
                      KMA: { type: Type.NUMBER },
                      "Météo-France": { type: Type.NUMBER },
                    },
                  },
                  concordance: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
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
    const parsed = JSON.parse(
      text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim(),
    );
    parsed.cie = ensureCompleteCie(parsed.cie);

    // Rede de segurança: garante que NENHUM item de hourly/daily venha sem `condition`
    // (ou outros campos), mesmo que o schema falhe por algum motivo — essa era a causa
    // provável do crash "Cannot read properties of undefined (reading 'includes')".
    parsed.hourly = (Array.isArray(parsed.hourly) ? parsed.hourly : []).map(
      (h: any, i: number) => ({
        time: h?.time || `${i.toString().padStart(2, "0")}:00`,
        temp: typeof h?.temp === "number" ? h.temp : parsed.temp || 25,
        pop: typeof h?.pop === "number" ? h.pop : 10,
        condition: h?.condition || parsed.condition || "Clear",
      }),
    );
    parsed.daily = (Array.isArray(parsed.daily) ? parsed.daily : []).map(
      (d: any, i: number) => ({
        day: d?.day || `Dia ${i + 1}`,
        date: d?.date || "",
        max: typeof d?.max === "number" ? d.max : parsed.max || 30,
        min: typeof d?.min === "number" ? d.min : parsed.min || 20,
        pop: typeof d?.pop === "number" ? d.pop : 10,
        condition: d?.condition || parsed.condition || "Clear",
        description: d?.description || "",
      }),
    );

    return parsed;
  } catch (err: any) {
    console.error(
      "[LLMManagerWeather] Erro no Gemini, usando dados simulados:",
      err?.message || err,
    );
    return generateSimulatedWeatherData(city, state, country, lang);
  }
}
