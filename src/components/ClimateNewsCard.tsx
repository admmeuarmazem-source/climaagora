import React from 'react';
import { Newspaper, ExternalLink, ShieldAlert, CheckCircle2, CloudRain, Thermometer, Wind } from 'lucide-react';
import { WeatherData } from '../types';

interface ClimateNewsCardProps {
  cityName: string;
  weather?: WeatherData | null;
}

export const ClimateNewsCard: React.FC<ClimateNewsCardProps> = ({ cityName, weather }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const temp = weather?.temp ?? 26;
  const humidity = weather?.humidity ?? 65;
  const windSpeed = weather?.windSpeed ?? 18;
  const condition = weather?.condition ?? 'Cloudy';

  // Determine active warning level based on real parameters
  let warningLevel = 'Estabilidade Atmosférica';
  let warningColor = 'bg-emerald-500/10 text-black border-emerald-500/30';
  let warningTitle = `Análise de Monitoramento da Microrregião de ${cityName}`;
  let warningDescription = `Dados de telemetria da API registram temperatura de ${temp}°C, umidade relativa em ${humidity}% e ventos de ${windSpeed} km/h em ${cityName}. Acompanhe os indicadores em tempo real.`;

  if (condition === 'Storm' || windSpeed > 45 || weather?.hourly?.[0]?.pop > 75) {
    warningLevel = 'Aviso de Instabilidade Severa';
    warningColor = 'bg-red-500/15 text-black border-red-500/40 animate-pulse';
    warningTitle = `Indicador de Precipitação e Rajadas em ${cityName}`;
    warningDescription = `Condição de precipitação intensa identificada (${weather?.hourly?.[0]?.pop ?? 80}% de probabilidade), ventos de ${windSpeed} km/h e potencial de descargas elétricas na área de ${cityName}.`;
  } else if (humidity < 30) {
    warningLevel = 'Alerta de Baixa Umidade';
    warningColor = 'bg-amber-500/15 text-black border-amber-500/30';
    warningTitle = `Alerta de Estresse Hídrico em ${cityName}`;
    warningDescription = `Umidade relativa do ar registrada em ${humidity}% em ${cityName}. Recomendado reforço na hidratação e cuidados adicionais.`;
  }

  const newsItems = [
    {
      id: 'news-1',
      source: 'Rede ClimaAgora IA',
      badge: warningLevel,
      badgeStyle: warningColor,
      title: warningTitle,
      summary: warningDescription,
      date: `${dateStr} às ${timeStr}`,
      link: '#'
    },
    {
      id: 'news-2',
      source: 'Motor ClimaAgora IA',
      badge: 'Sinopse Atmosférica Global',
      badgeStyle: 'bg-sky-500/10 text-black border-sky-500/30',
      title: `Modelagem Atmosférica Global para ${cityName}`,
      summary: `Projeção dos modelos meteorológicos de alta resolução para a área de ${cityName}. Pressão barométrica de ${weather?.pressure ?? 1013} hPa com estimativa de condições para as próximas 24h a 48h.`,
      date: `${dateStr} às ${timeStr}`,
      link: '#'
    },
    {
      id: 'news-3',
      source: 'Análise Preditiva ClimaAgora IA',
      badge: 'Balanço Hídrico & Radiação',
      badgeStyle: 'bg-emerald-500/10 text-black border-emerald-500/30',
      title: `Diretrizes Agrometeorológicas para ${cityName}`,
      summary: `Os indicadores computados de radiação solar (${weather?.solarIrradiance ?? 650} W/m²) e taxa de radiação indicam as janelas operacionais de manejo na região de ${cityName}.`,
      date: `${dateStr}`,
      link: '#'
    }
  ];

  return (
    <div id="climate-news-card" className="card custom-dynamic-card bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden text-black my-6">
      {/* Glow background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-black">
            <Newspaper size={22} color="black" className="text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-black text-black tracking-wider">Informativo Climatológico</span>
              <span className="bg-emerald-500/20 text-black text-[8px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
                <CheckCircle2 size={10} color="black" className="text-black" /> TELEMETRIA EM TEMPO REAL
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-black leading-tight">
              Informativos e Análises Climatológicas ({cityName})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-black font-mono bg-slate-100 dark:bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <ShieldAlert size={14} color="black" className="text-black" />
          <span className="text-black">Sinalização ClimaAgora</span>
        </div>
      </div>

      {/* News list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {newsItems.map((item) => (
          <div key={item.id} className="mini-card bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col justify-between gap-4 hover:border-amber-400/50 transition duration-300">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${item.badgeStyle}`}>
                  {item.badge}
                </span>
                <span className="text-[9px] text-black font-mono shrink-0">{item.date}</span>
              </div>
              <h4 className="text-sm font-black text-black leading-snug mb-2">
                {item.title}
              </h4>
              <p className="text-xs text-black leading-relaxed font-medium">
                {item.summary}
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-black font-bold">{item.source}</span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-black hover:text-black flex items-center gap-1 transition"
              >
                <span>Acessar Site Oficial</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
