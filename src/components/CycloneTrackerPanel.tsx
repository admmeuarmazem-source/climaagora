import React, { useState } from 'react';
import { Compass, Navigation, ShieldAlert, AlertTriangle, Wind, Info, MapPin } from 'lucide-react';

interface CycloneTrackerProps {
  cityName: string;
}

export const CycloneTrackerPanel: React.FC<CycloneTrackerProps> = ({ cityName }) => {
  const [activeCyclone, setActiveCyclone] = useState('ciclone-1');

  // Simulated active cyclones / tropical systems tracking data
  const cycloneSystems = [
    {
      id: 'ciclone-1',
      name: 'Ciclone Extratropical Atlântico Sul #04',
      type: 'Ciclone Extratropical Intenso',
      windSpeed: '98 km/h',
      gusts: '125 km/h',
      pressure: '984 hPa',
      category: 'Rajadas de Tempestade Subtropical',
      movement: 'Sudoeste a 22 km/h',
      distToUser: '480 km ao Sudeste',
      status: 'EM MONITORAMENTO',
      pathForecast: [
        { day: 'Hoje 18:00', pos: '28.4°S, 48.2°W', wind: '98 km/h', status: 'Ativo' },
        { day: 'Amanhã 06:00', pos: '29.1°S, 46.8°W', wind: '105 km/h', status: 'Pico Intenso' },
        { day: 'Amanhã 18:00', pos: '30.2°S, 44.5°W', wind: '85 km/h', status: 'Afastamento' },
        { day: 'Em 48h', pos: '31.8°S, 41.0°W', wind: '62 km/h', status: 'Dissipação em Alto Mar' }
      ]
    }
  ];

  const currentSystem = cycloneSystems.find(c => c.id === activeCyclone) || cycloneSystems[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-white">
      {/* Background Deep Blue/Purple Glow */}
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Navigation size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Tracker Trajetória de Ciclones & Tempestades Tropicais</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold">PROJEÇÃO DE TRAJETÓRIA</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">
              Monitor de Ciclones e Cônicos de Incerteza ({cityName})
            </h3>
          </div>
        </div>
      </div>

      {/* Cyclone Status Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-5 bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">
                {currentSystem.type}
              </span>
              <span className="text-[10px] text-amber-400 font-extrabold">{currentSystem.status}</span>
            </div>
            <h4 className="text-xl font-black text-white leading-tight mt-1">{currentSystem.name}</h4>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Centro a {currentSystem.distToUser}. Deslocando-se para {currentSystem.movement}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Vento Sustentado</span>
              <strong className="text-sm font-black text-sky-400">{currentSystem.windSpeed}</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Pressão Central</span>
              <strong className="text-sm font-black text-indigo-400">{currentSystem.pressure}</strong>
            </div>
          </div>
        </div>

        {/* Path Forecast Steps */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-white/10 rounded-2xl p-5">
          <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Navigation size={14} className="text-indigo-400" /> Projeção de Trajetória e Raio de Incerteza (Cone)</span>
            <span className="text-[10px] font-mono text-slate-400">Próximas 48 Horas</span>
          </h4>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
            {currentSystem.pathForecast.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between text-xs">
                {/* Node indicator */}
                <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 ${idx === 0 ? 'bg-amber-400 border-amber-300 animate-ping' : 'bg-indigo-500 border-indigo-300'}`} />
                <div>
                  <strong className="text-white font-bold block">{step.day}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">{step.pos} • {step.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-sky-400">{step.wind}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycloneTrackerPanel;
