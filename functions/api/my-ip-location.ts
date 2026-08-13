import { fetchWithTimeout } from "../_shared/nominatim-utils";

function isPrivateOrLocalIp(ipStr: string): boolean {
  if (!ipStr) return true;
  const clean = ipStr.replace(/^::ffff:/, "").trim();
  if (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean === "0.0.0.0" ||
    !clean
  )
    return true;
  if (
    clean.startsWith("10.") ||
    clean.startsWith("192.168.") ||
    clean.startsWith("169.254.") ||
    clean.startsWith("100.")
  )
    return true;
  if (clean.startsWith("172.")) {
    const parts = clean.split(".");
    if (parts.length >= 2) {
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }
  return false;
}

export async function onRequestGet(context: { request: Request }) {
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
  };

  const cfIp = context.request.headers.get("cf-connecting-ip");
  const forwardedFor = context.request.headers.get("x-forwarded-for");
  const rawIp = cfIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "");
  const cleanIp = rawIp.replace(/^::ffff:/, "").trim();
  const isPrivate = isPrivateOrLocalIp(cleanIp);

  // Attempt 1: ip-api.com
  try {
    const geoUrl = isPrivate
      ? "http://ip-api.com/json/"
      : `http://ip-api.com/json/${cleanIp}`;
    const geoRes = await fetchWithTimeout(geoUrl, {}, 2500);
    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      if (
        geoData &&
        geoData.status === "success" &&
        typeof geoData.lat === "number" &&
        typeof geoData.lon === "number"
      ) {
        return new Response(
          JSON.stringify({
            ip: geoData.query || cleanIp || "0.0.0.0",
            lat: geoData.lat,
            lon: geoData.lon,
            city: geoData.city || "Salvador",
            state: geoData.region || "BA",
            country: geoData.country || "Brasil",
            isp: geoData.isp || geoData.org || "Rede Local ClimaAgora",
            source: "IP Geolocation Server-Side",
          }),
          { status: 200, headers: jsonHeaders },
        );
      }
    }
  } catch (err) {
    // soft fallback
  }

  // Attempt 2: ipapi.co
  try {
    const geoUrl = isPrivate
      ? "https://ipapi.co/json/"
      : `https://ipapi.co/${cleanIp}/json/`;
    const geoRes = await fetchWithTimeout(geoUrl, {}, 2500);
    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      if (
        geoData &&
        typeof geoData.latitude === "number" &&
        typeof geoData.longitude === "number"
      ) {
        return new Response(
          JSON.stringify({
            ip: geoData.ip || cleanIp || "0.0.0.0",
            lat: geoData.latitude,
            lon: geoData.longitude,
            city: geoData.city || "Salvador",
            state: geoData.region_code || "BA",
            country: geoData.country_name || "Brasil",
            isp: geoData.org || "Rede Local ClimaAgora",
            source: "IP Geolocation Server-Side (Backup)",
          }),
          { status: 200, headers: jsonHeaders },
        );
      }
    }
  } catch (err) {
    // soft fallback
  }

  // Attempt 3: ipinfo.io
  try {
    const geoUrl = isPrivate
      ? "https://ipinfo.io/json"
      : `https://ipinfo.io/${cleanIp}/json`;
    const geoRes = await fetchWithTimeout(geoUrl, {}, 2500);
    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      if (geoData && geoData.loc) {
        const [latStr, lonStr] = geoData.loc.split(",");
        const latNum = parseFloat(latStr);
        const lonNum = parseFloat(lonStr);
        if (!isNaN(latNum) && !isNaN(lonNum)) {
          return new Response(
            JSON.stringify({
              ip: geoData.ip || cleanIp || "0.0.0.0",
              lat: latNum,
              lon: lonNum,
              city: geoData.city || "Salvador",
              state: geoData.region || "BA",
              country: geoData.country || "Brasil",
              isp: geoData.org || "Rede Local ClimaAgora",
              source: "IP Geolocation Server-Side (ipinfo)",
            }),
            { status: 200, headers: jsonHeaders },
          );
        }
      }
    }
  } catch (err) {
    // soft fallback
  }

  // Final fallback (Salvador, Bahia, Brasil)
  return new Response(
    JSON.stringify({
      ip: cleanIp || "0.0.0.0",
      lat: -12.9777,
      lon: -38.5016,
      city: "Salvador",
      state: "BA",
      country: "Brasil",
      isp: "Rede Local ClimaAgora",
      source: "IP Geolocation Fallback",
    }),
    { status: 200, headers: jsonHeaders },
  );
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
