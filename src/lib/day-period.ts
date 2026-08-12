export type DayPeriod =
  | "madrugada"
  | "amanhecendo"
  | "manha"
  | "meio-dia"
  | "tarde"
  | "escurecendo"
  | "noite";

export function getDayPeriod(
  now: Date,
  sunriseIso: string,
  sunsetIso: string
): DayPeriod {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = sunrise.getHours() * 60 + sunrise.getMinutes();
  const sunsetMin = sunset.getHours() * 60 + sunset.getMinutes();

  const TRANSITION = 40;

  if (nowMin < sunriseMin - TRANSITION) return "madrugada";
  if (nowMin < sunriseMin + TRANSITION) return "amanhecendo";

  const dayLength = sunsetMin - sunriseMin;
  const midDay = sunriseMin + dayLength / 2;

  if (nowMin < midDay - dayLength * 0.2) return "manha";
  if (nowMin < midDay + dayLength * 0.2) return "meio-dia";
  if (nowMin < sunsetMin - TRANSITION) return "tarde";
  if (nowMin < sunsetMin + TRANSITION) return "escurecendo";

  return "noite";
}

export const DAY_PERIOD_LABEL: Record<DayPeriod, string> = {
  madrugada: "Madrugada",
  amanhecendo: "Amanhecendo",
  manha: "Manhã",
  "meio-dia": "Meio-dia",
  tarde: "Tarde",
  escurecendo: "Entardecer",
  noite: "Noite",
};

export const SKY_GRADIENTS: Record<DayPeriod, string> = {
  madrugada: "from-[#0a0e27] via-[#1a1f3a] to-[#2d2a5e]",
  amanhecendo: "from-[#2d2a5e] via-[#e8836a] to-[#f4c07a]",
  manha: "from-[#4a9fd8] via-[#7dc4e8] to-[#bfe6f5]",
  "meio-dia": "from-[#3a8fd0] via-[#6bb8e8] to-[#d4f0fa]",
  tarde: "from-[#4a8fc7] via-[#f0b866] to-[#f5d896]",
  escurecendo: "from-[#1a1f4a] via-[#c65d5d] to-[#f0955f]",
  noite: "from-[#020617] via-[#0f172a] to-[#1e293b]",
};
