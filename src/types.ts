/**
 * Types for ClimaAgora IA
 */

export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Storm' | 'Night' | 'Snowy' | 'Hurricane';

export interface DecisionModule {
  status: 'optimal' | 'warning' | 'critical';
  recommendation: string;
  confidence: number;
}

export interface CIEData {
  sources: string[];
  consensus: number; // 0-100
  justification: string;
  weights?: {
    "ECMWF": number;
    "NOAA/GFS": number;
    "INMET": number;
    "NWS": number;
    "Copernicus": number;
    "JMA": number;
    "KMA": number;
    "Météo-France": number;
    [key: string]: number;
  };
  concordance?: string[];
  confidenceIndex?: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa';
  regionalHistoricalError?: number;
  divergenceValue?: number;
  rainProbabilityConsolidated?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  pop: number; // probability of precipitation %
  condition: WeatherCondition;
}

export interface DailyForecast {
  day: string;
  date: string;
  max: number;
  min: number;
  pop: number;
  condition: WeatherCondition;
  description: string;
  precipMm?: number;
  isHistorical?: boolean;
}

export interface WeatherData {
  city: string;
  state: string;
  country: string;
  temp: number;
  max: number;
  min: number;
  humidity: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: string;
  condition: WeatherCondition;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  pop?: number;
  feelsLike?: number;
  aiSummary: string;
  decisionCenter: {
    agriculture: DecisionModule;
    livestock: DecisionModule;
    solar: DecisionModule;
    fishing: DecisionModule;
    navigation: DecisionModule;
    alerts: DecisionModule;
  };
  cie: CIEData;
  inmetObservation?: {
    available: boolean;
    stationName?: string;
    entity?: string;
    uf?: string;
    ibgeCode?: string;
    summary?: string;
    tempMax?: number;
    tempMin?: number;
    windDirection?: string;
    windSpeed?: string;
    source?: string;
    reason?: string;
  };
  dataSourceInfo?: {
    forecastProvider: string;
    observationProvider: string;
    licenseNotice: string;
  };
  mlPostProcessed?: {
    originalTemp: number;
    correctedTemp: number;
    originalHumidity: number;
    correctedHumidity: number;
    feelsLike: number;
    systematicErrorCorrected: {
      tempBias: number;
      humidityBias: number;
      elevationOffset: number;
    };
    minuteByMinuteRain: { minute: number; probability: number; intensityMmPerHour: number }[];
    modelInfo: {
      engine: string;
      loss: number;
      epochs: number;
      status: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  confidence?: number;
  date?: string;
  justification?: string;
  expertViews?: { name: string; role: string; vote: string; opinion: string }[];
}

export type SubscriptionPlan = 'free' | 'rural' | 'professional' | 'enterprise';

export interface AdminStats {
  activeUsers: number;
  inactiveUsers: number;
  conversionRate: number; // %
  mrr: number; // R$
  churn: number; // %
  aiUsage: number; // tokens/requests count
  mapUsage: number; // map actions/views
  alertsSent: number;
  alertsViewed: number;
  dre: {
    revenue: number;
    costs: {
      servers: number;
      ai: number;
      marketing: number;
    };
    margin: number;
    netProfit: number;
  };
}

export interface ClimateAlert {
  source: string;
  event: string;
  headline: string;
}

export interface LightningData {
  activeStrikes1h: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';
  network: string;
  nearestDistanceKm: number;
}

export interface AIRecommendationRecord {
  id: string;
  date: string;
  type: 'agriculture' | 'livestock' | 'solar' | 'navigation' | 'alerts';
  typeLabel: string;
  recommendation: string;
  confidence: number;
  sources: string[];
  location: string;
}


