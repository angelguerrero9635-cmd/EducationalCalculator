/**
 * Electrons in atoms for the `atomModel` and `orbitalDiagram` pictures (H44, H45): subshells
 * filled in Aufbau order (Hund's rule and the Pauli principle in each), the known exceptions of
 * the neutral atoms through xenon, ions, Bohr shells, and hydrogen's energy levels. No drawing,
 * so the harness checks the same numbers.
 */

export interface Subshell {
  n: number;
  /** 0 s, 1 p, 2 d, 3 f. */
  l: number;
  /** Electrons in it. */
  e: number;
}

export const LETTERS = ['s', 'p', 'd', 'f'];
/** Orbitals in a subshell: s 1, p 3, d 5, f 7. */
export const orbitals = (l: number) => 2 * l + 1;

/** Subshells in the order they fill (the diagonal rule), through 7p. */
export const AUFBAU: [number, number][] = [
  [1, 0],
  [2, 0],
  [2, 1],
  [3, 0],
  [3, 1],
  [4, 0],
  [3, 2],
  [4, 1],
  [5, 0],
  [4, 2],
  [5, 1],
  [6, 0],
  [4, 3],
  [5, 2],
  [6, 1],
  [7, 0],
  [5, 3],
  [6, 2],
  [7, 1],
];

/** Most electrons the pictures draw: through xenon (1s to 5p). */
export const MAX_ELECTRONS = 54;

/**
 * Neutral atoms through xenon whose ground state breaks the Aufbau order: one s electron (two
 * for palladium) moves into the d subshell below it, which is then half full or full.
 */
const EXCEPTIONS: Record<number, [number, number, number][]> = {
  24: [
    [4, 0, 1],
    [3, 2, 5],
  ],
  29: [
    [4, 0, 1],
    [3, 2, 10],
  ],
  41: [
    [5, 0, 1],
    [4, 2, 4],
  ],
  42: [
    [5, 0, 1],
    [4, 2, 5],
  ],
  44: [
    [5, 0, 1],
    [4, 2, 7],
  ],
  45: [
    [5, 0, 1],
    [4, 2, 8],
  ],
  46: [
    [5, 0, 0],
    [4, 2, 10],
  ],
  47: [
    [5, 0, 1],
    [4, 2, 10],
  ],
};

/** Subshells filled in Aufbau order with `count` electrons (each subshell listed once it has any). */
export function aufbau(count: number): Subshell[] {
  const out: Subshell[] = [];
  let left = Math.max(0, Math.round(count));
  for (const [n, l] of AUFBAU) {
    if (left <= 0) break;
    const e = Math.min(left, 2 * orbitals(l));
    out.push({ n, l, e });
    left -= e;
  }
  return out;
}

/** Is this atom (atomic number z, neutral) one of the exceptions to the Aufbau order? */
export const isException = (z: number) => EXCEPTIONS[z] !== undefined;

/**
 * The ground-state configuration of an atom or ion: atomic number `z` with `electrons`
 * electrons. A neutral atom takes its known exception; a positive ion loses electrons from the
 * highest shell first (4s before 3d); a negative ion adds them in Aufbau order.
 */
export function configuration(z: number, electrons = z): Subshell[] {
  const neutral = aufbau(z);
  const exception = EXCEPTIONS[z];
  if (exception)
    for (const [n, l, e] of exception) {
      const s = neutral.find((x) => x.n === n && x.l === l);
      if (s) s.e = e;
      else neutral.push({ n, l, e });
    }
  let cfg = neutral.filter((s) => s.e > 0);
  if (electrons > z) cfg = aufbau(electrons);
  let remove = z - electrons;
  while (remove > 0) {
    // Highest n first, then highest l.
    const s = [...cfg].sort((a, b) => b.n - a.n || b.l - a.l).find((x) => x.e > 0);
    if (!s) break;
    const k = Math.min(remove, s.e);
    s.e -= k;
    remove -= k;
    cfg = cfg.filter((x) => x.e > 0);
  }
  return cfg;
}

/** Superscript digits. */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const sup = (n: number) => String(n).replace(/\d/g, (d) => SUP[Number(d)]!);

/** "2p" for a subshell. */
export const subshellName = (s: { n: number; l: number }) => `${s.n}${LETTERS[s.l]}`;

/** Written in Aufbau order: "1s² 2s² 2p⁴". */
export const notation = (cfg: Subshell[]) =>
  cfg
    .filter((s) => s.e > 0)
    .sort((a, b) => aufbauRank(a) - aufbauRank(b))
    .map((s) => `${subshellName(s)}${sup(s.e)}`)
    .join(' ');

export const aufbauRank = (s: { n: number; l: number }) =>
  AUFBAU.findIndex(([n, l]) => n === s.n && l === s.l);

const NOBLE: [number, string][] = [
  [36, 'Kr'],
  [18, 'Ar'],
  [10, 'Ne'],
  [2, 'He'],
];

/** Noble-gas shorthand: "[Ne] 3s² 3p⁴", or the full notation when no core fits. */
export function shorthand(cfg: Subshell[]): string {
  const total = cfg.reduce((s, x) => s + x.e, 0);
  for (const [core, symbol] of NOBLE) {
    if (core >= total) continue;
    const inner = aufbau(core);
    const full = inner.every((c) => cfg.some((s) => s.n === c.n && s.l === c.l && s.e === c.e));
    if (!full) continue;
    const rest = cfg.filter((s) => !inner.some((c) => c.n === s.n && c.l === s.l));
    return `[${symbol}] ${notation(rest)}`;
  }
  return notation(cfg);
}

/** Arrows in each orbital of a subshell by Hund's rule: 1 (up), 2 (a pair) or 0. */
export function arrowsIn(s: Subshell): number[] {
  const k = orbitals(s.l);
  return Array.from({ length: k }, (_, i) => (s.e > k + i ? 2 : s.e > i ? 1 : 0));
}

/** Unpaired electrons: orbitals holding one arrow. */
export const unpaired = (cfg: Subshell[]) =>
  cfg.reduce((sum, s) => sum + arrowsIn(s).filter((a) => a === 1).length, 0);

/** Electrons in each Bohr shell, n = 1, 2, 3 … (the shell sums of the configuration). */
export function shells(cfg: Subshell[]): number[] {
  const top = Math.max(0, ...cfg.map((s) => s.n));
  return Array.from({ length: top }, (_, i) =>
    cfg.filter((s) => s.n === i + 1).reduce((sum, s) => sum + s.e, 0),
  );
}

/** Valence electrons: those in the highest occupied shell. */
export const valenceOf = (cfg: Subshell[]) => {
  const sh = shells(cfg);
  return sh.length ? sh[sh.length - 1]! : 0;
};

// ─── Hydrogen's energy levels ────────────────────────────────────────────────

/** Hydrogen's ground-state energy magnitude, in eV. */
export const RYDBERG_EV = 13.6;
/** hc in eV·nm: λ (nm) = 1240 ÷ E (eV). */
export const HC_EV_NM = 1240;

/** Energy of level n, in eV (negative: bound). */
export const levelEnergy = (n: number) => -RYDBERG_EV / (n * n);

/** The photon's energy (eV) when the electron drops from `upper` to `lower`. */
export const photonEnergy = (upper: number, lower: number) =>
  RYDBERG_EV * (1 / (lower * lower) - 1 / (upper * upper));

/** A photon's wavelength (nm) from its energy (eV). */
export const photonWavelength = (energy: number) => HC_EV_NM / energy;

/** The series a drop to `lower` belongs to, and the part of the spectrum it is in. */
export function seriesOf(lower: number): string | undefined {
  return ['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'][lower - 1];
}

/** Where a wavelength (nm) falls: ultraviolet, visible or infrared. */
export const bandOf = (nm: number) =>
  nm < 380 ? 'ultraviolet' : nm <= 750 ? 'visible' : 'infrared';
