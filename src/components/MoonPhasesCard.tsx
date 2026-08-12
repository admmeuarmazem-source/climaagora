import React from 'react';
import { Moon, Calendar } from 'lucide-react';

interface MoonPhasesCardProps {
  selectedMoonDate: string;
  setSelectedMoonDate: (val: string) => void;
  moonRangeOption: string;
  setMoonRangeOption: (val: any) => void;
  getDatesForRange: (opt: string) => string[];
  getMoonPhaseForDate: (dateStr: string) => any;
}

export const MoonPhasesCard: React.FC<MoonPhasesCardProps> = ({
  selectedMoonDate,
  setSelectedMoonDate,
  moonRangeOption,
  setMoonRangeOption,
  getDatesForRange,
  getMoonPhaseForDate
}) => {
  return (
    <div id="moon-phases-card" className="card custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200 dark:border-white/15 p-5 rounded-3xl shadow-2xl transition duration-300 flex flex-col gap-5 relative overflow-hidden text-slate-900 dark:text-white w-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Moon className="text-amber-500 dark:text-yellow-300 animate-pulse" size={20} />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Fases da Lua & Ciclo Lunar
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-100 font-extrabold tracking-wide">
              Previsão Astronômica • Luminosidade & Eventos Celestes
            </p>
          </div>
        </div>
        {/* Mini-seletor de calendário integrado */}
        <div className="mini-card flex items-center gap-2 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/20 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-black text-amber-700 dark:text-yellow-400 uppercase tracking-wider">Projeção:</span>
          <input 
            type="date" 
            value={selectedMoonDate} 
            onChange={(e) => setSelectedMoonDate(e.target.value)}
            className="bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none border-none cursor-pointer"
          />
        </div>
      </div>

      {/* Moon Range Selector */}
      <div className="mini-card flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <Calendar className="text-amber-600 dark:text-yellow-400" size={14} />
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Janela de Projeção Lunar:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(['atual', '3dias', '7dias', '14dias', '30dias', 'personalizar'] as const).map((opt) => {
            const labels: Record<string, string> = {
              atual: 'Atual',
              '3dias': '3 dias',
              '7dias': '7 dias',
              '14dias': '14 dias',
              '30dias': '30 dias',
              personalizar: 'personalizar data'
            };
            return (
              <button
                key={opt}
                onClick={() => {
                  setMoonRangeOption(opt);
                  if (opt !== 'personalizar') {
                    const rangeDates = getDatesForRange(opt);
                    if (rangeDates.length > 0) {
                      setSelectedMoonDate(rangeDates[0]);
                    }
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer ${moonRangeOption === opt ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-white/10'}`}
              >
                {labels[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel of Projected Days */}
      {moonRangeOption !== 'atual' && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-amber-600 dark:text-yellow-400 uppercase tracking-widest block">Projeção do Ciclo em {moonRangeOption === 'personalizar' ? 'Data Selecionada' : `${getDatesForRange(moonRangeOption).length} Dias`}:</span>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            {getDatesForRange(moonRangeOption).map((dateStr) => {
              const m = getMoonPhaseForDate(dateStr);
              const isSel = selectedMoonDate === dateStr;
              const dateObj = new Date(dateStr + 'T12:00:00');
              const labelDay = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const labelWeekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedMoonDate(dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition w-[80px] focus:outline-none cursor-pointer ${isSel ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 dark:from-yellow-500/20 dark:to-yellow-500/5 border-amber-500 dark:border-yellow-500 shadow-lg' : 'bg-slate-100 dark:bg-slate-950/40 hover:bg-slate-200 dark:hover:bg-slate-900 border-slate-200 dark:border-white/5'}`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-tight ${isSel ? 'text-amber-600 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-200'}`}>{labelWeekday}</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{labelDay}</span>
                  <svg className="w-7 h-7 drop-shadow-[0_0_8px_rgba(253,251,212,0.4)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#1e293b" />
                    <path d={m.pathD} fill="#fef08a" />
                  </svg>
                  <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-full text-center leading-none">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(() => {
        const moon = getMoonPhaseForDate(selectedMoonDate);
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-center">
            {/* Moon visual & Cycle Progress */}
            <div className="mini-card xl:col-span-5 flex flex-col items-center justify-center p-4 bg-white/10 dark:bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 relative">
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-100/10 rounded-full blur-xl animate-pulse" />
                <svg className="w-16 h-16 drop-shadow-[0_0_15px_rgba(253,251,212,0.6)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#1e293b" />
                  <path d={moon.pathD} fill="#fef08a" />
                  <circle cx="35" cy="40" r="5" fill="rgba(15, 23, 42, 0.15)" />
                  <circle cx="42" cy="65" r="4" fill="rgba(15, 23, 42, 0.15)" />
                  <circle cx="65" cy="50" r="7" fill="rgba(254, 240, 138, 0.3)" />
                </svg>
                <div className="absolute -bottom-1 bg-slate-900 dark:bg-slate-950/95 border border-slate-700 dark:border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black text-yellow-300 uppercase tracking-widest text-center">
                  {moon.name}
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between items-center mb-1 text-xs text-slate-700 dark:text-slate-200 font-extrabold">
                  <span>Progresso</span>
                  <span className="text-black dark:text-black font-black">Dia {moon.age} ({moon.illumination}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 border border-slate-300 dark:border-white/10 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-yellow-500 dark:to-yellow-200 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(parseFloat(moon.age) / 29.53) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Astronomical Predictions list */}
            <div className="xl:col-span-7 flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-amber-600 dark:text-yellow-400 uppercase tracking-widest block">Previsões para {new Date(selectedMoonDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(() => {
                  const dateObj = new Date(selectedMoonDate + 'T12:00:00');
                  
                  const anomalisticMonth = 27.55455;
                  const basePerigee = new Date("2026-07-01T12:00:00Z");
                  const diffTime = dateObj.getTime() - basePerigee.getTime();
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  const anomAge = (diffDays % anomalisticMonth + anomalisticMonth) % anomalisticMonth;
                  const anomRad = (anomAge * 2 * Math.PI) / anomalisticMonth;
                  const distanceKm = Math.round(381550 - 25150 * Math.cos(anomRad));
                  const isApogeeOrPerigee = distanceKm > 403000 
                    ? "Apogeu (Máx. Distância)" 
                    : distanceKm < 360000 
                      ? "Perigeu (Superlua)" 
                      : "Distância Estável";

                  const synodicMonth = 29.530588853;
                  const moonAgeNum = parseFloat(moon.age);
                  const transitHour = ((moonAgeNum / synodicMonth) * 24 + 12) % 24;
                  const transitFormatted = `${Math.floor(transitHour).toString().padStart(2, '0')}:${Math.floor((transitHour % 1) * 60).toString().padStart(2, '0')}h`;

                  const isSizigia = moonAgeNum < 2 || (moonAgeNum > 13 && moonAgeNum < 16) || moonAgeNum > 28;
                  const tideForce = isSizigia 
                    ? "Sizígia (Ampl. Máxima)" 
                    : "Quadratura (Ampl. Mínima)";

                  return [
                    { label: 'Fase Projetada', value: `${moon.name} (${moon.illumination}%)`, icon: moon.icon },
                    { label: 'Período', value: `${moon.startDate} à ${moon.endDate}`, icon: '📅' },
                    { label: 'Idade da Lua', value: `${moon.age} dias no ciclo`, icon: '🌙' },
                    { label: 'Distância', value: `${distanceKm.toLocaleString('pt-BR')} km`, icon: '🛰️' },
                    { label: 'Trânsito', value: `${transitFormatted}`, icon: '🧭' },
                    { label: 'Força da Maré', value: tideForce, icon: '🌊' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-100 dark:bg-slate-900/90 p-2 rounded-xl border border-slate-300 dark:border-white/10 flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8.5px] font-black text-slate-800 dark:text-slate-300 uppercase block">{item.label}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono truncate">{item.value}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MoonPhasesCard;
