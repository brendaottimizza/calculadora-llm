import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Search, Star, X } from 'lucide-react';
import type { Model } from '@/lib/models';
import { perMillion } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  models: Model[];
  selected: string[];
  favorites: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function ModelCombobox({ models, selected, favorites, onToggle, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const byId = useMemo(() => new Map(models.map((m) => [m.id, m])), [models]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const results = useMemo(() => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    const list = models.filter((m) => {
      const hay = norm(`${m.name} ${m.provider} ${m.id}`);
      return terms.every((t) => hay.includes(t));
    });
    return list.sort((a, b) => Number(favSet.has(b.id)) - Number(favSet.has(a.id)));
  }, [models, query, favSet]);

  const move = (i: number) => {
    const n = Math.max(0, Math.min(results.length - 1, i));
    setActive(n);
    listRef.current?.querySelector<HTMLElement>(`[data-index="${n}"]`)?.scrollIntoView({ block: 'nearest' });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(active - 1); }
    else if (e.key === 'Home' && open) { e.preventDefault(); move(0); }
    else if (e.key === 'End' && open) { e.preventDefault(); move(results.length - 1); }
    else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); onToggle(results[active].id); }
    else if (e.key === 'Escape') { if (open) { e.preventDefault(); setOpen(false); } else if (query) setQuery(''); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={`${listId}-input`} className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Modelos <span className="num ml-1 text-slate-500">{selected.length}/{models.length}</span>
        </label>
        {selected.length > 0 && (
          <button type="button" onClick={onClear} data-testid="button-clear-selection" className="text-xs text-slate-400 transition-colors duration-300 hover:text-white">
            Limpar
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Modelos selecionados">
          {selected.map((id) => {
            const m = byId.get(id);
            if (!m) return null;
            return (
              <li key={id} className="ts-in flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-800/60 py-1 pl-2.5 pr-1 text-xs text-slate-200">
                <span className="max-w-[11rem] truncate" title={m.name}>{m.name}</span>
                <button type="button" onClick={() => onToggle(id)} aria-label={`Remover ${m.name}`} data-testid={`button-remove-${id}`}
                  className="rounded-md p-0.5 text-slate-400 transition-colors duration-300 hover:bg-slate-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-opt-${active}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKey}
          placeholder="Buscar por nome, provedor ou id"
          data-testid="input-model-search"
          className="h-11 w-full rounded-xl border border-slate-800 bg-[#0d131e] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-blue-500/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
        />
        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Catálogo de modelos"
            className="ts-scroll absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-800 bg-[#0e1420]/95 p-1 shadow-2xl backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-400" data-testid="text-no-results">
                Nenhum modelo encontrado para <span className="text-white">"{query}"</span>.
                <span className="mt-1 block text-xs text-slate-500">Tente o provedor (ex.: anthropic) ou parte do id.</span>
              </li>
            ) : results.map((m, i) => {
              const isSel = selectedSet.has(m.id);
              return (
                <li
                  key={m.id}
                  id={`${listId}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => onToggle(m.id)}
                  data-testid={`option-model-${m.id}`}
                  className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150', i === active ? 'bg-blue-500/10' : '')}
                >
                  <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors', isSel ? 'border-blue-500 bg-blue-500 text-slate-950' : 'border-slate-600')}>
                    {isSel && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-slate-100">{m.name}</span>
                      {favSet.has(m.id) && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-label="Favorito" />}
                      {m.source === 'demo' && <span className="shrink-0 rounded bg-amber-500/10 px-1 text-[10px] font-semibold text-amber-300">Demonstrativo</span>}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{m.provider} · {m.id}</span>
                  </span>
                  <span className="num shrink-0 text-right text-[11px] leading-tight text-slate-400">
                    <span className="block text-blue-400">{perMillion(m.inputPerMillion)}</span>
                    <span className="block text-orange-400">{perMillion(m.outputPerMillion)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-slate-500">Setas para navegar, Enter para marcar, Esc para fechar. Preços em USD por 1M tokens.</p>
    </div>
  );
}
