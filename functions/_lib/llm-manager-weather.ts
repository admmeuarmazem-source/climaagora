import { GoogleGenAI, Type } from "@google/genai";

export interface Env {
  GEMINI_API_KEY?: string;
}

function getGeminiClient(env: Env): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;

  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  } catch (error) {
    console.error("[LLMManagerWeather] Falha ao inicializar Gemini:", error);
    return null;
  }
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const message = String(error?.message || error);
    const transient =
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("temporary") ||
      message.includes("overloaded");

    if (transient && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs * 2);
    }

    throw error;
  }
}

function weatherCondition(code: number | undefined): string {
  if (code === undefined || !Number.isFinite(code)) return "Clear";
  if (code === 0) return "Sunny";
  if ([1, 2].includes(code)) return "PartlyCloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Rainy";
  if ([95, 96, 99].includes(code)) return "Storm";
  return "Cloudy";
}

function compassDirection(degrees: number | undefined): string {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) return "N/A";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function arrayValue(
  obj: any,
  key: string,
  index: number,
  fallback = 0,
): number {
  return num(obj?.[key]?.[index], fallback);
}

function ensureCompleteDecisionCenter(dc: any): any {
  const safe = dc && typeof dc === "object" ? dc : {};
  const defaults = {
    agriculture: [
      "optimal",
      "Monitore temperatura, chuva e umidade antes das operações.",
      75,
    ],
    livestock: [
      "optimal",
      "Monitore conforto térmico, água e sombra do rebanho.",
      75,
    ],
    solar: ["optimal", "Avalie nebulosidade e irradiação para a geração.", 75],
    fishing: [
      "optimal",
      "Verifique vento, chuva e condições locais antes de sair.",
      75,
    ],
    navigation: [
      "optimal",
      "Considere vento, chuva e visibilidade para navegação.",
      75,
    ],
    alerts: [
      "optimal",
      "Nenhum alerta severo identificado pelos dados recebidos.",
      80,
    ],
  } as const;

  const result: any = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    const value = safe[key];
    result[key] =
      value && typeof value === "object"
        ? {
            status: value.status || fallback[0],
            recommendation: value.recommendation || fallback[1],
            confidence: num(value.confidence, fallback[2]),
          }
        : {
            status: fallback[0],
            recommendation: fallback[1],
            confidence: fallback[2],
          };
  }
  return result;
}

function ensureCompleteCie(cie: any, hasInmet: boolean): any {
  const safe = cie && typeof cie === "object" ? cie : {};
  return {
    sources:
      Array.isArray(safe.sources) && safe.sources.length
        ? safe.sources
        : hasInmet
          ? ["Open-Meteo", "INMET"]
          : ["Open-Meteo"],
    consensus: num(safe.consensus, hasInmet ? 88 : 82),
    justification:
      typeof safe.justification === "string" && safe.justification
        ? safe.justification
        : "Consolidação baseada nos dados meteorológicos disponíveis para as coordenadas consultadas.",
    confidenceIndex: safe.confidenceIndex || (hasInmet ? "Alta" : "Média"),
    regionalHistoricalError: num(safe.regionalHistoricalError, 0),
    divergenceValue: num(safe.divergenceValue, 0),
    rainProbabilityConsolidated: num(safe.rainProbabilityConsolidated, 0),
    weights:
      safe.weights && typeof safe.weights === "object"
        ? safe.weights
        : { "Open-Meteo": 70, INMET: hasInmet ? 30 : 0 },
    concordance:
      Array.isArray(safe.concordance) && safe.concordance.length
        ? safe.concordance
        : ["Dados meteorológicos disponíveis"],
  };
}

function buildRealWeatherData(
  city: string,
  state: string,
  country: string,
  openMeteoData: any,
  inmetObs: any,
  lang: string,
): any {
  const current = openMeteoData?.current || {};
  const hourly = openMeteoData?.hourly || {};
  const daily = openMeteoData?.daily || {};

  const currentTemp = num(current.temperature_2m);
  const currentHumidity = num(current.relative_humidity_2m);
  const currentWind = num(current.wind_speed_10m);
  const currentPressure = num(current.surface_pressure);
  const currentCode = num(current.weather_code, 0);

  const firstHourly = Math.max(
    0,
    Array.isArray(hourly.time)
      ? hourly.time.findIndex(
          (time: string) => time >= String(current.time || ""),
        )
      : -1,
  );
  const startIndex = firstHourly >= 0 ? firstHourly : 0;

  const max = arrayValue(
    daily,
    "temperature_2m_max",
    0,
    inmetObs?.tempMax ?? currentTemp,
  );
  const min = arrayValue(
    daily,
    "temperature_2m_min",
    0,
    inmetObs?.tempMin ?? currentTemp,
  );
  const pop = arrayValue(daily, "precipitation_probability_max", 0, 0);

  const hourlyResult = Array.from({ length: 24 }, (_, offset) => {
    const index = startIndex + offset;
    const time = hourly.time?.[index] || "";
    return {
      time: time
        ? String(time).slice(11, 16)
        : `${String((new Date().getHours() + offset) % 24).padStart(2, "0")}:00`,
      temp: arrayValue(hourly, "temperature_2m", index, currentTemp),
      pop: arrayValue(hourly, "precipitation_probability", index, pop),
      condition: weatherCondition(
        arrayValue(hourly, "weather_code", index, currentCode),
      ),
    };
  });

  const dailyResult = Array.from(
    { length: Math.min(5, Array.isArray(daily.time) ? daily.time.length : 0) },
    (_, index) => {
      const date = String(daily.time[index] || "");
      const dateObj = date ? new Date(`${date}T12:00:00`) : new Date();
      return {
        day:
          index === 0
            ? lang.toLowerCase().startsWith("en")
              ? "Today"
              : "Hoje"
            : new Intl.DateTimeFormat(lang, { weekday: "long" }).format(
                dateObj,
              ),
        date: dateObj.toLocaleDateString(lang, {
          day: "numeric",
          month: "short",
        }),
        max: arrayValue(daily, "temperature_2m_max", index, max),
        min: arrayValue(daily, "temperature_2m_min", index, min),
        pop: arrayValue(daily, "precipitation_probability_max", index, 0),
        condition: weatherCondition(
          arrayValue(daily, "weather_code", index, currentCode),
        ),
        description: "",
      };
    },
  );

  const hasInmet = Boolean(inmetObs?.available);

  return {
    city,
    state,
    country,
    temp: currentTemp,
    feelsLike: num(current.apparent_temperature, currentTemp),
    max,
    min,
    humidity: currentHumidity,
    uvIndex: num(
      current.uv_index,
      arrayValue(hourly, "uv_index", startIndex, 0),
    ),
    pressure: currentPressure,
    visibility: num(current.visibility, 0) / 1000,
    windSpeed: currentWind,
    windDirection: compassDirection(num(current.wind_direction_10m, NaN)),
    condition: weatherCondition(currentCode),
    dewPoint: num(current.dew_point_2m, 0),
    pop,
    rainMm: num(current.rain, num(current.precipitation, 0)),
    cloudCover: num(current.cloud_cover, 0),
    hourly: hourlyResult,
    daily: dailyResult,
    aiSummary: hasInmet
      ? "Dados meteorológicos consolidados a partir da previsão por coordenadas e de observação municipal disponível."
      : "Dados meteorológicos consolidados a partir da previsão por coordenadas.",
    decisionCenter: ensureCompleteDecisionCenter(null),
    cie: ensureCompleteCie(null, hasInmet),
    dataSource: {
      primary: "Open-Meteo",
      secondary: hasInmet ? "INMET" : null,
      realData: true,
      simulated: false,
      coordinates: {
        latitude: num(openMeteoData?.latitude),
        longitude: num(openMeteoData?.longitude),
      },
      timezone: openMeteoData?.timezone || "auto",
      updatedAt: current.time || null,
    },
  };
}

export async function generateConsolidatedPrediction(
  city: string,
  state: string,
  country: string,
  openMeteoData: any,
  inmetObs: any,
  lang = "pt-BR",
  env: Env = {},
): Promise<any> {
  if (
    !openMeteoData?.current ||
    !openMeteoData?.daily ||
    !openMeteoData?.hourly
  ) {
    throw new Error(
      "A fonte meteorológica principal não retornou dados suficientes.",
    );
  }

  const base = buildRealWeatherData(
    city,
    state,
    country,
    openMeteoData,
    inmetObs,
    lang,
  );

  const ai = getGeminiClient(env);
  if (!ai) return base;

  const systemInstruction = `Você é o analista textual do ClimaAgora IA.
Receba dados meteorológicos já calculados e NÃO altere, estime, invente ou substitua nenhum valor meteorológico.
Responda sempre no idioma "${lang}".
Retorne apenas JSON válido. Gere somente resumo, recomendações e avaliação de consenso.`;

  const prompt = `Localidade: ${city}, ${state}, ${country}
Dados meteorológicos reais:
${JSON.stringify({
  temp: base.temp,
  feelsLike: base.feelsLike,
  max: base.max,
  min: base.min,
  humidity: base.humidity,
  windSpeed: base.windSpeed,
  windDirection: base.windDirection,
  pressure: base.pressure,
  uvIndex: base.uvIndex,
  pop: base.pop,
  condition: base.condition,
  daily: base.daily,
  inmet: inmetObs?.available ? inmetObs : null,
})}

Gere:
- aiSummary: resumo curto e factual;
- decisionCenter: agriculture, livestock, solar, fishing, navigation e alerts;
- cie: sources, consensus, justification, confidenceIndex, regionalHistoricalError, divergenceValue, rainProbabilityConsolidated, weights e concordance.
Não altere qualquer número meteorológico da entrada.`;

  try {
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiSummary: { type: Type.STRING },
              decisionCenter: {
                type: Type.OBJECT,
                properties: {
                  agriculture: { type: Type.OBJECT },
                  livestock: { type: Type.OBJECT },
                  solar: { type: Type.OBJECT },
                  fishing: { type: Type.OBJECT },
                  navigation: { type: Type.OBJECT },
                  alerts: { type: Type.OBJECT },
                },
              },
              cie: { type: Type.OBJECT },
            },
            required: ["aiSummary", "decisionCenter", "cie"],
          },
        },
      }),
    );

    const text = String(response.text || "")
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(text);

    return {
      ...base,
      aiSummary: parsed.aiSummary || base.aiSummary,
      decisionCenter: ensureCompleteDecisionCenter(parsed.decisionCenter),
      cie: ensureCompleteCie(parsed.cie, Boolean(inmetObs?.available)),
    };
  } catch (error: any) {
    console.warn(
      "[LLMManagerWeather] Gemini indisponível; mantendo dados meteorológicos reais:",
      error?.message || error,
    );
    return base;
  }
}
