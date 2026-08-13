import { fetchWithTimeout } from "../../_shared/nominatim-utils";

export async function onRequestGet(context: { request: Request }) {
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
  };

  try {
    const url = new URL(context.request.url);
    const query = (url.searchParams.get("q") || "").trim();

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;

    const response = await fetchWithTimeout(
      geocodingUrl,
      { headers: { "User-Agent": "ClimaAgora/1.0" } },
      3500,
    );

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err: any) {
    console.warn(
      "[Pages Function /api/open-meteo/geocoding] Fetch error:",
      err,
    );
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: jsonHeaders,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    },
  });
}
