import React, { useState } from 'react';
import { Sun, Snowflake, Leaf, Flower2, Calendar, Clock, Compass, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeasonsCardProps {
  currentDate?: Date;
}

export const SeasonsCard: React.FC<SeasonsCardProps> = ({ currentDate = new Date() }) => {
  const [hemisphere, setHemisphere] = useState<'south' | 'north'>('south');

  // Year 2026 seasons definitions
  const seasonsSouth2026 = [
    {
      id: 'verao_start',
      name: 'Verão',
      icon: Sun,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      startDate: '21/12/2025',
      endDate: '20/03/2026',
      startObj: new Date('2025-12-21T00:00:00'),
      endObj: new Date('2026-03-20T23:59:59'),
      astronomicalEvent: 'Solstício de Verão (21/12 às 12:03)',
      desc: 'Temperaturas elevadas, dias mais longos e pancadas de chuva de fim de tarde.'
    },
    {
      id: 'outono',
      name: 'Outono',
      icon: Leaf,
      color: 'orange',
      bgGradient: 'from-orange-500/20 to-amber-600/10',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      startDate: '20/03/2026',
      endDate: '21/06/2026',
      startObj: new Date('2026-03-20T00:00:00'),
      endObj: new Date('2026-06-21T23:59:59'),
      astronomicalEvent: 'Equinócio de Outono (20/03 às 11:46)',
      desc: 'Queda gradual de temperaturas, redução das chuvas e dias e noites com durações iguais.'
    },
    {
      id: 'inverno',
      name: 'Inverno',
      icon: Snowflake,
      color: 'cyan',
      bgGradient: 'from-cyan-500/20 to-blue-600/10',
      borderColor: 'border-cyan-500/50',
      textColor: 'text-cyan-400',
      startDate: '21/06/2026',
      endDate: '22/09/2026',
      startObj: new Date('2026-06-21T00:00:00'),
      endObj: new Date('2026-09-22T23:59:59'),
      astronomicalEvent: 'Solstício de Inverno (21/06 às 05:24)',
      desc: 'Temperaturas amenas/frias, noites mais longas do ano e entrada de massas polares.'
    },
    {
      id: 'primavera',
      name: 'Primavera',
      icon: Flower2,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-teal-600/10',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      startDate: '22/09/2026',
      endDate: '21/12/2026',
      startObj: new Date('2026-09-22T00:00:00'),
      endObj: new Date('2026-12-21T23:59:59'),
      astronomicalEvent: 'Equinócio de Primavera (22/09 às 17:05)',
      desc: 'Floração da vegetação, retorno gradativo da umidade e elevação constante das temperaturas.'
    }
  ];

  const seasonsNorth2026 = [
    {
      id: 'inverno_north',
      name: 'Inverno',
      icon: Snowflake,
      color: 'cyan',
      bgGradient: 'from-cyan-500/20 to-blue-600/10',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-400',
      startDate: '21/12/2025',
      endDate: '20/03/2026',
      startObj: new Date('2025-12-21T00:00:00'),
      endObj: new Date('2026-03-20T23:59:59'),
      astronomicalEvent: 'Solstício de Inverno Norte (21/12)',
      desc: 'Frio intenso e neve nas regiões de altas latitudes do Hemisfério Norte.'
    },
    {
      id: 'primavera_north',
      name: 'Primavera',
      icon: Flower2,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-teal-600/10',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      startDate: '20/03/2026',
      endDate: '21/06/2026',
      startObj: new Date('2026-03-20T00:00:00'),
      endObj: new Date('2026-06-21T23:59:59'),
      astronomicalEvent: 'Equinócio de Primavera Norte (20/03)',
      desc: 'Descongelamento, brotação da flora e temperaturas amenas em elevação.'
    },
    {
      id: 'verao_north',
      name: 'Verão',
      icon: Sun,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-400',
      startDate: '21/06/2026',
      endDate: '22/09/2026',
      startObj: new Date('2026-06-21T00:00:00'),
      endObj: new Date('2026-09-22T23:59:59'),
      astronomicalEvent: 'Solstício de Verão Norte (21/06)',
      desc: 'Dias mais longos e ondas de calor predominantes no hemisfério setentrional.'
    },
    {
      id: 'outono_north',
      name: 'Outono',
      icon: Leaf,
      color: 'orange',
      bgGradient: 'from-orange-500/20 to-amber-600/10',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      startDate: '22/09/2026',
      endDate: '21/12/2026',
      startObj: new Date('2026-09-22T00:00:00'),
      endObj: new Date('2026-12-21T23:59:59'),
      astronomicalEvent: 'Equinócio de Outono Norte (22/09)',
      desc: 'Resfriamento progressivo e amarelecimento das folhas antes do inverno.'
    }
  ];

  const currentSeasonsList = hemisphere === 'south' ? seasonsSouth2026 : seasonsNorth2026;

  // Determine active season
  const nowMs = currentDate.getTime();
  const activeSeason = currentSeasonsList.find(
    (s) => nowMs >= s.startObj.getTime() && nowMs <= s.endObj.getTime()
  ) || currentSeasonsList[2]; // Default to Inverno for current date Aug 2026 in S.Hemisphere

  // Compute progress in current active season
  const totalDurationMs = activeSeason.endObj.getTime() - activeSeason.startObj.getTime();
  const elapsedMs = Math.max(0, nowMs - activeSeason.startObj.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
  const daysPassed = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const totalDays = Math.round(totalDurationMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  return (
    <div id="seasons-year-card" className="custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Calendar size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-widest">
                ASTRONOMIA & CLIMATOLOGIA 2026
              </span>
              <span className="bg-sky-500/20 text-black text-[8px] font-mono px-2 py-0.5 rounded-full border border-sky-500/30 font-black">
                ANO VIGENTE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
              Estações do Ano Atual ({currentDate.getFullYear()})
            </h3>
          </div>
        </div>

        {/* Hemisphere Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300 dark:border-white/15 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setHemisphere('south')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-black tracking-wider ${
              hemisphere === 'south'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-extrabold'
            }`}
          >
            <Compass size={12} />
            <span>Hemisfério Sul (Brasil)</span>
          </button>
          <button
            type="button"
            onClick={() => setHemisphere('north')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-black tracking-wider ${
              hemisphere === 'north'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-extrabold'
            }`}
          >
            <Compass size={12} />
            <span>Hemisfério Norte</span>
          </button>
        </div>
      </div>

      {/* Active Season Highlight Banner */}
      <div className={`p-4 rounded-2xl border bg-gradient-to-r ${activeSeason.bgGradient} ${activeSeason.borderColor} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl bg-white/90 dark:bg-slate-950/90 shadow-md border border-white/20`}>
            <activeSeason.icon size={26} color="black" className="text-black animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                ESTAÇÃO ATUAL VIGENTE
              </span>
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 font-mono">
                {activeSeason.startDate} até {activeSeason.endDate}
              </span>
            </div>
            <h4 className={`text-xl font-black uppercase tracking-wider ${activeSeason.textColor} mt-1`}>
              {activeSeason.name} {currentDate.getFullYear()}
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-100 font-bold mt-0.5 leading-snug">
              {activeSeason.desc}
            </p>
          </div>
        </div>

        {/* Progress in Active Season */}
        <div className="bg-white/95 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-white/15 flex flex-col gap-2 min-w-[220px]">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-black">
              <Clock size={12} className="text-sky-500" /> Progresso da Estação
            </span>
            <span className="text-sky-700 dark:text-sky-300 font-mono font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-white/10">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-700 dark:text-slate-200 font-black">
            <span>Dia {daysPassed} de {totalDays}</span>
            <span className="text-black font-mono font-black">{daysRemaining} dias restantes</span>
          </div>
        </div>
      </div>

      {/* Grid of All 4 Seasons for 2026 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {currentSeasonsList.map((season) => {
          const Icon = season.icon;
          const isCurrent = season.id === activeSeason.id;

          return (
            <div
              key={season.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden ${
                isCurrent
                  ? `bg-slate-900/95 ${season.borderColor} ring-2 ring-sky-500/50 shadow-xl scale-[1.01]`
                  : 'bg-slate-950/90 border-white/15 hover:border-white/30'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-2.5 right-2.5 bg-emerald-500/20 text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/50 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={11} color="black" className="text-black" /> <span className="text-black">ATIVA</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 rounded-xl bg-slate-800/90 border border-white/10`}>
                    <Icon size={20} color="black" className="text-black" />
                  </div>
                  <div>
                    <h5 className={`text-base font-black uppercase tracking-wider ${season.textColor}`}>
                      {season.name}
                    </h5>
                    <span className="text-[10px] font-mono font-black text-slate-200 block mt-0.5">
                      {season.startDate} - {season.endDate}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-100 font-bold leading-relaxed mt-2.5">
                  {season.desc}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[10px] font-black text-slate-200">
                <Info size={12} className="text-sky-400 shrink-0" />
                <span className="leading-tight">{season.astronomicalEvent}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
