import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Download, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  open: boolean;
  report: string;
  onClose: () => void;
  onExport: () => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function ReportReaderModal({ open, report, onClose, onExport, onRegenerate, regenerating = false }: Props) {
  const { t } = useTranslation(['results', 'common']);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 print:hidden dark:bg-black/80"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative flex flex-col w-[95vw] sm:w-full max-w-3xl max-h-[90vh] bg-white border border-zinc-200 shadow-2xl dark:bg-zinc-950 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center px-5 sm:px-8 py-4 sm:py-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2
                id={titleId}
                className="text-sm uppercase tracking-[0.3em] font-light text-zinc-900 dark:text-white"
              >
                {t('results:readerTitle')}
              </h2>
              <button
                onClick={onClose}
                aria-label={t('results:closeReader') as string}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              <div className="mx-auto max-w-[640px]">
                <MarkdownRenderer variant="reader">{report}</MarkdownRenderer>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 sm:px-8 py-4 sm:py-5 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onExport}
                  className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] border border-zinc-300 text-[10px] uppercase tracking-[0.2em] text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  <Download className="w-3 h-3" />
                  {t('results:export')}
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    disabled={regenerating}
                    className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] border border-zinc-300 text-[10px] uppercase tracking-[0.2em] text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                    {regenerating ? t('common:regenerating') : t('common:regenerate')}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 min-h-[44px] border border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {t('results:closeReader')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
