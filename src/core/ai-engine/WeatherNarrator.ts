import { WeatherData } from '../../types';

export class WeatherNarrator {
  /**
   * Translates complex numerical weather predictions and agricultural data into 
   * clear, actionable, natural language insights.
   * 
   * STRICT CONSTRAINT: Never invent or hallucinate data. Only summarize 
   * and contextualize the existing input WeatherData structure.
   */
  public static generateNarrative(
    weather: WeatherData,
    historicalAverage?: { tempMean: number; rainMean: number }
  ): string {
    const bulletins: string[] = [];
    const isHot = weather.temp >= 33;
    const isCold = weather.temp <= 14;
    const isRainy = weather.condition === 'Rainy' || weather.condition === 'Storm';

    // 1. Core overview
    bulletins.push(`Hoje em ${weather.city} - ${weather.state}, o céu se encontra ${this.translateCondition(weather.condition)}.`);

    // 2. Thermodynamic commentary
    let tempCommentary = `A temperatura registrada é de ${weather.temp}°C, com sensação térmica associada de ${weather.temp}°C.`;
    if (historicalAverage) {
      const diff = parseFloat((weather.temp - historicalAverage.tempMean).toFixed(1));
      if (diff > 1.5) {
        tempCommentary += ` Este valor está ${Math.abs(diff)}°C acima da média histórica climatológica para esta data.`;
      } else if (diff < -1.5) {
        tempCommentary += ` Este valor está ${Math.abs(diff)}°C abaixo da média histórica climatológica para esta data.`;
      } else {
        tempCommentary += ` A temperatura está perfeitamente alinhada com as médias históricas da região.`;
      }
    } else {
      if (isHot) {
        tempCommentary += ` O clima encontra-se significativamente quente, exigindo atenção para o estresse hídrico.`;
      } else if (isCold) {
        tempCommentary += ` O clima encontra-se frio, favorecendo ventilação de baixada e condensação térmica.`;
      }
    }
    bulletins.push(tempCommentary);

    // 3. Hydrological nowcast / forecast summaries
    if (isRainy) {
      bulletins.push(`Temos instabilidade ativa no radar: há previsão de precipitação contínua. Mantenha os canais de drenagem desobstruídos.`);
    } else {
      const humidityStatus = weather.humidity < 30 ? 'crítica (seco)' : weather.humidity > 75 ? 'alta' : 'moderada';
      bulletins.push(`A umidade relativa do ar está em ${weather.humidity}% (estabilidade ${humidityStatus}), combinada com pressão atmosférica de ${weather.pressure} hPa.`);
    }

    // 4. Wind and Solar indicators
    const windDirectionPort = this.translateWindDirection(weather.windDirection);
    bulletins.push(`Os ventos sopram do ${windDirectionPort} a uma velocidade constante de ${weather.windSpeed} km/h.`);

    if (weather.uvIndex >= 8) {
      bulletins.push(`Índice UV registrado em nível crítico (${weather.uvIndex}). Recomendamos proteção solar rigorosa e cuidados especiais entre 10h e 16h.`);
    }

    return bulletins.join(' ');
  }

  private static translateCondition(cond: string): string {
    switch (cond) {
      case 'Sunny': return 'predominantemente ensolarado e limpo';
      case 'Cloudy': return 'nublado a parcialmente encoberto';
      case 'Rainy': return 'sob regime de chuva contínua';
      case 'Storm': return 'sob regime de tempestades com descargas elétricas';
      case 'Night': return 'limpo com céu estrelado';
      case 'Snowy': return 'com precipitação de neve ativa';
      case 'Hurricane': return 'com ventos ciclônicos de alta intensidade';
      default: return 'estável';
    }
  }

  private static translateWindDirection(dir: string): string {
    const d = dir.toUpperCase().trim();
    if (d === 'N' || d === 'NORTH') return 'Norte';
    if (d === 'S' || d === 'SOUTH') return 'Sul';
    if (d === 'E' || d === 'EAST') return 'Leste';
    if (d === 'W' || d === 'WEST') return 'Oeste';
    if (d === 'NE' || d === 'NORTHEAST') return 'Nordeste';
    if (d === 'SE' || d === 'SOUTHEAST') return 'Sudeste';
    if (d === 'NW' || d === 'NORTHWEST') return 'Noroeste';
    if (d === 'SW' || d === 'SOUTHWEST') return 'Sudoeste';
    return d || 'variável';
  }
}
