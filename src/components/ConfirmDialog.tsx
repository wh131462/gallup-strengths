import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  const { t } = useTranslation('history');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6"
      onClick={onCancel}
    >
      <div
        className="w-[95vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 p-6 sm:p-8 dark:bg-zinc-950 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-9 h-9 shrink-0 border border-zinc-300 flex items-center justify-center text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif italic text-zinc-900 dark:text-white mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-zinc-600 font-light leading-relaxed dark:text-zinc-400">{description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-zinc-200 text-zinc-700 py-3 min-h-[44px] text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {cancelLabel ?? t('confirm.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={
              destructive
                ? 'flex-1 border border-rose-600 bg-rose-600 text-white py-3 min-h-[44px] text-[10px] uppercase tracking-[0.2em] hover:bg-rose-700 transition-colors'
                : 'flex-1 border border-zinc-900 bg-zinc-900 text-white py-3 min-h-[44px] text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200'
            }
          >
            {confirmLabel ?? t('confirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
