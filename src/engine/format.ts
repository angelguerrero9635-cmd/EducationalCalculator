import type { Values, VariableDef } from './types';

/** Compact display: whole numbers as-is, up to 4 decimals, scientific for extremes. */
export function formatNumber(x: number, variable?: Pick<VariableDef, 'integer'>): string {
  if (variable?.integer) return String(Math.round(x));
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e7 || abs < 1e-4) return x.toExponential(3).replace('e+', 'e');
  return String(Number(x.toFixed(4)));
}

/** Parses user input; accepts "1,000", "−3" (Unicode minus) and "1e3". Undefined when blank. */
export function parseNumber(text: string): number | undefined | 'invalid' {
  const cleaned = text.trim().replace(/,/g, '').replace(/−/g, '-');
  if (cleaned === '') return undefined;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return 'invalid';
  return Number(cleaned);
}

/** Fills a display template: `{id}` → the symbol (symbolic) or the formatted value / "?". */
export function renderTemplate(
  template: string,
  variables: readonly VariableDef[],
  values?: Values,
): string {
  const byId = new Map(variables.map((v) => [v.id, v]));
  return template.replace(/\{(\w+)\}/g, (_, id: string) => {
    const variable = byId.get(id);
    if (!variable) return id;
    if (!values) return variable.symbol;
    const x = values[id];
    if (x === undefined) return '?';
    const s = formatNumber(x, variable);
    return x < 0 ? `(${s})` : s;
  });
}
