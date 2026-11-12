import { Star, X } from 'lucide-react';
import { contextLabel, money, perMillion } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Row } from './types';

interface Props { row: Row; rate: number; favorite: boolean; cheapest: boolean; onFavorite: () => void; onRemove: () => void }

export function ModelCard({ row, rate, favorite, cheapest, onFavorite, onRemove }: Props) {
  const { model: m } = row;
  const line = (label: string, dot: string, usd: number, price: number) => (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}</p>
        <p className="num mt-0.5 text-[11px] text-slate-500">{perMillion(price)} / 1M</p>
      </div>
      <div className="num text-right text-sm">
        <p className="text-white">{money(usd, 'USD')}</p>
        <p className="text-xs text-slate-400">{money(usd * rate, 'BRL')}</p>
      </div>
    </div>
  );
  return (
    <article className={cn('ts-card ts-card-hover ts-in flex flex-col p-5', cheapest && 'border-blue-500/40')} data-testid={`card-model-${m.id}`}>
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{m.provider}</p>
          <h3 className="mt-0.5 break-words text-base font-bold leading-snug text-white">{m.name}</h3>
          <p className="truncate text-[11px] text-slate-600" title={m.id}>{m.id}</p>
        </div>
        <button type="button" onClick={onFavorite} aria-pressed={favorite} aria-label={favorite ? `Remover ${m.name} dos favoritos` : `Favoritar ${m.name}`} data-testid={`button-favorite-${m.id}`}
          className="rounded-lg p-1.5 text-slate-500 transition-all duration-300 hover:bg-slate-800 hover:text-amber-300 active:scale-90">
          <Star className={cn('h-4 w-4 transition-colors duration-300', favorite && 'fill-amber-400 text-amber-400')} />
        </button>
        <button type="button" onClick={onRemove} aria-label={`Remover ${m.name} da comparação`} data-testid={`button-card-remove-${m.id}`}
          className="rounded-lg p-1.5 text-slate-500 transition-colors duration-300 hover:bg-slate-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="num rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-300">Contexto {contextLabel(m.context)}</span>
        {m.source === 'demo'
          ? <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300" title="Preço e contexto são exemplos, não tarifas atuais verificadas">Demonstrativo</span>
          : <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">OpenRouter</span>}
        {cheapest && <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-300">Menor custo</span>}
      </div>
      <div className="mt-3 divide-y divide-slate-800/80 border-t border-slate-800/80">
        {line('Entrada', 'bg-blue-500', row.inputCost, m.inputPerMillion)}
        {line('Saída', 'bg-orange-500', row.outputCost, m.outputPerMillion)}
      </div>
      <div className="mt-auto rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 p-3.5 ring-1 ring-blue-500/20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300">Total</p>
        <p className="num text-xl font-semibold text-white" data-testid={`text-total-usd-${m.id}`}>{money(row.total, 'USD')}</p>
        <p className="num text-sm text-slate-300" data-testid={`text-total-brl-${m.id}`}>{money(row.total * rate, 'BRL')}</p>
      </div>
    </article>
  );
}
