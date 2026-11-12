import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { money } from '@/lib/format';
import type { Row } from './types';

const BLUE = '#3b82f6';
const ORANGE = '#ff7a1a';

function ChartTooltip({ active, payload, rate }: TooltipProps<number, string> & { rate: number }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { full: string; provider: string; input: number; output: number };
  const total = d.input + d.output;
  return (
    <div className="min-w-56 rounded-xl border border-slate-700/60 bg-slate-950/80 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="font-semibold text-white">{d.full}</p>
      <p className="mb-2 text-slate-500">{d.provider}</p>
      {[['Entrada', d.input, BLUE], ['Saída', d.output, ORANGE]].map(([l, v, c]) => (
        <div key={l as string} className="flex justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2 w-2 rounded-sm" style={{ background: c as string }} />{l}</span>
          <span className="num text-white">{money(v as number, 'USD')}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between gap-4 border-t border-slate-800 pt-2">
        <span className="text-slate-300">Total</span>
        <span className="num text-right font-semibold text-white">{money(total, 'USD')}<br /><span className="font-normal text-slate-400">{money(total * rate, 'BRL')}</span></span>
      </div>
    </div>
  );
}

const shortLabel = (s: string) => (s.length > 16 ? `${s.slice(0, 15)}…` : s);

export function CostChart({ rows, rate }: { rows: Row[]; rate: number }) {
  if (!rows.length) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-center text-sm text-slate-500" data-testid="chart-empty">
        <BarChart3 className="mb-2 h-7 w-7 text-slate-700" />O gráfico aparece quando houver modelos selecionados.
      </div>
    );
  }
  const data = rows.map((r) => ({ key: r.model.id, label: shortLabel(r.model.name), full: r.model.name, provider: r.model.provider, input: r.inputCost, output: r.outputCost }));
  const minWidth = Math.max(rows.length * 84, 320);
  return (
    <div className="ts-scroll -mx-2 overflow-x-auto px-2 pb-2" data-testid="chart-costs">
      <div style={{ minWidth }} className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--ts-chart-grid)" strokeDasharray="3 4" />
            <XAxis dataKey="label" interval={0} angle={rows.length > 5 ? -30 : 0} textAnchor={rows.length > 5 ? 'end' : 'middle'} height={rows.length > 5 ? 64 : 32} tick={{ fill: 'var(--ts-chart-x)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--ts-chart-axis)' }} />
            <YAxis domain={[0, 'auto']} tick={{ fill: 'var(--ts-chart-y)', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={64}
              tickFormatter={(v: number) => `$${v.toLocaleString('pt-BR', { maximumFractionDigits: v < 1 ? 3 : 1 })}`} />
            <ReferenceLine y={0} stroke="var(--ts-chart-baseline)" />
            <Tooltip cursor={{ fill: 'rgba(59,130,246,0.06)' }} content={<ChartTooltip rate={rate} />} />
            <Legend verticalAlign="top" align="right" height={32} iconType="circle" iconSize={8}
              formatter={(v: string) => <span className="text-xs text-slate-300">{v}</span>} />
            <Bar dataKey="input" name="Entrada" stackId="c" fill={BLUE} animationDuration={400} />
            <Bar dataKey="output" name="Saída" stackId="c" fill={ORANGE} radius={[6, 6, 0, 0]} animationDuration={400} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
