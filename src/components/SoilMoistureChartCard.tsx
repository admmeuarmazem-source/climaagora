import React from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ReferenceLine
} from 'recharts';
import { getSoilMoistureHistory } from '../App';

interface SoilMoistureChartCardProps {
  currentCity: string;
}

export const SoilMoistureChartCard: React.FC<SoilMoistureChartCardProps> = React.memo(({ currentCity }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const soilMoistureData = getSoilMoistureHistory(currentCity);
  const moistureValues = soilMoistureData.map(d => d.moisture);
  const avgMoisture = Math.round(moistureValues.reduce((sum, val) => sum + val, 0) / moistureValues.length);
  const minMoisture = Math.min(...moistureValues);
  const maxMoisture = Math.max(...moistureValues);

  let statusText = "Equilibrada";
  let statusColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (avgMoisture < 30) {
    statusText = "Déficit Hídrico Crítico";
    statusColor = "text-red-400 border-red-500/20 bg-red-500/10 animate-pulse";
  } else if (avgMoisture < 45) {
    statusText = "Atenção (Solo Seco)";
    statusColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
  } else if (avgMoisture > 80) {
    statusText = "Saturação (Risco de Anoxia)";
    statusColor = "text-blue-400 border-blue-500/20 bg-blue-500/10";
  }

  return (
    <div className="bg-white/90 dark:bg-slate-950/90 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl text-slate-900 dark:text-white flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/25">
            <Activity size={22} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Monitoramento de Umidade do Solo (Últimos 30 Dias)
            </h4>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold tracking-wide uppercase mt-0.5">
              Histórico de balanço hídrico radicular e capacidade hídrica do solo para {currentCity}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border text-black dark:text-black ${statusColor}`}>
            Solo: {statusText}
          </span>
          <span className="bg-sky-500/20 text-black dark:text-black text-[8px] font-black uppercase px-2.5 py-1 rounded-full border border-sky-500/40">
            Sensores IoT Ativos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={soilMoistureData} margin={{ top: 10, right: 15, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="colorSoilMoistureCard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="day" stroke="var(--chart-axis)" fontSize={10} tickLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }} dy={5} />
              <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }} width={35} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}
                labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                itemStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}
              />
              <RechartsLegend wrapperStyle={{ fontSize: '10px', marginTop: '10px', color: 'var(--chart-legend)' }} />
              
              <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Capac. Campo (75%)', fill: '#3b82f6', fontSize: 8, position: 'top' }} />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Ponto Murcha (20%)', fill: '#ef4444', fontSize: 8, position: 'top' }} />

              <Area 
                type="monotone" 
                name="Umidade Real do Solo (%)" 
                dataKey="moisture" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorSoilMoistureCard)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between gap-4">
          <div>
            <span className="text-[8px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
              Resumo Hidrológico do Solo
            </span>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                <span className="text-[8px] text-slate-700 dark:text-slate-400 uppercase block font-black">Umidade Média</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{avgMoisture}%</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  <span className="text-[8px] text-slate-700 dark:text-slate-400 uppercase block font-black">Min (Estresse)</span>
                  <span className="text-xs font-black text-red-600 dark:text-red-400">{minMoisture}%</span>
                </div>
                <div className="bg-white dark:bg-slate-950/40 p-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  <span className="text-[8px] text-slate-700 dark:text-slate-400 uppercase block font-black">Max (Saturação)</span>
                  <span className="text-xs font-black text-sky-600 dark:text-sky-400">{maxMoisture}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/10 text-[9px] leading-relaxed text-slate-800 dark:text-slate-300">
            <span className="text-emerald-700 dark:text-emerald-400 font-black block mb-0.5">🌱 ANÁLISE AGRO-BIOLÓGICA</span>
            <p className={!isExpanded ? 'line-clamp-2' : ''}>
              {avgMoisture < 35 ? (
                <span>O solo encontra-se próximo ao <strong className="text-red-600 dark:text-red-400">Ponto de Murcha Permanente</strong>. Risco severo de estresse hídrico vegetal irreversível. Recomenda-se irrigação de emergência de 15mm.</span>
              ) : avgMoisture > 70 ? (
                <span>Solo com umidade ideal próxima à <strong className="text-sky-600 dark:text-sky-400">Capacidade de Campo</strong>. Atividade microbiana maximizada e excelente absorção de nutrientes. Manejo hídrico em modo conservação.</span>
              ) : (
                <span>Equilíbrio hídrico estável. A umidade atende perfeitamente à transpiração vegetal sem causar estresse radicular. Mantenha os ciclos de gotejamento programados.</span>
              )}
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? (
                <><span>Toque para recolher</span> <ChevronUp size={11} /></>
              ) : (
                <><span>Toque para expandir</span> <ChevronDown size={11} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
