import {
  fetchNominatimWithRateLimit,
  fetchWithTimeout,
} from "./nominatim-utils";

export interface GeocodedLocation {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  elevation?: number;
  source: "open-meteo" | "nominatim" | "cloudflare";
  displayName?: string;
}

const forwardCache = new Map<
  string,
  { data: GeocodedLocation; timestamp: number }
>();
const reverseCache = new Map<
  string,
  { data: GeocodedLocation; timestamp: number }
>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeText(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function languageCode(lang: string): string {
  return String(lang || "pt-BR")
    .toLowerCase()
    .startsWith("pt")
    ? "pt"
    : "en";
}

function scoreResult(result: any, query: string): number {
  const q = normalizeText(query);
  const name = normalizeText(result?.name);
  const admin1 = normalizeText(result?.admin1);
  const admin2 = normalizeText(result?.admin2);
  const country = normalizeText(result?.country);

  let score = 0;
  if (name === q) score += 100;
  if (name.includes(q) || q.includes(name)) score += 35;
  if (admin1 && q.includes(admin1)) score += 10;
  if (admin2 && q.includes(admin2)) score += 10;
  if (country && q.includes(country)) score += 10;
  if (typeof result?.population === "number")
    score += Math.min(result.population / 100000, 20);
  if (
    ["PPLC", "PPLA", "PPLA2", "PPLA3", "PPLA4"].includes(result?.feature_code)
  )
    score += 5;
  return score;
}

function validCoordinates(lat: unknown, lon: unknown): boolean {
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

export async function geocodeLocation(
  query: string,
  lang: string = "pt-BR",
): Promise<GeocodedLocation | null> {
  const clean = String(query || "").trim();
  if (clean.length < 2) return null;

  const key = `${languageCode(lang)}:${normalizeText(clean)}`;
  const cached = forwardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS)
    return cached.data;

  const params = new URLSearchParams({
    name: clean,
    count: "10",
    language: languageCode(lang),
    format: "json",
  });

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    { headers: { "User-Agent": "ClimaAgora/1.0" } },
    5000,
  );

  if (!response.ok) {
    throw new Error(`Geocodificação indisponível (${response.status})`);
  }

  const payload: any = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  if (!results.length) return null;

  const best = [...results].sort(
    (a, b) => scoreResult(b, clean) - scoreResult(a, clean),
  )[0];
  if (!validCoordinates(best?.latitude, best?.longitude)) return null;

  const data: GeocodedLocation = {
    city: best.name || best.admin2 || best.admin1 || clean,
    state: best.admin1 || "",
    country: best.country || "",
    countryCode: String(best.country_code || "").toUpperCase(),
    latitude: Number(best.latitude),
    longitude: Number(best.longitude),
    timezone: best.timezone,
    elevation: typeof best.elevation === "number" ? best.elevation : undefined,
    source: "open-meteo",
    displayName: [best.name, best.admin1, best.country]
      .filter(Boolean)
      .join(", "),
  };

  forwardCache.set(key, { data, timestamp: Date.now() });
  return data;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  lang: string = "pt-BR",
): Promise<GeocodedLocation | null> {
  if (!validCoordinates(latitude, longitude)) return null;

  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)},${languageCode(lang)}`;
  const cached = reverseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS)
    return cached.data;

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "10",
    addressdetails: "1",
    "accept-language": languageCode(lang),
  });

  const response = await fetchNominatimWithRateLimit(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    5000,
  );

  if (!response.ok) {
    throw new Error(`Geocodificação reversa indisponível (${response.status})`);
  }

  const payload: any = await response.json();
  const address = payload?.address || {};

  const data: GeocodedLocation = {
    city:
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.city_district ||
      address.county ||
      "",
    state: address.state || address.state_district || address.region || "",
    country: address.country || "",
    countryCode: String(address.country_code || "").toUpperCase(),
    latitude,
    longitude,
    source: "nominatim",
    displayName: payload?.display_name,
  };

  if (!data.city && !data.country) return null;

  reverseCache.set(key, { data, timestamp: Date.now() });
  return data;
}
