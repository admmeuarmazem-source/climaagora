import React, { useState } from 'react';
import { Zap, Bell, ShieldAlert, Radio, AlertTriangle, CheckCircle, Volume2, Compass } from 'lucide-react';

interface LightningProps {
  cityName: string;
}

export const LightningAlertPanel: React.FC<LightningProps> = ({ cityName }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundAlert, setSoundAlert] = useState(true);
  const [distanceRadius, setDistanceRadius] = useState<5 | 10 | 20>(10);
  const [simulatingStrike, setSimulatingStrike] = useState(false);

  // Simulated live lightning strike log near location
  const strikes = [
    { id: '1', distance: 3.8, peakCurrent: '-32 kA', time: 'Há 2 min', direction: 'Noroeste (NW)', dangerLevel: 'CRÍTICO (< 5km)' },
    { id: '2', distance: 6.2, peakCurrent: '+45 kA', time: 'Há 5 min', direction: 'Norte (N)', dangerLevel: 'ALERTA (< 10km)' },
    { id: '3', distance: 8.9, peakCurrent: '-18 kA', time: 'Há 12 min', direction: 'Nordeste (NE)', dangerLevel: 'ALERTA (< 10km)' },
    { id: '4', distance: 14.1, peakCurrent: '-22 kA', time: 'Há 18 min', direction: 'Oeste (W)', dangerLevel: 'MODERADO' }
  ];

  const closestStrike = strikes[0];

  const triggerStrikeSimulation = () => {
    setSimulatingStrike(true);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚡ ALERTA DE RAIO PRÓXIMO!', {
        body: `Raio detectado a 3.8 km de distância em ${cityName}! Busque abrigo em local fechado.`,
        icon: '/icon.png'
      });
    }
    setTimeout(() => setSimulatingStrike(false), 2000);
  };

  const requestPushPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          setPushEnabled(true);
        }
      });
    } else {
      setPushEnabled(!pushEnabled);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-white">
      {/* Background Amber/Yellow Glow */}
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider">Detector de Raios em Tempo Real & Push Alerta</span>
              <span className="bg-amber-500/20 text-amber-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">REDE ELETRONET AO VIVO</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">
              Monitor de Raios e Proximidade em {cityName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerStrikeSimulation}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Radio size={14} className={simulatingStrike ? 'animate-ping' : ''} />
            <span>{simulatingStrike ? 'Simulando Alerta...' : 'Testar Alerta Push'}</span>
          </button>
        </div>
      </div>

      {/* Alert Threshold Settings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Left Status Alert */}
        <div className="lg:col-span-6 bg-slate-950 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              MÚSICA DA TEMPESTADE
            </span>
            <span className="text-xs text-red-400 font-extrabold flex items-center gap-1">
              <ShieldAlert size={14} /> Raio mais próximo: {closestStrike.distance} km
            </span>
          </div>

          <div>
            <h4 className="text-xl font-black text-white leading-tight flex items-center gap-2">
              <Zap className="text-amber-400 fill-amber-400" size={20} />
              Última Descarga Elétrica Detectada
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Detectada na direção <strong className="text-amber-300">{closestStrike.direction}</strong> com pico de intensidade <strong className="text-white">{closestStrike.peakCurrent}</strong>.
            </p>
          </div>

          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 mt-4 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-black uppercase text-[10px] tracking-wider">Regra de Segurança 30/30</strong>
              <p className="text-[11px] leading-relaxed">
                Raios a menos de 5 km apresentam risco grave de atingir o solo próximo. Evite campos abertos, piscinas e árvores isoladas.
              </p>
            </div>
          </div>
        </div>

        {/* Right Settings Controls */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Bell size={15} className="text-amber-400" /> Configuração dos Alertas Push do Navegador
          </h4>

          {/* Toggle Push */}
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">Notificações Push Instantâneas</span>
              <span className="text-[10px] text-slate-400">Receba alertas mesmo com o navegador em segundo plano</span>
            </div>
            <button
              onClick={requestPushPermission}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${pushEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
            >
              {pushEnabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Radius selector */}
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">Raio Mínimo de Notificação</span>
              <span className="text-[10px] text-slate-400">Disparar alarme quando o raio cair dentro de:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setDistanceRadius(5)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition ${distanceRadius === 5 ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                &lt; 5km
              </button>
              <button
                onClick={() => setDistanceRadius(10)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition ${distanceRadius === 10 ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                &lt; 10km
              </button>
              <button
                onClick={() => setDistanceRadius(20)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition ${distanceRadius === 20 ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                &lt; 20km
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Strikes Log */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4">
        <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 flex items-center gap-2">
          <Radio size={14} className="text-amber-400" /> Histórico Recente de Descargas na Região
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {strikes.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>{s.time}</span>
                <span className="text-amber-400 font-bold">{s.dangerLevel}</span>
              </div>
              <div className="text-lg font-black text-white">{s.distance} km</div>
              <p className="text-[10px] text-slate-300 font-medium">{s.direction} • {s.peakCurrent}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LightningAlertPanel;
