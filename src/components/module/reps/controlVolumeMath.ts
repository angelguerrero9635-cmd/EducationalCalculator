/**
 * The arithmetic a `controlVolume` picture draws (HC5), shared with its harness check: flows,
 * component balances (with generation by a reaction), the energy balance and extraction
 * stages. `get` reads a fixed number or a variable's value (undefined while it is "?").
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { ControlVolumeSpec, CvFlow, CvStream } from '@/data/modules/typesHe1f';

export type Getter = (x: NumOrVar | undefined) => number | undefined;

/** A flow's value: one value, or the sum of a list (undefined if any part is "?"). */
export function flowOf(flow: CvFlow | undefined, get: Getter): number | undefined {
  if (flow === undefined) return undefined;
  if (!Array.isArray(flow)) return get(flow);
  let sum = 0;
  for (const part of flow) {
    const x = get(part);
    if (x === undefined) return undefined;
    sum += x;
  }
  return sum;
}

/** A stream's total: its flow, or the sum of its component amounts. */
export function streamTotal(s: CvStream, get: Getter): number | undefined {
  const f = flowOf(s.flow, get);
  if (f !== undefined || !s.amounts) return f;
  return flowOf(
    s.amounts.map((a) => a.n),
    get,
  );
}

/** Each component's flow in a stream, by name (fraction × flow, the rest, or its amount). */
export function componentFlows(s: CvStream, get: Getter): Map<string, number | undefined> {
  const out = new Map<string, number | undefined>();
  const total = streamTotal(s, get);
  for (const a of s.amounts ?? []) out.set(a.name, get(a.n));
  let sum: number | undefined = 0;
  for (const f of s.fractions ?? []) {
    const x = get(f.x);
    out.set(f.name, x === undefined || total === undefined ? undefined : x * total);
    sum = x === undefined || sum === undefined ? undefined : sum + x;
  }
  if (s.rest)
    out.set(s.rest, sum === undefined || total === undefined ? undefined : (1 - sum) * total);
  return out;
}

export interface Balance {
  /** The component's name, or "total". */
  name: string;
  into: number | undefined;
  out: number | undefined;
  /** Made (+) or used (−) by the reaction: ν × ξ. */
  made: number;
}

/** The streams that cross the boundary (a bypass's inside streams don't). */
const crossing = (spec: ControlVolumeSpec, dir: 'in' | 'out') =>
  spec.streams.filter((s) => s.dir === dir);

/**
 * In and out of the whole control volume, the total first and then each component; a reaction
 * adds ν_iξ to the out side's expectation (in + made = out). The total is left out when a
 * reaction changes the number of moles.
 */
export function balances(spec: ControlVolumeSpec, get: Getter): Balance[] {
  const ins = crossing(spec, 'in');
  const outs = crossing(spec, 'out');
  const sum = (xs: (number | undefined)[]) =>
    xs.some((x) => x === undefined) ? undefined : xs.reduce<number>((a, b) => a + b!, 0);
  const names: string[] = [];
  for (const s of [...ins, ...outs])
    for (const name of componentFlows(s, get).keys()) if (!names.includes(name)) names.push(name);
  const xi = spec.reaction ? get(spec.reaction.extent) : undefined;
  const nu = spec.reaction?.nu ?? {};
  const madeOf = (name: string) => (xi === undefined ? 0 : (nu[name] ?? 0) * xi);
  const of = (ss: CvStream[], name: string) =>
    sum(
      ss.map((s) => {
        const m = componentFlows(s, get);
        // A stream that doesn't name the component carries none of it.
        return m.has(name) ? m.get(name) : 0;
      }),
    );
  const rows: Balance[] = [];
  const netMoles = Object.values(nu).reduce((a, b) => a + b, 0);
  if (!spec.reaction || netMoles === 0)
    rows.push({
      name: 'total',
      into: sum(ins.map((s) => streamTotal(s, get))),
      out: sum(outs.map((s) => streamTotal(s, get))),
      made: 0,
    });
  for (const name of names)
    rows.push({ name, into: of(ins, name), out: of(outs, name), made: madeOf(name) });
  return rows;
}

/** Whether a balance holds to 0.1%. */
export const holdsBalance = (b: Balance) =>
  b.into === undefined ||
  b.out === undefined ||
  Math.abs(b.into + b.made - b.out) <= 1e-3 * Math.max(1e-3, Math.abs(b.into), Math.abs(b.out));

/** One part of the energy bar: a stream's ṁe, or Q̇ or Ẇ. */
export interface EnergyPart {
  label: string;
  value: number;
  /** The stream's index, or 'heat' / 'work'. */
  of: number | 'heat' | 'work' | 'steam';
}

/**
 * A stream's energy per unit flow: h (or c_pT) plus the kinetic energy V² ÷ 2 in kJ/kg
 * (V in m/s). Undefined when it carries none or a value is "?".
 */
export function specificEnergy(
  s: CvStream,
  spec: ControlVolumeSpec,
  get: Getter,
): number | undefined {
  let e: number | undefined;
  if (s.h !== undefined) e = get(s.h);
  else if (s.T !== undefined && spec.cp !== undefined) {
    const T = get(s.T);
    const cp = get(spec.cp);
    e = T === undefined || cp === undefined ? undefined : cp * T;
  } else if (s.V === undefined) return undefined;
  else e = 0;
  if (e === undefined) return undefined;
  if (s.V !== undefined) {
    const V = get(s.V);
    if (V === undefined) return undefined;
    e += (V * V) / 2000;
  }
  return e;
}

/**
 * The energy balance: what comes in (Σṁe in, Q̇ when positive, −Ẇ when work is done on it) and
 * what goes out (Σṁe out, Ẇ when positive, −Q̇ when heat is lost). Undefined when the streams
 * carry no energy or a value is "?".
 */
export function energyBalance(
  spec: ControlVolumeSpec,
  get: Getter,
): { into: EnergyPart[]; out: EnergyPart[] } | undefined {
  const into: EnergyPart[] = [];
  const out: EnergyPart[] = [];
  const carrying = spec.streams.filter((s) => s.dir !== 'inside');
  if (!carrying.some((s) => s.h !== undefined || s.T !== undefined || s.V !== undefined))
    return undefined;
  if (spec.unit === 'stages' || spec.unit === 'membrane') return undefined;
  // A device page with no flows works per kilogram: each stream's flow is 1.
  const perKg = carrying.every((s) => s.flow === undefined && !s.amounts);
  for (const [i, s] of spec.streams.entries()) {
    if (s.dir === 'inside') continue;
    const m = perKg ? 1 : streamTotal(s, get);
    const e = specificEnergy(s, spec, get);
    if (m === undefined || e === undefined) return undefined;
    const side = s.dir === 'in' ? into : out;
    // The kinetic energy V² ÷ 2 is its own part of the bar, beside h.
    const V = s.V === undefined ? undefined : get(s.V);
    const ke = V === undefined ? 0 : (V * V) / 2000;
    side.push({ label: s.name, value: m * (e - ke), of: i });
    if (ke > 0) side.push({ label: 'V²/2', value: m * ke, of: i });
  }
  if (spec.heat !== undefined) {
    const q = get(spec.heat);
    if (q === undefined) return undefined;
    if (q > 0) into.push({ label: 'Q̇', value: q, of: 'heat' });
    else if (q < 0) out.push({ label: 'Q̇ lost', value: -q, of: 'heat' });
  }
  if (spec.work !== undefined) {
    const w0 = get(spec.work);
    if (w0 === undefined) return undefined;
    const w = spec.workIn ? -w0 : w0;
    if (w > 0) out.push({ label: 'Ẇ', value: w, of: 'work' });
    else if (w < 0) into.push({ label: 'Ẇ in', value: -w, of: 'work' });
  }
  return { into, out };
}

/** Extraction: the fraction of solute left after n stages (crosscurrent or countercurrent). */
export function stagesLeft(
  n: number,
  kd: number,
  ratio: number,
  flow: 'crosscurrent' | 'countercurrent',
): number {
  if (flow === 'crosscurrent') return (1 / (1 + (kd * ratio) / n)) ** n;
  // Countercurrent (Kremser): the whole solvent passes every stage, E = K_D S ÷ F.
  const E = kd * ratio;
  if (Math.abs(E - 1) < 1e-9) return 1 / (n + 1);
  return (E - 1) / (E ** (n + 1) - 1);
}

/** The extraction factor of one stage: K_D S ÷ F, the solvent split n ways if crosscurrent. */
export const stageFactor = (
  n: number,
  kd: number,
  ratio: number,
  flow: 'crosscurrent' | 'countercurrent',
) => (flow === 'crosscurrent' ? (kd * ratio) / n : kd * ratio);

/**
 * The fraction of solute left in the raffinate after each stage in turn. Countercurrent, from
 * the Kremser profile with the feed entering stage 1 and fresh solvent stage n:
 * x_k ÷ x_0 = (E^(n+1−k) − 1) ÷ (E^(n+1) − 1).
 */
export function leftAfterEach(
  n: number,
  kd: number,
  ratio: number,
  flow: 'crosscurrent' | 'countercurrent',
): number[] {
  if (flow === 'countercurrent') {
    const E = kd * ratio;
    return Array.from({ length: n }, (_, i) =>
      Math.abs(E - 1) < 1e-9 ? (n - i) / (n + 1) : (E ** (n - i) - 1) / (E ** (n + 1) - 1),
    );
  }
  const per = 1 / (1 + (kd * ratio) / n);
  return Array.from({ length: n }, (_, k) => per ** (k + 1));
}

/** Residence time τ = V ÷ q × factor. */
export const residenceTime = (V: number, q: number, factor = 1) => (V / q) * factor;

/** Food-to-microorganism ratio F/M = QS₀ ÷ (VX). */
export const foodToMass = (Q: number, S0: number, V: number, X: number) => (Q * S0) / (V * X);

/**
 * Where a stream's arrow meets the unit: an inlet from the left, an outlet to the right, an
 * evaporator's vapour out of the top and a membrane's permeate out of the bottom.
 */
export function streamSide(spec: ControlVolumeSpec, i: number): 'L' | 'R' | 'T' | 'B' {
  const s = spec.streams[i]!;
  const kind = spec.device ?? spec.unit;
  if (kind === 'evaporator' && !spec.bypass && i === 1) return 'T';
  if (kind === 'membrane' && i === 2) return 'B';
  return s.dir === 'in' ? 'L' : 'R';
}
