/**
 * Harness checks for group K's college kinds (round 4, typesHe4k.ts), called from `repIssues`
 * in `pictures.ts`. Each recomputes what the picture draws by an independent route and compares
 * it with the page's values. Test-only.
 */
import {
  cellsPerDot,
  LIGAND_ASPECT,
  ligandPlaques,
  ligandWindow,
  meanShare,
  PHOTONS,
  photonDepths,
  photonRows,
  plumeProfile,
  plumeSpread,
  settlingPath,
  strutFor,
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

/**
 * HC162 `scaffold`: the drawn strut thickness makes a cell as solid as ρ∗ ÷ ρ_s within 5 points,
 * counted on a 40³ grid of points in one cell (inside any of its three square bars), not from
 * 3s² − 2s³; ρ∗ < ρ_s; the page's relative density, porosity and E∗ = E_s(ρ∗ ÷ ρ_s)².
 */
function scaffoldIssues(rep: Extract<He4kSpec, { kind: 'scaffold' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [rs, rStar] = [get(rep.rhoS), get(rep.rhoStar)];
  if (rs === undefined || rStar === undefined || rs <= 0) return out;
  if (rStar >= rs) return [`scaffold: ρ∗ = ${rStar} is not below ρ_s = ${rs}`];
  const rel = rStar / rs;
  const s = strutFor(rel);
  const n = 40;
  let inside = 0;
  const near = (u: number) => Math.abs(u - 0.5) <= s / 2;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++) {
        const [u, v, w] = [(i + 0.5) / n, (j + 0.5) / n, (k + 0.5) / n];
        if ((near(v) && near(w)) || (near(u) && near(w)) || (near(u) && near(v))) inside++;
      }
  const solid = inside / n ** 3;
  if (Math.abs(solid - rel) > 0.05)
    out.push(`scaffold: the struts make a cell ${solid} solid, not ρ∗ ÷ ρ_s = ${rel}`);
  const relative = get(rep.relative);
  if (relative !== undefined && !close(relative, rel))
    out.push(`scaffold: ρ∗ ÷ ρ_s = ${relative} is not ${rel}`);
  const porosity = get(rep.porosity);
  if (porosity !== undefined && !sameShare(porosity, 1 - rel))
    out.push(`scaffold: the porosity ${porosity} is not 1 − ${rel}`);
  const [es, estar] = [get(rep.es), get(rep.estar)];
  if (es !== undefined && estar !== undefined && !close(estar, es * rel * rel))
    out.push(`scaffold: E∗ = ${estar} is not E_s(ρ∗ ÷ ρ_s)² = ${es * rel * rel}`);
  return out;
}

/**
 * HC163 `ligandGrid`: the dots drawn, counted over the window's area in μm², are the density
 * (to 0.1%); the window is whole grid squares of side 1000 ÷ √density nm (the page's d);
 * plaques are drawn exactly when d ≤ the threshold (default 70 nm).
 */
function ligandIssues(rep: Extract<He4kSpec, { kind: 'ligandGrid' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const density = get(rep.density);
  const thr = get(rep.threshold ?? 70) ?? 70;
  if (density === undefined || density <= 0) return out;
  const d = Math.sqrt(1e6 / density);
  const win = ligandWindow(d, LIGAND_ASPECT);
  const dots = win.cols * win.rows;
  const area = (win.width / 1000) * (win.height / 1000);
  if (!close(dots / area, density, 1e-3))
    out.push(`ligandGrid: ${dots} dots on ${area} μm² is not ${density} per μm²`);
  const spacing = get(rep.spacing);
  if (spacing !== undefined && !close(spacing, d))
    out.push(`ligandGrid: d = ${spacing} nm is not √(10⁶ ÷ density) = ${d} nm`);
  const plaques = ligandPlaques(d, thr, win.cols, Math.ceil(win.rows * 0.55)).length;
  if (d <= thr && plaques === 0) out.push(`ligandGrid: d = ${d} ≤ ${thr} nm but no plaques`);
  if (d > thr && plaques > 0) out.push(`ligandGrid: d = ${d} > ${thr} nm but ${plaques} plaques`);
  return out;
}

/**
 * HC164 `bioreactor`: C = C∗(1 − X ÷ X_max) with X_max = k_La·C∗ ÷ q (another route to
 * C∗ − qX ÷ k_La); the page's OUR, C and X_max; the dots drawn times the cells per dot are X to
 * within one dot, at most 120 dots; the gauge is empty when C ≤ 0.
 */
function bioreactorIssues(rep: Extract<He4kSpec, { kind: 'bioreactor' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [cStar, kla, q, x] = [get(rep.cStar), get(rep.kla), get(rep.q), get(rep.x)];
  if (x !== undefined && x > 0) {
    const unit = cellsPerDot(x);
    const dots = Math.round(x / unit);
    if (dots > 120 || Math.abs(dots * unit - x) > unit / 2 + 1e-9)
      out.push(`bioreactor: ${dots} dots of ${unit} cells/mL for X = ${x}`);
  }
  if (cStar === undefined || kla === undefined || q === undefined || x === undefined) return out;
  if (kla <= 0 || q <= 0) return out;
  const xMax = (kla * cStar) / (q * 1e-6);
  const C = cStar * (1 - x / xMax);
  const our = get(rep.our);
  if (our !== undefined && !close(our, q * x * 1e-6))
    out.push(`bioreactor: OUR = ${our} is not qX`);
  const c = get(rep.c);
  if (c !== undefined && Math.abs(c - C) > 1e-6 * Math.max(1, cStar))
    out.push(`bioreactor: C = ${c} is not C∗ − qX ÷ k_La = ${C}`);
  const pageMax = get(rep.xMax);
  if (pageMax !== undefined && !close(pageMax, xMax))
    out.push(`bioreactor: X_max = ${pageMax} is not k_La·C∗ ÷ q = ${xMax}`);
  if (c !== undefined && c < 0) out.push(`bioreactor: C = ${c} is below 0 (the gauge is empty)`);
  return out;
}

/**
 * HC176 `settlingTank`: stepping the particle through the basin (the flow's speed Q ÷ WD across,
 * v_s down, 2000 steps) lands it inside exactly when v_s ≥ v₀ = Q ÷ LW, and the drawn path
 * agrees; the page's v₀, detention LWD ÷ Q (h) and removal min(1, v_s ÷ v₀).
 */
function settlingIssues(rep: Extract<He4kSpec, { kind: 'settlingTank' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [L, W, D, Q, vs] = [
    get(rep.length),
    get(rep.width),
    get(rep.depth),
    get(rep.q),
    get(rep.vs),
  ];
  if ([L, W, D, Q, vs].some((x) => x === undefined || x <= 0)) return out;
  const v0 = Q! / (L! * W!);
  const page0 = get(rep.v0);
  if (page0 !== undefined && !close(page0, v0))
    out.push(`settlingTank: v₀ = ${page0} is not Q ÷ LW = ${v0}`);
  const t = get(rep.t);
  if (t !== undefined && !close(t, (L! * W! * D!) / Q! / 3600))
    out.push(`settlingTank: t = ${t} h is not LWD ÷ Q`);
  // March the particle: across at Q ÷ WD, down at v_s, until the floor or the outlet wall.
  const u = Q! / (W! * D!);
  const dt = Math.min(D! / vs!, L! / u) / 2000;
  let [x, y] = [0, 0];
  while (x < L! && y < D!) [x, y] = [x + u * dt, y + vs! * dt];
  const landsBySteps = y >= D! && x <= L! * (1 + 2e-3);
  const drawn = settlingPath(L!, W!, D!, Q!, vs!);
  const clear = Math.abs(vs! - v0) > 2e-3 * v0;
  if (clear && landsBySteps !== drawn.lands)
    out.push(
      `settlingTank: the particle ${landsBySteps ? 'lands' : 'leaves'}, but is drawn the other way`,
    );
  if (clear && drawn.lands !== vs! >= v0)
    out.push(`settlingTank: lands is ${drawn.lands} with v_s = ${vs}, v₀ = ${v0}`);
  const removal = get(rep.removal);
  if (removal !== undefined && !sameShare(removal, Math.min(1, vs! / v0)))
    out.push(`settlingTank: removal ${removal} is not min(1, v_s ÷ v₀)`);
  return out;
}

/**
 * HC177 `plume`: the drawn profile peaks at H (searched on a 1000-step grid of heights) when
 * H > 2σ_z, so the centreline sits at H; σ_z grows downwind (the drawn spread rises at every
 * step toward the receptor and reaches σ_z there); the page's C is the Gaussian plume's ground
 * value, Q ÷ (πuσ_yσ_z) × e^(−H² ÷ 2σ_z²) in μg/m³, worked here as the centreline value times
 * the profile's ground share ÷ 2.
 */
function plumeIssues(rep: Extract<He4kSpec, { kind: 'plume' }>, val: Val): string[] {
  const out: string[] = [];
  const get = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [h, sz] = [get(rep.h), get(rep.sz)];
  if (h === undefined || sz === undefined || h <= 0 || sz <= 0) return out;
  if (h > 2 * sz) {
    let best = 0;
    for (let i = 1; i <= 1000; i++)
      if (plumeProfile((3 * h * i) / 1000, h, sz) > plumeProfile((3 * h * best) / 1000, h, sz))
        best = i;
    if (Math.abs((3 * h * best) / 1000 - h) > (3 * h) / 1000 + 1e-9)
      out.push(`plume: the profile peaks at ${(3 * h * best) / 1000} m, not H = ${h} m`);
  }
  for (let i = 1; i <= 20; i++)
    if (!(plumeSpread(sz, i / 20) > plumeSpread(sz, (i - 1) / 20)))
      out.push(`plume: the spread does not grow downwind at step ${i}`);
  if (!close(plumeSpread(sz, 1), sz)) out.push(`plume: σ_z at the receptor is not ${sz}`);
  const [q, u, sy, c] = [get(rep.q), get(rep.u), get(rep.sy), get(rep.c)];
  if (q === undefined || u === undefined || sy === undefined || c === undefined) return out;
  const centreline = (1e6 * q) / (2 * Math.PI * u * sy * sz);
  const ground = centreline * plumeProfile(0, h, sz);
  // (A value far down the tail shows as 0 to 4 decimals.)
  if (!close(c, ground) && Math.abs(c - ground) > 1e-4)
    out.push(`plume: C = ${c} μg/m³ is not the plume's ground value ${ground}`);
  return out;
}

export function he4kIssues(rep: He4kSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'dialyzer':
      return dialyzerIssues(rep, val);
    case 'attenuation':
      return attenuationIssues(rep, val);
    case 'scaffold':
      return scaffoldIssues(rep, val);
    case 'ligandGrid':
      return ligandIssues(rep, val);
    case 'bioreactor':
      return bioreactorIssues(rep, val);
    case 'settlingTank':
      return settlingIssues(rep, val);
    case 'plume':
      return plumeIssues(rep, val);
  }
}
