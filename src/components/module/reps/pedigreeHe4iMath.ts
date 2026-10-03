/**
 * HC144 (round 4, group I): a pedigree's layout, shared by the calculator picture and the card
 * figure (one drawing of `people`, as the explore figure lists them), and which modes of
 * inheritance a pedigree allows, for the layout check.
 */
import type { PedigreePerson } from '@/data/modules/layouts';

export type Mode = 'AD' | 'AR' | 'XD' | 'XR';

export interface PedigreePlace {
  x: number;
  y: number;
  /** The person's number in their generation, from 1. */
  n: number;
  row: number;
}

/** A couple and their children (ids), from each child's parents and from partners. */
export interface Couple {
  a: string;
  b: string;
  kids: string[];
}

/**
 * Where each person goes in a box `w` wide: a row per generation from `top`, `rowH` apart,
 * people spaced evenly in the order listed (between `left` and `w − right`).
 */
export function pedigreeLayout(
  people: PedigreePerson[],
  w: number,
  o: { top: number; rowH: number; left: number; right: number },
) {
  const gens = [...new Set(people.map((p) => p.generation))].sort((a, b) => a - b);
  const place = new Map<string, PedigreePlace>();
  for (const [row, g] of gens.entries()) {
    const list = people.filter((p) => p.generation === g);
    const slot = (w - o.left - o.right) / list.length;
    list.forEach((p, i) =>
      place.set(p.id, { x: o.left + slot * (i + 0.5), y: o.top + row * o.rowH, n: i + 1, row }),
    );
  }
  const widest = Math.max(1, ...gens.map((g) => people.filter((p) => p.generation === g).length));
  return { gens, place, couples: couplesOf(people), slot: (w - o.left - o.right) / widest };
}

/** Couples: from each child's parents, and partners with no children shown. */
export function couplesOf(people: PedigreePerson[]): Couple[] {
  const ids = new Set(people.map((p) => p.id));
  const couples = new Map<string, Couple>();
  for (const p of people) {
    const pair = p.parents ?? (p.partner ? ([p.id, p.partner] as [string, string]) : undefined);
    if (!pair || !ids.has(pair[0]) || !ids.has(pair[1])) continue;
    const key = [...pair].sort().join('+');
    const couple = couples.get(key) ?? { a: pair[0], b: pair[1], kids: [] };
    if (p.parents) couple.kids.push(p.id);
    couples.set(key, couple);
  }
  return [...couples.values()];
}

/** A fraction with a bottom to 1000 ("2/3", "1/150"), else 3 significant figures. */
export function chanceText(
  x: number,
  fraction: (x: number, b: number) => [number, number] | undefined,
) {
  if (x === 0 || x === 1) return String(x);
  const f = fraction(x, 1000);
  return f ? `${f[0]}/${f[1]}` : String(Number(x.toPrecision(3)));
}

// ─── Which modes a pedigree allows ───────────────────────────────────────────────

/** Allele copies a person can carry: autosomal 0–2; X-linked 0–1 for a male, 0–2 for a female. */
const genotypes = (mode: Mode, p: PedigreePerson) =>
  mode[0] === 'X' && p.sex === 'male' ? [0, 1] : [0, 1, 2];

/** Whether genotype g shows the trait under the mode (full penetrance). */
const shows = (mode: Mode, p: PedigreePerson, g: number) =>
  mode[0] === 'X' && p.sex === 'male' ? g === 1 : mode[1] === 'D' ? g >= 1 : g === 2;

/** The allele copies a parent can pass on. */
const gametes = (g: number) => (g === 0 ? [0] : g === 2 ? [1] : [0, 1]);

/** Whether a child's genotype can come from its parents under the mode. */
function inherits(mode: Mode, child: PedigreePerson, g: number, father: number, mother: number) {
  if (mode[0] === 'X') {
    // A son gets his X from his mother; a daughter one X from each parent (a father's one X).
    if (child.sex === 'male') return gametes(mother).includes(g);
    return gametes(mother).some((m) => m + father === g);
  }
  return gametes(father).some((f) => gametes(mother).some((m) => f + m === g));
}

/**
 * Whether the pedigree is possible under the mode: every person's symbol fits a genotype and
 * every child's genotype can come from its parents'. With `marked` the half-filled symbols are
 * every carrier there is (an unaffected person without one carries nothing); without, any
 * unaffected person may carry. A half-filled symbol is a carrier who does not show the trait:
 * impossible under a dominant mode, and for a male under an X-linked one.
 */
export function modePossible(people: PedigreePerson[], mode: Mode, marked = false): boolean {
  // Parents before their children.
  const order = [...people].sort((a, b) => a.generation - b.generation);
  const byId = new Map(people.map((p) => [p.id, p]));
  const fits = (p: PedigreePerson, g: number) => {
    if (shows(mode, p, g) !== !!p.trait) return false;
    if (p.trait) return true;
    if (p.carrier) return g >= 1;
    return marked ? g === 0 : true;
  };
  const g = new Map<string, number>();
  const go = (i: number): boolean => {
    if (i === order.length) return true;
    const p = order[i]!;
    for (const x of genotypes(mode, p)) {
      if (!fits(p, x)) continue;
      if (p.parents) {
        const [a, b] = p.parents.map((id) => byId.get(id));
        if (a && b) {
          const father = a.sex === 'male' ? a : b;
          const mother = a.sex === 'male' ? b : a;
          if (!inherits(mode, p, x, g.get(father.id)!, g.get(mother.id)!)) continue;
        }
      }
      g.set(p.id, x);
      if (go(i + 1)) return true;
    }
    g.delete(p.id);
    return false;
  };
  return go(0);
}

/** The mode a sort bin names, from its id or label. */
export function modeOfBin(b: { id: string; label: string }): Mode | undefined {
  const t = `${b.id} ${b.label}`.toLowerCase();
  if (/x-linked recessive|\bxr\b/.test(t)) return 'XR';
  if (/x-linked dominant|\bxd\b/.test(t)) return 'XD';
  if (/autosomal dominant|\bad\b/.test(t)) return 'AD';
  if (/autosomal recessive|\bar\b/.test(t)) return 'AR';
  return undefined;
}
