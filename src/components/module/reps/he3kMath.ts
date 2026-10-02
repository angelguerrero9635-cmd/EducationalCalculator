/**
 * The arithmetic the round-3 group K pictures draw (HC62, HC63, HC86, HC87, HC91), shared with
 * their harness checks (harness/picturesHe3k.ts), so a check measures what is drawn.
 */

// ─── HC91: decibel waterfall ─────────────────────────────────────────────────

/** The running level before and after each signed item (from 0, or from the first item). */
export function dbLevels(items: { sign: number; value: number }[]) {
  const out: { from: number; to: number }[] = [];
  let at = 0;
  for (const it of items) {
    const to = at + it.sign * it.value;
    out.push({ from: at, to });
    at = to;
  }
  return out;
}

/** One decimal with a true minus sign, and a plus when asked: "+3.0", "−64.0". */
export const db1 = (x: number, plus = false) => {
  const r = Math.round(x * 10) / 10;
  const s = Math.abs(r).toFixed(1);
  return r < 0 ? `−${s}` : plus && r > 0 ? `+${s}` : s;
};

/** A nice tick step for a span about `n` ticks long (1, 2, 5, 10 …). */
export function niceStep(span: number, n = 5) {
  const raw = Math.max(span, 1e-9) / n;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
}
