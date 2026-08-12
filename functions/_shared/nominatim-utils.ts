export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 3000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

let lastNominatimCallTime = 0;

export async function fetchNominatimWithRateLimit(
  url: string,
  timeoutMs: number = 3500,
) {
  const now = Date.now();
  const elapsed = now - lastNominatimCallTime;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastNominatimCallTime = Date.now();
  return fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent": "ClimaAgora/1.0 (admmeuarmazem@gmail.com)",
      },
    },
    timeoutMs,
  );
}
