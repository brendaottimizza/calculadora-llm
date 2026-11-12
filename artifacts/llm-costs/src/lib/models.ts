export type ModelSource = 'api' | 'demo';

export interface Model {
  id: string;
  name: string;
  provider: string;
  context: number | null;
  inputPerMillion: number;
  outputPerMillion: number;
  source: ModelSource;
}

/**
 * Valores DEMONSTRATIVOS. Não são tarifas verificadas; servem apenas
 * como fallback quando o catálogo da OpenRouter não contém o modelo.
 */
export const LOCAL_MODELS: Model[] = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini', provider: 'OpenAI', context: 128000, inputPerMillion: 0.15, outputPerMillion: 0.6, source: 'demo' },
  { id: 'openai/gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'OpenAI', context: 256000, inputPerMillion: 1.1, outputPerMillion: 8.8, source: 'demo' },
  { id: '~anthropic/claude-haiku-latest', name: 'Claude Haiku Latest', provider: 'Anthropic', context: 200000, inputPerMillion: 1, outputPerMillion: 5, source: 'demo' },
  { id: 'anthropic/claude-haiku-5.5', name: 'Claude Haiku 5.5', provider: 'Anthropic', context: 200000, inputPerMillion: 1.2, outputPerMillion: 6, source: 'demo' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', context: 200000, inputPerMillion: 1, outputPerMillion: 5, source: 'demo' },
  { id: 'aion-labs/aion-3.5', name: 'Aion 3.5', provider: 'AionLabs', context: 131072, inputPerMillion: 2.5, outputPerMillion: 7.5, source: 'demo' },
  { id: 'aion-labs/aion-3.5-mini', name: 'Aion 3.5 Mini', provider: 'AionLabs', context: 131072, inputPerMillion: 0.6, outputPerMillion: 1.8, source: 'demo' },
  { id: 'aion-labs/aion-2.0', name: 'Aion-2.0', provider: 'AionLabs', context: 65536, inputPerMillion: 3.5, outputPerMillion: 7, source: 'demo' },
  { id: 'aion-labs/aion-3.0', name: 'Aion-3.0', provider: 'AionLabs', context: 131072, inputPerMillion: 2, outputPerMillion: 6, source: 'demo' },
  { id: 'aion-labs/aion-3.0-mini', name: 'Aion-3.0-Mini', provider: 'AionLabs', context: 131072, inputPerMillion: 0.5, outputPerMillion: 1.5, source: 'demo' },
];

export const DEFAULT_SELECTION = [
  'openai/gpt-4o-mini',
  'anthropic/claude-haiku-4.5',
  'aion-labs/aion-3.0',
  'aion-labs/aion-3.5-mini',
];

export const canonicalId = (id: string) => id.trim().toLowerCase();

const PROVIDERS: Record<string, string> = {
  openai: 'OpenAI', anthropic: 'Anthropic', 'aion-labs': 'AionLabs', google: 'Google',
  'meta-llama': 'Meta', mistralai: 'Mistral', deepseek: 'DeepSeek', 'x-ai': 'xAI',
  qwen: 'Qwen', cohere: 'Cohere', amazon: 'Amazon', microsoft: 'Microsoft',
  nvidia: 'NVIDIA', perplexity: 'Perplexity', moonshotai: 'Moonshot AI', 'z-ai': 'Z.ai',
  minimax: 'MiniMax', openrouter: 'OpenRouter',
};

export function inferProvider(id: string, name: string): string {
  const prefix = canonicalId(id).replace(/^~/, '').split('/')[0];
  if (PROVIDERS[prefix]) return PROVIDERS[prefix];
  const fromName = name.includes(':') ? name.split(':')[0].trim() : '';
  if (fromName) return fromName;
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Desconhecido';
}

const perTokenToMillion = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n) || n < 0) return null;
  const m = n * 1e6;
  return Number.isFinite(m) ? Math.round(m * 1e6) / 1e6 : null;
};

export function normalizeApiModel(raw: unknown): Model | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id.trim()) return null;
  const pricing = (r.pricing ?? {}) as Record<string, unknown>;
  const input = perTokenToMillion(pricing.prompt);
  const output = perTokenToMillion(pricing.completion);
  if (input === null || output === null) return null;
  const rawName = typeof r.name === 'string' && r.name.trim() ? r.name.trim() : r.id;
  const name = rawName.includes(':') ? rawName.split(':').slice(1).join(':').trim() || rawName : rawName;
  const ctx = typeof r.context_length === 'number' && Number.isFinite(r.context_length) && r.context_length > 0 ? Math.round(r.context_length) : null;
  return { id: r.id.trim(), name, provider: inferProvider(r.id, rawName), context: ctx, inputPerMillion: input, outputPerMillion: output, source: 'api' };
}

export function mergeCatalog(api: Model[]): Model[] {
  const map = new Map<string, Model>();
  for (const m of LOCAL_MODELS) map.set(canonicalId(m.id), m);
  for (const m of api) map.set(canonicalId(m.id), m);
  return [...map.values()].sort((a, b) => a.provider.localeCompare(b.provider, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR'));
}

export async function fetchCatalog(timeoutMs = 8000, outer?: AbortSignal): Promise<Model[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  outer?.addEventListener('abort', onAbort);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data?: unknown };
    if (!Array.isArray(json.data)) throw new Error('Resposta inesperada');
    const models = json.data.map(normalizeApiModel).filter((m): m is Model => m !== null);
    if (!models.length) throw new Error('Catálogo vazio');
    return models;
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener('abort', onAbort);
  }
}
