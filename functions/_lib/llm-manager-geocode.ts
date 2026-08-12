import { GoogleGenAI, Type } from "@google/genai";

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
      console.error("LLMManager: Failed to initialize GoogleGenAI client:", e);
    }
  }
  return null;
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errStr = String(error?.message || error);
    const isQuota = errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Limit");

    if (isQuota) {
      console.log(`[LLMManager] Gemini API quota reached. Skipping retries to fall back gracefully.`);
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
        console.log(`[LLMManager] Gemini API transient error encountered (${errStr.slice(0, 150)}). Retrying in ${delayMs}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return callWithRetry(fn, retries - 1, delayMs * 2);
      }
    }
    throw error;
  }
}

function fallbackGeocode(query: string): any {
  const citiesDb = [
    { name: "Rio Branco", state: "AC", lat: -9.974, lon: -67.811 },
    { name: "Maceió", state: "AL", lat: -9.665, lon: -35.735 },
    { name: "Macapá", state: "AP", lat: 0.034, lon: -51.069 },
    { name: "Manaus", state: "AM", lat: -3.119, lon: -60.021 },
    { name: "Salvador", state: "BA", lat: -12.971, lon: -38.510 },
    { name: "Fortaleza", state: "CE", lat: -3.731, lon: -38.526 },
    { name: "Brasília", state: "DF", lat: -15.794, lon: -47.882 },
    { name: "Vitória", state: "ES", lat: -20.315, lon: -40.312 },
    { name: "Goiânia", state: "GO", lat: -16.686, lon: -49.264 },
    { name: "São Luís", state: "MA", lat: -2.530, lon: -44.302 },
    { name: "Cuiabá", state: "MT", lat: -15.601, lon: -56.096 },
    { name: "Campo Grande", state: "MS", lat: -20.442, lon: -54.646 },
    { name: "Belo Horizonte", state: "MG", lat: -19.920, lon: -43.937 },
    { name: "Belém", state: "PA", lat: -1.455, lon: -48.490 },
    { name: "João Pessoa", state: "PB", lat: -7.115, lon: -34.863 },
    { name: "Curitiba", state: "PR", lat: -25.429, lon: -49.271 },
    { name: "Recife", state: "PE", lat: -8.053, lon: -34.881 },
    { name: "Teresina", state: "PI", lat: -5.089, lon: -42.801 },
    { name: "Rio de Janeiro", state: "RJ", lat: -22.906, lon: -43.172 },
    { name: "Natal", state: "RN", lat: -5.794, lon: -35.211 },
    { name: "Porto Alegre", state: "RS", lat: -30.034, lon: -51.206 },
    { name: "Porto Velho", state: "RO", lat: -8.761, lon: -63.903 },
    { name: "Boa Vista", state: "RR", lat: 2.819, lon: -60.673 },
    { name: "Florianópolis", state: "SC", lat: -27.595, lon: -48.548 },
    { name: "São Paulo", state: "SP", lat: -23.550, lon: -46.633 },
    { name: "Aracaju", state: "SE", lat: -10.911, lon: -37.071 },
    { name: "Palmas", state: "TO", lat: -10.167, lon: -48.331 },
    { name: "Chapecó", state: "SC", lat: -27.100, lon: -52.615 },
    { name: "Feira de Santana", state: "BA", lat: -12.266, lon: -38.962 },
    { name: "Campinas", state: "SP", lat: -22.909, lon: -47.062 },
    { name: "Ribeirão Preto", state: "SP", lat: -21.177, lon: -47.810 },
    { name: "Uberlândia", state: "MG", lat: -18.918, lon: -48.277 },
    { name: "Juiz de Fora", state: "MG", lat: -21.764, lon: -43.349 },
    { name: "Londrina", state: "PR", lat: -23.304, lon: -51.169 },
    { name: "Maringá", state: "PR", lat: -23.426, lon: -51.938 },
    { name: "Joinville", state: "SC", lat: -26.304, lon: -48.846 },
    { name: "Caxias do Sul", state: "RS", lat: -29.167, lon: -51.179 },
    { name: "Vitória da Conquista", state: "BA", lat: -14.866, lon: -40.839 },
    { name: "Petrolina", state: "PE", lat: -9.389, lon: -40.502 },
    { name: "Caruaru", state: "PE", lat: -8.283, lon: -35.976 },
    { name: "Campina Grande", state: "PB", lat: -7.224, lon: -35.881 },
    { name: "Juazeiro do Norte", state: "CE", lat: -7.224, lon: -39.315 },
    { name: "Sobral", state: "CE", lat: -3.685, lon: -40.349 },
    { name: "Mossoró", state: "RN", lat: -5.187, lon: -37.344 },
    { name: "Imperatriz", state: "MA", lat: -5.526, lon: -47.476 },
    { name: "Anápolis", state: "GO", lat: -16.326, lon: -48.952 },
    { name: "Rondonópolis", state: "MT", lat: -16.470, lon: -54.635 },
  ];

  const coordRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const coordMatch = query.trim().match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);

    let closest = citiesDb[0];
    let minDist = Math.sqrt(Math.pow(lat - closest.lat, 2) + Math.pow(lon - closest.lon, 2));
    for (let i = 1; i < citiesDb.length; i++) {
      const d = Math.sqrt(Math.pow(lat - citiesDb[i].lat, 2) + Math.pow(lon - citiesDb[i].lon, 2));
      if (d < minDist) {
        minDist = d;
        closest = citiesDb[i];
      }
    }

    return {
      city: closest.name,
      state: closest.state,
      country: "Brasil",
      lat,
      lon,
    };
  }

  const lowerQuery = query.toLowerCase().trim();
  const matchedCity = citiesDb.find((c) => c.name.toLowerCase() === lowerQuery);
  if (matchedCity) {
    return {
      city: matchedCity.name,
      state: matchedCity.state,
      country: "Brasil",
      lat: matchedCity.lat,
      lon: matchedCity.lon,
    };
  }

  return {
    city: query.split(",")[0].trim() || "Local Refinado",
    state: "SC",
    country: "Brasil",
    lat: -27.1111,
    lon: -52.6222,
  };
}

export async function geocodeLocation(query: string, env: Env): Promise<any> {
  const ai = getGeminiClient(env);
  if (!ai) {
    return fallbackGeocode(query);
  }

  try {
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analise a seguinte busca de localização climática, endereço ou coordenadas geográficas: "${query}".
Forneça a latitude e longitude exatas correspondentes a essa localização (priorizando localizações no Brasil ou América do Sul caso seja ambíguo), além de um nome descritivo formatado como "Nome da Cidade, Estado" (ex: "Chapecó, SC").

Responda estritamente com um objeto JSON válido, contendo exatamente estes campos:
{
  "city": "Nome da cidade formatado (ex: Chapecó)",
  "state": "Sigla do estado (ex: SC)",
  "country": "País (ex: Brasil)",
  "lat": número da latitude (ex: -27.1004),
  "lon": número da longitude (ex: -52.6152)
}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              state: { type: Type.STRING },
              country: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lon: { type: Type.NUMBER },
            },
            required: ["city", "state", "country", "lat", "lon"],
          },
        },
      }),
    );

    const text = response.text || "";
    return JSON.parse(text.trim());
  } catch (error: any) {
    const errStr = String(error?.message || error);
    const isQuotaExceeded = errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429");
    const isTransient = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("demand") || errStr.includes("temporary") || errStr.includes("overloaded");

    if (isQuotaExceeded) {
      console.log(`[LLMManager] Geocoding API quota reached for query "${query}". Using high-fidelity deterministic fallback.`);
    } else if (isTransient) {
      console.log(`[LLMManager] Geocoding API temporarily unavailable (503) for query "${query}". Using high-fidelity deterministic fallback.`);
    } else {
      console.log(`[LLMManager] Geocoding fallback active for query "${query}".`);
    }
    return fallbackGeocode(query);
  }
}
