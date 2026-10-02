/**
 * The four views of one polypeptide for `macromolecules` with `level` (HC115, `typesHe4d.ts`):
 * its sequence, its helix and sheet, its fold, and two chains packed. Each view places the same
 * residues (up to MAX_DRAWN) as beads in a unit box, so the harness checks every view draws the
 * same count. Residue i keeps one role in every view: helix, strand or loop.
 */

export const MAX_DRAWN = 36;

export type Role = 'helix' | 'strand' | 'loop';

export interface Bead {
  x: number;
  y: number;
  role: Role;
  /** Which chain (0, or 1 for the second chain of the quaternary view). */
  chain: number;
}

/** Residues drawn: all of them up to MAX_DRAWN. */
export const drawnOf = (n: number) => Math.max(2, Math.min(MAX_DRAWN, Math.round(n)));

/** Each residue's role: the first half a helix, then a turn, then two strands. */
export function roles(m: number): Role[] {
  const h = Math.ceil(m / 2);
  return Array.from({ length: m }, (_, i) =>
    i < h ? 'helix' : i === h && m > 4 ? 'loop' : 'strand',
  );
}

/** Primary: the beads in rows, back and forth, read N to C. */
function sequence(m: number): Bead[] {
  const per = 9;
  const rows = Math.ceil(m / per);
  const rs = roles(m);
  return rs.map((role, i) => {
    const row = Math.floor(i / per);
    const k = i % per;
    const col = row % 2 === 0 ? k : per - 1 - k;
    return {
      x: 0.08 + (0.84 * col) / (per - 1),
      y: rows === 1 ? 0.5 : 0.2 + (0.6 * row) / (rows - 1),
      role,
      chain: 0,
    };
  });
}

/** Secondary: the helix on the left (3.6 residues a turn), the two strands on the right. */
function secondary(m: number): Bead[] {
  const rs = roles(m);
  const helix = rs.filter((r) => r === 'helix').length;
  const rest = m - helix;
  const s1 = Math.ceil(rest / 2);
  return rs.map((role, i) => {
    if (i < helix) {
      const t = i / Math.max(1, helix - 1);
      return {
        x: 0.06 + 0.4 * t,
        y: 0.5 + 0.26 * Math.sin((2 * Math.PI * i) / 3.6),
        role,
        chain: 0,
      };
    }
    const j = i - helix;
    const upper = j < s1;
    const k = upper ? j : j - s1;
    const len = upper ? s1 : rest - s1;
    const t = len <= 1 ? 0.5 : k / (len - 1);
    // Antiparallel: out along the top, back along the bottom, a slight pleat.
    const x = upper ? 0.56 + 0.38 * t : 0.94 - 0.38 * t;
    return { x, y: (upper ? 0.34 : 0.66) + (k % 2 ? 0.03 : -0.03), role, chain: 0 };
  });
}

/** Tertiary: the chain folded on itself, a spiral packed in toward the core. */
function fold(m: number, cx = 0.5, cy = 0.5, size = 1, chain = 0): Bead[] {
  const rs = roles(m);
  return rs.map((role, i) => {
    const t = m === 1 ? 0 : i / (m - 1);
    const th = 3.6 * Math.PI * t + 0.4;
    const r = 0.4 * size * (1 - 0.62 * t);
    return { x: cx + r * Math.cos(th), y: cy + 0.86 * r * Math.sin(th), role, chain };
  });
}

/** Quaternary: two folded chains side by side. */
function packed(m: number): Bead[] {
  return [...fold(m, 0.28, 0.5, 0.62, 0), ...fold(m, 0.72, 0.5, 0.62, 1)];
}

/** The beads of each level's view, 1–4. */
export function levelBeads(level: number, n: number): Bead[] {
  const m = drawnOf(n);
  switch (level) {
    case 1:
      return sequence(m);
    case 2:
      return secondary(m);
    case 3:
      return fold(m);
    default:
      return packed(m);
  }
}

/** Residues per chain in a view (the quaternary view has two chains). */
export const residuesPerChain = (beads: Bead[]) => beads.filter((b) => b.chain === 0).length;

/** α-helix rise per residue and residues per turn (nm). */
export const HELIX_RISE = 0.15;
export const STRAND_RISE = 0.34;
export const PER_TURN = 3.6;
