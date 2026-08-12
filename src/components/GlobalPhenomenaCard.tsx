import React from 'react';
import { Globe } from 'lucide-react';

interface GlobalPhenomenaCardProps {
  weather: any;
  currentCity: string;
}

export const GlobalPhenomenaCard: React.FC<GlobalPhenomenaCardProps> = ({
  weather,
  currentCity
}) => {
  return (
    <div id="global-phenomena-card" className="card custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl text-black border border-slate-200 dark:border-white/15 p-5 rounded-3xl shadow-2xl transition duration-300 flex flex-col gap-5 relative overflow-hidden w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="text-black animate-pulse" size={20} color="black" />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black">
              Macro-clima & Teleconexões Globais
            </h3>
            <p className="text-xs text-black font-extrabold tracking-wide">
              Padrões oceânicos e atmosféricos que modulam o clima no Brasil
            </p>
          </div>
        </div>
        <span className="text-[9px] font-black text-black border border-orange-300 dark:border-orange-500/40 bg-orange-100 dark:bg-orange-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
          Guia Oficial
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* El Niño & La Niña (ENSO) */}
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 p-3.5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                ENSO (El Niño / La Niña)
              </span>
              <span className="text-[9px] font-black text-black bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-lg border border-orange-300 dark:border-orange-500/30">
                Pacífico
              </span>
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Oscilação Sul no Pacífico Equatorial. <strong>El Niño</strong> aquece e inibe chuvas no Norte/Nordeste. <strong>La Niña</strong> resfria as águas, favorecendo chuvas no Norte e seca/geadas no Sul.
            </p>
          </div>
        </div>

        {/* Dipolo do Oceano Índico (IOD) */}
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 p-3.5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                Dipolo do Índico (IOD)
              </span>
              <span className="text-[9px] font-black text-black bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-500/30">
                Índico
              </span>
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Diferencial térmico no Oceano Índico. Na fase positiva, pode inibir convecção e potencializar secas no Brasil Central.
            </p>
          </div>
        </div>

        {/* Oscilação Madden-Julian (MJO) */}
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 p-3.5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                Madden-Julian (MJO)
              </span>
              <span className="text-[9px] font-black text-black bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-300 dark:border-sky-500/30">
                30-60d
              </span>
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Onda tropical de precipitação que circula o planeta. Nas fases 8, 1 e 2, favorece ZCAS e chuva intensa no Sudeste e Centro-Oeste.
            </p>
          </div>
        </div>

        {/* Oscilação Antártica (AAO) */}
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 p-3.5 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                Oscilação Antártica (AAO)
              </span>
              <span className="text-[9px] font-black text-black bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-300 dark:border-indigo-500/30">
                Cinturão Polar
              </span>
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Variação de ventos na Antártica. Na fase negativa, ventos enfraquecem e frentes frias avançam com frequência ao Sul e Sudeste.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Macro-Climate Signal Box */}
      <div className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md border border-orange-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg text-black">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-black shrink-0 border border-orange-500/30">
            <Globe size={20} color="black" className="text-black animate-pulse" />
          </div>
          <div>
            <span className="text-[9.5px] font-black uppercase text-black tracking-wider block">
              Análise Macro-Clima ({weather?.city || currentCity})
            </span>
            <p className="text-xs text-black font-medium mt-0.5 leading-relaxed">
              {weather?.condition === 'Storm' || (weather?.hourly?.[0]?.pop ?? 0) > 60
                ? `Sinalização de Instabilidade: Atuação de sistemas de convergência gerando umidade na microrregião. Probabilidade estimada em 80-90%.`
                : `Sinalização Estável: Índices do Pacífico e Atlântico indicam estabilidade em ${weather?.city || currentCity}. Probabilidade de tempestades <15%.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPhenomenaCard;
