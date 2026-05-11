import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

interface Props {
  variant?: 'compact' | 'full';
}

export default function LanguageSwitcher({ variant = 'full' }: Props) {
  const { i18n, t } = useTranslation('common');
  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLanguage)
    : 'zh';

  const labelFor = (lng: SupportedLanguage) =>
    lng === 'en' ? t('languageEnglish') : t('languageChinese');

  if (variant === 'compact') {
    const next: SupportedLanguage = current === 'en' ? 'zh' : 'en';
    return (
      <button
        onClick={() => i18n.changeLanguage(next)}
        title={t('language')}
        className="flex items-center gap-2 text-[10px] font-bold px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-none transition-colors border border-zinc-200 uppercase tracking-widest dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
      >
        <Languages className="w-3 h-3" />
        {labelFor(current)}
      </button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          onClick={() => i18n.changeLanguage(lng)}
          className={`px-4 py-3 border text-xs text-left transition-colors ${
            current === lng
              ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-white dark:bg-zinc-900 dark:text-white'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          <div className="font-bold uppercase tracking-widest text-[10px]">{lng}</div>
          <div className="text-[10px] text-zinc-500 mt-1">{labelFor(lng)}</div>
        </button>
      ))}
    </div>
  );
}
