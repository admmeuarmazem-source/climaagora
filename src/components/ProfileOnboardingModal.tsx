import React from 'react';
import { User, Sprout, Briefcase, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export type UserProfileType = 'essencial' | 'rural' | 'profissional';

interface ProfileOnboardingModalProps {
  isOpen: boolean;
  onSelectProfile: (profile: UserProfileType) => void;
  onSkip: () => void;
}

export const ProfileOnboardingModal: React.FC<ProfileOnboardingModalProps> = ({
  isOpen,
  onSelectProfile,
  onSkip
}) => {
  const [selected, setSelected] = React.useState<UserProfileType>('essencial');

  if (!isOpen) return null;

  const profiles: {
    id: UserProfileType;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    color: string;
    badge: string;
    highlights: string[];
  }[] = [
    {
      id: 'essencial',
      title: 'Perfil Essencial',
      subtitle: 'Urbano & Dia a Dia',
      description: 'Previsão direta, prática e objetiva para o planejamento cotidiano.',
      icon: User,
      color: 'from-sky-500/20 to-blue-600/10 border-sky-500/40 text-sky-400',
      badge: 'Padrão',
      highlights: ['Temperatura e Sensação', 'Chuva por Hora e 7 Dias', 'Alertas Rápidos de Emergência']
    },
    {
      id: 'rural',
      title: 'Perfil Rural',
      subtitle: 'Agro & Produtores',
      description: 'Painel otimizado para manejo agrícola, irrigação e safras.',
      icon: Sprout,
      color: 'from-emerald-500/20 to-green-600/10 border-emerald-500/40 text-emerald-400',
      badge: 'Recomendado para Campo',
      highlights: ['Umidade do Solo & Déficit Hídrico', 'Janela de Pulverização', 'Fases da Lua & Insolação Solar']
    },
    {
      id: 'profissional',
      title: 'Perfil Profissional',
      subtitle: 'Operações, Logística & Engenharia',
      description: 'Telemetria profunda, radar meteorológico e modelagem atmosférica.',
      icon: Briefcase,
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-400',
      badge: 'Técnico Avançado',
      highlights: ['Radar de Precipitação em Tempo Real', 'Ventos 3D em Altitude', 'Macro-clima (ENSO/MJO) & Modelos']
    }
  ];

  const handleConfirm = () => {
    onSelectProfile(selected);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-white/15 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-wider">
            <span>Boas-vindas ao ClimaAgora IA</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Como você prefere visualizar o clima?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Escolha seu perfil de uso para personalizar a prioridade dos blocos na sua tela inicial. Você continuará tendo acesso a 100% dos dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {profiles.map(p => {
            const Icon = p.icon;
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group ${
                  isSelected
                    ? `bg-gradient-to-b ${p.color} ring-2 ring-sky-400 shadow-lg scale-[1.02]`
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-950'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-sky-400 text-slate-950 p-1 rounded-full shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
                      <Icon size={20} className={p.color.split(' ').pop()} />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">
                        {p.subtitle}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {p.description}
                  </p>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">Destaques da Home:</span>
                    {p.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 text-center">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border block ${
                    isSelected ? 'bg-sky-400 text-slate-950 border-sky-300 font-bold' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}>
                    {isSelected ? 'Perfil Selecionado' : 'Selecionar Perfil'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white transition duration-200 underline uppercase font-bold"
          >
            Pular por enquanto (Usar Essencial)
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <span>Confirmar e Continuar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
