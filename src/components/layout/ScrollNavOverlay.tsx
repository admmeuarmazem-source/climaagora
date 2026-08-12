import React, { useState, useEffect, useRef } from 'react';
import { Home, Sparkles, Bell, Calendar, DollarSign, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { getTranslation, SupportedLanguage } from '../../i18n';

interface ScrollNavOverlayProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isAdmin?: boolean;
  lang?: string;
}

export const ScrollNavOverlay: React.FC<ScrollNavOverlayProps> = ({
  activeTab,
  setActiveTab,
  isAdmin = false,
  lang = 'pt-BR'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const currentLang = (lang as SupportedLanguage) || 'pt-BR';
  const navItems = [
    { id: 'dashboard', label: getTranslation('nav_home', currentLang) || 'Início', icon: Home },
    { id: 'assistant', label: getTranslation('nav_ai', currentLang) || 'IA', icon: Sparkles },
    { id: 'notifications', label: getTranslation('nav_alerts', currentLang) || 'Alertas', icon: Bell },
    { id: 'history', label: getTranslation('nav_history', currentLang) || 'Histórico', icon: Calendar },
    { id: 'plans', label: getTranslation('nav_plans', currentLang) || 'Planos', icon: DollarSign },
    ...(isAdmin ? [{ id: 'admin', label: getTranslation('nav_admin', currentLang) || 'Admin', icon: Shield }] : [])
  ];

  return (
    <nav
      id="scroll-nav-overlay"
      data-visible={isVisible}
      style={{
        position: 'fixed',
        bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5000,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        margin: 0,
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out',
      }}
      className="max-w-lg w-[calc(100%-1.25rem)] bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 shadow-[0_12px_35px_rgba(0,0,0,0.35)] flex items-center justify-around text-center"
    >
      {navItems.map((tabObj) => {
        const IconComponent = tabObj.icon;
        const isActive = activeTab === tabObj.id;
        return (
          <button
            key={tabObj.id}
            type="button"
            data-active={isActive}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab(tabObj.id);
              setIsVisible(true);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => setIsVisible(false), 3000);
            }}
            style={{ flexShrink: 0 }}
            className={`flex-1 shrink-0 flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1 py-1 px-0.5 sm:px-1 rounded-2xl relative transition-all duration-300 select-none cursor-pointer ${
              isActive ? 'active-tab' : ''
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-bottom-tab-translucent"
                className="absolute inset-0 bg-sky-500/20 dark:bg-sky-400/25 border border-sky-500/40 dark:border-sky-300/50 rounded-2xl z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
              <IconComponent
                size={18}
                className={`transition-colors duration-300 ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-300 scale-110'
                    : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
                }`}
              />
              <span
                className={`text-[7.5px] min-[320px]:text-[8.5px] min-[360px]:text-[9px] min-[400px]:text-[10px] tracking-wider uppercase mt-0.5 sm:mt-1 transition-colors duration-300 ${
                  isActive ? 'text-sky-600 dark:text-sky-300 font-extrabold' : 'text-slate-800 dark:text-slate-200 font-black'
                }`}
              >
                {tabObj.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
