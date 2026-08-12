import React from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceArea
} from 'recharts';
import { computeMonthlyAgroBalances, computeDroughtDiagnostic } from '../App';

interface WaterDeficitChartCardProps {
  currentCity: string;
  activeCoords?: { lat: number; lon: number } | null;
  manualLat?: string;
  manualLon?: string;
}

export const WaterDeficitChartCard: React.FC<WaterDeficitChartCardProps> = React.memo(({
  currentCity,
  activeCoords,
  manualLat,
  manualLon
}) => {
  const parsedLat = parseFloat(manualLat || '');
  const parsedLon = parseFloat(manualLon || '');
  const currentCoords = (!isNaN(parsedLat) && !isNaN(parsedLon))
    ? { lat: parsedLat, lon: parsedLon }
    : (activeCoords || { lat: -11.7831, lon: -38.3533 });

  const [isExpanded, setIsExpanded] = React.useState(false);
  const monthlyData = computeMonthlyAgroBalances(currentCoords.lat, currentCoords.lon, currentCity);
  const diagnostic = computeDroughtDiagnostic(monthlyData);

  const droughtWindows: { start: string; end: string }[] = [];
  let tempWindow: string[] = [];

  monthlyData.forEach(d => {
    if (d.evap > d.chuva) {
      tempWindow.push(d.month);
    } else {
      if (tempWindow.length > 0) {
        droughtWindows.push({
          start: tempWindow[0],
          end: tempWindow[tempWindow.length - 1]
        });
        tempWindow = [];
      }
    }
  });
  if (tempWindow.length > 0) {
    droughtWindows.push({
      start: tempWindow[0],
      end: tempWindow[tempWindow.length - 1]
    });
  }

  return (
    <div className="bg-white/95 dark:bg-slate-950/90 p-6 rounded-3xl border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-2xl text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-slate-900 dark:text-white">
            <TrendingUp size={14} className="text-sky-500 dark:text-sky-400" />
            <span>Índice Comparativo: Precipitação Mensal vs Evapotranspiração</span>
          </h4>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase mt-1">
            Projeção hídrica acumulada e identificação de janelas de risco de seca severa
          </p>
        </div>
        <div className={`border px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${diagnostic.hasRisk ? 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30 dark:border-red-500/40 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'}`}>
          <span className={`w-2 h-2 rounded-full ${diagnostic.hasRisk ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span>{diagnostic.hasRisk ? `Risco de Seca: ${diagnostic.monthsRange}` : 'Balanço Hídrico Seguro'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 h-[250px] w-full text-[10px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCity}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={monthlyData} 
                  margin={{ top: 10, right: 15, left: 10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="chuvaGradDeficit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="evapGradDeficit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" stroke="var(--chart-axis)" tickLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }} dy={5} />
                  <YAxis stroke="var(--chart-axis)" tickLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }} unit="mm" width={35} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                  />
                  
                  {droughtWindows.map((win, idx) => (
                    <g key={idx}>
                      <ReferenceArea 
                        x1={win.start} 
                        x2={win.end} 
                        {...{
                          fill: '#ef4444',
                          fillOpacity: 0.1,
                          stroke: 'rgba(239, 68, 68, 0.3)',
                          strokeDasharray: '3 3'
                        } as any}
                      />
                    </g>
                  ))}

                  <Area 
                    type="monotone" 
                    name="Precipitação (mm)"
                    dataKey="chuva" 
                    stroke="#38bdf8" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#chuvaGradDeficit)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Evapotranspiração (mm)"
                    dataKey="evap" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#evapGradDeficit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-100/90 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">Diagnóstico de Déficit Hídrico</span>
            <div>
              <p className={`text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold text-justify ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {diagnostic.text}
              </p>
              {diagnostic.text.length > 80 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  {isExpanded ? (
                    <><span>Toque para recolher</span> <ChevronUp size={12} /></>
                  ) : (
                    <><span>Toque para expandir</span> <ChevronDown size={12} /></>
                  )}
                </button>
              )}
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] bg-slate-200/50 dark:bg-white/5 p-2 rounded-lg">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Janela de Risco:</span>
                <span className={`font-extrabold font-mono ${diagnostic.hasRisk ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {diagnostic.monthsRange}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] bg-slate-200/50 dark:bg-white/5 p-2 rounded-lg">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Recomendação Agronômica:</span>
                <span className={`font-extrabold ${diagnostic.hasRisk ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {diagnostic.hasRisk ? 'Irrigação Suplementar' : 'Balanço Saudável'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
