/**
 * The arithmetic behind the college round 4 group L pictures (HC165–HC172), shared by the
 * pictures and their harness checks so both draw and check from one formula.
 */

// ─── HC165: the Moody chart ─────────────────────────────────────────────────────

/** Re below this is laminar (f = 64 ÷ Re); from here to MOODY_TURBULENT is transition. */
export const MOODY_LAMINAR = 2300;
export const MOODY_TURBULENT = 4000;
/** The chart's window: Re from 10³ to 10⁸, f from 0.005 to 0.1. */
export const MOODY_RE: [number, number] = [1e3, 1e8];
export const MOODY_F: [number, number] = [0.005, 0.1];
/** The family drawn when a page names none: smooth, then ε ÷ D from 10⁻⁵ to 0.05. */
export const MOODY_CURVES = [0, 1e-5, 1e-4, 1e-3, 0.005, 0.01, 0.05];

/**
 * Colebrook's turbulent friction factor at any Re (no laminar switch), solved by fixed-point
 * iteration on x = 1 ÷ √f: x = −2 log₁₀(r ÷ 3.7 + 2.51x ÷ Re). Converges in a few rounds.
 */
export function colebrookF(re: number, r: number): number {
  if (!(re > 0) || !(r >= 0)) return NaN;
  let x = 8;
  for (let i = 0; i < 100; i++) {
    const next = -2 * Math.log10(r / 3.7 + (2.51 * x) / re);
    if (Math.abs(next - x) < 1e-13) {
      x = next;
      break;
    }
    x = next;
  }
  return 1 / (x * x);
}

/** The f a page takes at Re: 64 ÷ Re when laminar, else Colebrook. */
export const moodyF = (re: number, r: number) => (re < MOODY_LAMINAR ? 64 / re : colebrookF(re, r));

/** The flow regime at Re, as the chart's caption names it. */
export const moodyRegime = (re: number): 'laminar' | 'transition' | 'turbulent' =>
  re < MOODY_LAMINAR ? 'laminar' : re < MOODY_TURBULENT ? 'transition' : 'turbulent';

// ─── HC166: spur gears ──────────────────────────────────────────────────────────

/** The direction from gear 3 to gear 4 in a compound train (radians, screen y down). */
export const GEAR_STAGE_ANGLE = (40 * Math.PI) / 180;

export interface GearPlaced {
  /** Centre, in modules (the drawing is made with m = 1). */
  x: number;
  y: number;
  N: number;
  /** The angle of one tooth's centre line (screen angles, y down). */
  phase: number;
  /** +1 clockwise on screen, −1 counterclockwise (gear 1 turns clockwise). */
  turn: number;
}

/**
 * Gears placed with m = 1: a pair or a simple train in a row, or a compound train (gear 3 on
 * gear 2's shaft, gear 4 down and to the right of it). Each mesh's pitch circles touch (the
 * centres are (N_i + N_j) ÷ 2 apart) and each gear's teeth sit in its mate's gaps.
 */
export function gearLayout(teeth: number[]) {
  const n = teeth.length;
  const gears: GearPlaced[] = [{ x: 0, y: 0, N: teeth[0]!, phase: 0, turn: 1 }];
  const mesh = (i: number, N: number, angle: number) => {
    const a = gears[i]!;
    const d = (a.N + N) / 2;
    const pa = (2 * Math.PI) / a.N;
    const pb = (2 * Math.PI) / N;
    const frac = ((((angle - a.phase) / pa) % 1) + 1) % 1;
    gears.push({
      x: a.x + d * Math.cos(angle),
      y: a.y + d * Math.sin(angle),
      N,
      phase: angle + Math.PI - (frac + 0.5) * pb,
      turn: -a.turn,
    });
  };
  if (n >= 2) mesh(0, teeth[1]!, 0);
  if (n === 3) mesh(1, teeth[2]!, 0);
  if (n === 4) {
    const g = gears[1]!;
    gears.push({ x: g.x, y: g.y, N: teeth[2]!, phase: 0, turn: g.turn });
    mesh(2, teeth[3]!, GEAR_STAGE_ANGLE);
  }
  const ext = gears.map((g) => g.N / 2 + 1.6);
  const minX = Math.min(...gears.map((g, i) => g.x - ext[i]!));
  const maxX = Math.max(...gears.map((g, i) => g.x + ext[i]!));
  const minY = Math.min(...gears.map((g, i) => g.y - ext[i]!));
  const maxY = Math.max(...gears.map((g, i) => g.y + ext[i]!));
  return {
    gears,
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
    /** The first mesh's pitch point (on the line of centres, d₁ ÷ 2 from gear 1). */
    pitch: { x: teeth[0]! / 2, y: 0 },
  };
}

/** The train value e = ΠN_driving ÷ ΠN_driven: N₁ ÷ N₂, N₁ ÷ N₃ (an idler), N₁N₃ ÷ N₂N₄. */
export function trainValue(teeth: number[]): number {
  if (teeth.length === 4) return (teeth[0]! * teeth[2]!) / (teeth[1]! * teeth[3]!);
  return teeth[0]! / teeth[teeth.length - 1]!;
}

/**
 * A spur gear's outline at (cx, cy), N teeth of module `s` px: tips at the addendum (pitch
 * radius + m), roots at the dedendum (pitch radius − 1.25m), straight flanks, root arcs.
 */
export function gearOutline(cx: number, cy: number, N: number, s: number, phase: number) {
  const rp = (N / 2) * s;
  const ra = rp + s;
  const rr = rp - 1.25 * s;
  const p = (2 * Math.PI) / N;
  const at = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let k = 0; k < N; k++) {
    const f = phase + k * p;
    d += `${k ? 'L' : 'M'}${at(rr, f - 0.3 * p)}L${at(ra, f - 0.13 * p)}A${ra.toFixed(2)},${ra.toFixed(2)} 0 0 1 ${at(ra, f + 0.13 * p)}L${at(rr, f + 0.3 * p)}A${rr.toFixed(2)},${rr.toFixed(2)} 0 0 1 ${at(rr, f + 0.7 * p)}`;
  }
  return `${d}Z`;
}
