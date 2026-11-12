import { Trophy, Scale } from 'lucide-react';
import { money } from '@/lib/format';
import type { Row } from './types';

export function Summary({ rows, rate }: { rows: Row[]; rate: number }) {
  if (!rows.length) {
    return (
      <div className="ts-card flex min-h-40 flex-col items-center justify-center p-6 text-center" data-testid="summary-empty">
        <Scale className="mb-3 h-7 w-7 text-slate-600" />
        <p className="font-semibold text-white">Nada para comparar ainda</p>
        <p className="mt-1 max-w-sm text-sm text-slate-400">Selecione ao menos um modelo no painel ao lado para ver o mais econômico.</p>
      </div>
    );
  }
  const sorted = [...rows].sort((a, b) => a.total - b.total);
  const min = sorted[0].total;
  const max = sorted[sorted.length - 1].total;
  const winners = sorted.filter((r) => r.total === min);
  const allZero = max === 0;
  const tie = winners.length > 1;
  const saving = max - min;
  const pct = max > 0 ? (saving / max) * 100 : 0;

  return (
    <div className="ts-card ts-in relative overflow-hidden p-6" data-testid="summary-card">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
            <Trophy className="h-3.5 w-3.5" />{allZero ? 'Sem custo no volume informado' : tie ? 'Empate no menor custo' : 'Mais econômico'}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white md:text-3xl" data-testid="text-cheapest">
            {allZero ? 'Todos custam zero' : winners.map((w) => w.model.name).join(' e ')}
          </h2>
          {!allZero && !tie && <p className="mt-0.5 text-sm text-slate-400">{winners[0].model.provider}</p>}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="num text-4xl font-semibold text-white" data-testid="text-cheapest-usd">{money(min, 'USD')}</span>
            <span className="num text-xl text-slate-300" data-testid="text-cheapest-brl">{money(min * rate, 'BRL')}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 self-end md:grid-cols-1">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <dt className="text-[11px] uppercase tracking-wider text-slate-500">Mais caro</dt>
            <dd className="num mt-0.5 text-sm text-white">{money(max, 'USD')} <span className="text-slate-400">· {money(max * rate, 'BRL')}</span></dd>
            <dd className="truncate text-xs text-slate-500">{rows.length > 1 ? sorted[sorted.length - 1].model.name : 'Único modelo selecionado'}</dd>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <dt className="text-[11px] uppercase tracking-wider text-emerald-400/80">Economia potencial</dt>
            <dd className="num mt-0.5 text-sm text-emerald-300" data-testid="text-saving">{money(saving * rate, 'BRL')}</dd>
            <dd className="text-xs text-slate-500">{pct > 0 ? `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% menor que o mais caro` : 'Sem diferença entre os selecionados'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
