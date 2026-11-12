export const intFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function money(value: number, currency: 'USD' | 'BRL'): string {
  const abs = Math.abs(value);
  const digits = abs === 0 || abs >= 0.01 ? 2 : abs >= 0.0001 ? 4 : 6;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function perMillion(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
}

export function contextLabel(ctx: number | null): string {
  if (ctx === null) return 'n/d';
  if (ctx >= 1e6) return `${(ctx / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M tokens`;
  if (ctx >= 1000) return `${(ctx / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}K tokens`;
  return `${intFmt.format(ctx)} tokens`;
}

/** Converte entrada de tokens; retorna null se inválida. Permite zero. */
export function parseTokens(raw: string): number | null {
  const digits = raw.replace(/[.\s\u00a0_]/g, '');
  if (digits === '') return 0;
  if (!/^\d+$/.test(digits)) return null;
  const n = Number(digits);
  return Number.isSafeInteger(n) ? n : null;
}

/** Aceita vírgula ou ponto como separador decimal. */
export function parseRate(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, '');
  if (!/^\d+([.,]\d*)?$/.test(t)) return null;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n < 1e6 ? n : null;
}

export const cost = (tokens: number, pricePerMillion: number) => (tokens * pricePerMillion) / 1e6;
