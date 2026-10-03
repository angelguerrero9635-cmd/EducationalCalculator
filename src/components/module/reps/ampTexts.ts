/**
 * What an op-amp schematic shows (HC18, OpAmpSchematic.tsx), apart from the drawing: each
 * label's text from the page's values (a part the page gives no variable is named only), and
 * the numbers in SI the plots and current arrows need. Pure, so a test can lay out every demo.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { AmpCircuit, AmpSpec } from '@/data/modules/typesHe2d';
import { formatNumber } from '@/engine/format';

import { ampSolve, siUnit, type AmpIn } from './ampMath';
import type { AmpNums, AmpTexts } from './ampLayout';

/** What the picture reads from the page (useRep's helpers). */
export interface RepLike {
  known: (id: string) => boolean;
  val: (id: string) => number;
  label: (id: string) => string;
  value: (id: string) => string;
  variable: (id: string) => { symbol: string; unit?: string };
}

const sig = (x: number) => formatNumber(Number(x.toPrecision(3)) || 0);

/** The names a part takes when the page gives it no variable, per circuit. */
export const NAMES: Record<AmpCircuit, { vin: string[]; rin: string[]; rf: string; rg: string }> = {
  inverting: { vin: ['vᵢₙ'], rin: ['Rᵢₙ'], rf: 'R_f', rg: 'R_g' },
  nonInverting: { vin: ['vᵢₙ'], rin: ['Rᵢₙ'], rf: 'R_f', rg: 'R_g' },
  summing: { vin: ['v₁', 'v₂'], rin: ['R₁', 'R₂'], rf: 'R_f', rg: 'R_g' },
  difference: { vin: ['v₁', 'v₂'], rin: ['R₁'], rf: 'R₂', rg: 'R_g' },
  integrator: { vin: ['vᵢₙ'], rin: ['R'], rf: 'R_f', rg: 'R_g' },
  activeLowPass: { vin: ['vᵢₙ'], rin: ['R₁'], rf: 'R_f', rg: 'R_g' },
  schmitt: { vin: ['vᵢₙ'], rin: ['R₁'], rf: 'R₂', rg: 'R_g' },
  instrumentation: { vin: ['V_d', 'V_cm'], rin: [], rf: 'R', rg: 'R_g' },
};

/**
 * Symbols side by side as a product (R₁R₂, AᵥVᵢₙ), with a "·" where a subscript written with
 * "_" would otherwise run into its neighbour (A_d·V_d, 2·V_TH, 2π·R_f·C) and show a raw "_".
 */
export const mul = (...xs: string[]) =>
  xs.reduce((a, b) => {
    if (!a) return b;
    const runOn =
      /[\p{L}\d]$/u.test(a) &&
      (/_[\p{L}\d]*$/u.test(a) || /^\p{L}[′']?(?:\p{L}[′']?){0,2}_/u.test(b));
    return a + (runOn ? '·' : '') + b;
  }, '');

/** A fixed SI value with its prefix: 10000 Ω → "10 kΩ", 1e-6 F → "1 μF". */
export function withPrefix(x: number, base: string): string {
  const steps: [number, string][] = [
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'μ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ];
  const a = Math.abs(x);
  const [f, p] = steps.find(([s]) => a >= s * 0.9999) ?? steps[steps.length - 1]!;
  return `${sig(x / f)} ${p}${base}`.trim();
}

/** The labels, numbers and solved values of an op-amp schematic. */
export function ampPicture(spec: AmpSpec, rep: RepLike) {
  const kind = spec.amp;
  const names = NAMES[kind];
  const isVar = (x: NumOrVar | undefined): x is string => typeof x === 'string';
  const si = (x: NumOrVar | undefined): number | undefined =>
    x === undefined
      ? undefined
      : typeof x === 'number'
        ? x
        : rep.known(x)
          ? rep.val(x) * siUnit(rep.variable(x).unit)
          : undefined;
  const valOf = (x: NumOrVar | undefined, unit: string) =>
    isVar(x) ? rep.value(x) : x === undefined ? '?' : withPrefix(x, unit);
  const text = (x: NumOrVar | undefined, name: string, unit: string) =>
    isVar(x) ? rep.label(x) : x === undefined ? name : `${name} = ${withPrefix(x, unit)}`;
  const vin = spec.vin ?? [];
  const rin = spec.rin ?? [];
  const input: AmpIn = {
    vin: vin.map(si),
    rin: rin.map(si),
    rf: si(spec.rf),
    rg: si(spec.rg),
    c: si(spec.c),
    rail: si(spec.rail),
    time: si(spec.time),
    v0: si(spec.v0),
    cmrr: isVar(spec.cmrr) ? (rep.known(spec.cmrr) ? rep.val(spec.cmrr) : undefined) : spec.cmrr,
    gain:
      kind === 'instrumentation' && spec.gain && rep.known(spec.gain)
        ? rep.val(spec.gain)
        : undefined,
  };
  const solved = ampSolve(kind, input);
  const voutSi = si(spec.vout) ?? solved.vout;

  const railText = (sign: '+' | '−') =>
    spec.rail === undefined
      ? undefined
      : isVar(spec.rail) && !rep.known(spec.rail)
        ? `${sign}${rep.variable(spec.rail).symbol}`
        : `${sign}${valOf(spec.rail, 'V')}`;
  const thText = (sign: '+' | '−') =>
    spec.threshold === undefined
      ? undefined
      : sign === '+'
        ? rep.label(spec.threshold)
        : rep.known(spec.threshold)
          ? `−${rep.value(spec.threshold)}`
          : `−${rep.variable(spec.threshold).symbol}`;
  const outName = spec.vout ? rep.label(spec.vout) : 'vₒᵤₜ';
  const texts: AmpTexts = {
    vin0: text(vin[0], names.vin[0] ?? 'vᵢₙ', 'V'),
    vin1:
      kind === 'summing' || kind === 'difference' || kind === 'instrumentation'
        ? text(vin[1], names.vin[1] ?? 'v₂', 'V')
        : undefined,
    rin0: kind === 'instrumentation' ? undefined : text(rin[0], names.rin[0] ?? 'R', 'Ω'),
    rin1:
      kind === 'summing'
        ? text(rin[1], names.rin[1] ?? 'R₂', 'Ω')
        : kind === 'difference'
          ? text(rin[0], names.rin[0] ?? 'R₁', 'Ω')
          : undefined,
    rf: kind === 'integrator' ? undefined : text(spec.rf, names.rf, 'Ω'),
    rg:
      kind === 'nonInverting' || kind === 'instrumentation'
        ? text(spec.rg, names.rg, 'Ω')
        : undefined,
    c: kind === 'integrator' || kind === 'activeLowPass' ? text(spec.c, 'C', 'F') : undefined,
    vout: outName,
    gain: spec.gain ? rep.label(spec.gain) : undefined,
    railTop: railText('+'),
    railBot: railText('−'),
    time: spec.time === undefined ? undefined : text(spec.time, 't', 's'),
    v0: isVar(spec.v0) ? rep.label(spec.v0) : undefined,
    cutoff: spec.cutoff ? rep.label(spec.cutoff) : undefined,
    db: spec.db ? rep.label(spec.db) : undefined,
    thPlus: thText('+'),
    thMinus: thText('−'),
    width: spec.width ? rep.label(spec.width) : undefined,
    hum: spec.hum ? rep.label(spec.hum) : undefined,
    r2:
      kind === 'difference'
        ? text(spec.rf, 'R₂', 'Ω')
        : kind === 'instrumentation'
          ? 'R₂'
          : undefined,
    xName: kind === 'integrator' ? 't' : kind === 'schmitt' ? 'vᵢₙ' : undefined,
    yName: kind === 'integrator' || kind === 'schmitt' ? 'vₒᵤₜ' : undefined,
  };
  const [v1, v2] = input.vin;
  const [r1, r2] = input.rin;
  const drive =
    kind === 'summing'
      ? v1 !== undefined && v2 !== undefined && r1 && r2
        ? v1 / r1 + v2 / r2
        : undefined
      : ['inverting', 'integrator', 'activeLowPass'].includes(kind)
        ? v1
        : undefined;
  const nums: AmpNums = {
    flow: drive === undefined || Math.abs(drive) < 1e-15 ? undefined : Math.sign(drive),
    v0: input.v0,
    vout: voutSi,
    time: input.time,
    rail: input.rail,
    threshold: si(spec.threshold) ?? solved.threshold,
    vin: v1,
  };
  const rails = spec.rail !== undefined;
  return { texts, nums, rails, input, solved, voutSi };
}
