import { motion } from 'motion/react';
import { Target, Users, Zap, Briefcase, ChevronRight, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { loadHistory } from '../services/historyStorage';

interface Props {
  onStart: () => void;
  onOpenHistory: () => void;
}

export default function LandingPage({ onStart, onOpenHistory }: Props) {
  const { t } = useTranslation(['landing', 'common', 'history']);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    setHistoryCount(loadHistory().entries.length);
  }, []);

  const domains = [
    { icon: Briefcase, key: 'executingShort' as const },
    { icon: Zap, key: 'influencingShort' as const },
    { icon: Users, key: 'relationshipShort' as const },
    { icon: Target, key: 'strategicShort' as const },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full"
      >
        <span className="inline-block px-4 sm:px-6 py-2 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-zinc-600 uppercase border border-zinc-200 rounded-none bg-zinc-50 dark:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
          {t('landing:badge')}
        </span>
        <h1 className="font-serif italic text-4xl sm:text-6xl md:text-8xl font-light text-zinc-900 mb-6 sm:mb-8 tracking-tighter dark:text-white">
          {t('landing:titleStart')} <span className="text-zinc-400 not-italic font-sans dark:text-zinc-600">{t('landing:titleHighlight')}</span> {t('landing:titleEnd')}
        </h1>
        <p className="text-base sm:text-xl text-zinc-600 mb-10 sm:mb-16 max-w-2xl mx-auto leading-relaxed font-light dark:text-zinc-400">
          {t('landing:subtitle')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-20">
          {domains.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-zinc-50 p-4 sm:p-6 border border-zinc-200 flex flex-col items-center group hover:bg-zinc-100 transition-colors cursor-default dark:bg-zinc-900/30 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 transition-colors mb-3 sm:mb-4 dark:group-hover:text-white" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-300 text-center">{t(`common:domains.${item.key}`)}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="group relative inline-flex w-full sm:w-auto items-center justify-center px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] font-bold text-white transition-all duration-300 bg-zinc-900 hover:bg-zinc-800 rounded-none shadow-2xl shadow-zinc-900/10 uppercase text-xs tracking-[0.3em] dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:shadow-white/5"
        >
          {t('landing:begin')}
          <ChevronRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <div className="mt-6">
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-zinc-900 transition-colors px-6 py-3 min-h-[44px] border border-zinc-200 hover:border-zinc-400 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <History className="w-3 h-3" />
            {t('history:openButton')}
            {historyCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono bg-zinc-900 text-white dark:bg-white dark:text-black">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] dark:text-zinc-600">{t('landing:infoMinutes')}</p>
          <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] dark:text-zinc-600">{t('landing:infoMapping')}</p>
        </div>
      </motion.div>
    </div>
  );
}
