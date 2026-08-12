import React, { useState, useEffect, useRef } from 'react';
import { Wind, Layers, Compass, Play, Pause, Gauge, Info } from 'lucide-react';

interface Wind3DProps {
  cityName: string;
}

export const Wind3DPressurePanel: React.FC<Wind3DProps> = ({ cityName }) => {
  const [pressureLevel, setPressureLevel] = useState<'1000' | '850' | '500' | '250'>('1000');
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pressureLevelsInfo = {
    '1000': { name: 'Superfície (1000 hPa)', alt: '~10 metros', desc: 'Ventos de superfície, rajadas locais e brisas térmicas que afetam o cotidiano na cidade.', color: '#38bdf8' },
    '850': { name: 'Baixa Troposfera (850 hPa)', alt: '~1.500 metros', desc: 'Correntes de Baixa Altitude (JBN) que transportam umidade da Bacia Amazônica.', color: '#34d399' },
    '500': { name: 'Média Troposfera (500 hPa)', alt: '~5.500 metros', desc: 'Nível das frentes frias, vórtices ciclônicos de altos níveis e bloqueios atmosféricos.', color: '#f59e0b' },
    '250': { name: 'Jet Stream / Corrente de Jato (250 hPa)', alt: '~10.500 metros', desc: 'Correntes de jato de alta velocidade que direcionam tempestades globais e rotas de aviação.', color: '#ec4899' }
  };

  const currentLevelData = pressureLevelsInfo[pressureLevel];

  // Particle Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 240);

    // Generate stream particles
    const numParticles = 120;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (pressureLevel === '250' ? 3.5 : pressureLevel === '500' ? 2.5 : pressureLevel === '850' ? 1.8 : 1.2) + Math.random() * 0.8,
      vy: Math.sin(Math.random() * Math.PI * 2) * 0.4,
      age: Math.random() * 100,
      maxAge: 80 + Math.random() * 60
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; // trail fade
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pressureLevel === '250' ? 2 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = currentLevelData.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = currentLevelData.color;
        ctx.fill();

        if (isPlaying) {
          p.x += p.vx;
          p.y += Math.sin(p.x * 0.02) * 0.5 + p.vy;
          p.age++;

          if (p.x > width || p.age > p.maxAge) {
            p.x = 0;
            p.y = Math.random() * height;
            p.age = 0;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pressureLevel, isPlaying]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-white">
      {/* Background Cyan Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Wind size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-sky-400 tracking-wider">Visualizador 3D de Partículas de Vento</span>
              <span className="bg-sky-500/20 text-sky-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-sky-500/30 font-bold">MODELE DE PRESSÃO DINÂMICO</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">
              Animação de Ventos em Altitude para {cityName}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-slate-200 self-start sm:self-center"
        >
          {isPlaying ? <Pause size={14} className="text-amber-400" /> : <Play size={14} className="text-emerald-400" />}
          <span>{isPlaying ? 'Pausar Animação' : 'Iniciar Animação'}</span>
        </button>
      </div>

      {/* Pressure Level Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {(Object.keys(pressureLevelsInfo) as Array<keyof typeof pressureLevelsInfo>).map((level) => {
          const item = pressureLevelsInfo[level];
          const isActive = pressureLevel === level;
          return (
            <button
              key={level}
              onClick={() => setPressureLevel(level)}
              className={`p-3 rounded-2xl border text-left transition relative overflow-hidden ${
                isActive
                  ? 'bg-slate-950 border-sky-400 shadow-xl'
                  : 'bg-slate-950/50 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">{item.alt}</span>
              <span className="text-xs font-black text-white block mt-0.5">{item.name}</span>
              <div
                className="h-1 w-full rounded-full mt-2"
                style={{ backgroundColor: item.color }}
              />
            </button>
          );
        })}
      </div>

      {/* Interactive Streamline Canvas */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 relative overflow-hidden mb-5">
        <canvas ref={canvasRef} className="w-full h-60 rounded-xl" />

        <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold">
          <span className="text-sky-400">Camada Ativa:</span> {currentLevelData.name} ({currentLevelData.alt})
        </div>

        <div className="absolute bottom-6 right-6 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold">
          Velocidade Média: <span className="text-emerald-400">{pressureLevel === '250' ? '185 km/h' : pressureLevel === '500' ? '92 km/h' : pressureLevel === '850' ? '48 km/h' : '18 km/h'}</span>
        </div>
      </div>

      {/* Level Description Info */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-sky-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            Dinâmica Atmosférica do Nível {currentLevelData.name}
          </h4>
          <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
            {currentLevelData.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wind3DPressurePanel;
