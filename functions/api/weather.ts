import { getCityStateAndCountry, normalizeCityStateAndCountry } from "../_shared/geo-utils";
import { fetchInmetObservation } from "../_shared/inmet-fetcher";
import { MLPostProcessor } from "../_shared/ml-postprocessor";
import { fetchWithTimeout } from "../_shared/nominatim-utils";
import { generateConsolidatedPrediction, Env } from "../_lib/llm-manager-weather";

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
        console.warn("[Pages Function /api/weather] Empty or invalid JSON body");
      }
    } else {
      const url = new URL(context.request.url);
      body = {
        city: url.searchParams.get("city") || url.searchParams.get("query") || "Alagoinhas, BA",
        lat: url.searchParams.get("lat") ? parseFloat(url.searchParams.get("lat")!) : undefined,
        lon: url.searchParams.get("lon") ? parseFloat(url.searchParams.get("lon")!) : undefined,
        lang: url.searchParams.get("lang") || "pt-BR",
      };
    }

    const { city: cityInput = "Alagoinhas, BA", lat, lon, lang = "pt-BR" } = body || {};

    const { city, state, country } = getCityStateAndCountry(cityInput, lang);

    let finalLat = lat ?? -12.1355;
    let finalLon = lon ?? -38.4193;

    let openMeteoData: any = null;
    try {
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const omRes = await fetchWithTimeout(omUrl, { headers: { "User-Agent": "ClimaAgora/1.0" } }, 3500);
      if (omRes.ok) {
        openMeteoData = await omRes.json();
      }
    } catch (omErr) {
      console.warn("[Pages Function /api/weather] Open-Meteo fetch failed:", omErr);
    }

    const inmetObs = await fetchInmetObservation(city, finalLat, finalLon);

    let result = await generateConsolidatedPrediction(
      city,
      state,
      country,
      openMeteoData,
      inmetObs,
      lang,
      context.env
    );

    result = normalizeCityStateAndCountry(result, lang);

    const mlProcessed = MLPostProcessor.process({
      temp: result.temp || 28,
      humidity: result.humidity || 60,
      windSpeed: result.windSpeed || 10,
      pressure: result.pressure || 1013,
      lat: finalLat,
      lon: finalLon,
      condition: result.condition || "PartlyCloudy"
    });

    result.mlCorrections = mlProcessed;

    return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });

  } catch (err: any) {
    console.error("[Pages Function /api/weather] Error handling request:", err);
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
