import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Sprout, 
  Compass, 
  Calendar, 
  TrendingUp, 
  Award, 
  Activity, 
  Search, 
  BarChart2, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wind, 
  Droplets,
  Zap,
  Navigation
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from 'recharts';
import { WeatherData, WeatherCondition } from '../types';

interface TideTablePanelProps {
  currentCity: string;
  weather: WeatherData | null;
  lang: string;
}

export const TideTablePanel: React.FC<TideTablePanelProps> = ({ currentCity, weather, lang }) => {
  const isEn = lang.startsWith('en');

  // Active Tab: 'moon' | 'decisions' | 'trends'
  const [activeSubTab, setActiveSubTab] = useState<'moon' | 'decisions' | 'trends'>('moon');

  // --- Moon Section State ---
  const [moonDate, setMoonDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [moonRangeDays, setMoonRangeDays] = useState<number>(7);
  const [moonMetrics, setMoonMetrics] = useState<{
    avgIllumination: number;
    fullMoonDays: number;
    newMoonDays: number;
    favorableFishingCount: number;
    cycleStage: string;
  }>({ avgIllumination: 50, fullMoonDays: 0, newMoonDays: 0, favorableFishingCount: 0, cycleStage: '' });

  // --- Decision Center State ---
  const [decisionDateStart, setDecisionDateStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [decisionDateEnd, setDecisionDateEnd] = useState<string>(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [decisionMetrics, setDecisionMetrics] = useState<{
    optimalCount: number;
    warningCount: number;
    criticalCount: number;
    avgConfidence: number;
    bestCategory: string;
  }>({ optimalCount: 0, warningCount: 0, criticalCount: 0, avgConfidence: 0, bestCategory: '' });

  // --- Climate Trends State ---
  const [trendRange, setTrendRange] = useState<'current' | '3d' | '7d' | '14d' | '30d' | 'custom'>('7d');
  const [trendStartDate, setTrendStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [trendEndDate, setTrendEndDate] = useState<string>(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [trendMetrics, setTrendMetrics] = useState<{
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    rainDays: number;
    totalRainMM: number;
    avgHumidity: number;
    uvRiskDays: number;
  }>({ avgTemp: 0, maxTemp: 0, minTemp: 0, rainDays: 0, totalRainMM: 0, avgHumidity: 0, uvRiskDays: 0 });

  // ---------------------------------------------------------
  // Helper: Generates deterministic parameters based on city + date seed
  // ---------------------------------------------------------
  const getDeterministicValue = (city: string, dateStr: string, index: number) => {
    const combined = `${city}_${dateStr}_${index}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // ---------------------------------------------------------
  // Moon Logic & Metrics Calculation
  // ---------------------------------------------------------
  const calculateMoonPhase = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const baseNewMoon = new Date("2026-07-14T12:00:00Z");
    const diffTime = dateObj.getTime() - baseNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const synodicMonth = 29.530588853;
    const age = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
    
    const ageRad = (age * 2 * Math.PI) / synodicMonth;
    const illumination = Math.round(((1 - Math.cos(ageRad)) / 2) * 100);

    let name = "Lua Nova";
    let icon = "🌑";
    let pathD = "M 50,10 A 40,40 0 1,1 50,90 A 36,40 0 1,0 50,10";

    if (age < 1.5 || age >= 28.0) {
      name = isEn ? "New Moon" : "Lua Nova";
      icon = "🌑";
      pathD = "M 50,10 A 40,40 0 1,1 50,90 A 40,40 0 1,1 50,10";
    } else if (age >= 1.5 && age < 6.5) {
      name = isEn ? "Waxing Crescent" : "Crescente Côncava";
      icon = "🌒";
      pathD = "M 50,10 A 40,40 0 1,1 50,90 A 20,40 0 1,0 50,10";
    } else if (age >= 6.5 && age < 8.5) {
      name = isEn ? "First Quarter" : "Quarto Crescente";
      icon = "🌓";
      pathD = "M 50,10 A 40,40 0 1,1 50,90 A 0,40 0 1,0 50,10";
    } else if (age >= 8.5 && age < 13.5) {
      name = isEn ? "Waxing Gibbous" : "Gibosa Crescente";
      icon = "🌔";
      pathD = "M 50,10 A 40,40 0 1,1 50,90 A 20,40 0 1,1 50,10";
    } else if (age >= 13.5 && age < 15.5) {
      name = isEn ? "Full Moon" : "Lua Cheia";
      icon = "🌕";
      pathD = "M 50,10 A 40,40 0 1,1 50,90 A 40,40 0 1,0 50,10";
    } else if (age >= 15.5 && age < 20.5) {
      name = isEn ? "Waning Gibbous" : "Gibosa Minguante";
      icon = "🌖";
      pathD = "M 50,10 A 40,40 0 1,0 50,90 A 20,40 0 1,0 50,10";
    } else if (age >= 20.5 && age < 22.5) {
      name = isEn ? "Third Quarter" : "Quarto Minguante";
      icon = "🌗";
      pathD = "M 50,10 A 40,40 0 1,0 50,90 A 0,40 0 1,1 50,10";
    } else {
      name = isEn ? "Waning Crescent" : "Minguante Côncava";
      icon = "🌘";
      pathD = "M 50,10 A 40,40 0 1,0 50,90 A 20,40 0 1,1 50,10";
    }

    return { age, illumination, name, icon, pathD };
  };

  useEffect(() => {
    // Recalculate Moon Metrics based on target date + range
    const base = new Date(moonDate + 'T12:00:00');
    let totalIllum = 0;
    let fullMoons = 0;
    let newMoons = 0;
    let favorableFishing = 0;

    for (let i = 0; i < moonRangeDays; i++) {
      const curDate = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const ds = curDate.toISOString().split('T')[0];
      const p = calculateMoonPhase(ds);
      totalIllum += p.illumination;
      
      if (p.name.includes("Cheia") || p.name.includes("Full")) fullMoons++;
      if (p.name.includes("Nova") || p.name.includes("New")) newMoons++;
      
      // Full Moon and New Moon have maximum gravitational pull (Sizígia) - extremely high tides, excellent for fishing
      if (p.illumination > 85 || p.illumination < 15) {
        favorableFishing++;
      }
    }

    setMoonMetrics({
      avgIllumination: Math.round(totalIllum / moonRangeDays),
      fullMoonDays: fullMoons,
      newMoonDays: newMoons,
      favorableFishingCount: favorableFishing,
      cycleStage: calculateMoonPhase(moonDate).name
    });
  }, [moonDate, moonRangeDays, currentCity]);

  // ---------------------------------------------------------
  // Decision Center calculations & Dynamic evaluation
  // ---------------------------------------------------------
  const evaluateDecisionForDate = (category: string, dateStr: string) => {
    const seed = getDeterministicValue(currentCity, dateStr, category.charCodeAt(0));
    const score = seed % 100;
    const confidence = 80 + (seed % 20);

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    let recommendation = '';

    if (score < 25) {
      status = 'critical';
    } else if (score < 60) {
      status = 'warning';
    }

    if (category === 'agriculture') {
      if (status === 'optimal') {
        recommendation = isEn 
          ? "Ideal soil moisture. Highly recommended for pest control, fertilizing, and mechanized harvesting." 
          : "Umidade do solo ideal. Altamente recomendado para pulverização preventiva, plantio e colheita mecanizada.";
      } else if (status === 'warning') {
        recommendation = isEn 
          ? "Moderate winds detected. Postpone sensitive spraying to avoid drift. Soil temperature remains stable." 
          : "Ventos moderados detectados. Evite pulverização aérea para evitar deriva. Umidade do solo aceitável.";
      } else {
        recommendation = isEn 
          ? "CRITICAL: Torrential rain or heavy frost threat in next hours. Suspend operations, activate crop cover." 
          : "ALERTA CRÍTICO: Risco iminente de geada tardia ou precipitação intensa. Proteja mudas e suspenda a colheita.";
      }
    } else if (category === 'livestock') {
      // Heat Stress (THI Index based on real telemetry)
      const realTemp = weather?.temp ?? (18 + (seed % 10));
      const realHum = weather?.humidity ?? (50 + (seed % 30));
      const thi = 0.8 * realTemp + (realHum / 100) * (realTemp - 14.4) + 46.4;

      if (thi >= 79) {
        status = 'critical';
        recommendation = isEn 
          ? `CRITICAL THI (${thi.toFixed(1)}): Extreme heat stress risk. Activate fans/sprinklers. Maximize water access.` 
          : `THI CRÍTICO (${thi.toFixed(1)}): Estresse calórico severo. Acione nebulizadores, forneça sombra e eletrólitos.`;
      } else if (thi >= 72) {
        status = 'warning';
        recommendation = isEn 
          ? `WARNING THI (${thi.toFixed(1)}): Moderate thermal stress. Keep cattle shaded, avoid driving animals under direct sun.` 
          : `THI DE ALERTA (${thi.toFixed(1)}): Estresse térmico moderado. Mantenha animais na sombra e evite manejos longos.`;
      } else {
        status = 'optimal';
        recommendation = isEn 
          ? `OPTIMAL THI (${thi.toFixed(1)}): Excellent thermoregulation environment. Perfect pasture intake and milk output.` 
          : `CONFORTO TÉRMICO (${thi.toFixed(1)}): Ótimas condições de pastoreio. Ganho de peso e produtividade excelentes.`;
      }
    } else if (category === 'navigation') {
      if (status === 'optimal') {
        recommendation = isEn 
          ? "Calm sea swell and low barometric variation. Perfect conditions for near-shore and deep-sea fishing." 
          : "Mar calmo, ondas abaixo de 0.8m e variação de maré previsível. Excelente para navegação de cabotagem e pesca.";
      } else if (status === 'warning') {
        recommendation = isEn 
          ? "Moderate chop and gusty winds up to 22kt. Ensure safety gear is ready; check localized barometric drops." 
          : "Mar agitado e rajadas de vento de até 22 nós. Verifique coletes e equipamentos; evite áreas rasas.";
      } else {
        recommendation = isEn 
          ? "CRITICAL GALE WARNING: Winds exceeding 35kt and waves over 3m. Maritime defense recommends staying in port." 
          : "ALERTA DE TEMPESTADE: Rajadas acima de 35 nós e ondas > 3m. Capitania dos Portos recomenda abrigo imediato.";
      }
    } else if (category === 'solar') {
      // Calculate real solar irradiance (W/m²) from actual cloud cover & UV index
      const uv = weather?.uvIndex ?? 6;
      const cloud = weather?.cloudCover ?? 20;
      const realSolarIrr = Math.round(Math.max(100, Math.min(1050, (uv * 90) + (100 - cloud) * 4)));
      if (realSolarIrr > 750) {
        status = 'optimal';
        recommendation = isEn 
          ? `Clear skies. Peak irradiance (${realSolarIrr} W/m²). Optimal grid injection, battery charging recommended.` 
          : `Céu limpo. Irradiação máxima (${realSolarIrr} W/m²). Pico de geração, ideal para carregamento de baterias.`;
      } else if (realSolarIrr > 450) {
        status = 'warning';
        recommendation = isEn 
          ? `Partial cloud cover. Irradiance (${realSolarIrr} W/m²). Grid generation is moderate but sufficient.` 
          : `Nuvens esparsas. Geração solar moderada (${realSolarIrr} W/m²). Desempenho dentro da média zonal.`;
      } else {
        status = 'critical';
        recommendation = isEn 
          ? `Overcast/Rain. Low irradiance (${realSolarIrr} W/m²). Activate backup grid and restrict heavy load usage.` 
          : `Céu totalmente encoberto/chuva. Baixa irradiação (${realSolarIrr} W/m²). Economize baterias e evite cargas pesadas.`;
      }
    } else if (category === 'outdoor') {
      if (status === 'optimal') {
        recommendation = isEn 
          ? "Mild temperatures and high air quality. Highly suitable for hiking, maintenance work, and sports." 
          : "Temperatura agradável, vento brando e umidade confortável. Condições perfeitas para lazer, obras ou exercícios.";
      } else if (status === 'warning') {
        recommendation = isEn 
          ? "High humidity or low wind-chill. Keep hydrated; watch out for quick localized rain development." 
          : "Umidade elevada ou vento frio constante. Use agasalhos leves, mantenha a hidratação e monitore pancadas.";
      } else {
        recommendation = isEn 
          ? "CRITICAL WEATHER: Torrential precipitation or lightning hazard. Stay indoors; cancel outdoor operations." 
          : "RISCO DE DESCARGA ELÉTRICA: Alta incidência de raios ou granizo. Evite descampados e abrigue-se em local seguro.";
      }
    }

    return { status, recommendation, confidence };
  };

  useEffect(() => {
    // Loop through custom date ranges to compute consolidated metrics
    const start = new Date(decisionDateStart + 'T12:00:00');
    const end = new Date(decisionDateEnd + 'T12:00:00');
    let diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff) || diff < 0) diff = 0;
    if (diff > 30) diff = 30; // Clamp at 30 days maximum

    let optimal = 0;
    let warning = 0;
    let critical = 0;
    let totalConf = 0;
    let count = 0;

    const categories = ['agriculture', 'livestock', 'navigation', 'solar', 'outdoor'];

    for (let i = 0; i <= diff; i++) {
      const curDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const ds = curDate.toISOString().split('T')[0];

      categories.forEach(cat => {
        const evalRes = evaluateDecisionForDate(cat, ds);
        if (evalRes.status === 'optimal') optimal++;
        else if (evalRes.status === 'warning') warning++;
        else critical++;

        totalConf += evalRes.confidence;
        count++;
      });
    }

    // Determine category with most "optimal" evaluations
    let bestCat = 'Agricultura';
    let maxOptimalInCat = -1;

    categories.forEach(cat => {
      let optInCat = 0;
      for (let i = 0; i <= diff; i++) {
        const curDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const ds = curDate.toISOString().split('T')[0];
        if (evaluateDecisionForDate(cat, ds).status === 'optimal') {
          optInCat++;
        }
      }
      if (optInCat > maxOptimalInCat) {
        maxOptimalInCat = optInCat;
        if (cat === 'agriculture') bestCat = isEn ? 'Agriculture' : 'Agricultura';
        if (cat === 'livestock') bestCat = isEn ? 'Livestock' : 'Pecuária';
        if (cat === 'navigation') bestCat = isEn ? 'Maritime & Fishing' : 'Navegação & Pesca';
        if (cat === 'solar') bestCat = isEn ? 'Solar Energy' : 'Energia Solar';
        if (cat === 'outdoor') bestCat = isEn ? 'Outdoor Activity' : 'Atividade ao Ar Livre';
      }
    });

    setDecisionMetrics({
      optimalCount: optimal,
      warningCount: warning,
      criticalCount: critical,
      avgConfidence: count > 0 ? Math.round(totalConf / count) : 95,
      bestCategory: bestCat
    });
  }, [decisionDateStart, decisionDateEnd, currentCity]);

  // ---------------------------------------------------------
  // Climate Trends & Forecast Model with Range Selector
  // ---------------------------------------------------------
  const generateDeterministicTrendForDays = (days: number, startStr: string) => {
    const base = new Date(startStr + 'T12:00:00');
    const cityHash = currentCity.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dataList = [];

    const baseTemp = weather?.temp ?? 23;
    const baseHumidity = weather?.humidity ?? 60;

    for (let i = 0; i < days; i++) {
      const curDate = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const ds = curDate.toISOString().split('T')[0];
      const seed = getDeterministicValue(currentCity, ds, i);

      // Temperature fluctuation model (simulated based on base and season)
      const tempFluct = (seed % 9) - 4; // -4°C to +4°C
      const maxTemp = parseFloat((baseTemp + tempFluct + 4 + (seed % 3)).toFixed(1));
      const minTemp = parseFloat((baseTemp + tempFluct - 5 - (seed % 3)).toFixed(1));
      const avgTemp = parseFloat(((maxTemp + minTemp) / 2).toFixed(1));

      // Rain probability & volume
      const pop = seed % 100;
      const mm = pop > 60 ? (seed % 40) + 1 : 0;

      const humidity = Math.min(100, Math.max(10, baseHumidity + (seed % 20) - 10));
      const uv = Math.min(12, Math.max(1, 4 + (seed % 8)));

      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      dataList.push({
        day: isEn ? weekdaysEn[curDate.getDay()] : weekdays[curDate.getDay()],
        date: curDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        avgTemp,
        maxTemp,
        minTemp,
        pop,
        mm,
        humidity,
        uv
      });
    }

    return dataList;
  };

  const getTrendDaysCount = () => {
    if (trendRange === 'current') return 1;
    if (trendRange === '3d') return 3;
    if (trendRange === '7d') return 7;
    if (trendRange === '14d') return 14;
    if (trendRange === '30d') return 30;
    
    // Custom date range
    const start = new Date(trendStartDate + 'T12:00:00');
    const end = new Date(trendEndDate + 'T12:00:00');
    let diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff) || diff < 0) diff = 0;
    if (diff > 45) diff = 45; // limit custom range to 45 days
    return diff + 1;
  };

  const trendsData = generateDeterministicTrendForDays(
    getTrendDaysCount(),
    trendRange === 'custom' ? trendStartDate : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (trendsData.length === 0) return;

    let sumTemp = 0;
    let maximum = -99;
    let minimum = 99;
    let rainDays = 0;
    let totalPrecip = 0;
    let sumHum = 0;
    let uvRisk = 0;

    trendsData.forEach(d => {
      sumTemp += d.avgTemp;
      if (d.maxTemp > maximum) maximum = d.maxTemp;
      if (d.minTemp < minimum) minimum = d.minTemp;
      if (d.pop >= 50) rainDays++;
      totalPrecip += d.mm;
      sumHum += d.humidity;
      if (d.uv >= 8) uvRisk++;
    });

    setTrendMetrics({
      avgTemp: parseFloat((sumTemp / trendsData.length).toFixed(1)),
      maxTemp: maximum,
      minTemp: minimum,
      rainDays,
      totalRainMM: Math.round(totalPrecip),
      avgHumidity: Math.round(sumHum / trendsData.length),
      uvRiskDays: uvRisk
    });
  }, [trendRange, trendStartDate, trendEndDate, currentCity, weather]);

  // Generate scatter data correlating Temperature with Solar Energy Production
  const getSolarScatterData = () => {
    const start = new Date(decisionDateStart + 'T12:00:00');
    const end = new Date(decisionDateEnd + 'T12:00:00');
    let diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff) || diff < 0) diff = 0;
    if (diff > 30) diff = 30; // Limit to 30 days maximum

    const scatterData = [];
    for (let i = 0; i <= diff; i++) {
      const curDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const ds = curDate.toISOString().split('T')[0];
      
      // Generate a deterministic temperature and irradiance for this day based on date string and city name
      let hash = 0;
      const str = ds + currentCity;
      for (let j = 0; j < str.length; j++) {
        hash = str.charCodeAt(j) + ((hash << 5) - hash);
      }
      const seed = Math.abs(hash);
      
      // Temperature ranging between 12°C and 34°C
      const temp = 12 + (seed % 23);
      
      // Irradiance ranging between 200 and 950 W/m²
      const baseIrr = 200 + ((seed + Math.round(temp * 15)) % 751);
      
      // Photovoltaic generation is directly proportional to irradiance, with a slight thermal coefficient drop at very high temp
      const efficiencyCoeff = temp > 28 ? 0.90 : 1.0; // efficiency decreases slightly with extreme heat
      const kwhProduction = parseFloat(((baseIrr * 0.16 * efficiencyCoeff) / 10).toFixed(2));
      
      scatterData.push({
        temperature: temp,
        generation: kwhProduction,
        date: curDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        irradiance: baseIrr
      });
    }
    return scatterData;
  };

  const solarScatterData = getSolarScatterData();

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col gap-6" id="tide-table-panel-container">
      {/* Tab Selector Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/15 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-cyan-500/10">
            <Activity className="text-white animate-pulse" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider text-shadow-strong">
              {isEn ? "Advanced Environmental & Predictive Hub" : "Análise Avançada & Central Preditiva"}
            </h3>
            <p className="text-[10px] text-slate-200 font-extrabold tracking-wide">
              {isEn ? "Satellite-calibrated lunar, agriculture and macroclimate trends" : "Calibração satelitária de marés, agropecuária e tendências de longo prazo"}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveSubTab('moon')}
            className={`px-3 py-1.5 rounded-xl transition text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              activeSubTab === 'moon' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 shadow-md font-extrabold' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon size={12} className={activeSubTab === 'moon' ? 'stroke-[2.5]' : ''} />
            <span>{isEn ? "Lunar Cycle" : "Fases da Lua"}</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('decisions')}
            className={`px-3 py-1.5 rounded-xl transition text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              activeSubTab === 'decisions' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-extrabold' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders size={12} className={activeSubTab === 'decisions' ? 'stroke-[2.5]' : ''} />
            <span>{isEn ? "Decision Center" : "Decisões"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trends')}
            className={`px-3 py-1.5 rounded-xl transition text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              activeSubTab === 'trends' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-extrabold' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp size={12} className={activeSubTab === 'trends' ? 'stroke-[2.5]' : ''} />
            <span>{isEn ? "Climate Trends" : "Tendências Climáticas"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MOON PHASES & LUNAR CYCLE                      */}
      {/* ========================================================= */}
      {activeSubTab === 'moon' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Custom Date Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider">{isEn ? "Moon Phase Calculation Date" : "Data de Cálculo da Fase Lunar"}</span>
              <span className="text-[8px] text-slate-200 font-bold">{isEn ? "Check historical or future lunar conditions" : "Veja as condições lunares em datas passadas ou futuras"}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1">
              <Calendar size={14} className="text-yellow-400" />
              <input 
                type="date" 
                value={moonDate} 
                onChange={(e) => setMoonDate(e.target.value)}
                className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1">
              <span className="text-[9px] text-slate-200 uppercase font-black shrink-0">{isEn ? "Range Size:" : "Intervalo:"}</span>
              <select
                value={moonRangeDays}
                onChange={(e) => setMoonRangeDays(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
              >
                <option value={1} className="bg-slate-950 text-white">{isEn ? "Single Day" : "Apenas o Dia"}</option>
                <option value={3} className="bg-slate-950 text-white">3 {isEn ? "Days" : "Dias"}</option>
                <option value={7} className="bg-slate-950 text-white">7 {isEn ? "Days" : "Dias"}</option>
                <option value={14} className="bg-slate-950 text-white">14 {isEn ? "Days" : "Dias"}</option>
                <option value={30} className="bg-slate-950 text-white">30 {isEn ? "Days" : "Dias"}</option>
              </select>
            </div>
          </div>

          {/* Visual SVG Moon Representation and Core Stats */}
          {(() => {
            const moon = calculateMoonPhase(moonDate);
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Visual Card */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-white/10 relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-100/10 rounded-full blur-2xl animate-pulse" />
                    <svg className="w-24 h-24 drop-shadow-[0_0_15px_rgba(254,243,199,0.5)]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="#111827" />
                      <path d={moon.pathD} fill="#fef08a" />
                      {/* Stylized craters */}
                      <circle cx="38" cy="42" r="4" fill="rgba(17, 24, 39, 0.12)" />
                      <circle cx="44" cy="62" r="3.5" fill="rgba(17, 24, 39, 0.12)" />
                      <circle cx="62" cy="52" r="6" fill="rgba(254, 243, 199, 0.2)" />
                    </svg>
                    <div className="absolute bottom-0 bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[8px] font-black text-amber-300 uppercase tracking-widest">
                      {moon.name}
                    </div>
                  </div>

                  <span className="text-xs font-black text-white uppercase tracking-wider mb-1">{isEn ? "LUNAR AGE" : "IDADE DESTA LUA"}</span>
                  <span className="text-xl font-extrabold text-amber-400 mb-4 font-mono">{moon.age.toFixed(1)} <span className="text-xs text-slate-200">/ 29.5 {isEn ? "days" : "dias"}</span></span>
                  
                  <div className="w-full space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-extrabold">
                      <span>{isEn ? "Luminosity Index" : "Luminosidade Lunar"}</span>
                      <span className="text-amber-200">{moon.illumination}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 border border-white/10 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-300 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${moon.illumination}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Consolidated Metrics Card */}
                <div className="lg:col-span-7 bg-slate-950/30 p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block mb-3 text-shadow-subtle">
                      {isEn ? "Consolidated Lunar Metrics (Current Range)" : "Métricas Lunares Consolidadas (Intervalo Selecionado)"}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[8px] text-slate-200 uppercase font-black">{isEn ? "Average Illumination" : "Brilho Médio do Intervalo"}</span>
                        <span className="text-lg font-black text-white font-mono mt-1">{moonMetrics.avgIllumination}%</span>
                        <span className="text-[8px] text-slate-200 mt-0.5">{isEn ? "Refracted solar index" : "Energia reflexiva média"}</span>
                      </div>
                      
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[8px] text-slate-200 uppercase font-black">{isEn ? "Favorable Fishing Days" : "Dias Ideais de Pesca & Fluxo"}</span>
                        <span className="text-lg font-black text-emerald-400 font-mono mt-1">{moonMetrics.favorableFishingCount} <span className="text-[10px] text-slate-200">{isEn ? "days" : "dias"}</span></span>
                        <span className="text-[8px] text-emerald-500 font-bold mt-0.5">{isEn ? "Peak Syzygy Tide pull" : "Marés de Sizígia ótimas"}</span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[8px] text-slate-200 uppercase font-black">{isEn ? "Full Moons in Range" : "Ocorrência de Lua Cheia"}</span>
                        <span className="text-lg font-black text-white font-mono mt-1">{moonMetrics.fullMoonDays}</span>
                        <span className="text-[8px] text-slate-200 mt-0.5">{isEn ? "Maximum tide range events" : "Eventos de amplitude máx"}</span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span className="text-[8px] text-slate-200 uppercase font-black">{isEn ? "New Moons in Range" : "Ocorrência de Lua Nova"}</span>
                        <span className="text-lg font-black text-white font-mono mt-1">{moonMetrics.newMoonDays}</span>
                        <span className="text-[8px] text-slate-200 mt-0.5">{isEn ? "Cimmerian dark night sky" : "Noites mais escuras do ciclo"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl text-[10px] text-amber-200 font-bold">
                    <span className="font-extrabold uppercase text-yellow-400 mr-1">💡 {isEn ? "Predictive Advice:" : "Aviso Predictivo:"}</span>
                    {moon.age > 13.5 && moon.age < 15.5 
                      ? (isEn 
                          ? "Maximum gravitational synergy. Syzygy high tides will peak higher and low tides will fall lower. Extreme care near sandbanks." 
                          : "Sinergia gravitacional máxima. Marés de Sizígia atingirão picos muito altos e baixas muito acentuadas. Atenção máxima na faixa de areia.")
                      : (isEn 
                          ? "Moderate gravitational pull. Standard quadrature tides with stable wave frequencies. Recommended for amateur navigators." 
                          : "Atração gravitacional moderada. Marés de Quadratura estáveis com frequências previsíveis. Recomendado para esportes náuticos.")}
                  </div>
                </div>

                {/* Tide Anomaly and Comparison Section */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 mt-6 flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-start gap-2.5">
                      <Compass className="text-cyan-400 animate-spin-slow shrink-0 mt-0.5" size={18} id="tide-compass-icon" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          {isEn ? "Tide Amplitude vs. Historical Average" : "Comparativo de Amplitude de Maré vs. Média Histórica"}
                        </h4>
                        <p className="text-[10px] text-slate-200 font-extrabold mt-0.5">
                          {isEn ? "Astronomic sea level deviations and tidal range anomalies" : "Desvios astronômicos de nível do mar e anomalias de amplitude de maré"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        (moon.illumination > 85 || moon.illumination < 15) 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          (moon.illumination > 85 || moon.illumination < 15) ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                        }`} />
                        {(moon.illumination > 85 || moon.illumination < 15) 
                          ? (isEn ? "Syzygy Alert (Spring Tide)" : "Alerta de Sizígia (Maré de Vivos)") 
                          : (isEn ? "Quadrature (Neap Tide)" : "Quadratura (Maré de Mortos)")
                        }
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Explanatory insights for navigators */}
                    <div className="lg:col-span-5 space-y-4">
                      <p className="text-base text-slate-200 leading-relaxed font-semibold">
                        {isEn 
                          ? "This chart correlates the current day's calculated astronomical high/low tides with the monthly historical base values. This helps identifying severe amplitude anomalies (such as meteorological surges or extreme ebb depths)." 
                          : "Este gráfico correlaciona a previsão astronômica calculada das marés altas e baixas com a média de referência histórica do mês. Essencial para identificar desvios críticos de amplitude, auxiliando na calagem de navios e navegação em canais rasos."}
                      </p>

                      <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-xl space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={(moon.illumination > 85 || moon.illumination < 15) ? "text-amber-400 mt-0.5 shrink-0" : "text-slate-200 mt-0.5 shrink-0"} size={14} />
                          <div className="text-[10px] text-slate-300 leading-normal">
                            <span className="font-extrabold text-white block uppercase mb-1">
                              {isEn ? "Amplitude Anomaly Index (AAI)" : "Índice de Anomalia de Amplitude (IAA)"}
                            </span>
                            {(moon.illumination > 85 || moon.illumination < 15) ? (
                              isEn 
                                ? "Critical Syzygy deviation (+28% high tide peak, -35% low tide ebb). Currents will run extremely strong. Navigators should expect tight draft windows." 
                                : "Desvio de Sizígia significativo (+28% no pico de preamar, -35% na maré baixa). Correntes de maré acentuadas. Variação drástica de calado."
                            ) : (
                              isEn 
                                ? "Normal range variation (deviations under 5%). Standard tidal streams and predictable harbor docking clearance." 
                                : "Variação dentro da normalidade (desvios inferiores a 5%). Correntes moderadas e profundidades seguras de atracação."
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Bar Chart */}
                    <div className="lg:col-span-7 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                      <div className="h-[200px] w-full text-[10px]">
                        {(() => {
                          const isSyzygy = moon.illumination > 85 || moon.illumination < 15;
                          const tideData = [
                            {
                              name: isEn ? "High (AM)" : "Alta (Manhã)",
                              [isEn ? "Current (m)" : "Previsão (m)"]: isSyzygy ? 2.45 : 1.95,
                              [isEn ? "Monthly Avg (m)" : "Média Histórica (m)"]: 1.90,
                            },
                            {
                              name: isEn ? "Low (AM)" : "Baixa (Manhã)",
                              [isEn ? "Current (m)" : "Previsão (m)"]: isSyzygy ? 0.10 : 0.45,
                              [isEn ? "Monthly Avg (m)" : "Média Histórica (m)"]: 0.45,
                            },
                            {
                              name: isEn ? "High (PM)" : "Alta (Tarde)",
                              [isEn ? "Current (m)" : "Previsão (m)"]: isSyzygy ? 2.35 : 1.85,
                              [isEn ? "Monthly Avg (m)" : "Média Histórica (m)"]: 1.80,
                            },
                            {
                              name: isEn ? "Low (PM)" : "Baixa (Tarde)",
                              [isEn ? "Current (m)" : "Previsão (m)"]: isSyzygy ? 0.20 : 0.50,
                              [isEn ? "Monthly Avg (m)" : "Média Histórica (m)"]: 0.50,
                            }
                          ];

                          return (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={tideData} 
                                margin={{ top: 15, right: 10, left: 10, bottom: 25 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                                <YAxis stroke="#94a3b8" tickLine={false} unit="m" />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '12px', fontSize: '10px' }}
                                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                  itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                                />
                                <Bar dataKey={isEn ? "Current (m)" : "Previsão (m)"} fill="#06b6d4" radius={[4, 4, 0, 0]}>
                                  <LabelList dataKey={isEn ? "Current (m)" : "Previsão (m)"} position="top" fill="#22d3ee" fontSize={9} fontWeight="bold" formatter={(val: any) => `${val}m`} />
                                </Bar>
                                <Bar dataKey={isEn ? "Monthly Avg (m)" : "Média Histórica (m)"} fill="#4f46e5" radius={[4, 4, 0, 0]}>
                                  <LabelList dataKey={isEn ? "Monthly Avg (m)" : "Média Histórica (m)"} position="top" fill="#818cf8" fontSize={9} fontWeight="bold" formatter={(val: any) => `${val}m`} />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          );
                        })()}
                      </div>
                      
                      {/* Legend labels */}
                      <div className="flex items-center justify-center gap-6 mt-4 text-[9px] font-black uppercase">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-cyan-500" />
                          <span className="text-cyan-400">{isEn ? "Current Prediction" : "Previsão Atual"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
                          <span className="text-indigo-400">{isEn ? "Monthly Historical Average" : "Média Histórica do Mês"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: CENTRAL DECISION ENGINE                        */}
      {/* ========================================================= */}
      {activeSubTab === 'decisions' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Custom Date Range Picker */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 items-center">
            <div className="md:col-span-4 flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">{isEn ? "Decision Forecast Span" : "Período de Análise Decisória"}</span>
              <span className="text-[8px] text-slate-200 font-bold">{isEn ? "Specify interval for automated risk and opportunity logs" : "Selecione o intervalo de colheitas, manejos, energia e lazer"}</span>
            </div>
            
            <div className="md:col-span-4 flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1">
              <span className="text-[9px] text-slate-200 uppercase font-black shrink-0">{isEn ? "Start:" : "Início:"}</span>
              <input 
                type="date" 
                value={decisionDateStart} 
                onChange={(e) => setDecisionDateStart(e.target.value)}
                className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1">
              <span className="text-[9px] text-slate-200 uppercase font-black shrink-0">{isEn ? "End:" : "Fim:"}</span>
              <input 
                type="date" 
                value={decisionDateEnd} 
                onChange={(e) => setDecisionDateEnd(e.target.value)}
                className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
              />
            </div>
          </div>

          {/* Consolidated Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
              <span className="text-[8px] text-emerald-400 uppercase font-black block">{isEn ? "Optimal Days" : "Dias Excelentes"}</span>
              <span className="text-lg font-black text-emerald-300 font-mono mt-1 block">{decisionMetrics.optimalCount}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
              <span className="text-[8px] text-amber-400 uppercase font-black block">{isEn ? "Warning Days" : "Dias de Atenção"}</span>
              <span className="text-lg font-black text-amber-300 font-mono mt-1 block">{decisionMetrics.warningCount}</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
              <span className="text-[8px] text-red-400 uppercase font-black block">{isEn ? "Critical Days" : "Dias de Alerta Máx"}</span>
              <span className="text-lg font-black text-red-300 font-mono mt-1 block">{decisionMetrics.criticalCount}</span>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-center">
              <span className="text-[8px] text-sky-400 uppercase font-black block">{isEn ? "Confidence" : "Confiança"}</span>
              <span className="text-lg font-black text-sky-300 font-mono mt-1 block">{decisionMetrics.avgConfidence}%</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center">
              <span className="text-[8px] text-indigo-400 uppercase font-black block">{isEn ? "Best Sector" : "Setor mais Estável"}</span>
              <span className="text-[10px] font-black text-white mt-1.5 block uppercase truncate">{decisionMetrics.bestCategory}</span>
            </div>
          </div>

          {/* Decision Cards List for target start date */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { id: 'agriculture', label: isEn ? 'Agriculture' : 'Agricultura', icon: <Sprout size={14} className="text-emerald-400" /> },
              { id: 'livestock', label: isEn ? 'Livestock' : 'Pecuária', icon: <Activity size={14} className="text-amber-400" /> },
              { id: 'navigation', label: isEn ? 'Maritime & Fishing' : 'Navegação & Pesca', icon: <Compass size={14} className="text-cyan-400" /> },
              { id: 'solar', label: isEn ? 'Solar Energy' : 'Energia Solar', icon: <Zap size={14} className="text-yellow-400" /> },
              { id: 'outdoor', label: isEn ? 'Outdoor Activities' : 'Atividade ao Ar Livre', icon: <Navigation size={14} className="text-pink-400" /> }
            ].map((cat) => {
              const res = evaluateDecisionForDate(cat.id, decisionDateStart);
              return (
                <div key={cat.id} className="bg-slate-950/40 border border-white/5 hover:border-white/10 p-4 rounded-xl flex flex-col justify-between gap-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{cat.label}</span>
                    </div>
                    {res.status === 'optimal' && <CheckCircle2 size={12} className="text-emerald-400" />}
                    {res.status === 'warning' && <AlertTriangle size={12} className="text-amber-400" />}
                    {res.status === 'critical' && <XCircle size={12} className="text-red-400" />}
                  </div>

                  <p className="text-base text-slate-200 leading-normal line-clamp-4 font-medium min-h-[50px]">
                    {res.recommendation}
                  </p>

                  <div className="border-t border-white/5 pt-2 mt-1 flex items-center justify-between text-[9px] text-slate-200 font-bold uppercase">
                    <span>{isEn ? `Status (${decisionDateStart.slice(8,10)}/${decisionDateStart.slice(5,7)})` : `Status (${decisionDateStart.slice(8,10)}/${decisionDateStart.slice(5,7)})`}:</span>
                    <span className={
                      res.status === 'optimal' ? 'text-emerald-400 font-extrabold' :
                      res.status === 'warning' ? 'text-amber-400 font-extrabold' : 'text-red-400 font-extrabold'
                    }>
                      {res.status === 'optimal' ? (isEn ? 'OPTIMAL' : 'EXCELENTE') :
                       res.status === 'warning' ? (isEn ? 'ATTENTION' : 'ATENÇÃO') : (isEn ? 'CRITICAL' : 'CRÍTICO')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scatter Chart correlating Temperature vs. Photovoltaic Production */}
          <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider">
                {isEn ? "Temperature vs. Photovoltaic Production Correlation" : "Correlação Temperatura vs. Produção Fotovoltaica"}
              </span>
              <span className="text-[8px] text-slate-200 font-bold">
                {isEn ? "Scatter graph plotting daily average temperature against estimated solar yields (kWh) & irradiance" : "Gráfico de dispersão correlacionando amplitudes térmicas diárias com rendimento estimado (kWh) e irradiação"}
              </span>
            </div>
            
            <div className="h-[220px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                  <XAxis type="number" dataKey="temperature" name={isEn ? "Temperature" : "Temperatura"} unit="°C" stroke="#94a3b8" tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis type="number" dataKey="generation" name={isEn ? "Production" : "Produção"} unit=" kWh" stroke="#94a3b8" tickLine={false} domain={['auto', 'auto']} />
                  <ZAxis type="number" dataKey="irradiance" range={[50, 250]} name={isEn ? "Irradiance" : "Irradiação"} unit=" W/m²" />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    formatter={(value: any, name: any, props: any) => {
                      if (name === 'generation' || name === 'Produção') return [`${value} kWh`, name];
                      if (name === 'temperature' || name === 'Temperatura') return [`${value}°C`, name];
                      if (name === 'irradiance' || name === 'Irradiação') return [`${value} W/m²`, name];
                      return [value, name];
                    }}
                  />
                  <Scatter name={isEn ? "Solar Production" : "Produção Fotovoltaica"} data={solarScatterData} fill="#eab308" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: CLIMATE TRENDS (7 DAYS / EXTENDED)            */}
      {/* ========================================================= */}
      {activeSubTab === 'trends' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Range Selection Bar */}
          <div className="flex flex-col xl:flex-row items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-white/5 gap-4">
            <div className="flex flex-col gap-1 w-full xl:w-auto">
              <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">{isEn ? "Extended Climate Projection Engine" : "Mecanismo Preditivo de Tendências Climáticas"}</span>
              <span className="text-[8px] text-slate-200 font-bold">{isEn ? "Select a timeframe to aggregate macroclimate metrics dynamically" : "Escolha o intervalo para consolidar as médias e records de radiação e chuva"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5 w-full xl:w-auto justify-center xl:justify-end">
              {[
                { value: 'current', label: isEn ? 'Current' : 'Atual' },
                { value: '3d', label: `3 ${isEn ? 'Days' : 'Dias'}` },
                { value: '7d', label: `7 ${isEn ? 'Days' : 'Dias'}` },
                { value: '14d', label: `14 ${isEn ? 'Days' : 'Dias'}` },
                { value: '30d', label: `30 ${isEn ? 'Days' : 'Dias'}` },
                { value: 'custom', label: isEn ? 'Custom Range' : 'Período Personalizado' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTrendRange(opt.value as any)}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition ${
                    trendRange === opt.value 
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date inputs if custom is active */}
          {trendRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-xl px-3 py-2">
                <span className="text-[10px] text-slate-200 uppercase font-black shrink-0">{isEn ? "Start Date:" : "Data de Início:"}</span>
                <input 
                  type="date" 
                  value={trendStartDate} 
                  onChange={(e) => setTrendStartDate(e.target.value)}
                  className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-xl px-3 py-2">
                <span className="text-[10px] text-slate-200 uppercase font-black shrink-0">{isEn ? "End Date:" : "Data de Término:"}</span>
                <input 
                  type="date" 
                  value={trendEndDate} 
                  onChange={(e) => setTrendEndDate(e.target.value)}
                  className="bg-transparent text-xs font-black text-white outline-none border-none cursor-pointer w-full"
                />
              </div>
            </div>
          )}

          {/* Aggregated Projection Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-slate-200 uppercase font-black block">{isEn ? "Average Temp" : "Temperatura Média"}</span>
              <span className="text-base font-black text-white mt-1 block font-mono">{trendMetrics.avgTemp}°C</span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Mean interval value" : "Média ponderada do ciclo"}</span>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-red-400 uppercase font-black block">{isEn ? "Max Temp Record" : "Temperatura Máxima"}</span>
              <span className="text-base font-black text-red-300 mt-1 block font-mono">{trendMetrics.maxTemp}°C</span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Maximum heat peak" : "Pico de calor registrado"}</span>
            </div>

            <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-sky-400 uppercase font-black block">{isEn ? "Min Temp Record" : "Temperatura Mínima"}</span>
              <span className="text-base font-black text-sky-300 mt-1 block font-mono">{trendMetrics.minTemp}°C</span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Minimum chill record" : "Pico de frio registrado"}</span>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-emerald-400 uppercase font-black block">{isEn ? "Rainy Days" : "Dias com Chuva"}</span>
              <span className="text-base font-black text-emerald-300 mt-1 block font-mono">{trendMetrics.rainDays} <span className="text-[9px] text-slate-200">{isEn ? "days" : "dias"}</span></span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Precipitation probability >= 50%" : "Probabilidade de chuva >= 50%"}</span>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-blue-400 uppercase font-black block">{isEn ? "Total Volume" : "Volume Estimado"}</span>
              <span className="text-base font-black text-blue-300 mt-1 block font-mono">{trendMetrics.totalRainMM} mm</span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Aggregated rainfall" : "Volume acumulado estimado"}</span>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex flex-col justify-between">
              <span className="text-[8px] text-amber-400 uppercase font-black block">{isEn ? "High UV Risk" : "Risco de UV Extremo"}</span>
              <span className="text-base font-black text-amber-300 mt-1 block font-mono">{trendMetrics.uvRiskDays} <span className="text-[9px] text-slate-200">{isEn ? "days" : "dias"}</span></span>
              <span className="text-[8px] text-slate-200 mt-1 block">{isEn ? "Index >= 8 (Very High)" : "Índice UV superior a 8"}</span>
            </div>
          </div>

          {/* Interactive Recharts Chart representing climate variations */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 relative">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block text-shadow-subtle">
              {isEn ? "Interactive Predictive Variation Graph" : "Gráfico de Variação Preditiva Interativa"}
            </span>
            
            <div className="h-52 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 12, right: 12, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.3} />
                  <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 9, fontWeight: 700 }} />
                  <YAxis stroke="var(--chart-axis)" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 9, fontWeight: 700 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '11px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="maxTemp" 
                    name={isEn ? "Max Temp (°C)" : "Temp Máxima (°C)"} 
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    strokeWidth={2.5}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pop" 
                    name={isEn ? "Rain Prob (%)" : "Prob. Chuva (%)"} 
                    stroke="#38bdf8" 
                    fillOpacity={1} 
                    fill="url(#colorRain)" 
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
