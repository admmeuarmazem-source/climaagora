import { fetchNominatimWithRateLimit } from "./nominatim-utils";

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
  alagoinhas: "2900702",
  salvador: "2927408",
  "feira de santana": "2910800",
  "sao paulo": "3550308",
  "rio de janeiro": "3304557",
  brasilia: "5300108",
  "belo horizonte": "3106202",
  curitiba: "4106902",
  "porto alegre": "4314902",
  recife: "2611606",
  fortaleza: "2304400",
  belem: "1501402",
  manaus: "1302603",
  goiania: "5208707",
  cuiaba: "5103403",
  "campo grande": "5002704",
  vitoria: "3205309",
  florianopolis: "4205407",
  maceio: "2704302",
  aracaju: "2800308",
  natal: "2408102",
  "joao pessoa": "2507507",
  teresina: "2211001",
  "sao luis": "2111300",
  macapa: "1600303",
  "porto velho": "1100205",
  "boa vista": "1400100",
  "rio branco": "1200401",
  palmas: "1721000",
  camacari: "2905701",
  "vitoria da conquista": "2933307",
  ilheus: "2913606",
  juazeiro: "2918407",
  barreiras: "2903201",
  itabuna: "2914802",
  "lauro de freitas": "2919207",
};

const inmetCache = new Map<
  string,
  { data: InmetObservation; timestamp: number }
>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function normalizeCity(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function validCoordinates(lat?: number, lon?: number): boolean {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lon === "number" &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}

async function findIbgeCode(
  cityName?: string,
  lat?: number,
  lon?: number,
): Promise<string | undefined> {
  const cleanCity = normalizeCity(cityName || "");

  if (cleanCity) {
    for (const [key, code] of Object.entries(PRESET_IBGE_CODES)) {
      if (cleanCity === key || cleanCity.includes(key)) return code;
    }
  }

  if (!validCoordinates(lat, lon) && !cityName) return undefined;

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      extratags: "1",
      limit: "1",
    });

    if (validCoordinates(lat, lon)) {
      params.set("lat", String(lat));
      params.set("lon", String(lon));
      params.set("zoom", "10");
    } else {
      params.set("q", String(cityName));
      params.set("countrycodes", "br");
    }

    const response = await fetchNominatimWithRateLimit(
      `https://nominatim.openstreetmap.org/${validCoordinates(lat, lon) ? "reverse" : "search"}?${params.toString()}`,
      5000,
    );

    if (!response.ok) return undefined;

    const payload: any = await response.json();
    const item = Array.isArray(payload) ? payload[0] : payload;
    const tags = item?.extratags || {};
    const address = item?.address || {};

    return (
      tags["IBGE:GEOCODIGO"] ||
      tags["ibge_code"] ||
      tags["ibge"] ||
      address["IBGE:GEOCODIGO"] ||
      address["ibge_code"]
    );
  } catch (error) {
    console.warn(
      "[INMET Fetcher] Não foi possível resolver o código IBGE:",
      error,
    );
    return undefined;
  }
}

export async function fetchInmetObservation(
  cityName?: string,
  lat?: number,
  lon?: number,
): Promise<InmetObservation> {
  const cacheKey = `${normalizeCity(cityName || "")}_${lat?.toFixed(3) || ""}_${lon?.toFixed(3) || ""}`;
  const cached = inmetCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const ibgeCode = await findIbgeCode(cityName, lat, lon);

    if (!ibgeCode) {
      const unavailable: InmetObservation = {
        available: false,
        source: "INMET",
        reason:
          "Nenhum código IBGE/município INMET foi identificado para esta localização.",
      };
      inmetCache.set(cacheKey, { data: unavailable, timestamp: Date.now() });
      return unavailable;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://apiprevmet3.inmet.gov.br/previsao/${encodeURIComponent(ibgeCode)}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "ClimaAgora/1.0 (admmeuarmazem@gmail.com)",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) throw new Error(`INMET HTTP ${response.status}`);

      const payload: any = await response.json();
      const cityObj = payload?.[ibgeCode];

      if (cityObj) {
        const dateKeys = Object.keys(cityObj);
        const todayData = dateKeys.length ? cityObj[dateKeys[0]] : undefined;
        const period =
          todayData?.manha || todayData?.tarde || todayData?.noite || todayData;

        if (period) {
          const tempMax = Number(period.temp_max);
          const tempMin = Number(period.temp_min);

          const result: InmetObservation = {
            available: true,
            stationName: `INMET — ${period.entidade || cityName || "Município"}`,
            entity: period.entidade,
            uf: period.uf,
            ibgeCode,
            summary: period.resumo || "Condições previstas pelo INMET.",
            tempMax: Number.isFinite(tempMax) ? tempMax : undefined,
            tempMin: Number.isFinite(tempMin) ? tempMin : undefined,
            windDirection: period.dir_vento || undefined,
            windSpeed: period.int_vento || undefined,
            source: "INMET",
          };

          inmetCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (error: any) {
    console.warn("[INMET Fetcher] Falha na consulta:", error?.message || error);
  }

  const unavailable: InmetObservation = {
    available: false,
    source: "INMET",
    reason:
      "INMET indisponível ou sem previsão municipal para esta localização.",
  };

  inmetCache.set(cacheKey, { data: unavailable, timestamp: Date.now() });
  return unavailable;
}
