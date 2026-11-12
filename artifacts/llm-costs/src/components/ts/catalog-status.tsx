import { RefreshCw } from 'lucide-react';
import type { CatalogStatus } from '@/hooks/use-catalog';
import { cn } from '@/lib/utils';

interface Props { status: CatalogStatus; error: string | null; liveCount: number; onRetry: () => void }

export function CatalogStatusBadge({ status, error, liveCount, onRetry }: Props) {
  const cfg = {
    loading: { dot: 'bg-blue-400 animate-pulse', text: 'Carregando catálogo da OpenRouter…', sub: 'Modelos locais já disponíveis.' },
    live: { dot: 'bg-emerald-400', text: `${liveCount.toLocaleString('pt-BR')} modelos disponíveis`, sub: 'Preços base públicos da API.' },
    fallback: { dot: 'bg-amber-400', text: 'Modo offline · catálogo local', sub: `Falha ao carregar: ${error ?? 'erro desconhecido'}` },
  }[status];
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5" data-testid="status-catalog">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-200">{cfg.text}</p>
        <p className="truncate text-[11px] text-slate-500" title={cfg.sub}>{cfg.sub}</p>
      </div>
      {status !== 'loading' && (
        <button type="button" onClick={onRetry} data-testid="button-retry-catalog" aria-label={status === 'live' ? 'Atualizar catálogo' : 'Tentar novamente'}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-300 transition-colors duration-300 hover:bg-slate-800 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" />{status === 'live' ? 'Atualizar' : 'Tentar de novo'}
        </button>
      )}
    </div>
  );
}
