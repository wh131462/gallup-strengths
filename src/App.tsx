/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LandingPage from './components/LandingPage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';
import SettingsModal from './components/SettingsModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import HistoryList from './components/HistoryList';
import { Compass, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { getEntry } from './services/historyStorage';

type AppState = 'landing' | 'quiz' | 'results' | 'history' | 'history-detail';

export default function App() {
  const { t } = useTranslation('common');
  const [state, setState] = useState<AppState>('landing');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleStart = () => setState('quiz');

  const handleComplete = (finalAnswers: Record<string, number>) => {
    setAnswers(finalAnswers);
    setState('results');
  };

  const handleRestart = () => {
    setAnswers({});
    setSelectedHistoryId(null);
    setState('landing');
  };

  const openHistory = () => {
    setSelectedHistoryId(null);
    setState('history');
  };

  const openHistoryEntry = (id: string) => {
    setSelectedHistoryId(id);
    setState('history-detail');
  };

  const backToHistory = () => {
    setSelectedHistoryId(null);
    setState('history');
  };

  const selectedEntry = useMemo(
    () => (selectedHistoryId ? getEntry(selectedHistoryId) : null),
    [selectedHistoryId, state],
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-zinc-800 dark:selection:text-white">
      {/* Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleRestart}>
            <div className="w-8 h-8 border border-zinc-300 flex items-center justify-center text-zinc-900 rotate-45 dark:border-zinc-700 dark:text-white">
              <Compass className="w-5 h-5 -rotate-45" />
            </div>
            <span className="font-serif italic font-light text-2xl tracking-[0.1em] text-zinc-900 uppercase dark:text-white">{t('nav.brand')}</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={toggleTheme}
              title={t('theme.toggle')}
              aria-label={t('theme.toggle')}
              className="flex items-center gap-2 text-[10px] font-bold px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-none transition-colors border border-zinc-200 uppercase tracking-widest dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
            >
              {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              {theme === 'dark' ? t('theme.light') : t('theme.dark')}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 text-[10px] font-bold px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-none transition-colors border border-zinc-200 uppercase tracking-widest dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
              title={t('nav.aiSettingsTitle')}
            >
              <Settings className="w-3 h-3" />
              {t('nav.aiSettings')}
            </button>
            <button
              onClick={handleRestart}
              className="text-[10px] font-bold px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-none transition-colors border border-zinc-200 uppercase tracking-widest dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
            >
              {t('reset')}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {state === 'landing' && <LandingPage onStart={handleStart} onOpenHistory={openHistory} />}
        {state === 'quiz' && <QuizPage onComplete={handleComplete} />}
        {state === 'results' && <ResultsPage answers={answers} onRestart={handleRestart} />}
        {state === 'history' && <HistoryList onBack={handleRestart} onOpenEntry={openHistoryEntry} />}
        {state === 'history-detail' && selectedEntry && (
          <ResultsPage
            answers={selectedEntry.answers}
            onRestart={handleRestart}
            readonly
            entry={selectedEntry}
            onBackToHistory={backToHistory}
          />
        )}
        {state === 'history-detail' && !selectedEntry && <HistoryList onBack={handleRestart} onOpenEntry={openHistoryEntry} />}
      </main>

      <footer className="py-12 px-6 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-600">
            <p className="text-[10px] uppercase tracking-[0.5em] font-light">{t('footer.tagline')}</p>
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
          </div>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
