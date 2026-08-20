import {
  Env,
  generateConsolidatedPrediction,
} from "../_lib/llm-manager-weather";
import {
  getCityStateAndCountry,
  normalizeCityStateAndCountry,
} from "../_shared/geo-utils";
import { geocodeLocation, reverseGeocode } from "../_shared/geocoding-utils";
import { fetchInmetObservation } from "../_shared/inmet-fetcher";
import { MLPostProcessor } from "../_shared/ml-postprocessor";
import { fetchWithTimeout } from "../_shared/nominatim-utils";

function validCoordinatePair(lat: unknown, lon: unknown): boolean {
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

function getCloudflareCoordinates(request: Request): {
  lat?: number;
  lon?: number;
} {
  const cf = (request as any).cf;

  const lat = Number(cf?.latitude);
  const lon = Number(cf?.longitude);

  return validCoordinatePair(lat, lon) ? { lat, lon } : {};
}

function errorResponse(
  message: string,
  status: number,
  headers: Record<string, string>,
) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers,
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Cache-Control": "no-store",
  };

  try {
    let body: any = {};

    if (context.request.method.toUpperCase() === "POST") {
      try {
        body = await context.request.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(context.request.url);
      body = {
        city:
          url.searchParams.get("city") || url.searchParams.get("query") || "",
        lat: url.searchParams.get("lat")
          ? Number(url.searchParams.get("lat"))
          : undefined,
        lon: url.searchParams.get("lon")
          ? Number(url.searchParams.get("lon"))
          : undefined,
        lang: url.searchParams.get("lang") || "pt-BR",
      };
    }

    const cityInput = String(body?.city || body?.query || "").trim();
    const lang = String(body?.lang || "pt-BR");

    let finalLat = Number(body?.lat);
    let finalLon = Number(body?.lon);

    if (!validCoordinatePair(finalLat, finalLon)) {
      const cloudflare = getCloudflareCoordinates(context.request);
      finalLat = cloudflare.lat as number;
      finalLon = cloudflare.lon as number;
    }

    let location: {
      city: string;
      state: string;
      country: string;
      countryCode?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
      elevation?: number;
      source?: string;
      displayName?: string;
    } | null = null;

    if (validCoordinatePair(finalLat, finalLon)) {
      try {
        location = await reverseGeocode(finalLat, finalLon, lang);
      } catch (error) {
        console.warn(
          "[Pages Function /api/weather] Reverse geocoding failed:",
          error,
        );
      }

      if (!location) {
        const parsed = getCityStateAndCountry(cityInput, lang);
        location = {
          city: parsed.city || "Localização atual",
          state: parsed.state || "",
          country: parsed.country || "",
          latitude: finalLat,
          longitude: finalLon,
          source: "cloudflare",
        };
      }
    } else if (cityInput) {
      try {
        location = await geocodeLocation(cityInput, lang);
      } catch (error: any) {
        console.warn(
          "[Pages Function /api/weather] Forward geocoding failed:",
          error,
        );
        return errorResponse(
          "Não foi possível localizar essa cidade agora. Tente novamente em alguns segundos.",
          502,
          jsonHeaders,
        );
      }

      if (!location) {
        return errorResponse(
          `Localização não encontrada para "${cityInput}".`,
          404,
          jsonHeaders,
        );
      }

      finalLat = location.latitude;
      finalLon = location.longitude;
    } else {
      return errorResponse(
        "Não foi possível determinar sua localização. Envie latitude/longitude ou informe uma cidade.",
        400,
        jsonHeaders,
      );
    }

    if (!validCoordinatePair(finalLat, finalLon)) {
      return errorResponse(
        "As coordenadas da localização são inválidas.",
        400,
        jsonHeaders,
      );
    }

    const city =
      location?.city ||
      getCityStateAndCountry(cityInput, lang).city ||
      "Localização";
    const state = location?.state || "";
    const country = location?.country || "";

    const params = new URLSearchParams({
      latitude: String(finalLat),
      longitude: String(finalLon),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "rain",
        "weather_code",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "uv_index",
        "visibility",
        "dew_point_2m",
        "cloud_cover",
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "uv_index",
        "visibility",
        "dew_point_2m",
        "cloud_cover",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "precipitation_sum",
        "rain_sum",
        "showers_sum",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
        "uv_index_max",
        "sunrise",
        "sunset",
      ].join(","),
      forecast_days: "5",
      timezone: "auto",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm",
    });

    let openMeteoData: any = null;

    try {
      const response = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
        {
          headers: {
            "User-Agent": "ClimaAgora/1.0",
            Accept: "application/json",
          },
        },
        6000,
      );

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }

      openMeteoData = await response.json();
    } catch (error: any) {
      console.error("[Pages Function /api/weather] Open-Meteo failed:", error);

      return errorResponse(
        "A fonte meteorológica está temporariamente indisponível. Nenhum clima fictício será exibido.",
        503,
        jsonHeaders,
      );
    }

    if (
      !openMeteoData?.current ||
      !openMeteoData?.hourly ||
      !openMeteoData?.daily
    ) {
      return errorResponse(
        "A fonte meteorológica não retornou dados completos para esta localização.",
        502,
        jsonHeaders,
      );
    }

    const inmetObs =
      String(location?.countryCode || "").toUpperCase() === "BR"
        ? await fetchInmetObservation(city, finalLat, finalLon)
        : {
            available: false,
            source: "INMET",
            reason: "Localização fora do Brasil.",
          };

    let result = await generateConsolidatedPrediction(
      city,
      state,
      country,
      openMeteoData,
      inmetObs,
      lang,
      context.env,
    );

    result = normalizeCityStateAndCountry(
      {
        ...result,
        city,
        state,
        country,
        latitude: finalLat,
        longitude: finalLon,
        locationSource: location?.source || "coordinates",
        timezone: openMeteoData.timezone || location?.timezone || "auto",
        elevation: openMeteoData.elevation ?? location?.elevation,
      },
      lang,
    );

    const mlProcessed = MLPostProcessor.process({
      temp: result.temp,
      humidity: result.humidity,
      windSpeed: result.windSpeed,
      pressure: result.pressure,
      lat: finalLat,
      lon: finalLon,
      condition: result.condition,
    });

    result.mlCorrections = mlProcessed;

    result.dataQuality = {
      realWeatherData: true,
      simulatedWeatherData: false,
      primarySource: "Open-Meteo",
      secondarySource: inmetObs?.available ? "INMET" : null,
      coordinates: {
        latitude: finalLat,
        longitude: finalLon,
      },
      timezone: openMeteoData.timezone,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error: any) {
    console.error("[Pages Function /api/weather] Error:", error);

    return errorResponse(
      error?.message || "Erro interno ao consultar o clima.",
      500,
      jsonHeaders,
    );
  }
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method.toUpperCase() === "OPTIONS") {
    return onRequestOptions();
  }

  return onRequestPost(context);
}

function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
