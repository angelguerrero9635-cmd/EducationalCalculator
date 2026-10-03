import { View } from 'react-native';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { AmpSpec } from '@/data/modules/typesHe2d';

import type { Calculator } from '../useCalculator';
import { layoutAmp } from './ampLayout';
import { NAMES, ampPicture, mul, withPrefix } from './ampTexts';
import { Canvas, Caption, useRep } from './common';
import { SchView } from './he2dKit';
import { formulaOnly } from './hskKit';

/**
 * An op-amp circuit as a schematic (HC18, `seriesCircuit` with `amp`): the triangle with its −
 * and + inputs and the rails ±V_sat as stubs, the resistors and capacitor with their values,
 * the inputs as terminals (the instrumentation amplifier's electrodes as V_d and V_cm sources),
 * v_out at the output, the input current's arrows through R_in and on through R_f. The
 * integrator's ramp and the Schmitt trigger's hysteresis loop are drawn under the circuit. A "?"
 * reads "?" and draws nothing for its value. The caption works the gain and output with the
 * page's numbers, the virtual short and the rails. Flat; no handles.
 */
export function OpAmpSchematic({ spec, calc }: { spec: AmpSpec; calc: Calculator }) {
  const rep = useRep(calc);
  const kind = spec.amp;
  const names = NAMES[kind];
  const isVar = (x: NumOrVar | undefined): x is string => typeof x === 'string';
  const symOf = (x: NumOrVar | undefined, name: string) =>
    isVar(x) ? rep.variable(x).symbol : name;
  const valOf = (x: NumOrVar | undefined, unit: string) =>
    isVar(x) ? rep.value(x) : x === undefined ? '?' : withPrefix(x, unit);
  const known = (...xs: (NumOrVar | undefined)[]) => xs.every((x) => !isVar(x) || rep.known(x));

  const { texts, nums, rails, solved, voutSi } = ampPicture(spec, rep);
  const vin = spec.vin ?? [];
  const rin = spec.rin ?? [];

  return (
    <View>
      <Canvas aspect={(w) => layoutAmp(kind, w, texts, nums, rails).height / w}>
        {({ w }) => <SchView s={layoutAmp(kind, w, texts, nums, rails)} w={w} />}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** The gain and output worked with the page's numbers, the virtual short, the rails. */
  function caption(): string {
    const lines: string[] = [];
    const worked = (good: boolean, line: string) =>
      lines.push(...(good ? [line] : formulaOnly([line])));
    const S = symOf;
    const V = valOf;
    const g = spec.gain;
    const o = spec.vout;
    const [i0, i1] = vin;
    const [q0, q1] = rin;
    const n = names;
    const vo = o ? rep.variable(o).symbol : 'vₒᵤₜ';
    switch (kind) {
      case 'inverting':
      case 'activeLowPass':
        if (g)
          worked(
            known(g, spec.rf, q0),
            `${S(g, 'A')} = −${S(spec.rf, n.rf)} ÷ ${S(q0, n.rin[0]!)} = −${V(spec.rf, 'Ω')} ÷ ${V(q0, 'Ω')} = ${rep.value(g)}`,
          );
        if (o && g && i0 !== undefined)
          worked(
            known(o, g, i0),
            `${vo} = ${mul(S(g, 'A'), S(i0, n.vin[0]!))} = ${rep.value(g)} × ${par(V(i0, 'V'))} = ${rep.value(o)}`,
          );
        if (kind === 'activeLowPass' && spec.cutoff)
          worked(
            known(spec.cutoff, spec.rf, spec.c),
            `${S(spec.cutoff, 'f_c')} = 1 ÷ (${mul('2π', S(spec.rf, n.rf), 'C')}) = ${rep.value(spec.cutoff)}`,
          );
        lines.push(
          kind === 'activeLowPass'
            ? 'Below f_c the capacitor is nearly open and the gain is −R_f ÷ R₁; above it C shorts R_f and the gain falls 20 dB a decade.'
            : 'Virtual short: v₋ = v₊ = 0 V, so the current vᵢₙ ÷ Rᵢₙ flows on through R_f; none enters the op-amp.',
        );
        break;
      case 'nonInverting':
        if (g)
          worked(
            known(g, spec.rf, spec.rg),
            `${S(g, 'A')} = 1 + ${S(spec.rf, n.rf)} ÷ ${S(spec.rg, n.rg)} = 1 + ${V(spec.rf, 'Ω')} ÷ ${V(spec.rg, 'Ω')} = ${rep.value(g)}`,
          );
        if (o && g && i0 !== undefined)
          worked(
            known(o, g, i0),
            `${vo} = ${mul(S(g, 'A'), S(i0, 'vᵢₙ'))} = ${rep.value(g)} × ${par(V(i0, 'V'))} = ${rep.value(o)}`,
          );
        lines.push('Virtual short: v₋ = v₊ = vᵢₙ; R_f and R_g divide vₒᵤₜ down to it.');
        break;
      case 'summing':
        if (o)
          worked(
            known(o, i0, i1, q0, q1, spec.rf),
            `${vo} = −${S(spec.rf, 'R_f')}(${S(i0, 'v₁')} ÷ ${S(q0, 'R₁')} + ${S(i1, 'v₂')} ÷ ${S(q1, 'R₂')}) = −${V(spec.rf, 'Ω')} × (${V(i0, 'V')} ÷ ${V(q0, 'Ω')} + ${V(i1, 'V')} ÷ ${V(q1, 'Ω')}) = ${rep.value(o)}`,
          );
        lines.push(
          'The − input is a virtual ground: each input’s current adds at it and flows on through R_f.',
        );
        break;
      case 'difference':
        if (o)
          worked(
            known(o, i0, i1, q0, spec.rf),
            `${vo} = (${S(spec.rf, 'R₂')} ÷ ${S(q0, 'R₁')})(${S(i1, 'v₂')} − ${S(i0, 'v₁')}) = (${V(spec.rf, 'Ω')} ÷ ${V(q0, 'Ω')}) × (${V(i1, 'V')} − ${par(V(i0, 'V'))}) = ${rep.value(o)}`,
          );
        lines.push(
          'Matched pairs: v₊ = v₂R₂ ÷ (R₁ + R₂), and the output makes v₋ equal to it, so only v₂ − v₁ is amplified.',
        );
        break;
      case 'integrator':
        if (o)
          worked(
            known(o, i0, q0, spec.c, spec.time, spec.v0),
            `${vo} = ${spec.v0 === undefined ? '' : `${S(spec.v0, 'v₀')} `}− ${mul(S(i0, 'vᵢₙ'), S(spec.time, 't'))} ÷ (${mul(S(q0, 'R'), S(spec.c, 'C'))}) = ${spec.v0 === undefined ? '' : `${V(spec.v0, 'V')} `}− ${V(i0, 'V')} × ${V(spec.time, 's')} ÷ (${V(q0, 'Ω')} × ${V(spec.c, 'F')}) = ${rep.value(o)}`,
          );
        lines.push(
          'A steady input pushes a steady current vᵢₙ ÷ R into C, so the output ramps down in a straight line.',
        );
        break;
      case 'schmitt':
        if (spec.threshold)
          worked(
            known(spec.threshold, spec.rail, q0, spec.rf),
            `${S(spec.threshold, 'V_TH')} = ${mul(S(spec.rail, 'Vₛₐₜ'), S(q0, 'R₁'))} ÷ (${S(q0, 'R₁')} + ${S(spec.rf, 'R₂')}) = ${V(spec.rail, 'V')} × ${V(q0, 'Ω')} ÷ (${V(q0, 'Ω')} + ${V(spec.rf, 'Ω')}) = ${rep.value(spec.threshold)}`,
          );
        if (spec.width)
          worked(
            known(spec.width, spec.threshold),
            `${S(spec.width, 'V_H')} = ${mul('2', S(spec.threshold, 'V_TH'))} = ${rep.value(spec.width)}`,
          );
        lines.push(
          'Positive feedback: the output sits at a rail. Rising past +V_TH it drops to −Vₛₐₜ; falling past −V_TH it jumps back. Between them it remembers.',
        );
        break;
      case 'instrumentation':
        if (g && spec.rf !== undefined && spec.rg !== undefined)
          worked(
            known(g, spec.rf, spec.rg),
            `${S(g, 'G')} = 1 + ${mul('2', S(spec.rf, 'R'))} ÷ ${S(spec.rg, 'R_g')} = 1 + 2 × ${V(spec.rf, 'Ω')} ÷ ${V(spec.rg, 'Ω')} = ${rep.value(g)}`,
          );
        if (o && g)
          worked(
            known(o, g, i0),
            `${vo} = ${mul(S(g, 'G'), S(i0, 'V_d'))} = ${rep.value(g)} × ${V(i0, 'V')} = ${rep.value(o)}`,
          );
        if (spec.common && g && spec.cmrr !== undefined)
          worked(
            known(spec.common, g, spec.cmrr),
            `${S(spec.common, 'A_c')} = ${S(g, 'G')} ÷ 10^(${S(spec.cmrr, 'CMRR')} ÷ 20) = ${rep.value(g)} ÷ 10^(${V(spec.cmrr, 'dB')} ÷ 20) = ${rep.value(spec.common)}`,
          );
        if (spec.hum && spec.common)
          worked(
            known(spec.hum, spec.common, i1),
            `${S(spec.hum, 'hum')} = ${mul(S(spec.common, 'A_c'), S(i1, 'V_cm'))} = ${rep.value(spec.common)} × ${V(i1, 'V')} = ${rep.value(spec.hum)}`,
          );
        lines.push(
          'The buffers A₁ and A₂ amplify only the difference V_d; A₃ subtracts, so V_cm (the hum both electrodes share) mostly cancels.',
        );
        break;
    }
    if (spec.rail !== undefined && kind !== 'schmitt') {
      if (solved.atRail && voutSi !== undefined)
        lines.push(`The output is at the rail: it can’t pass ±${V(spec.rail, 'V')}.`);
      else if (known(spec.rail)) lines.push(`Inside the rails: |${vo}| ≤ ${V(spec.rail, 'V')}.`);
    }
    return lines.join(' · ');
  }
}

/** A signed number in brackets for multiplying: (−2 V). */
const par = (t: string) => (t.startsWith('−') ? `(${t})` : t);
