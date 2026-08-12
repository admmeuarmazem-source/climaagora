export interface MicroclimateConfig {
  altitudeMeters: number;
  environmentType: 'urban' | 'rural' | 'valley' | 'coastal' | 'forest';
  distanceToCoastKm?: number;
}

export class HyperLocalAI {
  /**
   * Applies ML bias correction on aggregated weather based on regional historical sensor logs.
   * Helps correct general models like GFS/ECMWF to the local geography.
   */
  public static applyBiasCorrection(
    forecastTemp: number, 
    forecastHumidity: number,
    historicalBias: { tempError: number; humidityError: number }
  ): { correctedTemp: number; correctedHumidity: number } {
    // Model biases are typically systematic (e.g., GFS always predicts 1.2°C too hot in this valley)
    const correctedTemp = forecastTemp - historicalBias.tempError;
    const correctedHumidity = Math.max(0, Math.min(100, forecastHumidity - historicalBias.humidityError));
    
    return {
      correctedTemp: parseFloat(correctedTemp.toFixed(1)),
      correctedHumidity: Math.round(correctedHumidity)
    };
  }

  /**
   * Computes hyperlocal microclimatic offsets based on topological features:
   * - Urban Heat Islands increase overnight temperature.
   * - Coastal breeze buffers temperature peaks and rises humidity.
   * - Altitude drops temperature at a standard lapse rate of ~0.65°C per 100m.
   */
  public static calculateMicroclimateOffset(
    temp: number,
    humidity: number,
    config: MicroclimateConfig
  ): { adjustedTemp: number; adjustedHumidity: number } {
    let tempOffset = 0;
    let humidityOffset = 0;

    // 1. Altitude dry adiabatic/lapse rate correction (~0.0065°C per meter)
    if (config.altitudeMeters > 0) {
      tempOffset -= (config.altitudeMeters / 100) * 0.65;
    }

    // 2. Local environment corrections
    switch (config.environmentType) {
      case 'urban':
        // Urban heat island effect traps nocturnal heat
        tempOffset += 1.8;
        humidityOffset -= 5;
        break;
      case 'coastal':
        // Maritime climate buffers temperature and increases humidity
        tempOffset -= 0.8;
        humidityOffset += 8;
        break;
      case 'valley':
        // Cold air drainage pooling in valley floors
        tempOffset -= 1.2;
        humidityOffset += 4;
        break;
      case 'forest':
        // Transpiration from dense canopy reduces heat and raises humidity
        tempOffset -= 0.5;
        humidityOffset += 6;
        break;
      case 'rural':
      default:
        // Rural baseline has no urban offset
        break;
    }

    const adjustedTemp = parseFloat((temp + tempOffset).toFixed(1));
    const adjustedHumidity = Math.max(5, Math.min(100, humidity + humidityOffset));

    return {
      adjustedTemp,
      adjustedHumidity
    };
  }

  /**
   * Generates a minute-by-minute high-fidelity rainfall prediction for the next 60 to 120 minutes.
   * Simulates micro-precipitation trends based on humidity, pressure gradients, and wind speed.
   */
  public static predictNowcastPrecipitation(
    baseRainProbability: number,
    humidity: number,
    windSpeed: number,
    pressure: number,
    minutesAhead: number = 60
  ): { minute: number; probability: number; intensityMmPerHour: number }[] {
    const nowcast: { minute: number; probability: number; intensityMmPerHour: number }[] = [];
    
    // Core physical indices
    const humidityFactor = Math.max(0, (humidity - 50) / 50); // Higher humidity = more unstable
    const pressureInstability = Math.max(0, (1013 - pressure) / 30); // Lower pressure = high instability
    
    // Dynamically calculate peak precipitation minute based on wind speed (convective cloud speed)
    // High wind speed shifts the peak earlier. Low wind speed stalls the clouds.
    const peakMinute = Math.max(10, Math.min(minutesAhead - 10, Math.round(80 - windSpeed * 1.5)));

    for (let m = 1; m <= minutesAhead; m++) {
      // Gaussian distribution for the storm block passing by
      const exponent = -Math.pow(m - peakMinute, 2) / (2 * Math.pow(15, 2));
      const bellCurve = Math.exp(exponent);

      // Nowcast probability shifts dynamically across time
      const computedProb = Math.max(0, Math.min(100, Math.round(
        baseRainProbability * bellCurve + 
        (humidityFactor * 15) * Math.sin(m / 10) +
        (pressureInstability * 10)
      )));

      // Intensity scales with humidity and low pressure instability
      const computedIntensity = parseFloat((
        (computedProb > 30 ? (computedProb / 100) * 8.5 : 0) * 
        (1 + pressureInstability) * 
        (0.8 + 0.4 * Math.sin(m / 8))
      ).toFixed(2));

      nowcast.push({
        minute: m,
        probability: computedProb,
        intensityMmPerHour: computedIntensity
      });
    }

    return nowcast;
  }
}
