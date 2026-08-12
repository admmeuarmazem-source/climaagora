import React from 'react';
import { Sun } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

interface SolarGenerationCardProps {
  weather: any;
  currentCity: string;
  showSolarDetails: boolean;
  setShowSolarDetails: (val: boolean) => void;
  getSolarChartData: () => any[];
}

export const SolarGenerationCard: React.FC<SolarGenerationCardProps> = ({
  weather,
  currentCity,
  showSolarDetails,
  setShowSolarDetails,
  getSolarChartData
}) => {
  return (
    <div id="solar-generation-card" className="card custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 p-5 rounded-3xl shadow-2xl transition duration-300 flex flex-col gap-5 relative overflow-hidden w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="text-amber-500 animate-spin-slow" size={20} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Geração Solar Fotovoltaica & Radiação
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-100 font-extrabold tracking-wide">
              Irradiação solar incidente (W/m²) e projeção fotovoltaica para {weather?.city || currentCity}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSolarDetails(!showSolarDetails)}
          className="text-xs font-black text-black hover:underline bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider cursor-pointer"
          style={{ color: 'black' }}
        >
          <span className="text-black">{showSolarDetails ? 'Recolher' : 'Expandir'}</span>
        </button>
      </div>

      {showSolarDetails && (
        <div className="flex flex-col gap-4">
          <div className="h-[200px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getSolarChartData()} margin={{ top: 10, right: 15, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="day" stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 700 }} dy={5} />
                <YAxis stroke="var(--chart-axis)" tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 700 }} width={35} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} 
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                />
                <RechartsLegend wrapperStyle={{ fontSize: '10px', color: 'var(--chart-legend)' }} />
                <Line type="monotone" dataKey="Radiação Solar Realizada" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Radiação Solar Projetada" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-100 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-300 dark:border-white/15">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase block">Radiação Máxima</span>
              <span className="text-xs font-black text-black font-mono mt-0.5 block">820 W/m²</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-300 dark:border-white/15">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase block">Eficiência</span>
              <span className="text-xs font-black text-black font-mono mt-0.5 block">94.8%</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-300 dark:border-white/15">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase block">Geração Estimada</span>
              <span className="text-xs font-black text-black font-mono mt-0.5 block">28.4 kWh</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-300 dark:border-white/15">
              <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase block">Perda Térmica</span>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300 font-mono mt-0.5 block">-2.1%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarGenerationCard;
