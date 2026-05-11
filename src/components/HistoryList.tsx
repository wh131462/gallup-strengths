import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Trash2, Download, Sparkles, History as HistoryIcon, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clearAll, deleteEntry, downloadHistoryJson, loadHistory } from '../services/historyStorage';
import type { HistoryEntry } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  onBack: () => void;
  onOpenEntry: (id: string) => void;
}

export default function HistoryList({ onBack, onOpenEntry }: Props) {
  const { t, i18n } = useTranslation(['history', 'strengths', 'common']);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const refresh = () => setEntries(loadHistory().entries);

  useEffect(() => {
    refresh();
  }, []);

  const dateLocale = i18n.language.startsWith('en') ? 'en-US' : 'zh-CN';
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [dateLocale],
  );

  const themeName = (name: string) => t(`strengths:themes.${name}.name` as any);

  const doDelete = () => {
    if (pendingDelete) {
      deleteEntry(pendingDelete);
      setPendingDelete(null);
      refresh();
    }
  };

  const doClearAll = () => {
    clearAll();
    setConfirmClearAll(false);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 mb-8 sm:mb-10 min-h-[44px] dark:hover:text-white"
      >
        <ChevronLeft className="w-3 h-3" />
        {t('history:actions.backToList')}
      </button>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 sm:pb-10 mb-8 sm:mb-10 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3 flex items-center gap-2">
            <HistoryIcon className="w-3 h-3" /> {t('history:title')}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-light text-zinc-900 tracking-tight dark:text-white">
            {t('history:subtitle')}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadHistoryJson}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 min-h-[44px] text-[10px] uppercase tracking-[0.2em] text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Download className="w-3 h-3" />
            {t('history:actions.export')}
          </button>
          <button
            onClick={() => setConfirmClearAll(true)}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 border border-rose-200 px-4 py-2 min-h-[44px] text-[10px] uppercase tracking-[0.2em] text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-3 h-3" />
            {t('history:actions.clearAll')}
          </button>
        </div>
      </header>

      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-8 dark:text-zinc-500">
        {t('history:privacyNotice')}
      </p>

      {entries.length === 0 ? (
        <div className="border border-zinc-200 p-16 text-center dark:border-zinc-800">
          <h2 className="text-2xl font-serif italic text-zinc-900 mb-3 dark:text-white">
            {t('history:empty.title')}
          </h2>
          <p className="text-zinc-600 font-light dark:text-zinc-400">{t('history:empty.description')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-px bg-zinc-200 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-800">
          {entries.map((entry) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 dark:bg-zinc-950"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    {t('history:item.savedAt')}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">{fmt.format(entry.createdAt)}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                    {entry.language.toUpperCase()}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-600 border border-zinc-200 px-2 py-0.5 dark:text-zinc-400 dark:border-zinc-800">
                    {t('history:item.questionCount', { count: entry.quizLength })}
                  </span>
                  {entry.advisorReport && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-emerald-700 border border-emerald-200 px-2 py-0.5 dark:text-emerald-400 dark:border-emerald-900/60">
                      <Sparkles className="w-2.5 h-2.5" /> {t('history:item.hasAiReport')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.topThemes.slice(0, 3).map((theme, idx) => (
                    <span
                      key={theme.name}
                      className="text-xs px-3 py-1 border border-zinc-200 text-zinc-700 font-serif italic dark:border-zinc-800 dark:text-zinc-300"
                    >
                      <span className="text-zinc-400 font-sans not-italic mr-2 dark:text-zinc-600">0{idx + 1}</span>
                      {themeName(theme.name)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onOpenEntry(entry.id)}
                  className="inline-flex items-center gap-2 border border-zinc-900 px-4 py-2 min-h-[44px] text-[10px] uppercase tracking-[0.2em] text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  <Eye className="w-3 h-3" />
                  {t('history:actions.view')}
                </button>
                <button
                  onClick={() => setPendingDelete(entry.id)}
                  className="inline-flex items-center justify-center gap-2 border border-zinc-200 px-4 py-2 min-h-[44px] min-w-[44px] text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:border-rose-400 hover:text-rose-600 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-700 dark:hover:text-rose-400"
                  aria-label={t('history:actions.delete')}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('history:confirm.deleteTitle')}
        description={t('history:confirm.deleteDescription')}
        onConfirm={doDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmDialog
        open={confirmClearAll}
        title={t('history:confirm.clearAllTitle')}
        description={t('history:confirm.clearAllDescription')}
        onConfirm={doClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}
