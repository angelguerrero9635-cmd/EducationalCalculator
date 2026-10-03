/**
 * The sums behind `orbitalDiagram` mode `mo` (HC70): a second-period diatomic's valence MOs
 * filled in order (s–p mixing through N₂, π below σ2p; the other order from O₂), bond order and
 * unpaired electrons; the two MOs of a heteronuclear pair from the 2 × 2 secular determinant;
 * and a Hückel ring's Frost levels α + 2β cos(2πk ÷ N), filled from the lowest. No drawing, so
 * the harness and the demos use the same numbers.
 */

export interface MoLevel {
  /** "σ2s", "σ*2s", "π2p", "σ2p", "π*2p", "σ*2p". */
  name: string;
  bonding: boolean;
  /** Orbitals at this level (1, or 2 for a π pair). */
  degen: number;
  /** Schematic energy (2s AO at 0, 2p AO at 4): only the order and the gaps' look. */
  energy: number;
  /** Electrons in each orbital of the level (0, 1 or 2). */
  fill: number[];
}

/** s–p mixing (π2p below σ2p) holds through N₂: 10 valence electrons or fewer. */
export const mixedOrder = (electrons: number) => electrons <= 10;

/** Fills levels (lowest first) with `e` electrons: one in each orbital of a level, then pairs. */
function fillLevels<T extends { degen: number; fill: number[] }>(levels: T[], e: number): T[] {
  let left = e;
  for (const l of levels) {
    l.fill = new Array<number>(l.degen).fill(0);
    for (let pass = 0; pass < 2; pass++)
      for (let k = 0; k < l.degen && left > 0; k++) {
        l.fill[k]! += 1;
        left--;
      }
  }
  return levels;
}

/** A second-period homonuclear diatomic (or ion) with `electrons` valence electrons (0–16). */
export function diatomicMOs(electrons: number) {
  const e = Math.max(0, Math.min(16, Math.round(electrons)));
  const mixed = mixedOrder(e);
  const base: Omit<MoLevel, 'fill'>[] = [
    { name: 'σ2s', bonding: true, degen: 1, energy: -1 },
    { name: 'σ*2s', bonding: false, degen: 1, energy: 1 },
    ...(mixed
      ? [
          { name: 'π2p', bonding: true, degen: 2, energy: 2.9 },
          { name: 'σ2p', bonding: true, degen: 1, energy: 3.6 },
        ]
      : [
          { name: 'σ2p', bonding: true, degen: 1, energy: 2.6 },
          { name: 'π2p', bonding: true, degen: 2, energy: 3.2 },
        ]),
    { name: 'π*2p', bonding: false, degen: 2, energy: 4.9 },
    { name: 'σ*2p', bonding: false, degen: 1, energy: 5.8 },
  ];
  const levels = fillLevels(
    base.map((l) => ({ ...l, fill: [] as number[] })),
    e,
  );
  const sum = (b: boolean) =>
    levels
      .filter((l) => l.bonding === b)
      .reduce((s, l) => s + l.fill.reduce((a, x) => a + x, 0), 0);
  const bonding = sum(true);
  const antibonding = sum(false);
  const unpaired = levels.reduce((s, l) => s + l.fill.filter((x) => x === 1).length, 0);
  return {
    electrons: e,
    mixed,
    levels,
    bonding,
    antibonding,
    bondOrder: (bonding - antibonding) / 2,
    unpaired,
  };
}

/** The neutral molecule with `electrons` valence electrons, when there is one. */
export const DIATOMIC_NAMES: Record<number, string> = {
  2: 'Li₂',
  4: 'Be₂',
  6: 'B₂',
  8: 'C₂',
  10: 'N₂',
  12: 'O₂',
  14: 'F₂',
  16: 'Ne₂',
};

/** Valence electrons of one second-period atom, by symbol. */
export const VALENCE: Record<string, number> = {
  Li: 1,
  Be: 2,
  B: 3,
  C: 4,
  N: 5,
  O: 6,
  F: 7,
  Ne: 8,
};

/**
 * E± from |α_A − E, β; β, α_B − E| = 0: (α_A + α_B) ÷ 2 ∓ √(((α_A − α_B) ÷ 2)² + β²). With β
 * negative, E₊ (bonding) is the lower root.
 */
export function heteronuclear(alphaA: number, alphaB: number, beta: number) {
  const mid = (alphaA + alphaB) / 2;
  const root = Math.sqrt(((alphaA - alphaB) / 2) ** 2 + beta ** 2);
  return { plus: mid - root, minus: mid + root, splitting: 2 * root };
}

/** The determinant |α_A − E, β; β, α_B − E| at E (zero at E±). */
export const secular = (alphaA: number, alphaB: number, beta: number, E: number) =>
  (alphaA - E) * (alphaB - E) - beta * beta;

export interface FrostLevel {
  /** E = α + coef × β. */
  coef: number;
  /** The ring's vertices at this level (1 or 2). */
  degen: number;
  /** The k of each vertex (2πk ÷ N from the bottom). */
  ks: number[];
  fill: number[];
}

/**
 * A ring of N (3–8) carbons: its Frost levels (lowest first, β < 0 so the largest coef is
 * lowest), filled with `electrons` π electrons.
 */
export function frost(N: number, electrons: number) {
  const n = Math.max(3, Math.min(8, Math.round(N)));
  const e = Math.max(0, Math.min(2 * n, Math.round(electrons)));
  const levels: FrostLevel[] = [];
  for (let k = 0; k <= Math.floor(n / 2); k++) {
    const coef = 2 * Math.cos((2 * Math.PI * k) / n);
    const ks = k === 0 || 2 * k === n ? [k] : [k, n - k];
    levels.push({ coef, degen: ks.length, ks, fill: [] });
  }
  fillLevels(levels, e);
  const energy = levels.reduce((s, l) => s + l.coef * l.fill.reduce((a, x) => a + x, 0), 0);
  // The same electrons in isolated C=C π bonds: each pair at α + β; an odd one at α.
  const isolated = 2 * Math.floor(e / 2);
  const unpaired = levels.reduce((s, l) => s + l.fill.filter((x) => x === 1).length, 0);
  return {
    ring: n,
    electrons: e,
    levels,
    energy,
    isolated,
    delocalization: energy - isolated,
    unpaired,
  };
}

/** "α + 2β", "α − 0.618β", "α" for a Frost coefficient. */
export function frostText(coef: number): string {
  const c = Math.abs(coef) < 1e-9 ? 0 : Number(coef.toFixed(3));
  if (c === 0) return 'α';
  const mag = Math.abs(c) === 1 ? '' : String(Math.abs(c));
  return `α ${c > 0 ? '+' : '−'} ${mag}β`;
}
