export interface RainViewerFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  satellite?: {
    infrared: RainViewerFrame[];
  };
}

let cachedData: { data: RainViewerData; fetchedAt: number } | null = null;

export async function fetchRainViewerData(): Promise<RainViewerData | null> {
  const now = Date.now();
  // Cache metadata for 2 minutes to respect rate limits
  if (cachedData && (now - cachedData.fetchedAt < 120000)) {
    return cachedData.data;
  }

  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`RainViewer HTTP error ${res.status}`);
    }
    const data: RainViewerData = await res.json();
    if (data && data.host && data.radar && Array.isArray(data.radar.past) && data.radar.past.length > 0) {
      cachedData = { data, fetchedAt: now };
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[RainViewer] Error fetching weather maps metadata:', err);
    return null;
  }
}

export function buildRainViewerTileUrl(
  host: string,
  path: string,
  tileSize = 256,
  colorScheme = 2, // 2 = Universal Rainbow Rain Scale
  smooth = 1,
  snow = 1
): string {
  return `${host}${path}/${tileSize}/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.png`;
}

export function formatTimestampToLocalTime(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
