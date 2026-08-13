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

    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction&hourly=wave_height,wave_direction,wave_period,ocean_current_velocity&daily=wave_height_max&timezone=auto`;

    const response = await fetchWithTimeout(
      marineUrl,
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
        error: "Open-Meteo Marine API unavailable",
      }),
      { status: 502, headers: jsonHeaders },
    );
  } catch (err: any) {
    console.warn("[Pages Function /api/open-meteo/marine] Fetch error:", err);
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
