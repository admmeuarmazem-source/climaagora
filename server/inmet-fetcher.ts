/**
 * INMET (Instituto Nacional de Meteorologia - Governo Federal do Brasil) Data Fetcher
 *
 * Retrieves official real-time meteorological observations and daily forecasts
 * directly from INMET's REST API (apiprevmet3.inmet.gov.br) by municipality IBGE code.
 */

import fetch from "node-fetch";

export interface InmetObservation {
  available: boolean;
  stationName?: string;
  entity?: string;
  uf?: string;
  ibgeCode?: string;
  summary?: string;
  tempMax?: number;
  tempMin?: number;
  windDirection?: string;
  windSpeed?: string;
  source: string;
  reason?: string;
}

const PRESET_IBGE_CODES: Record<string, string> = {
  "alagoinhas": "2900702",
  "salvador": "2927408",
  "feira de santana": "2910800",
  "sao paulo": "3550308",
  "rio de janeiro": "3304557",
  "brasilia": "5300108",
  "belo horizonte": "3106200",
  "curitiba": "4106902",
  "porto alegre": "4314902",
  "recife": "2611606",
  "fortaleza": "2304400",
  "belem": "1501402",
  "manaus": "1302603",
  "goiania": "5208707",
  "cuiaba": "5103403",
  "campo grande": "5002704",
  "vitoria": "3205309",
  "florianopolis": "4205407",
  "maceio": "2704302",
  "aracaju": "2800308",
  "natal": "2408102",
  "joao pessoa": "2507507",
  "teresina": "2211001",
  "sao luis": "2111300",
  "macapa": "1600303",
  "porto velho": "1100205",
  "boa vista": "1400100",
  "rio branco": "1200401",
  "palmas": "1721000",
  "camacari": "2905701",
  "vitoria da conquista": "2933307",
  "ilheus": "2913606",
  "juazeiro": "2918407",
  "barreiras": "2903201",
  "itabuna": "2914802",
  "lauro de freitas": "2919207"
};

// In-memory cache for INMET requests (15-minute TTL)
const inmetCache: Record<string, { data: InmetObservation; timestamp: number }> = {};
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function fetchInmetObservation(
  cityName?: string,
  lat?: number,
  lon?: number
): Promise<InmetObservation> {
  const cacheKey = `${(cityName || "").toLowerCase().trim()}_${lat?.toFixed(2)}_${lon?.toFixed(2)}`;
  const cached = inmetCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let ibgeCode: string | undefined;
    const cleanCity = (cityName || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    // 1. Check preset IBGE lookup map
    for (const [key, code] of Object.entries(PRESET_IBGE_CODES)) {
      if (cleanCity.includes(key)) {
        ibgeCode = code;
        break;
      }
    }

    // 2. If not found in preset, perform dynamic Nominatim lookup for IBGE geocode
    if (!ibgeCode && cityName) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&extratags=1`;
        const nomRes = await fetch(nomUrl, {
          headers: { "User-Agent": "ClimaAgora/1.0 (admmeuarmazem@gmail.com)" }
        });
        if (nomRes.ok) {
          const list: any = await nomRes.json();
          if (Array.isArray(list) && list.length > 0) {
            const tags = list[0]?.extratags || {};
            ibgeCode = tags["IBGE:GEOCODIGO"] || tags["ibge_code"] || tags["ibge"];
          }
        }
      } catch (nomErr) {
        console.warn("[INMET Fetcher] Nominatim lookup failed:", nomErr);
      }
    }

    if (!ibgeCode) {
      const fallback: InmetObservation = {
        available: false,
        source: "INMET (Instituto Nacional de Meteorologia)",
        reason: "Município ou estação INMET não identificada para este local"
      };
      inmetCache[cacheKey] = { data: fallback, timestamp: Date.now() };
      return fallback;
    }

    // 3. Query INMET Official REST Endpoint
    const inmetUrl = `https://apiprevmet3.inmet.gov.br/previsao/${ibgeCode}`;
    console.log(`[INMET Fetcher] Querying INMET API for IBGE code ${ibgeCode}: ${inmetUrl}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(inmetUrl, {
      signal: controller.signal as any,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ClimaAgora/1.0"
      }
    });
    clearTimeout(timer);

    if (res.ok) {
      const payload: any = await res.json();
      const cityObj = payload?.[ibgeCode];
      if (cityObj) {
        const dateKeys = Object.keys(cityObj);
        const todayKey = dateKeys[0];
        const todayData = cityObj[todayKey];
        const manha = todayData?.manha || todayData?.tarde || todayData?.noite;

        if (manha) {
          const result: InmetObservation = {
            available: true,
            stationName: `Estação / Município INMET — ${manha.entidade} (${manha.uf})`,
            entity: manha.entidade,
            uf: manha.uf,
            ibgeCode: ibgeCode,
            summary: manha.resumo || "Condições locais monitoradas pelo INMET",
            tempMax: typeof manha.temp_max === "number" ? manha.temp_max : parseFloat(manha.temp_max),
            tempMin: typeof manha.temp_min === "number" ? manha.temp_min : parseFloat(manha.temp_min),
            windDirection: manha.dir_vento || "N/A",
            windSpeed: manha.int_vento || "Normal",
            source: "INMET - Instituto Nacional de Meteorologia (Governo Federal)"
          };
          console.log(`[INMET Fetcher] Successfully retrieved INMET data for ${manha.entidade} (${manha.uf})`);
          inmetCache[cacheKey] = { data: result, timestamp: Date.now() };
          return result;
        }
      }
    }
  } catch (err: any) {
    console.warn(`[INMET Fetcher] INMET API call failed or timed out:`, err?.message || err);
  }

  const fallbackResult: InmetObservation = {
    available: false,
    source: "INMET (Instituto Nacional de Meteorologia)",
    reason: "Rede INMET indisponível temporariamente para este quadrante"
  };
  inmetCache[cacheKey] = { data: fallbackResult, timestamp: Date.now() };
  return fallbackResult;
}
