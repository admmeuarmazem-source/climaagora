import React, { useState } from 'react';
import { Sun, ShieldCheck, AlertCircle, Clock, Info, UserCheck } from 'lucide-react';

interface UVProtectionProps {
  cityName: string;
  uvIndex?: number;
}

export const UVProtectionPanel: React.FC<UVProtectionProps> = ({ cityName, uvIndex = 0 }) => {
  const [skinType, setSkinType] = useState<number>(2); // Default skin type II

  const currentUVIndex = uvIndex;

  const skinTypes = [
    { type: 1, name: 'Tipo I (Muito Clara)', desc: 'Cabelos ruivos/loiros, olhos claros. Sempre queima, nunca doura.', maxExposureNoSPF: 10, recommendedSPF: 'FPS 50+' },
    { type: 2, name: 'Tipo II (Clara)', desc: 'Pele clara, olhos claros ou castanhos. Queima facilmente, doura levemente.', maxExposureNoSPF: 15, recommendedSPF: 'FPS 50+' },
    { type: 3, name: 'Tipo III (Morena Clara)', desc: 'Pele morena clara. Queima moderadamente, doura gradualmente.', maxExposureNoSPF: 22, recommendedSPF: 'FPS 30+' },
    { type: 4, name: 'Tipo IV (Morena Escura)', desc: 'Pele morena moderada. Rara queimadura, doura facilmente.', maxExposureNoSPF: 30, recommendedSPF: 'FPS 30' },
    { type: 5, name: 'Tipo V (Negra Clara)', desc: 'Pele escura. Raras queimaduras, doura intensamente.', maxExposureNoSPF: 45, recommendedSPF: 'FPS 30' },
    { type: 6, name: 'Tipo VI (Negra Retinta)', desc: 'Pele muito escura. Praticamente nunca queima, altamente pigmentada.', maxExposureNoSPF: 60, recommendedSPF: 'FPS 15+' }
  ];

  const currentSkin = skinTypes.find(s => s.type === skinType) || skinTypes[1];

  const getUVCategory = (val: number) => {
    if (val < 3) return { label: 'Baixo', color: 'text-black', badge: 'bg-emerald-500/20 text-black border-emerald-500/40' };
    if (val < 6) return { label: 'Moderado', color: 'text-black', badge: 'bg-amber-500/20 text-black border-amber-500/40' };
    if (val < 8) return { label: 'Alto', color: 'text-black', badge: 'bg-orange-500/20 text-black border-orange-500/40' };
    if (val < 11) return { label: 'Muito Alto', color: 'text-black', badge: 'bg-rose-500/20 text-black border-rose-500/40 animate-pulse' };
    return { label: 'Extremo', color: 'text-black', badge: 'bg-purple-500/20 text-black border-purple-500/40 animate-pulse' };
  };

  const uvInfo = getUVCategory(currentUVIndex);

  return (
    <div className="card custom-dynamic-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-black">
      {/* Background Yellow Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-black">
            <Sun size={24} color="black" className="text-black animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm uppercase font-black text-black tracking-wider">Calculadora de Proteção Solar por Fototipo</span>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-black text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 font-black">FITZPATRICK SCALE</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-black leading-tight mt-1">
              Índice UV e Tempo Limite de Exposição ({cityName})
            </h3>
          </div>
        </div>
      </div>

      {/* UV Index Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/80 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-black font-extrabold uppercase tracking-wider">Índice UV Solar Atual</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-5xl font-black ${uvInfo.color}`}>
                {currentUVIndex}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${uvInfo.badge}`}>
                {uvInfo.label}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-black font-bold">Pico UV Hoje:</span>
              <strong className="text-black font-black">10.2 (Extremo às 12:40)</strong>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-black font-bold">Horário Crítico:</span>
              <strong className="text-black font-black">10:00 às 16:00</strong>
            </div>
          </div>
        </div>

        {/* Fitzpatrick Skin Selection & Safe Exposure Minutes */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-white/10 rounded-2xl p-5">
          <label className="text-xs font-black uppercase text-black tracking-wider mb-2 block flex items-center gap-2">
            <UserCheck size={15} className="text-black" /> Selecione seu Fototipo de Pele (Escala Fitzpatrick)
          </label>

          <select
            value={skinType}
            onChange={(e) => setSkinType(Number(e.target.value))}
            className="w-full bg-slate-900 border border-white/15 text-black font-bold rounded-xl p-3 text-xs mb-4 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {skinTypes.map((s) => (
              <option key={s.type} value={s.type}>
                {s.name} — {s.desc}
              </option>
            ))}
          </select>

          {/* Results calculation display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-black shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[9px] text-black font-extrabold uppercase block">Tempo Máximo Sem Protetor</span>
                <strong className="text-lg font-black text-black">{currentSkin.maxExposureNoSPF} Minutos</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-black shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-[9px] text-black font-extrabold uppercase block">Fator Recomendado</span>
                <strong className="text-lg font-black text-black">{currentSkin.recommendedSPF}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UVProtectionPanel;
