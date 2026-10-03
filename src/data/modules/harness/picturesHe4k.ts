/**
 * Harness checks for group K's college kinds (round 4, typesHe4k.ts), called from `repIssues`
 * in `pictures.ts`. Each recomputes what the picture draws by an independent route and compares
 * it with the page's values. Test-only.
 */
import {
  meanShare,
  PHOTONS,
  photonDepths,
  photonRows,
  ureaDots,
} from '@/components/module/reps/he4kMath';

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

/**
 * HC161 `attenuation`. Beam: the photons still going at each depth number e^(−μz) of the
 * twenty to within one (counted, not from the formula's inverse), each row holds one track; the
 * page's I ÷ I₀ is e^(−μx) and its HVL is the depth where e^(−μz) = ½ (bisected). Echo: the
 * depth is c × t ÷ 2 (m/s × μs → cm); R = ((Z₂ − Z₁) ÷ (Z₂ + Z₁))² as Z₁Z₂'s mismatch,
 * 1 − 4Z₁Z₂ ÷ (Z₁ + Z₂)².
 */
function attenuationIssues(rep: Extract<He4kSpec, { kind: 'attenuation' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  if (rep.mode === 'echo') {
    const [t, c, d] = [get(rep.t), get(rep.c ?? 1540), get(rep.d)];
    if (t !== undefined && c !== undefined && d !== undefined && !close(d, (c * t * 1e-4) / 2))
      out.push(`attenuation: d = ${d} cm is not ct ÷ 2 = ${(c * t * 1e-4) / 2} cm`);
    const [z1, z2, r] = [get(rep.z1), get(rep.z2), get(rep.r)];
    if (z1 !== undefined && z2 !== undefined && r !== undefined && z1 + z2 > 0) {
      const R = 1 - (4 * z1 * z2) / (z1 + z2) ** 2;
      if (!sameShare(r, R) && Math.abs(r - 100 * R) > 1e-9)
        out.push(`attenuation: R = ${r} is not ((Z₂ − Z₁) ÷ (Z₂ + Z₁))² = ${R}`);
    }
    return out;
  }
  const [mu, x] = [get(rep.mu), get(rep.x)];
  if (mu === undefined || mu <= 0) return out;
  const depths = photonDepths(mu);
  for (const z of [0.1, 0.5, 1, 2, 4].map((k) => k / mu)) {
    const going = depths.filter((d) => d > z).length;
    if (Math.abs(going - PHOTONS * Math.exp(-mu * z)) > 1)
      out.push(`attenuation: ${going} tracks pass depth ${z}, not ${PHOTONS} × e^(−μz)`);
  }
  if (new Set(photonRows()).size !== PHOTONS) out.push('attenuation: two tracks share a row');
  let [lo, hi] = [0, 100 / mu];
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (Math.exp(-mu * mid) > 0.5) lo = mid;
    else hi = mid;
  }
  const hvl = get(rep.hvl);
  if (hvl !== undefined && !close(hvl, lo)) out.push(`attenuation: HVL = ${hvl} is not ${lo}`);
  const share = get(rep.share);
  if (share !== undefined && x !== undefined) {
    let T = 1;
    for (let i = 0; i < 1000; i++) T *= Math.exp((-mu * x) / 1000);
    if (!sameShare(share, T)) out.push(`attenuation: I ÷ I₀ = ${share} is not e^(−μx) = ${T}`);
  }
  return out;
}

export function he4kIssues(rep: He4kSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'dialyzer':
      return dialyzerIssues(rep, val);
    case 'attenuation':
      return attenuationIssues(rep, val);
  }
}
