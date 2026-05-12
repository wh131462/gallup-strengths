export type AIProvider = 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AIConfigProfile extends AIConfig {
  id: string;
  name: string;
  createdAt: number;
}

export interface AIConfigStore {
  profiles: AIConfigProfile[];
  activeId: string | null;
}

export const GLM_FREE_PRESET = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash',
  signupUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
} as const;

const STORAGE_KEY = 'gallup-strengths.ai-config';
const STORE_KEY = 'gallup-strengths.ai-config-profiles';
const MAX_PROFILES = 10;
const REQUEST_TIMEOUT_MS = 10_000;

export const PROVIDER_PRESETS: Record<AIProvider, { baseUrl: string; model: string; label: string }> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    label: 'OpenAI 兼容 (OpenAI / DeepSeek / 通义 / Moonshot / Ollama / Gemini OpenAI 端点 ...)',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-latest',
    label: 'Anthropic (Claude)',
  },
};

export const ANTHROPIC_MODEL_CANDIDATES: string[] = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
  'claude-3-opus-latest',
];

export type ConnectivityErrorKind = 'auth' | 'notFound' | 'network' | 'timeout' | 'other';

export type ConnectivityResult =
  | { ok: true }
  | { ok: false; kind: ConnectivityErrorKind; message: string };

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function classifyHttpStatus(status: number): ConnectivityErrorKind {
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'notFound';
  return 'other';
}

function classifyFetchError(err: unknown): { kind: ConnectivityErrorKind; message: string } {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { kind: 'timeout', message: 'Request timed out' };
  }
  if (err instanceof TypeError) {
    return { kind: 'network', message: err.message || 'Network error' };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { kind: 'other', message };
}

function withTimeout(externalSignal?: AbortSignal): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onAbort);
  }
  return {
    signal: controller.signal,
    cancel: () => {
      clearTimeout(timer);
      if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
    },
  };
}

export async function fetchOpenAIModels(
  baseUrl: string,
  apiKey: string,
  externalSignal?: AbortSignal,
): Promise<string[]> {
  const { signal, cancel } = withTimeout(externalSignal);
  try {
    const res = await fetch(`${trimBaseUrl(baseUrl)}/models`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    return list
      .map((m: unknown) => (typeof m === 'object' && m && 'id' in m ? String((m as { id: unknown }).id) : ''))
      .filter((id: string) => id.length > 0)
      .sort();
  } finally {
    cancel();
  }
}

export async function testConnectivity(
  config: AIConfig,
  externalSignal?: AbortSignal,
): Promise<ConnectivityResult> {
  const { signal, cancel } = withTimeout(externalSignal);
  const base = trimBaseUrl(config.baseUrl);
  try {
    if (config.provider === 'openai') {
      const res = await fetch(`${base}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${config.apiKey}` },
        signal,
      });
      if (res.ok) return { ok: true };
      const text = await res.text().catch(() => '');
      return { ok: false, kind: classifyHttpStatus(res.status), message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const res = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
      signal,
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => '');
    return { ok: false, kind: classifyHttpStatus(res.status), message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
  } catch (err) {
    const { kind, message } = classifyFetchError(err);
    return { ok: false, kind, message };
  } finally {
    cancel();
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

export function generateProfileName(provider: AIProvider, model: string): string {
  const label = provider === 'anthropic' ? 'Anthropic' : 'OpenAI';
  return `${label} / ${model || '(unnamed)'}`;
}

function migrateOldConfig(store: AIConfigStore): AIConfigStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return store;
    const parsed = JSON.parse(raw);
    if (parsed._migrated) return store;
    if (!parsed.apiKey || !parsed.baseUrl || !parsed.model || !parsed.provider) return store;
    const profile: AIConfigProfile = {
      id: generateId(),
      name: generateProfileName(parsed.provider, parsed.model),
      provider: parsed.provider,
      baseUrl: parsed.baseUrl,
      apiKey: parsed.apiKey,
      model: parsed.model,
      createdAt: Date.now(),
    };
    store.profiles.push(profile);
    store.activeId = profile.id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, _migrated: true }));
    return store;
  } catch {
    return store;
  }
}

export function loadAIConfigStore(): AIConfigStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AIConfigStore;
      if (Array.isArray(parsed.profiles)) return parsed;
    }
  } catch { /* fall through */ }
  const empty: AIConfigStore = { profiles: [], activeId: null };
  return migrateOldConfig(empty);
}

export function saveAIConfigStore(store: AIConfigStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function listProfiles(): AIConfigProfile[] {
  return loadAIConfigStore().profiles;
}

export function getActiveProfile(): AIConfigProfile | null {
  const store = loadAIConfigStore();
  if (!store.activeId) return null;
  return store.profiles.find((p) => p.id === store.activeId) ?? null;
}

export function setActiveId(id: string): void {
  const store = loadAIConfigStore();
  if (store.profiles.some((p) => p.id === id)) {
    store.activeId = id;
    saveAIConfigStore(store);
  }
}

export function addProfile(config: Omit<AIConfigProfile, 'id' | 'createdAt'>): AIConfigProfile | null {
  const store = loadAIConfigStore();
  if (store.profiles.length >= MAX_PROFILES) return null;
  const profile: AIConfigProfile = {
    ...config,
    id: generateId(),
    createdAt: Date.now(),
  };
  store.profiles.push(profile);
  if (!store.activeId) store.activeId = profile.id;
  saveAIConfigStore(store);
  return profile;
}

export function updateProfile(id: string, updates: Partial<Omit<AIConfigProfile, 'id' | 'createdAt'>>): void {
  const store = loadAIConfigStore();
  const idx = store.profiles.findIndex((p) => p.id === id);
  if (idx === -1) return;
  store.profiles[idx] = { ...store.profiles[idx], ...updates };
  saveAIConfigStore(store);
}

export function removeProfile(id: string): void {
  const store = loadAIConfigStore();
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (store.activeId === id) {
    store.activeId = store.profiles[0]?.id ?? null;
  }
  saveAIConfigStore(store);
}

export function loadAIConfig(): AIConfig | null {
  const profile = getActiveProfile();
  if (!profile) return null;
  return {
    provider: profile.provider,
    baseUrl: profile.baseUrl,
    apiKey: profile.apiKey,
    model: profile.model,
  };
}

export function saveAIConfig(config: AIConfig): void {
  const store = loadAIConfigStore();
  const existing = store.activeId ? store.profiles.find((p) => p.id === store.activeId) : null;
  if (existing) {
    existing.provider = config.provider;
    existing.baseUrl = config.baseUrl;
    existing.apiKey = config.apiKey;
    existing.model = config.model;
    existing.name = generateProfileName(config.provider, config.model);
    saveAIConfigStore(store);
  } else {
    addProfile({
      name: generateProfileName(config.provider, config.model),
      ...config,
    });
  }
}

export function clearAIConfig(): void {
  const store: AIConfigStore = { profiles: [], activeId: null };
  saveAIConfigStore(store);
}
