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
    const lat = parseFloat(url.searchParams.get("lat") || "-27.1111");
    const lon = parseFloat(url.searchParams.get("lon") || "-52.6222");

    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,european_aqi,us_aqi&hourly=pm2_5,ozone,pm10&timezone=auto`;

    const response = await fetchWithTimeout(
      airQualityUrl,
      { headers: { "User-Agent": "ClimaAgora/1.0" } },
      4000,
    );

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Open-Meteo Air Quality API unavailable",
      }),
      { status: 502, headers: jsonHeaders },
    );
  } catch (err: any) {
    console.warn(
      "[Pages Function /api/open-meteo/air-quality] Fetch error:",
      err,
    );
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 500, headers: jsonHeaders },
    );
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
