import React from 'react';
import { Sparkles, Clock, Activity, Zap, Wind, Flame, Navigation, Sun } from 'lucide-react';
import MinutecastPanel from './MinutecastPanel';
import AirQualityPanel from './AirQualityPanel';
import LightningAlertPanel from './LightningAlertPanel';
import Wind3DPressurePanel from './Wind3DPressurePanel';
import NASAWildfireRadar from './NASAWildfireRadar';
import CycloneTrackerPanel from './CycloneTrackerPanel';
import UVProtectionPanel from './UVProtectionPanel';

interface AdvancedWeatherSuiteCardProps {
  weather: any;
  currentCity: string;
  activeAdvancedFeature?: 'minutecast' | 'aqi' | 'lightning' | 'wind3d' | 'wildfire' | 'cyclone' | 'uv';
  setActiveAdvancedFeature?: (feature: any) => void;
  selectedRainDayInfo?: any;
  setSelectedRainDayInfo?: any;
}

export const AdvancedWeatherSuiteCard: React.FC<AdvancedWeatherSuiteCardProps> = ({
  weather,
  currentCity,
  activeAdvancedFeature: propFeature,
  setActiveAdvancedFeature: propSetFeature
}) => {
  const [internalFeature, setInternalFeature] = React.useState<'minutecast' | 'aqi' | 'lightning' | 'wind3d' | 'wildfire' | 'cyclone' | 'uv'>('minutecast');
  const activeAdvancedFeature = propFeature ?? internalFeature;
  const setActiveAdvancedFeature = (feature: any) => {
    setInternalFeature(feature);
    if (typeof propSetFeature === 'function') {
      propSetFeature(feature);
    }
  };
  return (
    <div id="advanced-weather-suite" className="flex flex-col gap-6 my-4 w-full">
      {/* Suite Header with Selector Tabs */}
      <div className="card custom-dynamic-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black shadow-sm">
              <Sparkles size={28} color="black" className="text-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-black text-black tracking-widest">SISTEMA METEOROLÓGICO AVANÇADO</span>
                <span className="bg-sky-100 dark:bg-sky-950/60 text-black text-xs font-mono px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-700 font-black">7 MÓDULOS ATIVOS</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-black leading-tight mt-1">
                Central de Inteligência Climática ({weather?.city || currentCity})
              </h2>
            </div>
          </div>
        </div>

        {/* 7 Feature Selector Buttons Row */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full">
          {[
            { id: 'minutecast', label: 'Minutecast (60-120m)', icon: Clock },
            { id: 'aqi', label: 'Qualidade Ar (AQI)', icon: Activity },
            { id: 'lightning', label: 'Push Alerta Raios', icon: Zap },
            { id: 'wind3d', label: 'Ventos 3D Altitude', icon: Wind },
            { id: 'wildfire', label: 'Queimadas (NASA)', icon: Flame },
            { id: 'cyclone', label: 'Ciclones & Furacões', icon: Navigation },
            { id: 'uv', label: 'Índice UV & Pele', icon: Sun }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeAdvancedFeature === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveAdvancedFeature(item.id as any)}
                className={`flex-1 min-w-[120px] xs:min-w-[130px] p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between items-start gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-sky-600 text-black border-slate-900 dark:border-sky-500 shadow-xl scale-[1.02] ring-2 ring-sky-400/50'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-white/10 text-black shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-black' : 'bg-slate-200/70 dark:bg-slate-700/70 text-black border border-slate-300 dark:border-slate-600'}`}>
                  <Icon size={18} color="black" className="text-black" />
                </div>
                <span className={`text-xs font-black leading-snug ${isActive ? 'text-black' : 'text-black'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Advanced Component */}
      {activeAdvancedFeature === 'minutecast' && <MinutecastPanel cityName={weather?.city || currentCity} weather={weather} />}
      {activeAdvancedFeature === 'aqi' && <AirQualityPanel cityName={weather?.city || currentCity} />}
      {activeAdvancedFeature === 'lightning' && <LightningAlertPanel cityName={weather?.city || currentCity} />}
      {activeAdvancedFeature === 'wind3d' && <Wind3DPressurePanel cityName={weather?.city || currentCity} />}
      {activeAdvancedFeature === 'wildfire' && <NASAWildfireRadar cityName={weather?.city || currentCity} />}
      {activeAdvancedFeature === 'cyclone' && <CycloneTrackerPanel cityName={weather?.city || currentCity} />}
      {activeAdvancedFeature === 'uv' && <UVProtectionPanel cityName={weather?.city || currentCity} uvIndex={weather?.uvIndex} />}
    </div>
  );
};

export default AdvancedWeatherSuiteCard;
