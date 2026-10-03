/**
 * The sums of the `binaryPhase` picture (HC82), shared by the picture and its harness check:
 * the lever rule, and the boundaries, computed in code (never traced from a chart) and shaped to
 * pass through the page's tie-line ends.
 */

/** The lever rule: the share of the phase at `right` is (C₀ − C_left) ÷ (C_right − C_left). */
export function lever(c0: number, left: number, right: number) {
  const span = right - left;
  const toRight = span === 0 ? NaN : (c0 - left) / span;
  return { toRight, toLeft: 1 - toRight, armLeft: c0 - left, armRight: right - c0 };
}

/** A point of a boundary: composition (wt%) and temperature as a share t of the plot's height. */
export type Pt = [number, number];

/**
 * An isomorphous lens with the liquid at `cl` and the solid at `cs` on a tie line at height t*
 * (0 < t* < 1, t = 0 the lower melting point, t = 1 the higher): liquidus x = 100tᵖ and solidus
 * x = 100t^q (the mirror when the solid is the leaner phase). Returns both curves, bottom to top,
 * on `n` steps, or undefined when the ends can't make a lens.
 */
export function lens(cl: number, cs: number, tStar: number, n = 48) {
  if (!(cl > 0 && cl < 100 && cs > 0 && cs < 100) || cl === cs) return undefined;
  if (!(tStar > 0 && tStar < 1)) return undefined;
  const flip = cl > cs;
  const [L, S] = flip ? [100 - cl, 100 - cs] : [cl, cs];
  const p = Math.log(L / 100) / Math.log(tStar);
  const q = Math.log(S / 100) / Math.log(tStar);
  const curve = (k: number): Pt[] =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const x = 100 * t ** k;
      return [flip ? 100 - x : x, t] as Pt;
    });
  // With the solid leaner (flip), the higher melting component is A, at the left.
  return { liquidus: curve(p), solidus: curve(q), flip };
}

/** A quadratic Bézier from a to b with control k, on `n` steps. */
export function bezier(a: Pt, k: Pt, b: Pt, n = 24): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n;
    const u = 1 - s;
    return [
      u * u * a[0] + 2 * u * s * k[0] + s * s * b[0],
      u * u * a[1] + 2 * u * s * k[1] + s * s * b[1],
    ];
  });
}

/** Heights (share of the plot) of a eutectic diagram's points. */
export const EUTECTIC = { meltA: 0.72, meltB: 0.86, eutectic: 0.36, floor: 0.02 };

/**
 * A eutectic diagram through the α end `ca`, the eutectic `ce` and the β end `cb`: the two
 * liquidus curves down to the eutectic, the two solidus curves, and the two solvus curves.
 */
export function eutecticLines(ca: number, ce: number, cb: number) {
  const { meltA, meltB, eutectic: tE, floor } = EUTECTIC;
  return {
    liquidusA: bezier([0, meltA], [ce * 0.5, meltA - 0.08], [ce, tE]),
    liquidusB: bezier([100, meltB], [ce + (100 - ce) * 0.5, meltB - 0.14], [ce, tE]),
    solidusA: bezier([0, meltA], [ca * 0.45, tE + 0.06], [ca, tE]),
    solidusB: bezier([100, meltB], [cb + (100 - cb) * 0.4, tE + 0.08], [cb, tE]),
    solvusA: bezier([ca, tE], [ca * 0.82, tE * 0.4], [ca * 0.3, floor]),
    solvusB: bezier([cb, tE], [cb + (100 - cb) * 0.2, tE * 0.4], [100 - (100 - cb) * 0.25, floor]),
  };
}

/** The steel corner's window and its fixed points (wt% C, °C). */
export const STEEL = {
  xMax: 1.6,
  tMin: 600,
  tMax: 1000,
  a3: 912,
  eutectoid: 727,
  ce: 0.76,
  calpha: 0.022,
  /** Acm continues to the eutectic's 2.14 wt% at 1147 °C (a straight run across the window). */
  acmEnd: [2.14, 1147] as Pt,
};

/** The steel corner's lines in (wt% C, °C), through the eutectoid at (ce, T_e). */
export function steelLines(ce: number, ca: number, te: number) {
  const { a3, acmEnd, xMax, tMin } = STEEL;
  const slope = (acmEnd[1] - te) / (acmEnd[0] - ce);
  return {
    // A3: from pure iron's 912 °C down to the eutectoid, bowed below the chord (it passes about
    // 795 °C at 0.38 wt% C when ce = 0.76).
    a3: bezier([0, a3], [ce / 2, 2 * (a3 * 0.4 + te * 0.6) - (a3 + te) / 2 - 20], [ce, te]),
    acm: [
      [ce, te],
      [xMax, te + slope * (xMax - ce)],
    ] as Pt[],
    // α's own field: from the eutectoid's α end up to 912 °C and down along its solvus.
    alphaTop: bezier([ca, te], [ca * 0.8, (a3 + te) / 2], [0, a3]),
    alphaSolvus: bezier([ca, te], [ca * 0.6, (te + tMin) / 2], [ca * 0.25, tMin]),
  };
}
