import { useEffect, useRef, useState } from 'react';
import { X, Save, Trash2, KeyRound, RefreshCw, Plug, Check, AlertCircle, Loader2, ChevronDown, Sparkles, ExternalLink, Plus, ArrowLeft, Pencil, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AIConfig,
  AIConfigProfile,
  AIProvider,
  ANTHROPIC_MODEL_CANDIDATES,
  ConnectivityResult,
  GLM_FREE_PRESET,
  PROVIDER_PRESETS,
  addProfile,
  fetchOpenAIModels,
  generateProfileName,
  loadAIConfigStore,
  removeProfile,
  setActiveId,
  testConnectivity,
  updateProfile,
} from '../services/aiConfig';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (config: AIConfig) => void;
}

type TestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; result: Extract<ConnectivityResult, { ok: false }> };

type ViewMode = 'list' | 'edit';

const MAX_PROFILES = 10;

export default function SettingsModal({ open, onClose, onSaved }: Props) {
  const { t } = useTranslation('settings');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [profiles, setProfiles] = useState<AIConfigProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [profileName, setProfileName] = useState('');
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [baseUrl, setBaseUrl] = useState(PROVIDER_PRESETS.openai.baseUrl);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDER_PRESETS.openai.model);
  const [showKey, setShowKey] = useState(false);

  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [testState, setTestState] = useState<TestState>({ status: 'idle' });

  const modelLoadAbortRef = useRef<AbortController | null>(null);
  const testAbortRef = useRef<AbortController | null>(null);
  const modelDropdownRef = useRef<HTMLDivElement | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const refreshProfiles = () => {
    const store = loadAIConfigStore();
    setProfiles(store.profiles);
    setActiveProfileId(store.activeId);
  };

  useEffect(() => {
    if (!open) return;
    refreshProfiles();
    setViewMode('list');
    setTestState({ status: 'idle' });
    setModelLoadError(false);
    setDeleteConfirmId(null);
  }, [open]);

  useEffect(() => {
    return () => {
      modelLoadAbortRef.current?.abort();
      testAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!modelDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [modelDropdownOpen]);

  if (!open) return null;

  const enterEditMode = (profile?: AIConfigProfile) => {
    if (profile) {
      setEditingId(profile.id);
      setProfileName(profile.name);
      setProvider(profile.provider);
      setBaseUrl(profile.baseUrl);
      setApiKey(profile.apiKey);
      setModel(profile.model);
      if (profile.provider === 'anthropic') {
        setModelOptions(ANTHROPIC_MODEL_CANDIDATES);
      } else {
        setModelOptions([]);
      }
    } else {
      setEditingId(null);
      setProfileName('');
      setProvider('openai');
      setBaseUrl(PROVIDER_PRESETS.openai.baseUrl);
      setApiKey('');
      setModel(PROVIDER_PRESETS.openai.model);
      setModelOptions([]);
    }
    setShowKey(false);
    setTestState({ status: 'idle' });
    setModelLoadError(false);
    setViewMode('edit');
  };

  // CHUNK_2_PLACEHOLDER

  const loadModels = async (p: AIProvider, url: string, key: string) => {
    if (p === 'anthropic') {
      setModelOptions(ANTHROPIC_MODEL_CANDIDATES);
      setModelLoadError(false);
      return;
    }
    if (!url.trim() || !key.trim()) return;
    modelLoadAbortRef.current?.abort();
    const controller = new AbortController();
    modelLoadAbortRef.current = controller;
    setLoadingModels(true);
    setModelLoadError(false);
    try {
      const ids = await fetchOpenAIModels(url.trim(), key.trim(), controller.signal);
      if (controller.signal.aborted) return;
      setModelOptions(ids);
      setModelLoadError(ids.length === 0);
    } catch {
      if (controller.signal.aborted) return;
      setModelLoadError(true);
      setModelOptions([]);
    } finally {
      if (!controller.signal.aborted) setLoadingModels(false);
    }
  };

  const handleProviderChange = (p: AIProvider) => {
    setProvider(p);
    const preset = PROVIDER_PRESETS[p];
    let nextBase = baseUrl;
    let nextModel = model;
    if (!baseUrl || baseUrl === PROVIDER_PRESETS.openai.baseUrl || baseUrl === PROVIDER_PRESETS.anthropic.baseUrl) {
      nextBase = preset.baseUrl;
      setBaseUrl(nextBase);
    }
    if (!model || model === PROVIDER_PRESETS.openai.model || model === PROVIDER_PRESETS.anthropic.model) {
      nextModel = preset.model;
      setModel(nextModel);
    }
    setTestState({ status: 'idle' });
    if (p === 'anthropic') {
      setModelOptions(ANTHROPIC_MODEL_CANDIDATES);
      setModelLoadError(false);
    } else {
      setModelOptions([]);
      void loadModels(p, nextBase, apiKey);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim() || !baseUrl.trim() || !model.trim()) return;
    testAbortRef.current?.abort();
    const controller = new AbortController();
    testAbortRef.current = controller;
    setTestState({ status: 'loading' });
    const result = await testConnectivity(
      { provider, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model: model.trim() },
      controller.signal,
    );
    if (controller.signal.aborted) return;
    if (result.ok) setTestState({ status: 'success' });
    else setTestState({ status: 'error', result: result as Extract<ConnectivityResult, { ok: false }> });
  };

  // CHUNK_3_PLACEHOLDER

  const handleSave = () => {
    if (!apiKey.trim() || !baseUrl.trim() || !model.trim()) return;
    const name = profileName.trim() || generateProfileName(provider, model.trim());
    if (editingId) {
      updateProfile(editingId, { name, provider, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model: model.trim() });
    } else {
      addProfile({ name, provider, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model: model.trim() });
    }
    refreshProfiles();
    const store = loadAIConfigStore();
    const active = store.profiles.find((p) => p.id === store.activeId);
    if (active) onSaved?.({ provider: active.provider, baseUrl: active.baseUrl, apiKey: active.apiKey, model: active.model });
    setViewMode('list');
  };

  const handleSetActive = (id: string) => {
    setActiveId(id);
    refreshProfiles();
    const store = loadAIConfigStore();
    const active = store.profiles.find((p) => p.id === store.activeId);
    if (active) onSaved?.({ provider: active.provider, baseUrl: active.baseUrl, apiKey: active.apiKey, model: active.model });
  };

  const handleDelete = (id: string) => {
    removeProfile(id);
    refreshProfiles();
    setDeleteConfirmId(null);
  };

  const handleApplyGlmPreset = () => {
    setEditingId(null);
    setProfileName('');
    setProvider('openai');
    setBaseUrl(GLM_FREE_PRESET.baseUrl);
    setModel(GLM_FREE_PRESET.model);
    setApiKey('');
    setModelOptions([]);
    setTestState({ status: 'idle' });
    setModelLoadError(false);
    setShowKey(false);
    setViewMode('edit');
  };

  const canTest = !!apiKey.trim() && !!baseUrl.trim() && !!model.trim() && testState.status !== 'loading';

  const errorLabelKey = (kind: Extract<ConnectivityResult, { ok: false }>['kind']) => {
    switch (kind) {
      case 'auth': return 'testFailedAuth';
      case 'notFound': return 'testFailedNotFound';
      case 'network': return 'testFailedNetwork';
      case 'timeout': return 'testFailedTimeout';
      default: return 'testFailedOther';
    }
  };

  // CHUNK_RENDER_PLACEHOLDER

  const renderListView = () => (
    <>
      <div className="p-5 sm:p-8 space-y-6 text-sm">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">{t('language')}</label>
          <LanguageSwitcher />
          <p className="text-[10px] text-zinc-500 mt-2 dark:text-zinc-600">{t('languageHint')}</p>
        </div>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">{t('description')}</p>

        {profiles.length === 0 && (
          <div className="border border-amber-400/60 bg-amber-50/60 px-4 py-4 dark:border-amber-500/40 dark:bg-amber-500/5">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-amber-700 font-bold mb-2 dark:text-amber-400">
              <Sparkles className="w-3 h-3" />
              {t('glmBannerTitle')}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800/90 mb-3 dark:text-amber-300/90">
              {t('glmBannerBody')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={handleApplyGlmPreset} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-amber-700 transition-colors dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400">
                <Sparkles className="w-3 h-3" />
                {t('glmBannerApply')}
              </button>
              <a href={GLM_FREE_PRESET.signupUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-amber-600/60 text-amber-700 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-amber-100 transition-colors dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10">
                <ExternalLink className="w-3 h-3" />
                {t('glmBannerGetKey')}
              </a>
            </div>
          </div>
        )}

        {profiles.length > 0 ? (
          <div className="space-y-2">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => { if (!isActive) handleSetActive(p.id); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isActive) { e.preventDefault(); handleSetActive(p.id); } }}
                  className={`border px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                    isActive
                      ? 'border-zinc-900 bg-zinc-50 cursor-default dark:border-white dark:bg-zinc-900'
                      : 'border-zinc-200 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isActive && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      <span className="text-xs font-medium truncate">{p.name}</span>
                      {isActive && (
                        <span className="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-500">{t('activeLabel')}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 truncate dark:text-zinc-600">{p.provider.toUpperCase()} &middot; {p.model}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); enterEditMode(p); }}
                      title={t('editProfile') as string}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors dark:hover:text-white"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === p.id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="px-2 py-1 text-[10px] uppercase tracking-widest text-rose-600 border border-rose-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/30"
                      >
                        {t('deleteConfirm')}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }}
                        title={t('deleteProfile') as string}
                        className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-zinc-400 text-center py-4 dark:text-zinc-600">{t('noProfiles')}</p>
        )}
      </div>
      <div className="flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <button onClick={onClose} className="px-5 py-2.5 min-h-[44px] border border-zinc-200 text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900">{t('cancel')}</button>
        <button onClick={() => enterEditMode()} disabled={profiles.length >= MAX_PROFILES} className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <Plus className="w-3 h-3" />
          {profiles.length >= MAX_PROFILES ? t('maxProfilesReached', { max: MAX_PROFILES }) : t('addProfile')}
        </button>
      </div>
    </>
  );

  // CHUNK_EDITVIEW_PLACEHOLDER

  const renderEditView = () => (
    <>
      <div className="p-5 sm:p-8 space-y-6 text-sm">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{t('profileName')}</label>
          <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder={t('profileNamePlaceholder') as string} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-white" />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">{t('apiStyle')}</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROVIDER_PRESETS) as AIProvider[]).map((p) => (
              <button key={p} onClick={() => handleProviderChange(p)} className={`px-4 py-3 border text-xs text-left transition-colors ${provider === p ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-white dark:bg-zinc-900 dark:text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600'}`}>
                <div className="font-bold uppercase tracking-widest text-[10px] mb-1">{p}</div>
                <div className="text-[10px] text-zinc-500 leading-snug">{t(`providerLabels.${p}` as any)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{t('baseUrl')}</label>
          <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} onBlur={() => { if (provider === 'openai') void loadModels(provider, baseUrl, apiKey); }} placeholder={PROVIDER_PRESETS[provider].baseUrl} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-white" />
          <p className="text-[10px] text-zinc-500 mt-2 dark:text-zinc-600">{provider === 'openai' ? t('baseUrlHintOpenAI') : t('baseUrlHintAnthropic')}</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500">{t('apiKey')}</label>
            <button onClick={() => setShowKey((v) => !v)} className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">{showKey ? t('hide') : t('show')}</button>
          </div>
          <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} onBlur={() => { if (provider === 'openai') void loadModels(provider, baseUrl, apiKey); }} placeholder="sk-..." className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-white" />
        </div>

        {/* EDITVIEW_MODEL_PLACEHOLDER */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500">{t('model')}</label>
            {provider === 'openai' && (
              <button onClick={() => void loadModels(provider, baseUrl, apiKey)} disabled={loadingModels || !baseUrl.trim() || !apiKey.trim()} title={t('refreshModels') as string} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:text-white">
                {loadingModels ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {t('refreshModels')}
              </button>
            )}
          </div>
          <div ref={modelDropdownRef} className="relative">
            <input type="text" value={model} onChange={(e) => { setModel(e.target.value); setModelDropdownOpen(true); }} onFocus={() => setModelDropdownOpen(true)} placeholder={PROVIDER_PRESETS[provider].model} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 pr-10 text-sm focus:border-zinc-900 focus:outline-none font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-white" />
            <button type="button" onClick={() => setModelDropdownOpen((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" tabIndex={-1}>
              <ChevronDown className={`w-4 h-4 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {modelDropdownOpen && (() => {
              const filtered = modelOptions.filter((id) => model.trim() === '' ? true : id.toLowerCase().includes(model.toLowerCase()));
              if (filtered.length === 0) return null;
              return (
                <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-zinc-200 shadow-lg dark:bg-zinc-950 dark:border-zinc-800">
                  {filtered.map((id) => (
                    <li key={id}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setModel(id); setModelDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-mono transition-colors ${id === model ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white' : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900'}`}>{id}</button>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
          {provider === 'openai' && modelLoadError && !loadingModels && (
            <p className="text-[10px] text-amber-600 mt-2 dark:text-amber-500">{t('modelListUnavailable')}</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <button onClick={handleTest} disabled={!canTest} className="flex items-center gap-2 px-4 py-2 border border-zinc-300 text-[10px] uppercase tracking-[0.2em] text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
              {testState.status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plug className="w-3 h-3" />}
              {testState.status === 'loading' ? t('testing') : t('testConnection')}
            </button>
            {testState.status === 'success' && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-500"><Check className="w-3 h-3" />{t('testSuccess')}</span>
            )}
            {testState.status === 'error' && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-500"><AlertCircle className="w-3 h-3" />{t(errorLabelKey(testState.result.kind))}</span>
            )}
          </div>
          {testState.status === 'error' && testState.result.message && (
            <details className="mt-2">
              <summary className="text-[10px] uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-white">{t('testErrorDetails')}</summary>
              <pre className="mt-2 p-2 text-[10px] font-mono bg-zinc-50 border border-zinc-200 text-zinc-700 whitespace-pre-wrap break-all max-h-32 overflow-auto dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">{testState.result.message}</pre>
            </details>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 sm:px-8 py-4 sm:py-5 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <button onClick={() => setViewMode('list')} className="flex items-center gap-2 min-h-[44px] text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          <ArrowLeft className="w-3 h-3" />
          {t('backToList')}
        </button>
        <button onClick={handleSave} disabled={!apiKey.trim() || !baseUrl.trim() || !model.trim()} className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <Save className="w-3 h-3" />
          {t('saveConfig')}
        </button>
      </div>
    </>
  );

  // CHUNK_RETURN_PLACEHOLDER

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 dark:bg-black/70">
      <div className="w-[95vw] sm:w-full max-w-xl bg-white border border-zinc-200 text-zinc-700 max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200">
        <div className="sticky top-0 z-10 flex justify-between items-center px-5 sm:px-8 py-4 sm:py-6 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            {viewMode === 'edit' && (
              <button onClick={() => setViewMode('list')} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <KeyRound className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm uppercase tracking-[0.3em] font-light">{t('title')}</h2>
          </div>
          <button onClick={onClose} aria-label={t('cancel') as string} className="flex items-center justify-center min-h-[44px] min-w-[44px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {viewMode === 'list' ? renderListView() : renderEditView()}
      </div>
    </div>
  );
}