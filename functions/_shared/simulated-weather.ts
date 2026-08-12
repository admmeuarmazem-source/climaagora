export function generateSimulatedWeatherData(city: string, state: string, country: string, lang: string = "pt-BR"): any {
  const isEn = lang.startsWith("en");
  const isFeira = city.toLowerCase().includes("feira de santana");
  
  const baseTemp = isFeira ? 34 : 28;
  const maxTemp = isFeira ? 35 : 31;
  const minTemp = isFeira ? 23 : 21;
  const condition = isFeira ? "Sunny" : "PartlyCloudy";
  const humidity = isFeira ? 40 : 65;

  return {
    city,
    state,
    country,
    temp: baseTemp,
    feelsLike: baseTemp + 2,
    max: maxTemp,
    min: minTemp,
    condition,
    humidity,
    windSpeed: 12,
    windDirection: "SE",
    pressure: 1013,
    uvIndex: 8,
    visibility: 10,
    dewPoint: 19,
    pop: 15,
    rainMm: 0,
    cloudCover: 25,
    airQuality: { aqi: 32, label: isEn ? "Good" : "Boa" },
    marine: { waveHeight: 1.2, wavePeriod: 8, waveDirection: "E" },
    aiSummary: isEn 
      ? `Simulated meteorological fallback active for ${city}, ${state}. Dominant conditions stable with moderate temperature.`
      : `Fallback meteorológico simulado ativo para ${city}, ${state}. Condições dominantes estáveis com temperatura moderada.`,
    daily: [
      { dayName: isEn ? "Today" : "Hoje", date: "2026-08-11", max: maxTemp, min: minTemp, pop: 15, condition, description: isEn ? "Partly cloudy with pleasant temperature" : "Parcialmente nublado com temperatura agradável" },
      { dayName: isEn ? "Wed" : "Qua", date: "2026-08-12", max: maxTemp + 1, min: minTemp, pop: 10, condition: "Sunny", description: isEn ? "Mostly sunny day" : "Dia predominantemente ensolarado" },
      { dayName: isEn ? "Thu" : "Qui", date: "2026-08-13", max: maxTemp, min: minTemp + 1, pop: 20, condition: "PartlyCloudy", description: isEn ? "Sun with light clouds" : "Sol com poucas nuvens" },
      { dayName: isEn ? "Fri" : "Sex", date: "2026-08-14", max: maxTemp - 1, min: minTemp, pop: 40, condition: "Rainy", description: isEn ? "Occasional rain showers" : "Pancadas de chuva ocasionais" },
      { dayName: isEn ? "Sat" : "Sáb", date: "2026-08-15", max: maxTemp, min: minTemp - 1, pop: 10, condition: "Sunny", description: isEn ? "Clear skies" : "Céu limpo e ensolarado" }
    ],
    hourly: Array.from({ length: 24 }).map((_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      temp: Math.round(minTemp + (maxTemp - minTemp) * Math.sin((i / 24) * Math.PI)),
      condition: i >= 6 && i <= 18 ? condition : "Clear",
      pop: 10 + (i % 3) * 5,
      humidity: 60 + (i % 5) * 3,
      windSpeed: 10 + (i % 4)
    })),
    decisionCenter: {
      agriculture: { recommendation: isEn ? "Favorable for sowing" : "Favorável para semeadura e colheita" },
      livestock: { recommendation: isEn ? "Normal THI index" : "Índice ITU adequado para confinamento" },
      solar: { recommendation: isEn ? "High photovoltaic efficiency" : "Alta eficiência fotovoltaica estimada" },
      fishing: { recommendation: isEn ? "Safe coastal waters" : "Condição segura para pesca artesanal" },
      navigation: { recommendation: isEn ? "Low wave amplitude" : "Navegação costeira sem alertas de maragato" }
    }
  };
}
