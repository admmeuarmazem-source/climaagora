export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

let lastNominatimCallTime = 0;

export async function fetchNominatimWithRateLimit(
  url: string,
  timeoutMs = 5000,
): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastNominatimCallTime;

  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }

  lastNominatimCallTime = Date.now();

  return fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent": "ClimaAgora/1.0 (admmeuarmazem@gmail.com)",
        Accept: "application/json",
      },
    },
    timeoutMs,
  );
}
