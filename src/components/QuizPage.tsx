import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QUESTIONS } from '../constants';

interface Props {
  onComplete: (answers: Record<string, number>) => void;
}

export default function QuizPage({ onComplete }: Props) {
  const { t } = useTranslation(['quiz', 'strengths']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const selectedValue = answers[currentQuestion.id] ?? 0;
  const statementA = t(`strengths:questions.${currentQuestion.id}.statementA` as any);
  const statementB = t(`strengths:questions.${currentQuestion.id}.statementB` as any);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Progress Header */}
      <div className="mb-20">
        <header className="flex justify-between items-end pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4">{t('quiz:module')}</p>
            <h2 className="text-4xl font-serif italic font-light text-zinc-900 leading-none dark:text-white">
              {t('quiz:contrastLabel')} <span className="text-zinc-400 not-italic font-sans text-2xl mx-4 dark:text-zinc-600">/</span> {currentIndex + 1} {t('quiz:of')} {QUESTIONS.length}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{t('quiz:completion')}</p>
            <p className="text-xl font-mono text-zinc-700 dark:text-zinc-300">{Math.round(progress)}%</p>
          </div>
        </header>
        <div className="h-px w-full bg-zinc-200 relative mt-[-1px] dark:bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-px bg-zinc-900 shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col md:flex-row gap-0 border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/20"
          >
            <div className={`flex-1 p-12 flex items-center justify-center text-center transition-all duration-500 ${selectedValue < 0 ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
              <p className="text-2xl font-serif leading-relaxed italic">"{statementA}"</p>
            </div>

            <div className="w-px bg-zinc-200 hidden md:block dark:bg-zinc-800" />

            <div className={`flex-1 p-12 flex items-center justify-center text-center transition-all duration-500 ${selectedValue > 0 ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
              <p className="text-2xl font-serif leading-relaxed italic">"{statementB}"</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Input Interface */}
        <div className="mt-12 p-8 border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-10">{t('quiz:selectWeight')}</p>
          <div className="max-w-2xl mx-auto relative flex justify-between items-center px-4">
            {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className={`
                  relative z-10 w-12 h-12 flex items-center justify-center transition-all border
                  ${selectedValue === val
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xl scale-110 dark:bg-white dark:text-black dark:border-white'
                    : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400 dark:text-zinc-600 dark:border-zinc-800 dark:hover:border-zinc-600'}
                `}
              >
                <span className="text-[10px] font-mono font-bold">{val === 0 ? t('quiz:neutral') : Math.abs(val)}</span>
              </button>
            ))}
            <div className="absolute left-4 right-4 h-[1px] bg-zinc-200 -z-0 dark:bg-zinc-800" />
          </div>

          <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-10 px-2 dark:text-zinc-700">
            <span>{t('quiz:strongA')}</span>
            <span>{t('quiz:balanced')}</span>
            <span>{t('quiz:strongB')}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-16 pb-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border rounded-none ${
            currentIndex === 0
              ? 'opacity-0 pointer-events-none border-zinc-200 dark:border-zinc-800'
              : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:text-white dark:hover:bg-zinc-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('quiz:back')}
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-6 px-12 py-4 bg-zinc-900 text-white rounded-none text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {currentIndex === QUESTIONS.length - 1 ? t('quiz:analyze') : t('quiz:proceed')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
