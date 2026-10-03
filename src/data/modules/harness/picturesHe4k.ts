/**
 * Harness checks for group K's college kinds (round 4, typesHe4k.ts), called from `repIssues`
 * in `pictures.ts`. Each recomputes what the picture draws by an independent route and compares
 * it with the page's values. Test-only.
 */
import { meanShare, ureaDots } from '@/components/module/reps/he4kMath';

import type { He4kSpec } from '../typesHe4k';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 2e-3) =>
  Math.abs(a - b) <= rel * Math.max(1e-12, Math.abs(a), Math.abs(b));

/** A share the page writes as a fraction or a percent. */
const sameShare = (page: number, share: number) => close(page, share) || close(page, 100 * share);

/**
 * HC160 `dialyzer`: K = Q_b(C_in − C_out) ÷ C_in (as Q_b − Q_b·C_out ÷ C_in); C_out ≤ C_in;
 * the urea dots along a fiber average C_out…C_in in the mean (r − 1) ÷ ln r of C_in, counted
 * against a midpoint sum; Kt/V = K·t ÷ 1000V and URR = 1 − e^(−Kt/V).
 */
function dialyzerIssues(rep: Extract<He4kSpec, { kind: 'dialyzer' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [qb, cin, cout] = [get(rep.qb), get(rep.cin), get(rep.cout)];
  if (qb !== undefined && qb <= 0) out.push(`dialyzer: Q_b = ${qb} is not positive`);
  if (cin !== undefined && cout !== undefined && cout > cin * (1 + 1e-9))
    out.push(`dialyzer: C_out = ${cout} is above C_in = ${cin}`);
  if (qb === undefined || cin === undefined || cout === undefined || cin <= 0 || cout > cin)
    return out;
  const K = qb - (qb * cout) / cin;
  const k = get(rep.k);
  if (k !== undefined && !close(k, K))
    out.push(`dialyzer: K = ${k} is not Q_b(C_in − C_out) ÷ C_in = ${K}`);
  // The dots: as many as a midpoint sum of C ÷ C_in along the fiber says.
  const r = Math.max(1e-4, cout / cin);
  const n = 200;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += r ** ((i + 0.5) / n) / n;
  if (!close(sum, meanShare(r), 1e-3))
    out.push(`dialyzer: the mean urea share ${meanShare(r)} is not ${sum}`);
  const dots = ureaDots(r, 216, 14, 0.5).length;
  if (Math.abs(dots - 14 * sum) > 1)
    out.push(`dialyzer: ${dots} urea dots on a fiber, not about ${14 * sum}`);
  const [t, v] = [get(rep.t), get(rep.v)];
  if (t === undefined || v === undefined || v <= 0) return out;
  const ktv = (K * t) / (1000 * v);
  const pageKtv = get(rep.ktv);
  if (pageKtv !== undefined && !close(pageKtv, ktv))
    out.push(`dialyzer: Kt/V = ${pageKtv} is not ${ktv}`);
  const urr = get(rep.urr);
  if (urr !== undefined && !sameShare(urr, 1 - Math.exp(-ktv)))
    out.push(`dialyzer: URR = ${urr} is not 1 − e^(−${ktv})`);
  return out;
}

export function he4kIssues(rep: He4kSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'dialyzer':
      return dialyzerIssues(rep, val);
  }
}
