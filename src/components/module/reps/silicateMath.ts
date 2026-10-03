/**
 * HC117 `silicateChain`: the tetrahedra of each silicate structure seen from above, in edge
 * lengths (screen y down), with the oxygens they share counted from the drawn corners. Shared by
 * the picture and its harness check.
 */

const H = Math.sqrt(3) / 2;

/** The shares a silicate structure can have. */
export const SILICATE_SHARES = [0, 1, 2, 2.5, 3, 4];

/** One tetrahedron: its three corner oxygens (x, y) and whether it is in the boxed unit. */
export interface Tetrahedron {
  corners: [number, number][];
  boxed: boolean;
}

/** A structure: its tetrahedra (drawn and counted), its name and the oxygens' sharing. */
export interface SilicateStructure {
  name: string;
  example: string;
  tets: Tetrahedron[];
  /** Each tetrahedron's apical O is shared too (a framework). */
  apicalShared: boolean;
  /** How many tetrahedra hold each corner, by its key. */
  holders: Map<string, number>;
}

const k3 = (v: number) => String(Math.round(v * 1000) + 0);
export const cornerKey = ([x, y]: [number, number]) => `${k3(x)},${k3(y)}`;

const tri = (a: [number, number], b: [number, number], c: [number, number]) => [a, b, c];

/** A triangle with its base on y = yb from x0 to x0 + 1, apex up (−) or down (+). */
const based = (x0: number, yb: number, up: boolean): [number, number][] =>
  tri([x0, yb], [x0 + 1, yb], [x0 + 0.5, yb + (up ? -H : H)]);

/**
 * The structure for s shared oxygens per tetrahedron with n Si boxed, or nothing for a share no
 * silicate has. Padding tetrahedra run past the box so every boxed corner has its neighbour.
 */
export function silicateStructure(
  s: number,
  n: number,
  form: 'ring' | 'chain' = 'chain',
): SilicateStructure | undefined {
  n = Math.max(1, Math.round(n));
  const tets: Tetrahedron[] = [];
  let name = '';
  let example = '';
  if (s === 0) {
    name = 'Isolated tetrahedra';
    example = 'olivine, garnet';
    for (let i = 0; i < Math.max(n, 3); i++)
      tets.push({ corners: based(i * 1.7, H / 3, true), boxed: i < n });
  } else if (s === 1) {
    name = 'Pairs of tetrahedra';
    example = 'epidote';
    const pairs = Math.max(2, Math.ceil(n / 2));
    for (let i = 0; i < pairs; i++) {
      tets.push({ corners: based(i * 2.7, 0, true), boxed: 2 * i < n });
      tets.push({ corners: based(i * 2.7 + 1, 0, false), boxed: 2 * i + 1 < n });
    }
  } else if (s === 2 && form === 'ring') {
    name = n >= 3 && n <= 6 ? `A ring of ${n} tetrahedra` : 'A ring of 6 tetrahedra';
    example = n === 6 || n < 3 || n > 6 ? 'beryl, tourmaline' : n === 3 ? 'benitoite' : 'axinite';
    const k = n >= 3 && n <= 6 ? n : 6;
    const rs = 1 / (2 * Math.sin(Math.PI / k));
    for (let j = 0; j < k; j++) {
      const a0 = (2 * Math.PI * j) / k - Math.PI / 2;
      const a1 = a0 + (2 * Math.PI) / k;
      const p0: [number, number] = [rs * Math.cos(a0), rs * Math.sin(a0)];
      const p1: [number, number] = [rs * Math.cos(a1), rs * Math.sin(a1)];
      const am = (a0 + a1) / 2;
      const ro = rs * Math.cos(Math.PI / k) + H;
      tets.push({ corners: [p0, p1, [ro * Math.cos(am), ro * Math.sin(am)]], boxed: j < n });
    }
  } else if (s === 2) {
    name = 'A single chain';
    example = 'pyroxenes';
    for (let k = -2; k < 11; k++)
      tets.push({ corners: based(k - 0.5, 0, k % 2 === 0), boxed: k >= 0 && k < n });
  } else if (s === 2.5) {
    name = 'A double chain';
    example = 'amphiboles';
    // Two single chains mirrored about y = −H: the even tetrahedra share their apex. The box
    // takes whole repeats, two neighbours along one chain, then the two across from them.
    for (let k = -2; k < 11; k++) {
      const even = k % 2 === 0;
      const order = (chain: number) =>
        k < 0 ? Infinity : 4 * Math.floor(k / 2) + 2 * chain + (k % 2);
      tets.push({ corners: based(k - 0.5, 0, even), boxed: order(0) < n });
      tets.push({
        corners: tri([k - 0.5, -2 * H], [k + 0.5, -2 * H], [k, even ? -H : -3 * H]),
        boxed: order(1) < n,
      });
    }
  } else if (s === 3 || s === 4) {
    name = s === 3 ? 'A sheet' : 'A framework';
    example = s === 3 ? 'micas, clay minerals' : 'quartz, feldspars';
    // A kagome net: up triangles on a lattice (2, 0), (1, −√3), down triangles between them.
    const boxedOrder: number[] = [];
    for (let j = -2; j <= 3; j++)
      for (let i = -3; i <= 7; i++) {
        const rx = 2 * i + j;
        const ry = -2 * H * j;
        const at = tets.length;
        tets.push({ corners: tri([rx, ry], [rx + 1, ry], [rx + 0.5, ry - H]), boxed: false });
        tets.push({ corners: tri([rx + 1, ry], [rx + 2, ry], [rx + 1.5, ry + H]), boxed: false });
        if (j === 0 && i >= 1) boxedOrder.push(at, at + 1);
      }
    for (const t of boxedOrder.slice(0, n)) tets[t]!.boxed = true;
  } else return undefined;
  const holders = new Map<string, number>();
  for (const t of tets)
    for (const c of t.corners) holders.set(cornerKey(c), (holders.get(cornerKey(c)) ?? 0) + 1);
  return { name, example, tets, apicalShared: s === 4, holders };
}

/**
 * Whether n Si make whole repeats of the structure: a double chain repeats every 2 Si (one
 * tetrahedron sharing 3 and one sharing 2); an odd n boxes part of a repeat.
 */
export const wholeRepeat = (s: number, n: number) => !(s === 2.5 && Math.round(n) % 2 === 1);

/** The oxygens counted in the box: a shared O counts ½, the apical O 1 (½ in a framework). */
export function boxedOxygens(st: SilicateStructure): number {
  let o = 0;
  for (const t of st.tets) {
    if (!t.boxed) continue;
    o += st.apicalShared ? 0.5 : 1;
    for (const c of t.corners) o += 1 / st.holders.get(cornerKey(c))!;
  }
  return o;
}

/** Each boxed tetrahedron's shared oxygens (corners held twice, and a shared apex). */
export function sharesOf(st: SilicateStructure): number[] {
  return st.tets
    .filter((t) => t.boxed)
    .map(
      (t) =>
        t.corners.filter((c) => st.holders.get(cornerKey(c))! > 1).length +
        (st.apicalShared ? 1 : 0),
    );
}

/** The repeat unit's formula: Si₄O₁₁⁶⁻ (a fractional count keeps its decimal). */
export function silicateFormula(n: number, o: number, charge: number): string {
  const sub = (x: number) =>
    [...String(Number(x.toFixed(2)))].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d).join('');
  const sup = (x: number) =>
    [...String(Number(x.toFixed(2)))]
      .map((d) => (d === '.' ? '·' : ('⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? d)))
      .join('');
  const q = Math.abs(charge) < 1e-9 ? '' : `${sup(Math.abs(charge))}${charge < 0 ? '⁻' : '⁺'}`;
  return `Si${n === 1 ? '' : sub(n)}O${o === 1 ? '' : sub(o)}${q}`;
}
