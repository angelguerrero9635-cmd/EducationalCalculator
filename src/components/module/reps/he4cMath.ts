/**
 * The sums behind the round-4 group C college pictures (typesHe4c.ts). The pictures and the
 * harness check share them, so what is drawn and what is checked can't drift apart.
 */

// ─── Axes ────────────────────────────────────────────────────────────────────

/** The smallest step of 1, 2, 2.5 or 5 × 10ⁿ giving at most `count` steps across `span`. */
export function niceStepOf(span: number, count: number) {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count);
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw * (1 - 1e-9))!;
}

/** Tick values every nice step across [lo, hi]. */
export function ticksOf(lo: number, hi: number, count = 4) {
  const step = niceStepOf(hi - lo, count);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step)
    out.push(Number(v.toPrecision(10)));
  return out;
}

// ─── HC99 polynomial motion ──────────────────────────────────────────────────

export type Cubic = readonly [number, number, number, number];

/** x, v = dx/dt and a = dv/dt at t for x = c₀ + c₁t + c₂t² + c₃t³. */
export function cubicAt([c0, c1, c2, c3]: Cubic, t: number) {
  return {
    x: c0 + c1 * t + c2 * t * t + c3 * t * t * t,
    v: c1 + 2 * c2 * t + 3 * c3 * t * t,
    a: 2 * c2 + 6 * c3 * t,
  };
}

/**
 * The turnarounds after t = 0: the times where v = c₁ + 2c₂t + 3c₃t² is 0 and changes sign (a
 * double root only touches 0, so the motion doesn't turn there), in order.
 */
export function turnarounds([, c1, c2, c3]: Cubic): number[] {
  const out: number[] = [];
  if (Math.abs(c3) < 1e-12) {
    if (Math.abs(c2) > 1e-12) out.push(-c1 / (2 * c2));
  } else {
    const disc = 4 * c2 * c2 - 12 * c3 * c1;
    if (disc > 1e-12 * Math.max(1, c2 * c2)) {
      const r = Math.sqrt(disc);
      out.push((-2 * c2 - r) / (6 * c3), (-2 * c2 + r) / (6 * c3));
    }
  }
  return out.filter((t) => t > 1e-9 && Number.isFinite(t)).sort((p, q) => p - q);
}

/**
 * The time window drawn, from 0: past t and the last turnaround by a fifth (a turnaround more
 * than four times t away is left out), at least 1.
 */
export function cubicSpan(c: Cubic, at: number | undefined) {
  const t = at !== undefined && at > 0 ? at : undefined;
  const near = turnarounds(c).filter((r) => t === undefined || r <= 4 * t);
  const last = Math.max(t ?? 0, ...near);
  return last > 0 ? last * 1.2 : 1;
}
