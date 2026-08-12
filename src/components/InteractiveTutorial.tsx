import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronRight, ChevronLeft, X, Check, Sparkles, Shield } from 'lucide-react';
import { SupportedLanguage } from '../i18n';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

interface TutorialStep {
  title: string;
  content: string;
  targetId: string;
  tabRequired?: string;
  adminOnly?: boolean;
}

const TUTORIAL_CONTENT: Record<string, TutorialStep[]> = {
  'pt': [
    {
      title: '👋 Bem-vindo ao ClimaAgora IA!',
      content: 'Esta é uma plataforma de inteligência climática de alta precisão desenvolvida para dar suporte imediato a produtores rurais, pecuaristas, energia solar, pescadores e navegadores. Vamos fazer um tour pelos recursos atuais?',
      targetId: 'main-nav-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '🔍 Busca, Geolocalização & Estação de Telemetria',
      content: 'Pesquise qualquer município ou ative sua localização GPS exata. Visualize em tempo real a estação física de telemetria e relatórios sincronizados do Motor ClimaAgora IA.',
      targetId: 'tour-search-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '📡 Radar de Precipitação Doppler & Filtro',
      content: 'Nosso Radar Doppler RainViewer integra imagens de tempestades em tempo real com controle de linha do tempo e slider de filtro de ruído ajustável (0% a 50%) para isolar células de chuva severas.',
      targetId: 'tour-radar-doppler',
      tabRequired: 'dashboard'
    },
    {
      title: '🚜 Central de Recursos Climáticos & Decisões',
      content: 'Acesse 7 módulos especializados (Minutecast, Qualidade do Ar AQI, Alerta de Raios Push, Ventos 3D Altitude, Queimadas NASA, Ciclones e Índice UV) e recomendações para Agricultura, Pecuária, Solar e Navegação.',
      targetId: 'advanced-weather-suite',
      tabRequired: 'dashboard'
    },
    {
      title: '🌎 Mapa Inteligente de Riscos Georreferenciado',
      content: 'Conheça o Climate Intelligence Engine (CIE). Ative camadas interativas em tempo real para Chuva, Ventos 3D, Descargas Elétricas Blitzortung, Qualidade do Ar e Queimadas com alta resolução.',
      targetId: 'tour-intelligent-map',
      tabRequired: 'dashboard'
    },
    {
      title: '🤖 Assistente Climático IA',
      content: 'Converse com o assistente inteligente para recomendações imediatas de pulverização, manejo de rebanho e navegação marítima com inteligência artificial.',
      targetId: 'tour-ai-chat',
      tabRequired: 'assistant'
    },
    {
      title: '📅 Histórico & Reanálise Comparativa',
      content: 'Compare os últimos 7 dias de dados reais com tendências históricas e relatórios do Motor ClimaAgora IA, acompanhados de pareceres automatizados de georesiliência.',
      targetId: 'tour-history',
      tabRequired: 'history'
    },
    {
      title: '🚨 Central de Alertas & Emergências',
      content: 'Acompanhe notificações de emergência, rajadas de vento, riscos de geada e alertas sonoros acionados automaticamente em casos de tempestades severas.',
      targetId: 'tour-notifications',
      tabRequired: 'notifications'
    },
    {
      title: '💎 Planos, Monetização & Camadas Pro',
      content: 'Desbloqueie relatórios avançados de estresse hídrico do solo, índice THI de conforto térmico bovino e rastreamento de descargas atmosféricas nos planos com comercialização ativa.',
      targetId: 'tour-plans',
      tabRequired: 'plans'
    },
    {
      title: '🛡️ Painel Administrativo de Controle (Exclusivo Admin)',
      content: 'Como Administrador, você gerencia usuários assinantes, calibração fina de sensores, banners de parceiros patrocinados, alertas de emergência e auditoria de segurança.',
      targetId: 'tour-admin-panel',
      tabRequired: 'admin',
      adminOnly: true
    }
  ],
  'en': [
    {
      title: '👋 Welcome to ClimaAgora IA!',
      content: 'This is a high-precision climate intelligence platform providing real-time data for agriculture, livestock, solar energy, fishing, and navigation. Let\'s explore the updated features!',
      targetId: 'main-nav-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '🔍 Search, Geolocation & Telemetry Station',
      content: 'Search any municipality or activate your exact GPS location. View live telemetry station data and ClimaAgora AI synced forecasts in real time.',
      targetId: 'tour-search-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '📡 Doppler Precipitation Radar & Noise Filter',
      content: 'Live RainViewer Doppler Radar featuring an interactive playback timeline and noise filter slider (0% to 50%) to eliminate radar noise and isolate heavy storm cells.',
      targetId: 'tour-radar-doppler',
      tabRequired: 'dashboard'
    },
    {
      title: '🚜 Advanced Climate Suite & Decision Center',
      content: 'Access 7 specialized modules (Minutecast, AQI Air Quality, Lightning Push Alerts, 3D Altitude Winds, NASA Fire Radar, Cyclones, and UV Index) along with sector-specific guidance.',
      targetId: 'advanced-weather-suite',
      tabRequired: 'dashboard'
    },
    {
      title: '🌎 Georeferenced Intelligent Risk Map',
      content: 'Explore the Climate Intelligence Engine (CIE). Toggle dynamic live layers for Rain, 3D Winds, Lightning, Air Quality, and Active Wildfire hotspots.',
      targetId: 'tour-intelligent-map',
      tabRequired: 'dashboard'
    },
    {
      title: '🤖 AI Weather Assistant',
      content: 'Chat with our AI assistant for spraying advice, thermal stress guidance for livestock, and maritime safety with artificial intelligence.',
      targetId: 'tour-ai-chat',
      tabRequired: 'assistant'
    },
    {
      title: '📅 History & Comparative Reanalysis',
      content: 'Compare the last 7 days of real-time weather against historical series from ClimaAgora AI, with automated georesilience summaries.',
      targetId: 'tour-history',
      tabRequired: 'history'
    },
    {
      title: '🚨 Emergency Alerts & Civil Defense',
      content: 'Monitor severe weather risks, emergency notifications, gust warnings, and automated sound alerts for severe convective storms.',
      targetId: 'tour-notifications',
      tabRequired: 'notifications'
    },
    {
      title: '💎 Subscription Plans & Pro Layers',
      content: 'Unlock specialized soil stress mapping, THI livestock comfort indices, and real-time lightning network coverage with flexible plans.',
      targetId: 'tour-plans',
      tabRequired: 'plans'
    },
    {
      title: '🛡️ Administrative Control Panel (Admin Exclusive)',
      content: 'Administrators have full access to manage active subscriptions, sensor calibrations, sponsor ad banners, system alerts, and security logs.',
      targetId: 'tour-admin-panel',
      tabRequired: 'admin',
      adminOnly: true
    }
  ],
  'es': [
    {
      title: '👋 ¡Bienvenido a ClimaAgora IA!',
      content: 'Plataforma de inteligencia climática de alta precisión para agricultura, ganadería, energía solar, pesca y navegación. ¡Acompañanos en este recorrido!',
      targetId: 'main-nav-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '🔍 Búsqueda, Geolocalización y Estación de Telemetría',
      content: 'Busque cualquier ciudad o active su ubicación GPS exacta. Vea telemetría en tiempo real y pronósticos integrados del Motor ClimaAgora IA.',
      targetId: 'tour-search-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '📡 Radar Doppler y Filtro de Ruido',
      content: 'Radar Doppler RainViewer en vivo con línea de tiempo y filtro deslizante de ruido (0% a 50%) para aislar núcleos de tormentas severas.',
      targetId: 'tour-radar-doppler',
      tabRequired: 'dashboard'
    },
    {
      title: '🚜 Centro de Recursos Climáticos y Decisiones',
      content: 'Acceda a 7 módulos avanzados (Minutecast, Calidad del Aire, Alerta de Rayos, Vientos 3D, Incendios NASA, Ciclones e Índice UV) y recomendaciones sectoriales.',
      targetId: 'advanced-weather-suite',
      tabRequired: 'dashboard'
    },
    {
      title: '🌎 Mapa Inteligente de Riesgos (CIE)',
      content: 'Explore el Climate Intelligence Engine (CIE). Active capas de Lluvia, Vientos 3D, Descargas Eléctricas, Calidad del Aire e Incendios en tiempo real.',
      targetId: 'tour-intelligent-map',
      tabRequired: 'dashboard'
    },
    {
      title: '🤖 Asistente de Clima IA',
      content: 'Consulte al asistente inteligente para decisiones de campo, recomendaciones de siembra y consultas meteorológicas.',
      targetId: 'tour-ai-chat',
      tabRequired: 'assistant'
    },
    {
      title: '📅 Histórico y Reanálisis Comparativo',
      content: 'Compare los últimos 7 días con series históricas de ClimaAgora IA junto con resúmenes de georesiliencia.',
      targetId: 'tour-history',
      tabRequired: 'history'
    },
    {
      title: '🚨 Central de Alertas y Defensa Civil',
      content: 'Monitoree avisos de emergencia, ráfagas de viento, riesgos de heladas y alertas sonoras de tormenta.',
      targetId: 'tour-notifications',
      tabRequired: 'notifications'
    },
    {
      title: '💎 Planes de Suscripción y Capas Pro',
      content: 'Desbloquee análisis de estrés hídrico del suelo, índice de confort térmico ganadero THI y seguimiento de rayos en tiempo real.',
      targetId: 'tour-plans',
      tabRequired: 'plans'
    },
    {
      title: '🛡️ Panel de Control Administrativo (Exclusivo Admin)',
      content: 'Como Administrador, gestione suscriptores, calibración de sensores, banners patrocinados, emisión de alertas y auditoría.',
      targetId: 'tour-admin-panel',
      tabRequired: 'admin',
      adminOnly: true
    }
  ],
  'de': [
    {
      title: '👋 Willkommen bei ClimaAgora IA!',
      content: 'Hochpräzise Klimaintelligenz für Landwirtschaft, Viehzucht, Solarenergie, Fischerei und Navigation. Entdecken Sie die aktuellen Funktionen!',
      targetId: 'main-nav-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '🔍 Suche, GPS & Telemetrie-Station',
      content: 'Suchen Sie Städte oder geben Sie GPS-Koordinaten ein. Sehen Sie Telemetriedaten und ClimaAgora IA Prognosen in Echtzeit.',
      targetId: 'tour-search-bar',
      tabRequired: 'dashboard'
    },
    {
      title: '📡 Doppler-Niederschlagsradar & Rauschfilter',
      content: 'Live-Doppler-Radar mit Zeitleistensteuerung und einstellbarem Rauschfilter-Schieberegler (0% bis 50%) zur Isolierung schwerer Regenfronten.',
      targetId: 'tour-radar-doppler',
      tabRequired: 'dashboard'
    },
    {
      title: '🚜 Erweiterte Klimasuite & Entscheidungszentrum',
      content: 'Zugriff auf 8 Spezialmodule (Minutecast, Luftqualität AQI, Blitz-Push-Warnungen, 3D-Winde, NASA-Brände, Zyklone, UV-Index & Modellvergleich) sowie Branchenempfehlungen.',
      targetId: 'advanced-weather-suite',
      tabRequired: 'dashboard'
    },
    {
      title: '🌎 Georeferenzierte Risikokarte (CIE)',
      content: 'Erkunden Sie die Climate Intelligence Engine (CIE). Schalten Sie Ebenen für Regen, 3D-Winde, Blitze, Luftqualität und Brände live.',
      targetId: 'tour-intelligent-map',
      tabRequired: 'dashboard'
    },
    {
      title: '🤖 KI-Assistent & Modellvergleich',
      content: 'Nutzen Sie den KI-Assistenten für Entscheidungen in Landwirtschaft und Schifffahrt und vergleichen Sie Prognosen führender Wettermodelle.',
      targetId: 'tour-ai-chat',
      tabRequired: 'assistant'
    },
    {
      title: '📅 Historie & Vergleichende Reanalyse',
      content: 'Vergleichen Sie die letzten 7 Tage mit historischen Daten von ClimaAgora IA inklusive automatisierten Georesilienzgutachten.',
      targetId: 'tour-history',
      tabRequired: 'history'
    },
    {
      title: '🚨 Notfallwarnungen & Zivilschutz',
      content: 'Überwachen Sie Unwetterrisiken, Windböen, Frostgefahren und automatische akustische Warnsignale bei schweren Gewittern.',
      targetId: 'tour-notifications',
      tabRequired: 'notifications'
    },
    {
      title: '💎 Abonnements & Pro-Ebenen',
      content: 'Schalten Sie Bodenfeuchte-Analysen, THI-Hitzestressindizes für Viehzucht und Blitzerfassung in Echtzeit frei.',
      targetId: 'tour-plans',
      tabRequired: 'plans'
    },
    {
      title: '🛡️ Administrator-Panel (Exklusiv für Admin)',
      content: 'Als Administrator verwalten Sie Abonnenten, Sensorkalibrierung, Werbebanner, Notfallwarnungen und Sicherheitsaudits.',
      targetId: 'tour-admin-panel',
      tabRequired: 'admin',
      adminOnly: true
    }
  ]
};

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  lang,
  activeTab,
  setActiveTab,
  isAdmin = false
}) => {
  const [step, setStep] = useState(0);

  // Determine language group
  const getLangGroup = (): string => {
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('de')) return 'de';
    return 'en';
  };

  const group = getLangGroup();
  const rawSteps = TUTORIAL_CONTENT[group] || TUTORIAL_CONTENT['en'];
  
  // Filter steps if user is not admin
  const steps = rawSteps.filter(s => !s.adminOnly || isAdmin);
  const currentStep = steps[step];

  // Auto handle tab transitions and scrolling/highlights
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Transition tab if required for this step
    if (currentStep.tabRequired && activeTab !== currentStep.tabRequired) {
      setActiveTab(currentStep.tabRequired);
    }

    // Wait a brief moment for layout changes, then scroll and highlight
    const timeout = setTimeout(() => {
      // Clear previous highlights
      const highlighted = document.querySelectorAll('.tour-highlight');
      highlighted.forEach(el => {
        el.classList.remove(
          'tour-highlight',
          'ring-4',
          'ring-sky-500',
          'ring-offset-4',
          'ring-offset-slate-100',
          'dark:ring-offset-slate-950',
          'animate-pulse'
        );
      });

      const element = document.getElementById(currentStep.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add(
          'tour-highlight',
          'ring-4',
          'ring-sky-500',
          'ring-offset-4',
          'ring-offset-slate-100',
          'dark:ring-offset-slate-950',
          'animate-pulse'
        );
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [step, isOpen, activeTab, currentStep?.targetId, currentStep?.tabRequired]);

  // Clean highlights on close
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      const highlighted = document.querySelectorAll('.tour-highlight');
      highlighted.forEach(el => {
        el.classList.remove(
          'tour-highlight',
          'ring-4',
          'ring-sky-500',
          'ring-offset-4',
          'ring-offset-slate-100',
          'dark:ring-offset-slate-950',
          'animate-pulse'
        );
      });
    }
  }, [isOpen]);

  if (!currentStep) return null;

  const progressPercentage = ((step + 1) / steps.length) * 100;

  // Language dictionaries for UI labels
  const uiLabels: Record<string, Record<string, string>> = {
    pt: {
      next: 'Avançar',
      back: 'Voltar',
      skip: 'Pular Tour',
      finish: 'Concluir Tour! 🚀',
      step_of: 'passo {current} de {total}'
    },
    en: {
      next: 'Next',
      back: 'Back',
      skip: 'Skip Tour',
      finish: 'Finish Tour! 🚀',
      step_of: 'step {current} of {total}'
    },
    es: {
      next: 'Siguiente',
      back: 'Atrás',
      skip: 'Omitir',
      finish: 'Terminar! 🚀',
      step_of: 'paso {current} de {total}'
    },
    de: {
      next: 'Weiter',
      back: 'Zurück',
      skip: 'Überspringen',
      finish: 'Tour beenden! 🚀',
      step_of: 'Schritt {current} von {total}'
    }
  };

  const labels = uiLabels[group] || uiLabels['en'];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-[999999] max-w-sm w-full p-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-sky-500/40 dark:border-sky-500/30 p-5 rounded-3xl shadow-2xl flex flex-col gap-4 relative overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Neon side accent glowing effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Info & Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="animate-spin-slow" />
                INTELLIGENT ONBOARDING
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  setActiveTab('dashboard');
                }}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition cursor-pointer z-10 shrink-0"
                title="Fechar Tutorial"
                aria-label="Fechar Tutorial"
              >
                <X size={16} />
              </button>
            </div>

            {/* Micro progress bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              {labels.step_of
                .replace('{current}', String(step + 1))
                .replace('{total}', String(steps.length))}
            </span>
          </div>

          {/* Step Content */}
          <div className="space-y-1.5">
            <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              {currentStep.adminOnly && <Shield size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />}
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              {currentStep.content}
            </p>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                setActiveTab('dashboard');
              }}
              className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
            >
              {labels.skip}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-800 dark:text-white uppercase transition cursor-pointer"
                >
                  <ChevronLeft size={12} />
                  {labels.back}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:opacity-90 rounded-xl text-[10px] font-black text-white dark:text-slate-950 uppercase transition shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                {step === steps.length - 1 ? (
                  <>
                    <Check size={12} />
                    {labels.finish}
                  </>
                ) : (
                  <>
                    {labels.next}
                    <ChevronRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};
