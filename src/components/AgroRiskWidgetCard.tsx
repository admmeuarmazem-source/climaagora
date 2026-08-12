import React from 'react';
import { Sprout, Droplets, Wind, Sun, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { computeMonthlyAgroBalances, getSoilMoistureHistory } from '../App';

interface AgroRiskWidgetCardProps {
  weather: any;
  currentCity: string;
  activeCoords?: { lat: number; lon: number } | null;
  manualLat?: string;
  manualLon?: string;
}

export const AgroRiskWidgetCard: React.FC<AgroRiskWidgetCardProps> = ({
  weather,
  currentCity,
  activeCoords,
  manualLat,
  manualLon
}) => {
  if (!weather) return null;

  // 1. PULVERIZAÇÃO
  // Critério: Não recomendada se windSpeed > 10 km/h OR max(hourly[0..2].pop) > 30% OR humidity < 30% OR humidity > 85%
  const windKm = weather.windSpeed || 0;
  const humidity = weather.humidity || 0;
  const next3hHourly = weather.hourly ? weather.hourly.slice(0, 3) : [];
  const maxPop3h = next3hHourly.length > 0
    ? Math.max(...next3hHourly.map((h: any) => h.pop ?? 0))
    : 0;

  let pulverizacaoStatus: 'Recomendada' | 'Não Recomendada';
  let pulverizacaoMotivo: string;
  let pulverizacaoType: 'success' | 'danger' | 'warning';

  if (maxPop3h > 30) {
    pulverizacaoStatus = 'Não Recomendada';
    pulverizacaoMotivo = `Chuva provável nas próximas 3h (máx ${maxPop3h}% > 30%)`;
    pulverizacaoType = 'danger';
  } else if (windKm > 10) {
    pulverizacaoStatus = 'Não Recomendada';
    pulverizacaoMotivo = `Vento acima do limite (${windKm} km/h > 10 km/h)`;
    pulverizacaoType = 'danger';
  } else if (humidity < 30) {
    pulverizacaoStatus = 'Não Recomendada';
    pulverizacaoMotivo = `Umidade relativa crítica (${humidity}% < 30%)`;
    pulverizacaoType = 'warning';
  } else if (humidity > 85) {
    pulverizacaoStatus = 'Não Recomendada';
    pulverizacaoMotivo = `Alta umidade / risco de orvalho (${humidity}% > 85%)`;
    pulverizacaoType = 'warning';
  } else {
    pulverizacaoStatus = 'Recomendada';
    pulverizacaoMotivo = `Vento ideal (${windKm} km/h) e UR (${humidity}%)`;
    pulverizacaoType = 'success';
  }

  // 2. IRRIGAÇÃO (Reaproveita computeMonthlyAgroBalances)
  // Critério: Necessária se déficit mensal (evapotranspiração - chuva) > 20mm; Moderada se > 5mm; Dispensável se <= 5mm
  const parsedLat = parseFloat(manualLat || '');
  const parsedLon = parseFloat(manualLon || '');
  const currentCoords = (!isNaN(parsedLat) && !isNaN(parsedLon))
    ? { lat: parsedLat, lon: parsedLon }
    : (activeCoords || { lat: -11.7831, lon: -38.3533 });

  const monthlyBalances = computeMonthlyAgroBalances(currentCoords.lat, currentCoords.lon, currentCity);
  const currentMonthIdx = new Date().getMonth();
  const currentMonthBalance = monthlyBalances[currentMonthIdx] || monthlyBalances[0];
  const deficitMm = currentMonthBalance ? (currentMonthBalance.evap - currentMonthBalance.chuva) : 0;

  let irrigacaoStatus: 'Necessária' | 'Moderada' | 'Dispensável';
  let irrigacaoDetalho: string;
  let irrigacaoType: 'danger' | 'warning' | 'success';

  if (deficitMm > 20) {
    irrigacaoStatus = 'Necessária';
    irrigacaoDetalho = `Déficit hídrico mensal de +${Math.round(deficitMm)}mm (> 20mm)`;
    irrigacaoType = 'danger';
  } else if (deficitMm > 5) {
    irrigacaoStatus = 'Moderada';
    irrigacaoDetalho = `Balanço hídrico em atenção (${Math.round(deficitMm)}mm evap. excedente)`;
    irrigacaoType = 'warning';
  } else {
    irrigacaoStatus = 'Dispensável';
    irrigacaoDetalho = `Precipitação suprem necessidades (sem déficit crítico)`;
    irrigacaoType = 'success';
  }

  // 3. PLANTIO (Critério aprovado na Fase 1: Umidade do solo atual 40%-75% + Chuva prevista 3 dias 10mm-50mm)
  const soilHistory = getSoilMoistureHistory(currentCity);
  const currentSoilMoisture = soilHistory.length > 0 ? soilHistory[soilHistory.length - 1].moisture : 55;
  
  const next3Days = weather.daily ? weather.daily.slice(0, 3) : [];
  const forecastRain3dMm = next3Days.reduce((acc: number, d: any) => {
    const mm = d.precipMm ?? (d.pop > 50 ? 12 : 0);
    return acc + mm;
  }, 0);

  let plantioStatus: 'Favorável' | 'Moderado' | 'Desfavorável';
  let plantioMotivo: string;
  let plantioType: 'success' | 'warning' | 'danger';

  if (currentSoilMoisture >= 40 && currentSoilMoisture <= 75 && forecastRain3dMm >= 10 && forecastRain3dMm <= 50) {
    plantioStatus = 'Favorável';
    plantioMotivo = `Solo com ${currentSoilMoisture}% umidade (40-75%) e chuva 3d (${Math.round(forecastRain3dMm)}mm em 10-50mm)`;
    plantioType = 'success';
  } else if (currentSoilMoisture < 40) {
    plantioStatus = 'Desfavorável';
    plantioMotivo = `Solo muito seco (${currentSoilMoisture}% < 40% do limite mínimo de plantio)`;
    plantioType = 'danger';
  } else if (currentSoilMoisture > 75) {
    plantioStatus = 'Desfavorável';
    plantioMotivo = `Solo encharcado (${currentSoilMoisture}% > 75% da capacidade de campo)`;
    plantioType = 'danger';
  } else {
    plantioStatus = 'Moderado';
    plantioMotivo = `Umidade solo ${currentSoilMoisture}% e chuva prevista 3d de ${Math.round(forecastRain3dMm)}mm`;
    plantioType = 'warning';
  }

  // 4. ESTRESSE TÉRMICO
  // Critério: Baixo se feelsLike < 28°C; Moderado se 28°C <= feelsLike < 35°C; Alto se feelsLike >= 35°C
  const feelsLike = weather.feelsLike ?? weather.temp ?? 22;
  let estresseStatus: 'Baixo' | 'Moderado' | 'Alto';
  let estresseMotivo: string;
  let estresseType: 'success' | 'warning' | 'danger';

  if (feelsLike >= 35) {
    estresseStatus = 'Alto';
    estresseMotivo = `Sensação térmica crítica (${feelsLike}°C >= 35°C) — Risco a culturas e animais`;
    estresseType = 'danger';
  } else if (feelsLike >= 28) {
    estresseStatus = 'Moderado';
    estresseMotivo = `Sensação térmica moderada (${feelsLike}°C entre 28°C e 34°C)`;
    estresseType = 'warning';
  } else {
    estresseStatus = 'Baixo';
    estresseMotivo = `Conforto térmico adequado (${feelsLike}°C < 28°C)`;
    estresseType = 'success';
  }

  const getTypeStyle = (type: 'success' | 'warning' | 'danger') => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
          badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40',
          icon: <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'danger':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400',
          badge: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40',
          icon: <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
        };
    }
  };

  const plantioStyle = getTypeStyle(plantioType);
  const irrigacaoStyle = getTypeStyle(irrigacaoType);
  const pulverizacaoStyle = getTypeStyle(pulverizacaoType);
  const estresseStyle = getTypeStyle(estresseType);

  return (
    <div id="agro-risk-widget" className="card custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200 dark:border-white/15 p-5 rounded-3xl shadow-2xl hover:border-emerald-500/40 transition duration-300 flex flex-col gap-5 relative overflow-hidden text-slate-900 dark:text-white">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-emerald-600 dark:text-emerald-400 animate-pulse" size={18} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Resumo de Risco Agrícola Operacional
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-extrabold tracking-wide">
              Indicadores agrometeorológicos calculados em tempo real para {currentCity}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-black border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0">
          Dados Reais
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 🌱 Plantio */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition ${plantioStyle.bg}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sprout size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                🌱 Plantio
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${plantioStyle.badge}`}>
              {plantioStatus}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
            {plantioStyle.icon}
            <span>{plantioMotivo}</span>
          </div>
        </div>

        {/* 💧 Irrigação */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition ${irrigacaoStyle.bg}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                💧 Irrigação
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${irrigacaoStyle.badge}`}>
              {irrigacaoStatus}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
            {irrigacaoStyle.icon}
            <span>{irrigacaoDetalho}</span>
          </div>
        </div>

        {/* 🚜 Pulverização */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition ${pulverizacaoStyle.bg}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                🚜 Pulverização
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${pulverizacaoStyle.badge}`}>
              {pulverizacaoStatus}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
            {pulverizacaoStyle.icon}
            <span>{pulverizacaoMotivo}</span>
          </div>
        </div>

        {/* ☀️ Estresse Térmico */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition ${estresseStyle.bg}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                ☀️ Estresse Térmico
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${estresseStyle.badge}`}>
              {estresseStatus}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
            {estresseStyle.icon}
            <span>{estresseMotivo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
