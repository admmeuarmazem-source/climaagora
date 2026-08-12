import React from 'react';
import { Ship } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface TideTableCardProps {
  weather: any;
  currentCity: string;
  activeCoords: { lat: number; lon: number };
  tideRange: string;
  setTideRange: (val: any) => void;
  tideStartDate: string;
  setTideStartDate: (val: string) => void;
  tideEndDate: string;
  setTideEndDate: (val: string) => void;
  isMarineLoading: boolean;
  realMarineData: any;
  getTideEvents: () => any[];
}

export const TideTableCard: React.FC<TideTableCardProps> = ({
  weather,
  currentCity,
  activeCoords,
  tideRange,
  setTideRange,
  tideStartDate,
  setTideStartDate,
  tideEndDate,
  setTideEndDate,
  isMarineLoading,
  realMarineData,
  getTideEvents
}) => {
  const displayCityTideTitle = `Tábua de Maré Astronômica — ${weather?.city || currentCity}`;
  const displayCityTideSubtitle = `Litoral & Zonas Marítimas Próximas de ${weather?.city || currentCity}`;
  const nearestPort = 'Porto de Salvador / Aratu (Bahia)';

  return (
    <div id="tide-table-card" className="custom-dynamic-card bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 p-5 md:p-6 rounded-3xl shadow-2xl transition duration-300 flex flex-col gap-5 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Ship className="text-cyan-600 dark:text-cyan-400 animate-pulse" size={20} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {displayCityTideTitle}
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-100 font-extrabold tracking-wide">
              {displayCityTideSubtitle}
            </p>
          </div>
        </div>

        {/* Selector for Tide Ranges */}
        <div className="flex flex-wrap items-center gap-1 text-[9px]">
          {[
            { value: 'current', label: 'Atual' },
            { value: '24h', label: '24h' },
            { value: '48h', label: '48h' },
            { value: '3d', label: '3 Dias' },
            { value: '7d', label: '7 Dias' },
            { value: '14d', label: '14 Dias' },
            { value: '30d', label: '30 Dias' },
            { value: 'custom', label: 'Personalizar' }
          ].map((opt) => (
            <button
              key={opt.value}
              id={`tide-range-${opt.value}`}
              onClick={() => setTideRange(opt.value as any)}
              className={`px-2 py-1 rounded-xl transition font-black uppercase text-[9px] tracking-wider cursor-pointer ${
                tideRange === opt.value
                  ? 'bg-cyan-600 text-white shadow-md border border-cyan-500 ring-2 ring-cyan-400'
                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold border border-slate-300 dark:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker Dropdown if 'custom' is active for Tide */}
      {tideRange === 'custom' && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 text-slate-900">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-cyan-700 uppercase tracking-widest">Período da Maré:</label>
            <span className="text-[10px] text-slate-600 leading-none">Início e fim do rastreamento marítimo</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-700 font-extrabold uppercase">Início:</span>
              <input 
                type="date" 
                value={tideStartDate} 
                min="2026-07-02"
                max="2026-08-15"
                onChange={(e) => setTideStartDate(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-700 font-extrabold uppercase">Fim:</span>
              <input 
                type="date" 
                value={tideEndDate} 
                min="2026-07-02"
                max="2026-08-15"
                onChange={(e) => setTideEndDate(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tide Wave Graphic (Interactive 24h Recharts time series) calculating M2 + S2 Harmonic Tides */}
      <div className="card custom-dynamic-card bg-white/10 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col gap-4 relative text-slate-900 dark:text-white" style={{ contain: 'layout style' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-black text-cyan-800 dark:text-cyan-400 uppercase tracking-widest block">
              Série Temporal de Flutuação do Nível do Mar & Ondas (24h)
            </span>
            <p className="text-[9px] text-slate-700 dark:text-slate-300 font-bold">
              Cálculo Harmônico M2 (Lunar 12.42h) + S2 (Solar 12.00h) Superposto a Telemetria Marítima ClimaAgora
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {isMarineLoading && (
              <span className="text-[8.5px] font-bold text-cyan-800 dark:text-cyan-300 animate-pulse bg-cyan-100/80 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-700">
                Atualizando API Marítima...
              </span>
            )}
            <span className="text-[8.5px] font-black text-black dark:text-black uppercase bg-cyan-200 border border-cyan-400 px-2.5 py-1 rounded-full shadow-sm">
              Telemetria Marítima • M2+S2
            </span>
          </div>
        </div>

        {/* Real-Time Ocean Metrics Banner from Open-Meteo Marine API */}
        {realMarineData?.current && (
          <div className="mini-card grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-2.5 rounded-xl border border-cyan-300/40 dark:border-cyan-500/30 text-[10px]">
            <div className="flex flex-col">
              <span className="text-[8.5px] text-black dark:text-black uppercase font-black">Ondas</span>
              <span className="text-black dark:text-black font-black text-xs">{realMarineData.current.wave_height ?? '1.2'} m</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8.5px] text-black dark:text-black uppercase font-black">Período Vaga</span>
              <span className="text-black dark:text-black font-black text-xs">{realMarineData.current.wave_period ?? '7.5'} s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8.5px] text-black dark:text-black uppercase font-black">Corrente</span>
              <span className="text-black dark:text-black font-black text-xs">{realMarineData.current.ocean_current_velocity ?? '0.8'} km/h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8.5px] text-black dark:text-black uppercase font-black">Direção</span>
              <span className="text-black dark:text-black font-black text-xs">{realMarineData.current.ocean_current_direction ?? '120'}°</span>
            </div>
          </div>
        )}
        
        {/* Recharts 24h M2+S2 Harmonic Tide Series Chart */}
        {(() => {
          const latFixed = activeCoords?.lat ?? -11.7831;
          const lonFixed = activeCoords?.lon ?? -38.3533;
          const longitudeOffsetHours = (lonFixed / 15.0);
          
          const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
          const synodicMonthMs = 29.530588 * 24 * 60 * 60 * 1000;
          const now = new Date();
          const dayStartMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
          const lunarAgeDays = ((dayStartMs - refNewMoon) % synodicMonthMs) / (24 * 60 * 60 * 1000);
          const moonPhaseAngle = (lunarAgeDays / 29.530588) * 2 * Math.PI;
          
          const springModulation = Math.abs(Math.cos(moonPhaseAngle));
          const m2Amplitude = 0.9 + 0.3 * springModulation;
          const s2Amplitude = 0.35 + 0.15 * springModulation;
          const meanWaterLevel = 1.2 + Math.sin((latFixed * Math.PI) / 180) * 0.1;

          const hourlyWaveHeights = realMarineData?.hourly?.wave_height || [];

          const chartData24h = Array.from({ length: 24 }).map((_, hour) => {
            const timeInHours = hour - longitudeOffsetHours;
            const m2Val = m2Amplitude * Math.cos((2 * Math.PI * (timeInHours - lunarAgeDays * 0.84)) / 12.4206);
            const s2Val = s2Amplitude * Math.cos((2 * Math.PI * timeInHours) / 12.0);
            const realWaveContrib = (hourlyWaveHeights[hour] ?? realMarineData?.current?.wave_height ?? 0) * 0.10;
            const totalLevel = Math.max(0.05, meanWaterLevel + m2Val + s2Val + realWaveContrib);
            return {
              horaNum: hour,
              hora: `${String(hour).padStart(2, '0')}:00`,
              Nível: parseFloat(totalLevel.toFixed(2)),
              M2: parseFloat(m2Val.toFixed(2)),
              S2: parseFloat(s2Val.toFixed(2)),
              OndaReal: parseFloat((hourlyWaveHeights[hour] ?? realMarineData?.current?.wave_height ?? 1.2).toFixed(1)),
              isHighPeak: false,
              isLowPeak: false,
              peakType: null as 'Alta' | 'Baixa' | null,
              peakHeight: ''
            };
          });

          for (let h = 0; h < 24; h++) {
            const prev = chartData24h[(h - 1 + 24) % 24].Nível;
            const curr = chartData24h[h].Nível;
            const next = chartData24h[(h + 1) % 24].Nível;

            if (curr >= prev && curr >= next) {
              chartData24h[h].isHighPeak = true;
              chartData24h[h].peakType = 'Alta';
              chartData24h[h].peakHeight = `${curr.toFixed(1)}m`;
            } else if (curr <= prev && curr <= next) {
              chartData24h[h].isLowPeak = true;
              chartData24h[h].peakType = 'Baixa';
              chartData24h[h].peakHeight = `${curr.toFixed(1)}m`;
            }
          }

          const highPeaks = chartData24h.filter(d => d.isHighPeak);
          const lowPeaks = chartData24h.filter(d => d.isLowPeak);

          return (
            <div className="flex flex-col gap-3">
              <div className="h-52 w-full relative min-h-[200px]" style={{ contain: 'strict' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData24h} margin={{ top: 18, right: 15, left: 10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="tideAreaGradM2S2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} />
                    <XAxis 
                      dataKey="hora" 
                      stroke="var(--chart-axis)" 
                      tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }}
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => {
                        const hr = parseInt(val.split(':')[0]);
                        return hr % 3 === 0 ? val : '';
                      }}
                    />
                    <YAxis 
                      stroke="var(--chart-axis)" 
                      tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 800 }}
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 3.5]} 
                      tickFormatter={(val) => `${val}m`}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const levelVal = data.Nível;
                          const m2 = data.M2;
                          const s2 = data.S2;
                          const onda = data.OndaReal;
                          const peak = data.peakType;

                          return (
                            <div className="bg-slate-900 border border-cyan-500/30 p-2.5 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
                              <div className="flex justify-between gap-4 font-black text-cyan-400 border-b border-white/10 pb-1">
                                <span>Horário: {label}</span>
                                {peak && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${peak === 'Alta' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-purple-500/30 text-purple-300'}`}>
                                    Maré {peak} ({levelVal}m)
                                  </span>
                                )}
                              </div>
                              <div className="text-white font-extrabold flex justify-between gap-4">
                                <span className="text-slate-400">Nível Total de Água (Elevação):</span>
                                <span className="text-cyan-300">{levelVal} m</span>
                              </div>
                              <div className="text-[10px] text-slate-300 flex justify-between gap-2 pt-0.5 border-t border-white/5">
                                <span>Swell/Ondas ClimaAgora: {onda}m</span>
                                <span>Lunar M2: {m2 >= 0 ? `+${m2}` : m2}m</span>
                                <span>Solar S2: {s2 >= 0 ? `+${s2}` : s2}m</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Nível" 
                      stroke="#22d3ee" 
                      strokeWidth={3} 
                      fill="url(#tideAreaGradM2S2)"
                      isAnimationActive={false}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isHighPeak) {
                          return (
                            <g key={`high-${payload.hora}`}>
                              <circle cx={cx} cy={cy} r={5} fill="#06b6d4" stroke="#0f172a" strokeWidth={2} />
                              <text x={cx} y={cy - 10} fill="#22d3ee" fontSize={9} fontWeight="900" textAnchor="middle">
                                Alta {payload.Nível}m
                              </text>
                            </g>
                          );
                        }
                        if (payload.isLowPeak) {
                          return (
                            <g key={`low-${payload.hora}`}>
                              <circle cx={cx} cy={cy} r={5} fill="#a855f7" stroke="#0f172a" strokeWidth={2} />
                              <text x={cx} y={cy + 16} fill="#c084fc" fontSize={9} fontWeight="900" textAnchor="middle">
                                Baixa {payload.Nível}m
                              </text>
                            </g>
                          );
                        }
                        return null;
                      }}
                      activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary badges for High & Low tide peaks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="mini-card bg-cyan-50/10 dark:bg-cyan-950/30 backdrop-blur-md border border-cyan-300/40 dark:border-cyan-500/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse shadow-sm shadow-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-black">Picos de Maré Alta</span>
                  </div>
                  <div className="flex gap-1.5">
                    {highPeaks.slice(0, 2).map((p, idx) => (
                      <span key={idx} className="bg-cyan-200 text-black dark:text-black text-[9.5px] font-black px-2 py-0.5 rounded border border-cyan-400">
                        {p.hora} • {p.Nível}m
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mini-card bg-purple-50/10 dark:bg-purple-950/30 backdrop-blur-md border border-purple-300/40 dark:border-purple-500/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shadow-sm shadow-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-black">Picos de Maré Baixa</span>
                  </div>
                  <div className="flex gap-1.5">
                    {lowPeaks.slice(0, 2).map((p, idx) => (
                      <span key={idx} className="bg-purple-200 text-black dark:text-black text-[9.5px] font-black px-2 py-0.5 rounded border border-purple-400">
                        {p.hora} • {p.Nível}m
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Moon phase influence and maritime notification */}
        <div className="mini-card flex flex-col md:flex-row items-center justify-between gap-3 bg-white/10 dark:bg-slate-950/40 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-100 font-bold">
          <div className="flex items-center gap-2">
            <span className="bg-sky-300 text-black dark:text-black font-black px-2 py-0.5 rounded uppercase">Influência Lunar</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-200">Lua Quase Cheia • Maré de Sizígia</span>
          </div>
          <div className="text-right text-slate-800 dark:text-slate-300">
            Porto: <span className="text-slate-950 dark:text-white font-black">{nearestPort}</span>
          </div>
        </div>
      </div>

      {/* Horizontal flow schedule with tide cycles for selected range */}
      <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {getTideEvents().map((dayData, index) => (
          <div key={index} className="card custom-dynamic-card bg-white/10 dark:bg-slate-950/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 shrink-0">
              <div className="mini-card bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-center min-w-[50px]">
                <span className="text-[9px] text-black dark:text-black block font-black uppercase">{dayData.day.slice(0, 3)}</span>
                <span className="text-xs font-black text-black dark:text-black block mt-0.5">{dayData.date}</span>
              </div>
            </div>

            {/* Display the 4 tidal peaks of the day in a grid */}
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              {dayData.peaks.map((peak: any, pIdx: number) => (
                <div 
                  key={pIdx} 
                  className={`mini-card p-1.5 rounded-xl text-center border backdrop-blur-md transition flex flex-col justify-center ${peak.type === 'Alta' ? 'bg-cyan-100/80 dark:bg-cyan-900/50 border-cyan-300 dark:border-cyan-700' : 'bg-purple-100/80 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700'}`}
                >
                  <span className="text-[8px] font-black uppercase text-black dark:text-black">
                    {peak.type === 'Alta' ? '▲ Alta' : '▼ Baixa'}
                  </span>
                  <span className="text-xs font-black text-black dark:text-black mt-0.5">{peak.height}m</span>
                  <span className="text-[8.5px] text-black dark:text-black font-extrabold mt-0.5">{peak.time}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TideTableCard;
