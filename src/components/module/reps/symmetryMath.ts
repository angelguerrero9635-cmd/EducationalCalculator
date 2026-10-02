/**
 * Molecules in 3-D for the college symmetry pictures (HC113, `typesHe4d.ts`): the explore figure
 * `symmetryElements` and the `molecule` card formulas of inorganic#0. Each molecule has its atoms
 * (bond length about 1; y up, the principal axis along y where it has one), its bonds, and the
 * symmetry elements a scene can light: a rotation axis Cₙ, a mirror plane σ, the centre i or an
 * improper axis Sₙ. `maps` applies an element and says whether every atom lands on a like atom,
 * so the harness checks each lit element really is one. No drawing here.
 */

export type Vec = [number, number, number];

export interface Atom3 {
  el: string;
  p: Vec;
}

export type SymElementKind = 'C' | 'σ' | 'i' | 'S';

/**
 * One symmetry element: an axis (`axis` through the centre, order `n`; n = 0 for C∞), a plane
 * (its unit `normal`), the centre (i), or an improper axis (`axis`, order `n`). `name` is how the
 * page writes it ("C₂", "σᵥ", "σₕ", "i", "S₄").
 */
export interface SymElement {
  id: string;
  kind: SymElementKind;
  name: string;
  axis?: Vec;
  normal?: Vec;
  n?: number;
}

export interface Molecule3 {
  name: string;
  formula: string;
  atoms: Atom3[];
  bonds: [number, number, number][];
  group: string;
  elements: SymElement[];
}

const norm = (v: Vec): Vec => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const scale = (v: Vec, k: number): Vec => [v[0] * k, v[1] * k, v[2] * k];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** v turned by `deg` degrees about the unit axis u (Rodrigues). */
export function rotate(v: Vec, u: Vec, deg: number): Vec {
  const t = (deg * Math.PI) / 180;
  const [c, s] = [Math.cos(t), Math.sin(t)];
  const k = dot(u, v) * (1 - c);
  const x = cross(u, v);
  return [
    v[0] * c + x[0] * s + u[0] * k,
    v[1] * c + x[1] * s + u[1] * k,
    v[2] * c + x[2] * s + u[2] * k,
  ];
}

/** v reflected through the plane through the origin with unit normal n. */
export const reflect = (v: Vec, n: Vec): Vec => sub(v, scale(n, 2 * dot(v, n)));

/** Where an element sends a point. C∞ is tried at an odd angle (37°). */
export function operate(e: SymElement, v: Vec): Vec {
  switch (e.kind) {
    case 'C':
      return rotate(v, norm(e.axis!), e.n ? 360 / e.n : 37);
    case 'σ':
      return reflect(v, norm(e.normal!));
    case 'i':
      return scale(v, -1);
    default: {
      const u = norm(e.axis!);
      return reflect(rotate(v, u, 360 / e.n!), u);
    }
  }
}

/**
 * The atom each atom lands on under the element (−1 when it lands on none of its own kind):
 * a true symmetry element gives a permutation.
 */
export function imageOf(m: Molecule3, e: SymElement): number[] {
  return m.atoms.map((a) => {
    const q = operate(e, a.p);
    return m.atoms.findIndex((b) => b.el === a.el && Math.hypot(...sub(b.p, q)) < 1e-6);
  });
}

/** Whether the element maps the molecule onto itself. */
export const maps = (m: Molecule3, e: SymElement) => {
  const img = imageOf(m, e);
  return img.every((k) => k >= 0) && new Set(img).size === img.length;
};

// ─── The molecules ───────────────────────────────────────────────────────────

const A = (el: string, x: number, y: number, z: number): Atom3 => ({ el, p: [x, y, z] });
const r3 = Math.sqrt(3);
const deg = (d: number) => (d * Math.PI) / 180;
/** k atoms in the level plane at y, radius r, the first toward +z. */
const ringY = (el: string, k: number, r: number, y: number, start = 0) =>
  Array.from({ length: k }, (_, i) => {
    const t = deg(start + (360 * i) / k);
    return A(el, r * Math.sin(t), y, r * Math.cos(t));
  });
const bondsTo0 = (n: number, order = 1): [number, number, number][] =>
  Array.from({ length: n }, (_, i) => [0, i + 1, order]);

const C = (id: string, name: string, axis: Vec, n: number): SymElement => ({
  id,
  kind: 'C',
  name,
  axis,
  n,
});
const sigma = (id: string, name: string, normal: Vec): SymElement => ({
  id,
  kind: 'σ',
  name,
  normal,
});
const I: SymElement = { id: 'i', kind: 'i', name: 'i' };
const S = (id: string, name: string, axis: Vec, n: number): SymElement => ({
  id,
  kind: 'S',
  name,
  axis,
  n,
});

const Y: Vec = [0, 1, 0];
const X: Vec = [1, 0, 0];
const Z: Vec = [0, 0, 1];

export const SYMMETRY_MOLECULES: Record<string, Molecule3> = {
  H2O: {
    name: 'Water',
    formula: 'H₂O',
    atoms: [A('O', 0, 0.25, 0), A('H', -0.79, -0.36, 0), A('H', 0.79, -0.36, 0)],
    bonds: bondsTo0(2),
    group: 'C₂ᵥ',
    elements: [C('C2', 'C₂', Y, 2), sigma('sv', 'σᵥ', Z), sigma('sv2', 'σᵥ′', X)],
  },
  CH2Cl2: {
    name: 'Dichloromethane',
    formula: 'CH₂Cl₂',
    atoms: [
      A('C', 0, 0, 0),
      A('Cl', -0.82, -0.58, 0),
      A('Cl', 0.82, -0.58, 0),
      A('H', 0, 0.58, 0.82),
      A('H', 0, 0.58, -0.82),
    ],
    bonds: bondsTo0(4),
    group: 'C₂ᵥ',
    elements: [C('C2', 'C₂', Y, 2), sigma('sv', 'σᵥ', Z), sigma('sv2', 'σᵥ′', X)],
  },
  NH3: {
    name: 'Ammonia',
    formula: 'NH₃',
    atoms: [A('N', 0, 0.35, 0), ...ringY('H', 3, 0.94, -0.1)],
    bonds: bondsTo0(3),
    group: 'C₃ᵥ',
    elements: [C('C3', 'C₃', Y, 3), sigma('sv', 'σᵥ', X)],
  },
  BF3: {
    name: 'Boron trifluoride',
    formula: 'BF₃',
    atoms: [A('B', 0, 0, 0), ...ringY('F', 3, 1, 0)],
    bonds: bondsTo0(3),
    group: 'D₃ₕ',
    elements: [
      C('C3', 'C₃', Y, 3),
      C('C2', 'C₂', Z, 2),
      sigma('sh', 'σₕ', Y),
      sigma('sv', 'σᵥ', X),
      S('S3', 'S₃', Y, 3),
    ],
  },
  PCl5: {
    name: 'Phosphorus pentachloride',
    formula: 'PCl₅',
    atoms: [A('P', 0, 0, 0), A('Cl', 0, 1.05, 0), A('Cl', 0, -1.05, 0), ...ringY('Cl', 3, 1, 0)],
    bonds: bondsTo0(5),
    group: 'D₃ₕ',
    elements: [
      C('C3', 'C₃', Y, 3),
      C('C2', 'C₂', Z, 2),
      sigma('sh', 'σₕ', Y),
      sigma('sv', 'σᵥ', X),
      S('S3', 'S₃', Y, 3),
    ],
  },
  CH4: {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      A('C', 0, 0, 0),
      A('H', 1 / r3, 1 / r3, 1 / r3),
      A('H', 1 / r3, -1 / r3, -1 / r3),
      A('H', -1 / r3, 1 / r3, -1 / r3),
      A('H', -1 / r3, -1 / r3, 1 / r3),
    ],
    bonds: bondsTo0(4),
    group: 'T_d',
    elements: [
      C('C3', 'C₃', [1, 1, 1], 3),
      C('C2', 'C₂', X, 2),
      S('S4', 'S₄', X, 4),
      sigma('sd', 'σ_d', norm([0, 1, -1])),
    ],
  },
  XeF4: {
    name: 'Xenon tetrafluoride',
    formula: 'XeF₄',
    atoms: [A('Xe', 0, 0, 0), ...ringY('F', 4, 1, 0)],
    bonds: bondsTo0(4),
    group: 'D₄ₕ',
    elements: [
      C('C4', 'C₄', Y, 4),
      C('C2', 'C₂', Z, 2),
      sigma('sh', 'σₕ', Y),
      sigma('sv', 'σᵥ', X),
      I,
      S('S4', 'S₄', Y, 4),
    ],
  },
  SF6: {
    name: 'Sulfur hexafluoride',
    formula: 'SF₆',
    atoms: [A('S', 0, 0, 0), A('F', 0, 1, 0), A('F', 0, -1, 0), ...ringY('F', 4, 1, 0)],
    bonds: bondsTo0(6),
    group: 'O_h',
    elements: [
      C('C4', 'C₄', Y, 4),
      C('C3', 'C₃', [1, 1, 1], 3),
      sigma('sh', 'σₕ', Y),
      I,
      S('S6', 'S₆', [1, 1, 1], 6),
    ],
  },
  CO2: {
    name: 'Carbon dioxide',
    formula: 'CO₂',
    atoms: [A('C', 0, 0, 0), A('O', -1.1, 0, 0), A('O', 1.1, 0, 0)],
    bonds: bondsTo0(2, 2),
    group: 'D∞h',
    elements: [C('Cinf', 'C∞', X, 0), C('C2', 'C₂', Y, 2), sigma('sh', 'σₕ', X), I],
  },
  N2F2: {
    name: 'trans-Dinitrogen difluoride',
    formula: 'trans-N₂F₂',
    atoms: [A('N', -0.6, 0, 0), A('N', 0.6, 0, 0), A('F', -1.1, 0.85, 0), A('F', 1.1, -0.85, 0)],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
      [1, 3, 1],
    ],
    group: 'C₂ₕ',
    elements: [C('C2', 'C₂', Z, 2), sigma('sh', 'σₕ', Z), I],
  },
};

/** Card-only shapes (inorganic#0's sort), drawn the same way. */
export const CARD_MOLECULES: Record<string, Molecule3> = {
  PCl3: {
    ...SYMMETRY_MOLECULES.NH3!,
    name: 'Phosphorus trichloride',
    formula: 'PCl₃',
    atoms: [A('P', 0, 0.35, 0), ...ringY('Cl', 3, 0.94, -0.15)],
  },
  PtCl4: {
    ...SYMMETRY_MOLECULES.XeF4!,
    name: 'Tetrachloroplatinate(II)',
    formula: '[PtCl₄]²⁻',
    atoms: [A('Pt', 0, 0, 0), ...ringY('Cl', 4, 1, 0)],
  },
  FeC6N6: {
    name: 'Hexacyanoferrate(II)',
    formula: '[Fe(CN)₆]⁴⁻',
    atoms: [
      A('Fe', 0, 0, 0),
      A('C', 0, 1, 0),
      A('C', 0, -1, 0),
      ...ringY('C', 4, 1, 0),
      A('N', 0, 1.9, 0),
      A('N', 0, -1.9, 0),
      ...ringY('N', 4, 1.9, 0),
    ],
    bonds: [
      ...bondsTo0(6),
      ...Array.from({ length: 6 }, (_, i) => [i + 1, i + 7, 3] as [number, number, number]),
    ],
    group: 'O_h',
    elements: [C('C4', 'C₄', Y, 4), I],
  },
  HCN: {
    name: 'Hydrogen cyanide',
    formula: 'HCN',
    atoms: [A('C', 0, 0, 0), A('H', -0.95, 0, 0), A('N', 1.05, 0, 0)],
    bonds: [
      [0, 1, 1],
      [0, 2, 3],
    ],
    group: 'C∞v',
    elements: [C('Cinf', 'C∞', X, 0)],
  },
  C2H2: {
    name: 'Ethyne',
    formula: 'C₂H₂',
    atoms: [A('C', -0.55, 0, 0), A('C', 0.55, 0, 0), A('H', -1.45, 0, 0), A('H', 1.45, 0, 0)],
    bonds: [
      [0, 1, 3],
      [0, 2, 1],
      [1, 3, 1],
    ],
    group: 'D∞h',
    elements: [C('Cinf', 'C∞', X, 0), I],
  },
};

// ─── The view ────────────────────────────────────────────────────────────────

/** The view every symmetry picture uses: turned 25° about y, tipped 30° toward the viewer. */
export function view(v: Vec, yaw = -25, pitch = 30): { x: number; y: number; z: number } {
  const a = rotate(v, Y, yaw);
  const b = rotate(a, X, pitch);
  return { x: b[0], y: -b[1], z: b[2] };
}

export { cross, dot, norm, scale, sub };
