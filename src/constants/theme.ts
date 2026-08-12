// Centralized Design Tokens for High-Contrast Light & Dark Theme Compatibility
export const THEME_TOKENS = {
  // Text Tokens - Guaranteed WCAG AA 4.5:1 Contrast
  text: {
    primary: 'text-slate-900 dark:text-white font-extrabold',
    secondary: 'text-slate-800 dark:text-slate-200 font-semibold',
    muted: 'text-slate-700 dark:text-slate-300 font-medium',
    accent: 'text-sky-700 dark:text-sky-300 font-black',
    success: 'text-emerald-700 dark:text-emerald-300 font-extrabold',
    warning: 'text-amber-700 dark:text-amber-300 font-extrabold',
    danger: 'text-rose-700 dark:text-rose-300 font-extrabold',
  },
  // Card Container Surface Tokens
  card: {
    base: 'bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl backdrop-blur-md rounded-3xl p-5 md:p-6',
    inner: 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl p-4 md:p-5',
    pillActive: 'bg-[#4A90E2] text-white shadow-md border border-sky-400 font-black uppercase text-xs',
    pillInactive: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border border-slate-300 dark:border-white/10 font-bold uppercase text-xs',
  },
  // Spacing Standard Token (16px - 20px)
  spacing: {
    cardGap: 'gap-4 sm:gap-5',
    sectionSpace: 'space-y-4 sm:space-y-5',
  }
};
