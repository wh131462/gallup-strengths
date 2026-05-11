export type AIProvider = 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const GLM_FREE_PRESET = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash',
  signupUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
} as const;

const STORAGE_KEY = 'gallup-strengths.ai-config';
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

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIConfig;
    if (!parsed.apiKey || !parsed.baseUrl || !parsed.model || !parsed.provider) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
