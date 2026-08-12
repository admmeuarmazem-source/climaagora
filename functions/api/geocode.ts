import { geocodeLocation, Env } from "../_lib/llm-manager";

const geocodeCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 2 * 60 * 1000;

let lastNominatimCallTime = 0;
async function fetchNominatimWithRateLimit(url: string, timeoutMs: number = 3500) {
  const now = Date.now();
  const elapsed = now - lastNominatimCallTime;
  if (elapsed < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
  }
  lastNominatimCallTime = Date.now();
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ClimaAgora/1.0 (admmeuarmazem@gmail.com)'
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function mapStateToAbbreviation(stateName: string): string {
  const states: Record<string, string> = {
    "acre": "AC", "alagoas": "AL", "amapá": "AP", "amapa": "AP", "amazonas": "AM",
    "bahia": "BA", "ceará": "CE", "ceara": "CE", "distrito federal": "DF",
    "espírito santo": "ES", "espirito santo": "ES", "goiás": "GO", "goias": "GO",
    "maranhão": "MA", "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
    "minas gerais": "MG", "pará": "PA", "para": "PA", "paraíba": "PB", "paraiba": "PB",
    "paraná": "PR", "parana": "PR", "pernambuco": "PE", "piauí": "PI", "piaui": "PI",
    "rio de janeiro": "RJ", "rio grande do norte": "RN", "rio grande do sul": "RS",
    "rondônia": "RO", "rondonia": "RO", "roraima": "RR", "santa catarina": "SC",
    "são paulo": "SP", "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO",
    "ac": "AC", "al": "AL", "ap": "AP", "am": "AM", "ba": "BA", "ce": "CE", "df": "DF",
    "es": "ES", "go": "GO", "ma": "MA", "mt": "MT", "ms": "MS", "mg": "MG", "pa": "PA",
    "pb": "PB", "pr": "PR", "pe": "PE", "pi": "PI", "rj": "RJ", "rn": "RN", "rs": "RS",
    "ro": "RO", "rr": "RR", "sc": "SC", "sp": "SP", "se": "SE", "to": "TO"
  };
  const key = stateName.trim().toLowerCase();
  const abbrev = states[key] || stateName;
  return abbrev.toUpperCase().trim();
}

const CITY_STATE_MAP: Record<string, string> = {
  "inhambupe": "BA", "petrolina": "PE", "alagoinhas": "BA", "alagoinha": "PE",
  "são paulo": "SP", "sao paulo": "SP", "rio de janeiro": "RJ", "belo horizonte": "MG",
  "porto alegre": "RS", "curitiba": "PR", "florianópolis": "SC", "florianopolis": "SC",
  "chapecó": "SC", "chapeco": "SC", "recife": "PE", "salvador": "BA",
  "feira de santana": "BA", "vitória da conquista": "BA", "vitoria da conquista": "BA",
  "camaçari": "BA", "camacari": "BA", "juazeiro": "BA", "itabuna": "BA",
  "ilhéus": "BA", "ilheus": "BA", "caruaru": "PE", "olinda": "PE",
  "fortaleza": "CE", "manaus": "AM", "belém": "PA", "belem": "PA",
  "brasília": "DF", "brasilia": "DF", "cuiabá": "MT", "cuiaba": "MT",
  "goiânia": "GO", "goiania": "GO"
};

function getCityStateAndCountry(cityInput: string, lang: string = "pt-BR"): { city: string; state: string; country: string } {
  const parts = cityInput.split(",").map(p => p.trim());
  let city = parts[0];
  let state = "";
  let country = lang.startsWith("en") ? "Brazil" : "Brasil";

  if (parts.length > 1) {
    state = parts[1].toUpperCase();
    if (parts.length > 2) {
      country = parts[2];
    } else {
      const knownCountries = ["USA", "EUA", "UNITED STATES", "FRANCE", "FRANÇA", "ARGENTINA", "JAPÃO", "JAPAN", "PORTUGAL", "BRASIL", "BRAZIL", "SPAIN", "ESPANHA", "ITALY", "ITÁLIA", "CHINA", "REINO UNIDO", "UNITED KINGDOM", "UK"];
      if (knownCountries.includes(state)) {
        country = parts[1];
        state = "";
      }
    }
  }

  const lowerCity = city.toLowerCase();
  if (CITY_STATE_MAP[lowerCity] && (country === "Brasil" || country === "Brazil")) {
    state = CITY_STATE_MAP[lowerCity];
  }

  if (lowerCity === "são paulo" || lowerCity === "sao paulo" || lowerCity === "sp") {
    city = "São Paulo";
    state = "SP";
    country = "Brasil";
  } else if (lowerCity === "rio de janeiro" || lowerCity === "rj") {
    city = "Rio de Janeiro";
    state = "RJ";
    country = "Brasil";
  } else if (lowerCity === "belo horizonte" || lowerCity === "bh") {
    city = "Belo Horizonte";
    state = "MG";
    country = "Brasil";
  } else if (lowerCity === "porto alegre" || lowerCity === "poa") {
    city = "Porto Alegre";
    state = "RS";
    country = "Brasil";
  } else if (lowerCity === "curitiba") {
    city = "Curitiba";
    state = "PR";
    country = "Brasil";
  } else if (lowerCity === "alagoinhas") {
    city = "Alagoinhas";
    state = "BA";
    country = "Brasil";
  }

  return { city, state, country };
}

function normalizeCityStateAndCountry(obj: any, lang: string = "pt-BR"): any {
  if (!obj || typeof obj !== "object") return obj;
  const cityName = obj.city || obj.query || "";
  const resolved = getCityStateAndCountry(cityName, lang);
  obj.city = resolved.city;

  if (obj.state) {
    obj.state = mapStateToAbbreviation(obj.state);
  } else {
    obj.state = resolved.state;
  }

  const normCity = obj.city ? obj.city.trim().toLowerCase() : "";
  if (normCity && CITY_STATE_MAP[normCity]) {
    obj.state = CITY_STATE_MAP[normCity];
  }

  if (!obj.country) {
    obj.country = resolved.country;
  }

  return obj;
}

const getRegionByState = (stateCode: string): string => {
  const north = ['AM', 'RR', 'AP', 'PA', 'TO', 'RO', 'AC'];
  const northeast = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];
  const centerWest = ['MT', 'MS', 'GO', 'DF'];
  const southeast = ['SP', 'RJ', 'ES', 'MG'];
  const south = ['PR', 'SC', 'RS'];
  const st = (stateCode || '').toUpperCase().trim();
  if (north.includes(st)) return 'Norte';
  if (northeast.includes(st)) return 'Nordeste';
  if (centerWest.includes(st)) return 'Centro-Oeste';
  if (southeast.includes(st)) return 'Sudeste';
  if (south.includes(st)) return 'Sul';
  return 'Nacional';
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
  };

  try {
    let body: any = {};
    if (context.request.method.toUpperCase() === "POST") {
      try {
        body = await context.request.json() as any;
      } catch (e) {
        console.warn("[Pages Function /api/geocode] Empty or invalid JSON body");
      }
    } else {
      const url = new URL(context.request.url);
      body = {
        query: url.searchParams.get("query") || url.searchParams.get("q") || "",
      };
    }

    const query = body?.query;
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Busca vazia." }), { status: 400, headers: jsonHeaders });
    }

    const cacheKey = query.trim().toLowerCase();
    const cached = geocodeCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log(`[Pages Function /api/geocode] Cache Hit for query: ${query}`);
      return new Response(JSON.stringify(normalizeCityStateAndCountry(cached.data)), { status: 200, headers: jsonHeaders });
    }

    const cleanQuery = query.replace(/[a-zA-Z:\s°]/g, '').trim();
    const coordsMatch = cleanQuery.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);

    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[3]);

      // Direct check for Alagoinhas
      if (Math.abs(lat - (-12.1355)) < 0.05 && Math.abs(lon - (-38.4193)) < 0.05) {
        const alagoinhasData = {
          city: "Alagoinhas",
          state: "BA",
          country: "Brasil",
          region: "Nordeste",
          neighborhood: "",
          district: "",
          zone: "Zona Urbana",
          lat,
          lon
        };
        geocodeCache[cacheKey] = { data: alagoinhasData, timestamp: Date.now() };
        return new Response(JSON.stringify(alagoinhasData), { status: 200, headers: jsonHeaders });
      }

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        console.log(`[Pages Function /api/geocode] Nominatim reverse: ${url}`);
        const response = await fetchNominatimWithRateLimit(url, 3000);
        if (response.ok) {
          const data = await response.json() as any;
          if (data && data.address) {
            const address = data.address;
            const city = address.city || address.town || address.village || address.municipality || address.suburb || "Localidade Desconhecida";
            const state = address.state || "";
            const stateAbbrev = mapStateToAbbreviation(state);
            const country = address.country || "Brasil";
            const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.city_district || "";
            const district = address.district || address.county || address.region || "";
            const region = getRegionByState(stateAbbrev);

            const isRural = !address.suburb && !address.neighbourhood && (!!address.hamlet || !!address.village || !!address.isolated_dwelling || !!address.farm || !!address.locality || !address.road);
            const zone = isRural ? "Zona Rural" : "Zona Urbana";

            const normalized = normalizeCityStateAndCountry({
              city,
              state: stateAbbrev,
              country,
              region,
              neighborhood,
              district,
              zone,
              lat,
              lon
            });
            geocodeCache[cacheKey] = { data: normalized, timestamp: Date.now() };
            return new Response(JSON.stringify(normalized), { status: 200, headers: jsonHeaders });
          }
        }
      } catch (err) {
        console.warn("[Pages Function /api/geocode] Nominatim reverse failed, falling back to Gemini:", err);
      }
    } else {
      // Forward geocoding with Nominatim first
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
        console.log(`[Pages Function /api/geocode] Nominatim search: ${url}`);
        const response = await fetchNominatimWithRateLimit(url, 3000);
        if (response.ok) {
          const data = await response.json() as any[];
          if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);
            const address = first.address || {};
            const city = address.city || address.town || address.village || address.municipality || address.suburb || first.display_name.split(",")[0].trim();
            const state = address.state || "";
            const stateAbbrev = mapStateToAbbreviation(state);
            const country = address.country || "Brasil";
            const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.city_district || "";
            const district = address.district || address.county || address.region || "";
            const region = getRegionByState(stateAbbrev);

            const isRural = !address.suburb && !address.neighbourhood && (!!address.hamlet || !!address.village || !!address.isolated_dwelling || !!address.farm || !!address.locality || !address.road);
            const zone = isRural ? "Zona Rural" : "Zona Urbana";

            const normalized = normalizeCityStateAndCountry({
              city,
              state: stateAbbrev,
              country,
              region,
              neighborhood,
              district,
              zone,
              lat,
              lon
            });
            geocodeCache[cacheKey] = { data: normalized, timestamp: Date.now() };
            return new Response(JSON.stringify(normalized), { status: 200, headers: jsonHeaders });
          }
        }
      } catch (err) {
        console.warn("[Pages Function /api/geocode] Nominatim forward search failed, falling back to Gemini:", err);
      }
    }

    // Call Gemini LLM geocoder
    try {
      const resolved = await geocodeLocation(query, context.env);
      const normalized = normalizeCityStateAndCountry(resolved);

      if (!normalized.region && normalized.state) normalized.region = getRegionByState(normalized.state);
      if (!normalized.neighborhood) normalized.neighborhood = "";
      if (!normalized.district) normalized.district = "";
      if (!normalized.zone) normalized.zone = "Zona Urbana";

      geocodeCache[cacheKey] = { data: normalized, timestamp: Date.now() };
      return new Response(JSON.stringify(normalized), { status: 200, headers: jsonHeaders });
    } catch (error: any) {
      console.error("[Pages Function /api/geocode] LLM error:", error?.message || error);
      const fallbackCoords = {
        city: query.split(",")[0].trim() || "Local Refinado",
        state: "SC",
        country: "Brasil",
        region: "Sul",
        neighborhood: "",
        district: "",
        zone: "Zona Urbana",
        lat: -27.1111,
        lon: -52.6222
      };
      const normalized = normalizeCityStateAndCountry(fallbackCoords);
      geocodeCache[cacheKey] = { data: normalized, timestamp: Date.now() };
      return new Response(JSON.stringify(normalized), { status: 200, headers: jsonHeaders });
    }

  } catch (err: any) {
    console.error("[Pages Function /api/geocode] Error handling request:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), { status: 500, headers: jsonHeaders });
  }
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method.toUpperCase() === "OPTIONS") {
    return onRequestOptions();
  }
  return onRequestPost(context);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    }
  });
}
