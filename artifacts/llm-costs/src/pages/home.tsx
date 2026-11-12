import { useMemo } from 'react';
import { Info, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog } from '@/hooks/use-catalog';
import { isShortString, isStringArray, useStoredState } from '@/hooks/use-stored-state';
import { DEFAULT_SELECTION } from '@/lib/models';
import { cost, parseRate } from '@/lib/format';
import { ModelCombobox } from '@/components/ts/model-combobox';
import { UsageControls } from '@/components/ts/controls';
import { CatalogStatusBadge } from '@/components/ts/catalog-status';
import { Summary } from '@/components/ts/summary';
import { CostChart } from '@/components/ts/cost-chart';
import { ModelCard } from '@/components/ts/model-card';
import type { Row } from '@/components/ts/types';

const isTokenCount = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { models, status, error, retry, liveCount } = useCatalog();
  const [selected, setSelected] = useStoredState('ts:selected', DEFAULT_SELECTION, isStringArray);
  const [favorites, setFavorites] = useStoredState<string[]>('ts:favorites', [], isStringArray);
  const [input, setInput] = useStoredState('ts:input', 1_000_000, isTokenCount);
  const [output, setOutput] = useStoredState('ts:output', 1_000_000, isTokenCount);
  const [rateText, setRateText] = useStoredState('ts:rate', '5,4', isShortString);
  const parsedRate = parseRate(rateText);
  const rate = useMemo(() => parsedRate ?? 5.4, [parsedRate]);

  const byId = useMemo(() => new Map(models.map((m) => [m.id, m])), [models]);
  const rows: Row[] = useMemo(() => selected.flatMap((id) => {
    const m = byId.get(id);
    if (!m) return [];
    const inputCost = cost(input, m.inputPerMillion);
    const outputCost = cost(output, m.outputPerMillion);
    return [{ model: m, inputCost, outputCost, total: inputCost + outputCost }];
  }), [selected, byId, input, output]);
  const visibleSelected = rows.map((r) => r.model.id);
  const minTotal = rows.length ? Math.min(...rows.map((r) => r.total)) : 0;
  const hasDemo = rows.some((r) => r.model.source === 'demo');

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <>
    <div className="relative z-10 mx-auto min-h-[100dvh] max-w-[1400px] px-4 pb-16 pt-6 md:px-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo Ottimizza" className="h-12 w-12 shrink-0 object-contain" width={48} height={48} />
          <span className="font-['Oxanium'] text-lg font-semibold tracking-tighter text-white sm:text-xl">Ottimizza</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 hidden text-[11px] text-slate-500 sm:inline">Dados de preço via OpenRouter</span>
          <button type="button" onClick={toggleTheme} data-testid="button-toggle-theme"
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <header className="ts-in mx-auto mt-12 max-w-3xl text-center md:mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Calculadora de custos de IA</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
          Calcule e Compare <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">Custos de LLMs</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 md:text-lg">
          A ferramenta definitiva para desenvolvedores e empresas otimizarem seus gastos com IA. Simule o volume de tokens, defina a cotação do dólar e descubra o modelo mais econômico em segundos.
        </p>
      </header>

      <main className="mt-12 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="ts-card space-y-5 p-5" aria-label="Parâmetros de uso">
            <CatalogStatusBadge status={status} error={error} liveCount={liveCount} onRetry={retry} />
            <ModelCombobox models={models} selected={visibleSelected} favorites={favorites} onToggle={toggle} onClear={() => setSelected([])} />
            <div className="h-px bg-slate-800" />
            <UsageControls input={input} output={output} rateText={rateText} onInput={setInput} onOutput={setOutput} onRate={setRateText} />
          </section>
          <p className="flex gap-2 px-1 text-[11px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Estimativas com tarifas base de entrada e saída aplicadas ao volume agregado. Não incluem cache, ferramentas, batch, impostos nem preços escalonados por tamanho de prompt. Itens "Demonstrativo" usam valores de exemplo, não tarifas verificadas.
          </p>
        </aside>

        <div className="min-w-0 space-y-6">
          <Summary rows={rows} rate={rate} />
          {hasDemo && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-200/90" data-testid="text-demo-warning">
              A comparação inclui modelos Demonstrativos: preço e contexto são exemplos e não refletem tarifas atuais verificadas.
            </p>
          )}
          <section className="ts-card p-5" aria-label="Gráfico de custos">
            <div className="mb-2">
              <h2 className="text-base font-bold text-white">Custo por modelo</h2>
              <p className="text-xs text-slate-400">Barras empilhadas: entrada e saída em USD. Role horizontalmente se houver muitos modelos.</p>
            </div>
            <CostChart rows={rows} rate={rate} />
          </section>
          {rows.length > 0 && (
            <section aria-label="Detalhes por modelo">
              <h2 className="mb-3 text-base font-bold text-white">Detalhes <span className="num text-sm font-normal text-slate-500">{rows.length}</span></h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((r) => (
                  <ModelCard key={r.model.id} row={r} rate={rate} favorite={favorites.includes(r.model.id)}
                    cheapest={rows.length > 1 && r.total === minTotal && minTotal < Math.max(...rows.map((x) => x.total))}
                    onFavorite={() => toggleFav(r.model.id)} onRemove={() => toggle(r.model.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
    <footer className="relative z-10 flex w-full items-center justify-center border-t border-slate-700/50 bg-slate-800/50 px-4 py-4 text-center text-xs text-slate-400">
      <p>© 2026 • Calculadora LLM • Ottimizza Sistemas Contabeis S.A</p>
    </footer>
    </>
  );
}
