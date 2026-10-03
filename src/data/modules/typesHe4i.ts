/**
 * College pictures, round 4, group I (docs/RENDERINGS_HE.md): biology. Kept apart from
 * `types.ts`, `typesHs2e.ts` and `layouts/types.ts` so each gains a line. A `NumOrVar` field is
 * a fixed number or a variable id, read in the variable's shown unit; a string field is the
 * page's own value, checked.
 *
 * - HC141 `curvedSolid` `ratio`: a cell as a sphere, A, V and A ÷ V, and a bigger cell beside it.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | false | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC141: curvedSolid ratio ───────────────────────────────────────────────────

/**
 * HC141 (B-P1): `ratio` on a `curvedSolid` sphere (a cell). The cell is drawn as a lit ball of
 * radius r with r marked; under it A = 4πr², V = (4/3)πr³ and A ÷ V = 3 ÷ r (`area`, `volume`
 * and `ratio` are the page's values, checked). `compare` (a factor, default 2; `false` for one
 * cell) draws a second cell of radius r × factor beside it at the same scale with its own A,
 * V and A ÷ V, so the ratio falls as the cell grows. A "?" r draws no cell; a "?" A, V or ratio
 * leaves its line out.
 */
export interface CurvedSolidHe4i {
  ratio?: {
    area?: string;
    volume?: string;
    ratio?: string;
    compare?: NumOrVar | false;
  };
}

/** The variable ids the HC141 option names (for the module tests). */
export function curvedSolidHe4iVars(r: CurvedSolidHe4i): string[] {
  const q = r.ratio;
  return ids(q?.area, q?.volume, q?.ratio, q?.compare);
}
