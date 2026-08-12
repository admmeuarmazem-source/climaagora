export interface ConfidenceFactors {
  modelAgreement: number; // 0-100 (concordance/variance between models)
  stationCoverage: number; // 0-100 (physical density of weather stations nearby)
  radarCoverage: number; // 0-100 (quality/proximity of meteorological precipitation radars like RainViewer/INMET)
  historicalAccuracy: number; // 0-100 (recent correct prediction rates in this exact grid)
}

export class ConfidenceEngine {
  /**
   * Calculates the overall forecast reliability index based on four core meteorological factors.
   * Weight breakdown:
   * - Model Agreement (Inter-model consensus): 40%
   * - Regional Station Density (Ground truth validation): 20%
   * - Precipitation Radar Proximity & Coverage: 20%
   * - Regional Historical Accuracy Track-Record: 20%
   */
  public static calculate(factors: ConfidenceFactors): {
    score: number;
    rating: 'Muito Alta' | 'Alta' | 'Moderada' | 'Baixa';
    color: string; // Tailwind hex color or class
    breakdown: {
      consensusContrib: number;
      stationContrib: number;
      radarContrib: number;
      accuracyContrib: number;
    };
  } {
    const consensusContrib = factors.modelAgreement * 0.4;
    const stationContrib = factors.stationCoverage * 0.2;
    const radarContrib = factors.radarCoverage * 0.2;
    const accuracyContrib = factors.historicalAccuracy * 0.2;

    const totalScore = Math.round(consensusContrib + stationContrib + radarContrib + accuracyContrib);
    const score = Math.max(0, Math.min(100, totalScore));

    let rating: 'Muito Alta' | 'Alta' | 'Moderada' | 'Baixa' = 'Moderada';
    let color = '#E6A23C'; // Warning/orange

    if (score >= 90) {
      rating = 'Muito Alta';
      color = '#10B981'; // Green-500
    } else if (score >= 80) {
      rating = 'Alta';
      color = '#34D399'; // Green-400
    } else if (score >= 60) {
      rating = 'Moderada';
      color = '#F59E0B'; // Amber-500
    } else {
      rating = 'Baixa';
      color = '#EF4444'; // Red-500
    }

    return {
      score,
      rating,
      color,
      breakdown: {
        consensusContrib: parseFloat(consensusContrib.toFixed(1)),
        stationContrib: parseFloat(stationContrib.toFixed(1)),
        radarContrib: parseFloat(radarContrib.toFixed(1)),
        accuracyContrib: parseFloat(accuracyContrib.toFixed(1))
      }
    };
  }
}
