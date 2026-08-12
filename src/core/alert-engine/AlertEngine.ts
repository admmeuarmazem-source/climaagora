export interface AlertPayload {
  id: string;
  type: 'WIND' | 'HEAT' | 'FROST' | 'RAIN' | 'UV' | 'HUMIDITY' | 'LIGHTNING';
  title: string;
  description: string;
  severity: 'EXTREME' | 'SEVERE' | 'MODERATE' | 'MINOR';
  urgency: 'IMMEDIATE' | 'EXPECTED' | 'FUTURE';
  certainty: 'OBSERVED' | 'LIKELY' | 'POSSIBLE';
  instruction: string;
  timestamp: string;
}

export class AlertEngine {
  /**
   * Evaluates active weather parameters and returns high-priority environmental alerts
   * if severe thresholds are breached.
   */
  public static generateAlerts(weather: {
    temp: number;
    humidity: number;
    windSpeed: number; // km/h
    uvIndex: number;
    rainProbability: number;
    lightningStrikesNearby?: number;
  }): AlertPayload[] {
    const alerts: AlertPayload[] = [];
    const timestamp = new Date().toISOString();

    // 1. Wind speed threshold evaluation (Beaufort Scale gale force > 50km/h)
    if (weather.windSpeed >= 70) {
      alerts.push({
        id: `alert-wind-${Date.now()}`,
        type: 'WIND',
        title: 'Alerta de Vendaval Extremo',
        description: `Rajadas violentas de vento de até ${weather.windSpeed} km/h estão afetando a região.`,
        severity: 'EXTREME',
        urgency: 'IMMEDIATE',
        certainty: 'OBSERVED',
        instruction: 'Evite abrigar-se debaixo de árvores, coberturas leves, postes ou painéis de publicidade. Risco de quedas e cortes de energia.',
        timestamp
      });
    } else if (weather.windSpeed >= 50) {
      alerts.push({
        id: `alert-wind-${Date.now()}`,
        type: 'WIND',
        title: 'Aviso de Ventos Fortes',
        description: `Ventos constantes de ${weather.windSpeed} km/h previstos para as próximas horas.`,
        severity: 'MODERATE',
        urgency: 'EXPECTED',
        certainty: 'LIKELY',
        instruction: 'Fixe estruturas soltas e tenha cautela ao trafegar em rodovias expostas.',
        timestamp
      });
    }

    // 2. Extreme heat & frost index evaluation
    if (weather.temp >= 38) {
      alerts.push({
        id: `alert-heat-${Date.now()}`,
        type: 'HEAT',
        title: 'Onda de Calor Intenso',
        description: `Temperaturas extremas de ${weather.temp}°C registradas na localidade.`,
        severity: 'SEVERE',
        urgency: 'IMMEDIATE',
        certainty: 'OBSERVED',
        instruction: 'Mantenha-se hidratado, evite exposição direta ao sol nos horários de pico e redobre a atenção com crianças e idosos.',
        timestamp
      });
    } else if (weather.temp <= 4) {
      alerts.push({
        id: `alert-frost-${Date.now()}`,
        type: 'FROST',
        title: 'Alerta Crítico de Geada',
        description: `Temperatura do ar em ${weather.temp}°C favorece a formação de geada severa no solo.`,
        severity: 'SEVERE',
        urgency: 'IMMEDIATE',
        certainty: 'LIKELY',
        instruction: 'Agroprodutores: Acionem imediatamente as coberturas térmicas e sistemas de irrigação anti-geada programados.',
        timestamp
      });
    }

    // 3. Lightning strike threat evaluation
    if (weather.lightningStrikesNearby && weather.lightningStrikesNearby > 0) {
      const isExtreme = weather.lightningStrikesNearby > 10;
      alerts.push({
        id: `alert-lightning-${Date.now()}`,
        type: 'LIGHTNING',
        title: isExtreme ? 'Tempestade Elétrica Severa' : 'Atividade Elétrica Atmosférica',
        description: `Detectados ${weather.lightningStrikesNearby} raios nuvem-solo recentes na sua zona de monitoramento.`,
        severity: isExtreme ? 'EXTREME' : 'MODERATE',
        urgency: 'IMMEDIATE',
        certainty: 'OBSERVED',
        instruction: 'Busque abrigo seguro imediatamente. Evite campos abertos, tratores, cercas de metal ou aparelhos ligados na tomada.',
        timestamp
      });
    }

    // 4. Extreme UV Index exposure safety
    if (weather.uvIndex >= 11) {
      alerts.push({
        id: `alert-uv-${Date.now()}`,
        type: 'UV',
        title: 'Índice UV Extremo (Grau de Risco 11+)',
        description: `Níveis perigosos de radiação solar ultravioleta ativa com pico ao meio-dia.`,
        severity: 'SEVERE',
        urgency: 'EXPECTED',
        certainty: 'LIKELY',
        instruction: 'Uso obrigatório de protetor solar FPS 50+, chapéu de abas largas, óculos de sol e roupas protetoras. Evite exposição das 10h às 16h.',
        timestamp
      });
    }

    // 5. Critical relative air humidity levels (desert-like dryness)
    if (weather.humidity <= 15) {
      alerts.push({
        id: `alert-humid-${Date.now()}`,
        type: 'HUMIDITY',
        title: 'Umidade do Ar Crítica (Alerta Secura)',
        description: `Umidade relativa do ar em patamar alarmante de ${weather.humidity}%. Alto risco de incêndios florestais e problemas respiratórios.`,
        severity: 'SEVERE',
        urgency: 'IMMEDIATE',
        certainty: 'OBSERVED',
        instruction: 'Umidifique ambientes fechados, evite atividades físicas intensas ao ar livre e proíba qualquer queima de pastagem.',
        timestamp
      });
    }

    return alerts;
  }
}
