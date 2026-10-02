/**
 * College pictures, round 4, group C (docs/RENDERINGS_HE.md): HC99 `motionGraph` `polynomial`.
 * Kept apart from `types.ts` so the union only names them.
 *
 * Every string is a variable id; a `NumOrVar` is a fixed number or one. A value is read in its
 * variable's formula unit (the unit each field names); a "?" draws nothing for that value.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

// ─── HC99 motionGraph polynomial ─────────────────────────────────────────────

/**
 * Position as a cubic in time, x = c₀ + c₁t + c₂t² + c₃t³ (m, m/s, m/s², m/s³; t in s), with
 * v = dx/dt and a = dv/dt by the power rule: x–t, v–t and a–t stacked on one time axis, the
 * point at `at` on each, the tangent on x–t whose slope is v, and every turnaround (v = 0 where
 * v changes sign) ringed on x–t and v–t. Drag the point for t.
 */
export interface MotionPolynomial {
  c0: NumOrVar;
  c1: NumOrVar;
  c2: NumOrVar;
  c3: NumOrVar;
  /** The time t (s) marked on the three graphs. */
  at: NumOrVar;
  /** The page's x, v and a at t, when it names them. */
  position?: string;
  velocity?: string;
  acceleration?: string;
}

export interface MotionGraphHe4cSpec {
  kind: 'motionGraph';
  polynomial: MotionPolynomial;
  fixed?: boolean;
}

// ─── The union ───────────────────────────────────────────────────────────────

/** Group HE4C's options on kinds that exist (sent to He4cView before the kind's own picture). */
export type He4cOptionSpec = MotionGraphHe4cSpec;

/** Every picture of group HE4C. */
export type He4cSpec = He4cOptionSpec;

/** Whether a picture is one of group HE4C's options on an existing kind. */
export function isHe4cOption(r: Representation): r is He4cOptionSpec {
  if (r.kind === 'motionGraph') return 'polynomial' in r;
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-HE4C picture reads (modules.test.ts). */
export function he4cSpecVars(r: He4cSpec): string[] {
  switch (r.kind) {
    case 'motionGraph': {
      const p = r.polynomial;
      return ids(p.c0, p.c1, p.c2, p.c3, p.at, p.position, p.velocity, p.acceleration);
    }
  }
}
