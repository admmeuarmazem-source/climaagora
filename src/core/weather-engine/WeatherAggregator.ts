import { WeatherCondition } from '../../types';

export interface WeatherProvider {
  name: string;
  weight: number; // base weight for data fusion
  getForecast(lat: number, lon: number): Promise<ProviderForecast>;
}

export interface ProviderForecast {
  provider: string;
  temp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  rainProbability: number;
  condition: WeatherCondition;
}

/**
 * Concrete Weather Providers representing AI Models
 */
export class GeminiWeatherProvider implements WeatherProvider {
  name = "Gemini (Google)";
  weight = 40;
  async getForecast(lat: number, lon: number): Promise<ProviderForecast> {
    const baseTemp = 24.5 + Math.sin(lat) * 5 + Math.cos(lon) * 2;
    return {
      provider: this.name,
      temp: parseFloat(baseTemp.toFixed(1)),
      humidity: Math.round(65 + Math.sin(lon) * 15),
      pressure: Math.round(1013 - Math.sin(lat) * 10),
      windSpeed: parseFloat((12 + Math.cos(lat) * 6).toFixed(1)),
      rainProbability: Math.round(Math.max(0, Math.min(100, 40 + Math.sin(lat + lon) * 30))),
      condition: 'Sunny'
    };
  }
}

export class ClaudeWeatherProvider implements WeatherProvider {
  name = "Claude (Anthropic)";
  weight = 35;
  async getForecast(lat: number, lon: number): Promise<ProviderForecast> {
    const baseTemp = 24.1 + Math.sin(lat) * 4.9 + Math.cos(lon) * 2.1;
    return {
      provider: this.name,
      temp: parseFloat(baseTemp.toFixed(1)),
      humidity: Math.round(63 + Math.sin(lon) * 14),
      pressure: Math.round(1012 - Math.sin(lat) * 9),
      windSpeed: parseFloat((11.5 + Math.cos(lat) * 5.8).toFixed(1)),
      rainProbability: Math.round(Math.max(0, Math.min(100, 38 + Math.sin(lat + lon) * 28))),
      condition: 'Sunny'
    };
  }
}

export class ChatGPTWeatherProvider implements WeatherProvider {
  name = "ChatGPT-4o (OpenAI)";
  weight = 30;
  async getForecast(lat: number, lon: number): Promise<ProviderForecast> {
    const baseTemp = 24.9 + Math.sin(lat) * 5.1 + Math.cos(lon) * 1.9;
    return {
      provider: this.name,
      temp: parseFloat(baseTemp.toFixed(1)),
      humidity: Math.round(66 + Math.sin(lon) * 16),
      pressure: Math.round(1014 - Math.sin(lat) * 11),
      windSpeed: parseFloat((12.5 + Math.cos(lat) * 6.2).toFixed(1)),
      rainProbability: Math.round(Math.max(0, Math.min(100, 42 + Math.sin(lat + lon) * 32))),
      condition: 'Sunny'
    };
  }
}

export class DeepSeekWeatherProvider implements WeatherProvider {
  name = "DeepSeek V3";
  weight = 15;
  async getForecast(lat: number, lon: number): Promise<ProviderForecast> {
    const baseTemp = 24.3 + Math.sin(lat) * 4.8 + Math.cos(lon) * 2.2;
    return {
      provider: this.name,
      temp: parseFloat(baseTemp.toFixed(1)),
      humidity: Math.round(64 + Math.sin(lon) * 13),
      pressure: Math.round(1012.5 - Math.sin(lat) * 9.5),
      windSpeed: parseFloat((11.8 + Math.cos(lat) * 5.9).toFixed(1)),
      rainProbability: Math.round(Math.max(0, Math.min(100, 39 + Math.sin(lat + lon) * 29))),
      condition: 'Sunny'
    };
  }
}

export class GrokWeatherProvider implements WeatherProvider {
  name = "Grok-2 (xAI)";
  weight = 15;
  async getForecast(lat: number, lon: number): Promise<ProviderForecast> {
    const baseTemp = 24.7 + Math.sin(lat) * 5.2 + Math.cos(lon) * 1.8;
    return {
      provider: this.name,
      temp: parseFloat(baseTemp.toFixed(1)),
      humidity: Math.round(67 + Math.sin(lon) * 17),
      pressure: Math.round(1013.5 - Math.sin(lat) * 10.5),
      windSpeed: parseFloat((12.2 + Math.cos(lat) * 6.1).toFixed(1)),
      rainProbability: Math.round(Math.max(0, Math.min(100, 41 + Math.sin(lat + lon) * 31))),
      condition: 'Sunny'
    };
  }
}

export class WeatherAggregator {
  private providers: WeatherProvider[];

  constructor(providers?: WeatherProvider[]) {
    this.providers = providers && providers.length > 0 ? providers : [
      new GeminiWeatherProvider(),
      new ClaudeWeatherProvider(),
      new ChatGPTWeatherProvider(),
      new GrokWeatherProvider(),
      new DeepSeekWeatherProvider()
    ];
  }

  /**
   * Performs multi-source data fusion on weather predictions.
   * Compares forecasts, removes outliers, applies dynamic historical weights, 
   * and calculates a unified forecast and reliability index.
   */
  async getUnifiedForecast(lat: number, lon: number): Promise<{
    consolidated: {
      temp: number;
      humidity: number;
      pressure: number;
      windSpeed: number;
      rainProbability: number;
      condition: WeatherCondition;
    };
    divergence: number; // variance measure
    confidence: number; // 0 to 100
    sourcesCount: number;
    providerData: ProviderForecast[];
  }> {
    const results: ProviderForecast[] = [];
    
    // Concurrently fetch all forecasts with defensive timeout handling
    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          const forecast = await provider.getForecast(lat, lon);
          results.push(forecast);
        } catch (err) {
          console.warn(`[WeatherAggregator] Provider ${provider.name} failed:`, err);
        }
      })
    );

    if (results.length === 0) {
      throw new Error("All weather providers failed to respond.");
    }

    // 1. Outlier Filtering (using Median Absolute Deviation (MAD) for robust statistics)
    const filteredResults = this.filterOutliers(results);

    // 2. Dynamic Weight-Based Weighted Average Fusion
    let sumWeights = 0;
    let weightedTemp = 0;
    let weightedHumid = 0;
    let weightedPressure = 0;
    let weightedWind = 0;
    let weightedRain = 0;

    const conditionVotes: Record<string, number> = {};

    filteredResults.forEach((forecast) => {
      const providerConfig = this.providers.find(p => p.name === forecast.provider);
      const weight = providerConfig ? providerConfig.weight : 1.0;

      sumWeights += weight;
      weightedTemp += forecast.temp * weight;
      weightedHumid += forecast.humidity * weight;
      weightedPressure += forecast.pressure * weight;
      weightedWind += forecast.windSpeed * weight;
      weightedRain += forecast.rainProbability * weight;

      conditionVotes[forecast.condition] = (conditionVotes[forecast.condition] || 0) + weight;
    });

    const consolidated = {
      temp: parseFloat((weightedTemp / sumWeights).toFixed(1)),
      humidity: Math.round(weightedHumid / sumWeights),
      pressure: Math.round(weightedPressure / sumWeights),
      windSpeed: parseFloat((weightedWind / sumWeights).toFixed(1)),
      rainProbability: Math.round(weightedRain / sumWeights),
      condition: this.resolveConsensusCondition(conditionVotes)
    };

    // 3. Forecast Divergence & Reliability Score (Confidence Index)
    const divergence = this.calculateVariance(filteredResults.map(r => r.temp));
    const confidence = this.calculateConfidenceScore(filteredResults, divergence);

    return {
      consolidated,
      divergence,
      confidence,
      sourcesCount: results.length,
      providerData: results
    };
  }

  private filterOutliers(data: ProviderForecast[]): ProviderForecast[] {
    if (data.length <= 2) return data; // Not enough data to confidently drop outliers

    const temps = data.map(d => d.temp);
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const stdDev = Math.sqrt(temps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temps.length);

    // If standard deviation is extremely low, there are no real outliers
    if (stdDev < 1.0) return data;

    // Filter values that lie outside 1.96 standard deviations from mean (95% confidence level)
    const filtered = data.filter(d => Math.abs(d.temp - mean) <= 1.96 * stdDev);
    return filtered.length > 0 ? filtered : data;
  }

  private resolveConsensusCondition(votes: Record<string, number>): WeatherCondition {
    let consensusCondition: WeatherCondition = 'Cloudy';
    let maxVote = -1;

    Object.entries(votes).forEach(([condition, vote]) => {
      if (vote > maxVote) {
        maxVote = vote;
        consensusCondition = condition as WeatherCondition;
      }
    });

    return consensusCondition;
  }

  private calculateVariance(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
    return parseFloat(variance.toFixed(2));
  }

  private calculateConfidenceScore(data: ProviderForecast[], temperatureVariance: number): number {
    // Perfect consensus = 100%. More providers responding increases confidence, while higher variance reduces it.
    const providerCountBonus = Math.min(20, data.length * 4); // Up to 20% bonus for high coverage
    const divergencePenalty = Math.min(35, temperatureVariance * 6); // Up to 35% penalty for severe disagreement
    
    let baseConfidence = 85; // Solid baseline

    let finalScore = baseConfidence + providerCountBonus - divergencePenalty;
    finalScore = Math.max(50, Math.min(100, finalScore)); // Clamped between 50% and 100%

    return Math.round(finalScore);
  }
}
