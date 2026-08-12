import React, { useState } from 'react';
import { Flame, AlertTriangle, ShieldAlert, Radio, RefreshCw, MapPin, Eye } from 'lucide-react';

interface WildfireProps {
  cityName: string;
}

export const NASAWildfireRadar: React.FC<WildfireProps> = ({ cityName }) => {
  const [selectedSatellite, setSelectedSatellite] = useState<'ALL' | 'MODIS' | 'VIIRS'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Thermal hotspot detection data
  const hotspots = [
    { id: 'F1', satellite: 'Sensor Térmico A', lat: -12.48, lon: -55.62, brightnessK: 342.1, confidence: 'Alta (94%)', passTime: 'Há 42 min', frp: '14.2 MW', risk: 'Crítico' },
    { id: 'F2', satellite: 'Sensor Térmico B', lat: -12.61, lon: -55.80, brightnessK: 328.5, confidence: 'Média (78%)', passTime: 'Há 1h 15m', frp: '8.6 MW', risk: 'Alto' },
    { id: 'F3', satellite: 'Sensor Térmico C', lat: -12.35, lon: -55.45, brightnessK: 318.0, confidence: 'Alta (89%)', passTime: 'Há 2h 05m', frp: '4.1 MW', risk: 'Moderado' }
  ];

  const filteredHotspots = selectedSatellite === 'ALL'
    ? hotspots
    : hotspots.filter(h => h.satellite.includes(selectedSatellite));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-white">
      {/* Background Red/Orange Thermal Glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-rose-400 tracking-wider">Radar de Queimadas e Mapeamento Térmico</span>
              <span className="bg-rose-500/20 text-rose-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-rose-500/30 font-bold">DETECÇÃO TÉRMICA REMOTA</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">
              Focos de Incêndio e Riscos de Fogo em {cityName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSatellite}
            onChange={(e) => setSelectedSatellite(e.target.value as any)}
            className="bg-slate-950 border border-white/15 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">Todos os Sensores Térmicos</option>
            <option value="VIIRS">Sensores de Alta Precisão</option>
            <option value="MODIS">Sensores de Mapeamento Espectral</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Atualizar focos térmicos"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-rose-400' : ''} />
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-4 bg-slate-950 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nível de Risco de Fogo</span>
            <div className="text-3xl font-black text-rose-400 mt-1 uppercase flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={24} /> ALTO / CRÍTICO
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-3 leading-relaxed">
            A baixa umidade relativa do ar aliada ao vento seco favorece a propagação rápida de focos de queimada na vegetação regional.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Focos no Raio de 50km:</span>
            <strong className="text-rose-400 font-black">{hotspots.length} Focos Ativos</strong>
          </div>
        </div>

        {/* Hotspots List */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-white/10 rounded-2xl p-4">
          <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Flame size={14} className="text-rose-400" /> Focos Térmicos Detectados</span>
            <span className="text-[10px] font-mono text-slate-400">Fonte: Mapeamento de Focos Térmicos</span>
          </h4>

          <div className="space-y-2.5">
            {filteredHotspots.map((h) => (
              <div key={h.id} className="bg-slate-900/90 border border-white/5 hover:border-rose-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{h.satellite}</span>
                      <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-mono font-bold uppercase">{h.risk}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Lat: {h.lat}°, Lon: {h.lon}° • Passagem: {h.passTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right self-end sm:self-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Temp. Brilho</span>
                    <strong className="text-xs font-black text-amber-300">{h.brightnessK} K ({Math.round(h.brightnessK - 273.15)}°C)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Potência FRP</span>
                    <strong className="text-xs font-black text-rose-400">{h.frp}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NASAWildfireRadar;
