import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, Compass, Telescope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LENGTH_OPTIONS } from '../data/questionBank';
import type { QuizLength } from '../types';

interface Props {
  onStart: (length: QuizLength) => void;
  onBack: () => void;
}

const ORDER: QuizLength[] = ['quick', 'standard', 'deep'];
const ICONS: Record<QuizLength, typeof Zap> = {
  quick: Zap,
  standard: Compass,
  deep: Telescope,
};

export default function LengthSelectionPage({ onStart, onBack }: Props) {
  const { t } = useTranslation(['lengthSelection', 'common']);
  const [selected, setSelected] = useState<QuizLength>('standard');
  const cardRefs = useRef<Record<QuizLength, HTMLButtonElement | null>>({
    quick: null,
    standard: null,
    deep: null,
  });

  useEffect(() => {
    // Initial focus on the default (recommended) option for keyboard users.
    cardRefs.current[selected]?.focus({ preventScroll: true });
    // We intentionally only run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = ORDER.indexOf(selected);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = ORDER[(idx + 1) % ORDER.length];
      setSelected(next);
      cardRefs.current[next]?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      setSelected(prev);
      cardRefs.current[prev]?.focus({ preventScroll: true });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStart(selected);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 sm:py-20">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 mb-8 sm:mb-12 min-h-[44px] dark:hover:text-white"
      >
        <ChevronLeft className="w-3 h-3" />
        {t('lengthSelection:back')}
      </button>

      <header className="mb-10 sm:mb-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4">
          {t('lengthSelection:badge')}
        </p>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic font-light text-zinc-900 mb-4 sm:mb-6 tracking-tight dark:text-white">
          {t('lengthSelection:title')}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-light dark:text-zinc-400">
          {t('lengthSelection:subtitle')}
        </p>
      </header>

      <div
        role="radiogroup"
        aria-label={t('lengthSelection:title')}
        onKeyDown={handleKey}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12"
      >
        {ORDER.map((length, i) => {
          const opt = LENGTH_OPTIONS[length];
          const Icon = ICONS[length];
          const isSelected = selected === length;
          const isRecommended = length === 'standard';
          return (
            <motion.button
              key={length}
              ref={(el) => {
                cardRefs.current[length] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${t(`lengthSelection:${length}.name`)} — ${opt.count} ${t('lengthSelection:questions')}, ${opt.estMinutes[0]}–${opt.estMinutes[1]} ${t('lengthSelection:minutes')}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(length)}
              onDoubleClick={() => onStart(length)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`relative text-left p-6 sm:p-8 min-h-[44px] border transition-all outline-none ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xl dark:bg-white dark:text-black dark:border-white'
                  : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-900/30 dark:text-white dark:border-zinc-800 dark:hover:border-zinc-600'
              } focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950`}
            >
              {isRecommended && (
                <span
                  className={`absolute -top-3 left-6 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] ${
                    isSelected
                      ? 'bg-white text-zinc-900 dark:bg-black dark:text-white'
                      : 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  }`}
                >
                  {t('lengthSelection:recommended')}
                </span>
              )}
              <Icon
                className={`w-6 h-6 mb-6 ${
                  isSelected ? '' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              />
              <h2 className="text-2xl sm:text-3xl font-serif italic font-light mb-2">
                {t(`lengthSelection:${length}.name`)}
              </h2>
              <div
                className={`flex items-baseline gap-2 mb-4 ${
                  isSelected ? '' : 'text-zinc-500 dark:text-zinc-500'
                }`}
              >
                <span className="font-mono text-2xl">{opt.count}</span>
                <span className="text-[10px] uppercase tracking-[0.3em]">
                  {t('lengthSelection:questions')}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] ml-auto">
                  {opt.estMinutes[0]}–{opt.estMinutes[1]} {t('lengthSelection:minutes')}
                </span>
              </div>
              <p
                className={`text-sm font-light leading-relaxed ${
                  isSelected ? '' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t(`lengthSelection:${length}.desc`)}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selected)}
          className="group inline-flex w-full sm:w-auto items-center justify-center px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-none shadow-2xl uppercase text-xs tracking-[0.3em] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {t('lengthSelection:start')}
          <ChevronRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}
