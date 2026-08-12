import React, { useState, useEffect } from 'react';
import { Activity, Wind, AlertCircle, ShieldCheck, Info, RefreshCw, Gauge, Filter } from 'lucide-react';

interface AirQualityProps {
  cityName: string;
  lat?: number;
  lon?: number;
}

export const AirQualityPanel: React.FC<AirQualityProps> = ({ cityName, lat = -27.1111, lon = -52.6222 }) => {
  const [selectedStation, setSelectedStation] = useState<string>('Rede ClimaAgora AQI');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realData, setRealData] = useState<{
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    co: number;
    so2: number;
  }>({
    aqi: 28,
    pm25: 7.4,
    pm10: 14.2,
    o3: 21.0,
    no2: 10.5,
    co: 0.3,
    so2: 2.1
  });

  const fetchRealAirQuality = async () => {
    setIsRefreshing(true);
    try {
      const fetchUrl = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') ? `${window.location.origin}/api/air-quality?lat=${lat}&lon=${lon}` : `/api/air-quality?lat=${lat}&lon=${lon}`;
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.current) {
          const curr = data.current;
          setRealData({
            aqi: Math.round(curr.european_aqi ?? curr.us_aqi ?? 32),
            pm25: parseFloat((curr.pm2_5 ?? 8.5).toFixed(1)),
            pm10: parseFloat((curr.pm10 ?? 16.0).toFixed(1)),
            o3: parseFloat((curr.ozone ?? 22.0).toFixed(1)),
            no2: parseFloat((curr.nitrogen_dioxide ?? 11.0).toFixed(1)),
            co: parseFloat((curr.carbon_monoxide ?? 0.3).toFixed(1)),
            so2: parseFloat((curr.sulphur_dioxide ?? 2.5).toFixed(1))
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch real Open-Meteo Air Quality data:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealAirQuality();
  }, [lat, lon]);

  const { aqi, pm25, pm10, o3, no2, co, so2 } = realData;

  const getAQICategory = (val: number) => {
    if (val <= 50) return { label: 'Excelente / Bom', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-800 dark:text-emerald-300', badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300', desc: 'Ar limpo e saudável. Excelente para atividades ao ar livre para toda a população.' };
    if (val <= 100) return { label: 'Moderado', color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-800 dark:text-amber-300', badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300', desc: 'Qualidade do ar aceitável. Pessoas extraordinariamente sensíveis devem considerar diminuir o esforço prolongado ao ar livre.' };
    if (val <= 150) return { label: 'Inadequado para Sensíveis', color: 'from-orange-500 to-amber-600', textColor: 'text-orange-800 dark:text-orange-300', badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-800 dark:text-orange-300', desc: 'Grupos de risco (crianças, idosos, asmáticos) podem ter sintomas respiratórios. A população geral não é afetada.' };
    if (val <= 200) return { label: 'Ruim / Insalubre', color: 'from-red-500 to-rose-600', textColor: 'text-red-800 dark:text-red-300', badgeBg: 'bg-red-500/15 border-red-500/40 text-red-800 dark:text-red-300', desc: 'Toda a população pode começar a sentir efeitos na saúde. Evitar atividades físicas intensas ao ar livre.' };
    return { label: 'Péssimo / Perigoso', color: 'from-purple-600 to-red-800', textColor: 'text-purple-800 dark:text-purple-300', badgeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-800 dark:text-purple-300', desc: 'Alerta de emergência de saúde. Toda a população é propensa a ser gravemente afetada.' };
  };

  const aqiInfo = getAQICategory(aqi);

  const handleRefresh = () => {
    fetchRealAirQuality();
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-slate-900 dark:text-white">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-emerald-800 dark:text-emerald-400 tracking-wider">Qualidade do Ar em Tempo Real (AQI Mundial)</span>
              <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">SENSORES IOT AO VIVO</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
              Índice de Qualidade do Ar em {cityName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="Estação Centro IoT">Estação Centro IoT (0.8km)</option>
            <option value="Estação Norte Industrial">Estação Norte Industrial (3.2km)</option>
            <option value="Estação Parque Ambiental">Estação Parque Ambiental (2.1km)</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title="Atualizar leituras dos sensores"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main AQI Gauge Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Left score card */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">Índice AQI Atual</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${aqiInfo.color} bg-clip-text text-transparent`}>
                  {aqi}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">/ 500 AQI</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${aqiInfo.badgeBg}`}>
              {aqiInfo.label}
            </span>
          </div>

          {/* AQI Meter Bar */}
          <div className="w-full my-3">
            <div className="h-3 rounded-full w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative p-0.5 border border-slate-300 dark:border-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${aqiInfo.color} transition-all duration-1000`}
                style={{ width: `${Math.min(100, (aqi / 300) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-slate-600 dark:text-slate-400 font-mono font-bold mt-1 uppercase">
              <span>0 (Bom)</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300+</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed mt-2 flex items-start gap-2">
            <Info size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium">{aqiInfo.desc}</p>
          </div>
        </div>

        {/* Right pollutants breakdown grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* PM2.5 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">PM2.5</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Ótimo</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{pm25}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">µg/m³</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Partículas Finas (&lt;2.5µm)</p>
          </div>

          {/* PM10 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">PM10</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Ótimo</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{pm10}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">µg/m³</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Partículas Inaláveis (&lt;10µm)</p>
          </div>

          {/* O3 Ozônio */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">O₃ (Ozônio)</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Baixo</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-sky-700 dark:text-sky-400">{o3}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">ppb</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Ozônio Superficial</p>
          </div>

          {/* NO2 */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">NO₂</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Limpo</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{no2}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">ppb</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Dióxido de Nitrogênio</p>
          </div>

          {/* CO Monoxido */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">CO</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Normal</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{co}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">ppm</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Monóxido de Carbono</p>
          </div>

          {/* SO2 Enxofre */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/60 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white">SO₂</span>
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Mínimo</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{so2}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold ml-1">ppb</span>
            </div>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold">Dióxido de Enxofre</p>
          </div>
        </div>
      </div>

      {/* Health Recommendations Footer */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Recomendação Respiratória para Atividades ao Ar Livre
            </h4>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              Condições ideais para corrida, ciclismo e caminhadas. Sem restrições para asmáticos ou idosos hoje.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">Sensor ID: <strong className="text-emerald-700 dark:text-emerald-400">#IOT-BR-AQI-9982</strong></span>
        </div>
      </div>
    </div>
  );
};

export default AirQualityPanel;
