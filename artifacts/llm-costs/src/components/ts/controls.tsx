import { useState } from 'react';
import { intFmt, parseRate, parseTokens } from '@/lib/format';

function TokenField({ id, label, accent, value, onChange }: { id: string; label: string; accent: string; value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(intFmt.format(value));
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span className={`h-2 w-2 rounded-full ${accent}`} />{label}
      </label>
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={text}
          aria-invalid={!!err}
          aria-describedby={`${id}-hint`}
          data-testid={`input-${id}`}
          onChange={(e) => {
            const n = parseTokens(e.target.value);
            if (n === null) { setText(e.target.value); setErr('Use apenas números inteiros não negativos (até 9 quatrilhões).'); return; }
            setErr(null); setText(e.target.value === '' ? '' : intFmt.format(n)); onChange(n);
          }}
          onBlur={() => { setText(intFmt.format(value)); setErr(null); }}
          className="num h-12 w-full rounded-xl border border-slate-800 bg-[#0d131e] px-3.5 pr-16 text-lg text-white outline-none transition-all duration-300 focus:border-blue-500/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] aria-[invalid=true]:border-red-500/70"
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">tokens</span>
      </div>
      <p id={`${id}-hint`} className={`text-[11px] ${err ? 'text-red-400' : 'text-slate-500'}`}>{err ?? 'Volume agregado no período. Zero é permitido.'}</p>
    </div>
  );
}

interface Props {
  input: number; output: number; rateText: string;
  onInput: (n: number) => void; onOutput: (n: number) => void; onRate: (s: string) => void;
}

export function UsageControls({ input, output, rateText, onInput, onOutput, onRate }: Props) {
  const rateOk = parseRate(rateText) !== null;
  return (
    <div className="space-y-5">
      <TokenField id="tokens-input" label="Tokens de entrada" accent="bg-blue-500" value={input} onChange={onInput} />
      <TokenField id="tokens-output" label="Tokens de saída" accent="bg-orange-500" value={output} onChange={onOutput} />
      <div className="space-y-1.5">
        <label htmlFor="rate" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Cotação USD/BRL</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">R$</span>
          <input
            id="rate" inputMode="decimal" autoComplete="off" value={rateText}
            aria-invalid={!rateOk} aria-describedby="rate-hint" data-testid="input-rate"
            onChange={(e) => onRate(e.target.value)}
            className="num h-12 w-full rounded-xl border border-slate-800 bg-[#0d131e] pl-10 pr-3.5 text-lg text-white outline-none transition-all duration-300 focus:border-blue-500/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] aria-[invalid=true]:border-red-500/70"
          />
        </div>
        <p id="rate-hint" className={`text-[11px] ${rateOk ? 'text-slate-500' : 'text-red-400'}`}>
          {rateOk ? 'Informe manualmente. Aceita vírgula ou ponto (ex.: 5,42).' : 'Cotação inválida. Usando o último valor válido.'}
        </p>
      </div>
    </div>
  );
}
