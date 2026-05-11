import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Download, RefreshCw, KeyRound, BookOpen, Save, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { QUESTIONS, STRENGTH_THEMES } from '../constants';
import { QUESTION_BANK_VERSION } from '../data/questionBank';
import { StrengthTheme, StrengthDomain, HistoryEntry, DomainScoreSnapshot } from '../types';
import { analyzeStrengths, AIConfigError } from '../services/aiService';
import SettingsModal from './SettingsModal';
import MarkdownRenderer from './MarkdownRenderer';
import ReportReaderModal from './ReportReaderModal';
import { truncateMarkdown } from './markdown/truncateMarkdown';
import { generateId, saveEntry, updateEntry } from '../services/historyStorage';
import { loadAIConfig } from '../services/aiConfig';
import { downloadReportMarkdown } from '../services/reportExport';

interface Props {
  answers: Record<string, number>;
  onRestart: () => void;
  readonly?: boolean;
  entry?: HistoryEntry;
  onBackToHistory?: () => void;
  /**
   * Number of questions actually presented in this run. Falls back to the
   * size of `answers` (legacy/history detail) so existing callers keep
   * working without passing it explicitly.
   */
  quizLength?: number;
}

export default function ResultsPage({ answers, onRestart, readonly = false, entry, onBackToHistory, quizLength }: Props) {
  const { t, i18n } = useTranslation(['results', 'strengths', 'common', 'history']);
  const [topThemes, setTopThemes] = useState<StrengthTheme[]>([]);
  const [domainScores, setDomainScores] = useState<DomainScoreSnapshot[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(!readonly);
  const [reportError, setReportError] = useState<string | null>(null);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedThemes, setSavedThemes] = useState<StrengthTheme[]>([]);
  const [readerOpen, setReaderOpen] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(entry?.id ?? null);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const didInitRef = useRef(false);

  const displayLanguage = entry?.language ?? i18n.language;
  // The history detail view passes an `entry` with quizLength; the live run
  // passes it via the `quizLength` prop. Fall back to the answer count for
  // any caller that hasn't been updated yet (or a legacy entry).
  const effectiveQuizLength =
    entry?.quizLength ?? quizLength ?? Object.keys(answers).length;

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (readonly && entry) {
      setTopThemes(entry.topThemes);
      setDomainScores(entry.domainScores);
      setSavedThemes(entry.topThemes);
      if (entry.advisorReport) setAiReport(entry.advisorReport.markdown);
      setLoadingReport(false);
      return;
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#e11d48', '#059669', '#ea580c'],
    });
    void calculateResults();
  }, []);

  const calculateResults = async () => {
    const themeWeights: Record<string, number> = {};
    const domainWeights: Record<StrengthDomain, number> = {
      Executing: 0,
      Influencing: 0,
      'Relationship Building': 0,
      'Strategic Thinking': 0,
    };
    const domainMax: Record<StrengthDomain, number> = {
      Executing: 0,
      Influencing: 0,
      'Relationship Building': 0,
      'Strategic Thinking': 0,
    };

    STRENGTH_THEMES.forEach((tm) => (themeWeights[tm.name] = 0));

    // Compute domainMax based ONLY on the questions actually answered so
    // that short-quiz results scale proportionally instead of looking
    // artificially tiny against the full bank's denominator.
    const answeredIds = new Set(Object.keys(answers));
    const answeredQuestions = QUESTIONS.filter((q) => answeredIds.has(q.id));
    const baselineQuestions = answeredQuestions.length > 0 ? answeredQuestions : QUESTIONS;
    baselineQuestions.forEach((q) => {
      domainMax[q.domainA] += 3;
      domainMax[q.domainB] += 3;
    });

    Object.entries(answers).forEach(([qId, value]) => {
      const question = QUESTIONS.find((q) => q.id === qId);
      if (!question) return;

      const intensity = Math.abs(value);
      if (value < 0) {
        domainWeights[question.domainA] += intensity;
        question.themesA.forEach((tName) => (themeWeights[tName] += intensity * 2));
      } else if (value > 0) {
        domainWeights[question.domainB] += intensity;
        question.themesB.forEach((tName) => (themeWeights[tName] += intensity * 2));
      } else {
        domainWeights[question.domainA] += 0.5;
        domainWeights[question.domainB] += 0.5;
      }
    });

    STRENGTH_THEMES.forEach((tm) => {
      themeWeights[tm.name] += Math.random() * 0.1;
    });

    const sortedThemes = [...STRENGTH_THEMES]
      .sort((a, b) => themeWeights[b.name] - themeWeights[a.name])
      .slice(0, 5);

    setTopThemes(sortedThemes);
    setSavedThemes(sortedThemes);

    const domainsData: DomainScoreSnapshot[] = (
      ['Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'] as StrengthDomain[]
    ).map((domain) => ({
      domain,
      value: domainWeights[domain],
      full: domainMax[domain],
    }));
    setDomainScores(domainsData);

    if (!readonly) {
      const now = Date.now();
      const newEntry: HistoryEntry = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        language: i18n.language,
        answers,
        topThemes: sortedThemes,
        domainScores: domainsData,
        quizLength: effectiveQuizLength,
        questionBankVersion: QUESTION_BANK_VERSION,
      };
      try {
        saveEntry(newEntry);
        setEntryId(newEntry.id);
      } catch (err) {
        console.warn('[results] auto-save failed', err);
      }
    }

    await runAnalysis(sortedThemes);
  };

  const runAnalysis = async (themes: StrengthTheme[]) => {
    setLoadingReport(true);
    setReportError(null);
    setNeedsConfig(false);
    try {
      const report = await analyzeStrengths(themes, displayLanguage);
      setAiReport(report);
      if (entryId) {
        const cfg = loadAIConfig();
        updateEntry(entryId, {
          advisorReport: {
            markdown: report,
            model: cfg?.model,
            generatedAt: Date.now(),
          },
        });
      }
    } catch (err) {
      if (err instanceof AIConfigError) {
        setNeedsConfig(true);
      } else {
        setReportError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSaveSnapshot = () => {
    if (readonly || topThemes.length === 0) return;
    const now = Date.now();
    const snapshot: HistoryEntry = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      language: i18n.language,
      answers,
      topThemes,
      domainScores,
      quizLength: effectiveQuizLength,
      questionBankVersion: QUESTION_BANK_VERSION,
      advisorReport: aiReport
        ? { markdown: aiReport, generatedAt: now, model: loadAIConfig()?.model }
        : undefined,
    };
    try {
      saveEntry(snapshot);
      setSnapshotFlash(true);
      setTimeout(() => setSnapshotFlash(false), 1500);
    } catch (err) {
      console.warn('[results] snapshot save failed', err);
    }
  };

  const handleExport = () => {
    const reportModel = entry?.advisorReport?.model ?? loadAIConfig()?.model;
    const reportGeneratedAt = entry?.advisorReport?.generatedAt;
    downloadReportMarkdown({
      topThemes,
      domainScores,
      aiReport,
      language: displayLanguage,
      model: reportModel,
      generatedAt: reportGeneratedAt,
      t,
    });
  };

  const themeName = (name: string) =>
    i18n.getFixedT(displayLanguage, 'strengths')(`themes.${name}.name` as any);
  const themeDesc = (name: string) =>
    i18n.getFixedT(displayLanguage, 'strengths')(`themes.${name}.description` as any);

  const dateLocale = displayLanguage.startsWith('en') ? 'en-US' : 'zh-CN';
  const timestampDate = entry ? new Date(entry.createdAt) : new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-16">
      {readonly && onBackToHistory && (
        <button
          onClick={onBackToHistory}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 mb-8 dark:hover:text-white"
        >
          <ChevronLeft className="w-3 h-3" />
          {t('history:actions.backToHistory')}
        </button>
      )}

      <header className="flex flex-col md:flex-row justify-between md:items-end items-start gap-6 md:gap-0 px-0 pt-6 sm:pt-10 pb-8 sm:pb-12 border-b border-zinc-200 mb-10 sm:mb-16 dark:border-zinc-800">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-500 mb-3 ml-1 flex flex-wrap items-center gap-2 sm:gap-3">
            {t('results:dashboardLabel')}
            {readonly && (
              <span className="text-zinc-400 border border-zinc-300 px-2 py-0.5 text-[9px] dark:border-zinc-700 dark:text-zinc-500">
                {t('history:badge.readonly')}
              </span>
            )}
            <span className="text-zinc-500 border border-zinc-300 px-2 py-0.5 text-[9px] dark:border-zinc-700 dark:text-zinc-500">
              {t('results:basedOn', { count: effectiveQuizLength })}
            </span>
          </p>
          <h1 className="text-3xl sm:text-5xl font-light italic font-serif tracking-tight text-zinc-900 dark:text-white">
            {t('results:titlePart1')} <span className="text-zinc-400 font-sans not-italic text-xl sm:text-3xl mx-3 sm:mx-6 dark:text-zinc-600">/</span> {t('results:titlePart2')}
          </h1>
          {effectiveQuizLength > 0 && effectiveQuizLength < 60 && (
            <p className="mt-3 text-xs text-zinc-500 italic dark:text-zinc-500">
              {t('results:shortQuizNotice')}
            </p>
          )}
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2">{t('results:timestamp')}</p>
          <p className="text-base sm:text-xl font-mono text-zinc-700 dark:text-zinc-300">{timestampDate.toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row overflow-hidden border border-zinc-200 mb-12 sm:mb-16 dark:border-zinc-800">
        {/* Left Column: Top Strengths */}
        <div className="lg:w-3/5 p-6 sm:p-10 md:p-12 bg-white flex flex-col gap-8 sm:gap-12 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
          <div className="relative">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-6 sm:mb-8 border-l border-zinc-300 pl-4 dark:border-zinc-700">{t('results:signatureTheme')}</p>
            {topThemes[0] && (
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-10">
                <div className="text-5xl sm:text-7xl md:text-9xl font-serif italic text-zinc-200 leading-none select-none dark:text-zinc-800">01</div>
                <div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif mb-4 sm:mb-6 text-zinc-900 uppercase tracking-tighter leading-tight dark:text-white">
                    {themeName(topThemes[0].name)}
                  </h2>
                  <p className="text-zinc-600 text-base sm:text-xl leading-relaxed max-w-sm font-light italic dark:text-zinc-400">
                    {themeDesc(topThemes[0].name)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden dark:bg-zinc-800 dark:border-zinc-800">
            {topThemes.slice(1).map((theme, index) => (
              <div key={theme.name} className="p-6 sm:p-8 bg-white hover:bg-zinc-50 transition-colors group dark:bg-zinc-950 dark:hover:bg-zinc-900/50">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 dark:text-zinc-600">{t('results:themePrefix')}0{index + 2}</p>
                <div className="flex justify-between items-center mb-4 gap-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-zinc-700 group-hover:text-zinc-900 transition-colors dark:text-zinc-200 dark:group-hover:text-white">{themeName(theme.name)}</h3>
                  <div className="mt-2 h-0.5 w-10 shrink-0" style={{ backgroundColor: theme.domain === 'Executing' ? '#f43f5e33' : theme.domain === 'Influencing' ? '#f9731633' : theme.domain === 'Relationship Building' ? '#10b98133' : '#3b82f633' }}>
                    <div className="h-full w-4" style={{ backgroundColor: theme.domain === 'Executing' ? '#f43f5e' : theme.domain === 'Influencing' ? '#f97316' : theme.domain === 'Relationship Building' ? '#10b981' : '#3b82f6' }}></div>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed font-light">{themeDesc(theme.name)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:w-2/5 p-6 sm:p-10 md:p-12 bg-zinc-50 flex flex-col dark:bg-zinc-900/30">
          <div className="mb-10 sm:mb-16">
            <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-8 sm:mb-12 flex items-center justify-between">
              {t('results:domainsBalance')}
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                ))}
              </div>
            </h3>

            <div className="space-y-8 sm:space-y-12">
              {domainScores.map((ds) => (
                <div key={ds.domain} className="relative">
                  <div className="flex justify-between text-[10px] mb-3 sm:mb-4 uppercase tracking-[0.2em] font-bold gap-2">
                    <span className="text-zinc-600 dark:text-zinc-400 truncate">{t(`common:domains.${ds.domain}` as any)}</span>
                    <span className="text-zinc-500 font-mono dark:text-zinc-600 shrink-0">{ds.full > 0 ? Math.round((ds.value / ds.full) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ds.full > 0 ? (ds.value / ds.full) * 100 : 0}%` }}
                      className="h-px bg-zinc-900/80 shadow-[0_0_8px_rgba(0,0,0,0.15)] dark:bg-white/60 dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-6 sm:p-10 bg-white border border-zinc-200 relative group overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity dark:opacity-5 dark:group-hover:opacity-10">
              <Sparkles className="w-16 h-16" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-6 italic border-b border-zinc-200 pb-4 dark:border-zinc-800">{t('results:advisorPerspective')}</p>

            {loadingReport ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-full bg-zinc-200 rounded dark:bg-zinc-800" />
                <div className="h-4 w-5/6 bg-zinc-200 rounded dark:bg-zinc-800" />
                <div className="h-4 w-3/4 bg-zinc-200 rounded dark:bg-zinc-800" />
              </div>
            ) : needsConfig ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-zinc-600 text-sm font-light leading-relaxed dark:text-zinc-400">
                  <KeyRound className="w-4 h-4 mt-1 shrink-0" />
                  <span>{t('results:needsConfig')}</span>
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="w-full border border-zinc-900 text-zinc-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  {t('results:openSettings')}
                </button>
              </div>
            ) : reportError ? (
              <div className="space-y-4">
                <div className="text-rose-500 text-xs font-mono leading-relaxed break-words dark:text-rose-400">{reportError}</div>
                <button
                  onClick={() => runAnalysis(savedThemes)}
                  className="w-full border border-zinc-300 text-zinc-700 py-3 text-[10px] uppercase tracking-[0.2em] hover:border-zinc-900 hover:text-zinc-900 transition-all dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                >
                  {t('common:retry')}
                </button>
              </div>
            ) : aiReport ? (
              <div className="space-y-6">
                <MarkdownRenderer variant="card">{truncateMarkdown(aiReport, 300)}</MarkdownRenderer>
                <button
                  onClick={() => setReaderOpen(true)}
                  className="w-full border border-zinc-900 text-zinc-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  <BookOpen className="w-3 h-3" />
                  {t('results:openReader')}
                </button>
              </div>
            ) : readonly ? (
              <div className="space-y-4">
                <p className="text-zinc-500 text-sm font-light italic dark:text-zinc-500">
                  {t('history:item.noAiReport')}
                </p>
                <button
                  onClick={() => runAnalysis(savedThemes)}
                  className="w-full border border-zinc-900 text-zinc-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  {t('history:actions.regenerate')}
                </button>
              </div>
            ) : null}

            <div className="mt-8 sm:mt-10 flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="w-full sm:flex-1 sm:min-w-[140px] min-h-[44px] border border-zinc-200 bg-zinc-50 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-white dark:hover:text-black"
              >
                <Download className="w-3 h-3" />
                {t('results:export')}
              </button>
              {readonly ? (
                <button
                  onClick={onBackToHistory ?? onRestart}
                  className="w-full sm:flex-1 sm:min-w-[140px] min-h-[44px] border border-zinc-900 text-zinc-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-300 flex items-center justify-center gap-2 dark:border-white dark:text-white dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-3 h-3" />
                  {t('history:actions.backToHistory')}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveSnapshot}
                    className="w-full sm:flex-1 sm:min-w-[140px] min-h-[44px] border border-zinc-200 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 dark:border-zinc-800 dark:hover:bg-white dark:hover:text-black"
                  >
                    <Save className="w-3 h-3" />
                    {snapshotFlash ? t('history:actions.snapshotSaved') : t('history:actions.saveSnapshot')}
                  </button>
                  <button
                    onClick={onRestart}
                    className="w-full sm:flex-1 sm:min-w-[140px] min-h-[44px] border border-zinc-900 text-zinc-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-300 flex items-center justify-center gap-2 dark:border-white dark:text-white dark:hover:bg-zinc-800"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('results:restart')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full AI Report Body */}
      {!loadingReport && aiReport && !needsConfig && !reportError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 sm:p-8 md:p-20 border border-zinc-200 bg-white relative overflow-hidden mb-16 sm:mb-24 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="max-w-4xl mx-auto prose prose-sm sm:prose-base prose-headings:font-serif prose-headings:italic prose-headings:font-light prose-headings:tracking-tight prose-p:text-zinc-600 prose-p:font-light prose-p:leading-loose dark:prose-invert dark:prose-p:text-zinc-400">
            <h2 className="text-2xl sm:text-4xl text-zinc-900 mb-8 sm:mb-12 border-b border-zinc-200 pb-6 sm:pb-8 flex items-center gap-3 sm:gap-4 dark:text-white dark:border-zinc-800">
              <span className="text-zinc-300 text-4xl sm:text-6xl not-italic font-serif dark:text-zinc-700">/</span> {t('results:fullReport')}
            </h2>
            <MarkdownRenderer variant="reader">{aiReport}</MarkdownRenderer>
          </div>
        </motion.div>
      )}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => savedThemes.length && runAnalysis(savedThemes)}
      />

      <ReportReaderModal
        open={readerOpen && !!aiReport && !needsConfig && !reportError && !loadingReport}
        report={aiReport ?? ''}
        onClose={() => setReaderOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
