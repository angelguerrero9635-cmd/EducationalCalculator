import { View } from 'react-native';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { DeviceSpec } from '@/data/modules/typesHe2d';

import type { Calculator } from '../useCalculator';
import { withPrefix } from './ampTexts';
import { Canvas, Caption, useRep } from './common';
import { layoutDevice } from './deviceLayout';
import { PARTS, devicePicture } from './deviceTexts';
import { SchView } from './he2dKit';
import { formulaOnly } from './hskKit';

/**
 * A semiconductor circuit as a schematic (HC39, `seriesCircuit` with `device`): a diode and
 * resistor in series, the zener regulator with its load, the bridge rectifier with C and R and
 * its rectified wave (the ripple drawn to scale), the divider-biased npn (faded once V_CE falls
 * to 0.2 V: saturated), the common-source MOSFET, and the hybrid-π model with R_C ∥ R_L. Each
 * part carries its value, the currents run as arrows the way they flow, a "?" reads "?". The
 * caption works the page's relations with its numbers. Flat; no handles.
 */
export function DeviceSchematic({ spec, calc }: { spec: DeviceSpec; calc: Calculator }) {
  const rep = useRep(calc);
  const kind = spec.device;
  const { texts, nums, solved } = devicePicture(spec, rep);

  return (
    <View>
      <Canvas aspect={(w) => layoutDevice(kind, w, texts, nums).height / w}>
        {({ w }) => <SchView s={layoutDevice(kind, w, texts, nums)} w={w} />}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** The page's relations with its numbers, and what the model assumes. */
  function caption(): string {
    const lines: string[] = [];
    const v = spec.values ?? {};
    const isVar = (x: NumOrVar | undefined): x is string => typeof x === 'string';
    const known = (...xs: (NumOrVar | undefined)[]) => xs.every((x) => !isVar(x) || rep.known(x));
    const worked = (good: boolean, line: string) =>
      lines.push(...(good ? [line] : formulaOnly([line])));
    const names = PARTS[kind];
    const p = spec.parts;
    const S = (x: NumOrVar | undefined, name: string) => (isVar(x) ? rep.variable(x).symbol : name);
    const V = (x: NumOrVar | undefined, unit: string) =>
      isVar(x) ? rep.value(x) : x === undefined ? '?' : withPrefix(x, unit);
    const P = (i: number) => S(p[i], names[i]![0]);
    const PV = (i: number) => V(p[i], names[i]![1]);
    const out = (id: string | undefined, rhs: string, vals: string, ...deps: NumOrVar[]) => {
      if (id) worked(known(id, ...deps), `${S(id, '')} = ${rhs} = ${vals} = ${rep.value(id)}`);
    };
    switch (kind) {
      case 'diodeR':
        if (solved.on === false) {
          lines.push(
            `${P(0)} = ${PV(0)} is below the drop ${P(1)} = ${PV(1)}: the diode is off and no current flows.`,
          );
          break;
        }
        out(v.vr, `${P(0)} − ${P(1)}`, `${PV(0)} − ${PV(1)}`, p[0]!, p[1]!);
        if (v.vr)
          out(v.current, `${S(v.vr, '')} ÷ ${P(2)}`, `${V(v.vr, 'V')} ÷ ${PV(2)}`, v.vr, p[2]!);
        if (v.current)
          out(
            v.power,
            `${P(1)}${S(v.current, 'I')}`,
            `${PV(1)} × ${V(v.current, 'A')}`,
            p[1]!,
            v.current,
          );
        lines.push(
          'Constant-drop model: the diode takes its drop and points the way the current flows.',
        );
        break;
      case 'zener':
        if (v.current && v.zener)
          worked(
            known(p[0], p[1], p[2], v.current, v.zener),
            `(${P(0)} − ${P(1)}) ÷ ${P(2)} = (${PV(0)} − ${PV(1)}) ÷ ${PV(2)} = ${S(v.current, 'I_L')} + ${S(v.zener, 'I_Z')}`,
          );
        out(
          v.power,
          `${P(1)}(${P(0)} − ${P(1)}) ÷ ${P(2)}`,
          `${PV(1)} × (${PV(0)} − ${PV(1)}) ÷ ${PV(2)}`,
          p[0]!,
          p[1]!,
          p[2]!,
        );
        lines.push(
          'The zener holds V_Z across the load; R drops the rest, and its current splits between the zener and the load. P_Z is with no load.',
        );
        break;
      case 'bridge':
        out(
          v.peak,
          `${P(0)} − 2${spec.drop === undefined ? ' × 0.7 V' : S(spec.drop, 'V_D')}`,
          `${PV(0)} − 2 × ${spec.drop === undefined ? '0.7 V' : V(spec.drop, 'V')}`,
          p[0]!,
          spec.drop ?? 0,
        );
        if (v.peak && v.frequency !== undefined)
          out(
            v.ripple,
            `${S(v.peak, 'V_p')} ÷ (${S(v.frequency, 'f_r')}${P(1)}${P(2)})`,
            `${V(v.peak, 'V')} ÷ (${V(v.frequency, 'Hz')} × ${PV(1)} × ${PV(2)})`,
            v.peak,
            v.frequency,
            p[1]!,
            p[2]!,
          );
        if (v.peak && v.ripple)
          out(
            v.dc,
            `${S(v.peak, 'V_p')} − ${S(v.ripple, 'V_r')} ÷ 2`,
            `${V(v.peak, 'V')} − ${V(v.ripple, 'V')} ÷ 2`,
            v.peak,
            v.ripple,
          );
        lines.push(
          'Two diodes conduct each half cycle, so the ripple comes at twice the line frequency. Dashed: the wave without C; solid: C’s voltage, drawn to scale.',
        );
        break;
      case 'bjtDivider':
        out(
          v.base,
          `${P(0)}${P(2)} ÷ (${P(1)} + ${P(2)})`,
          `${PV(0)} × ${PV(2)} ÷ (${PV(1)} + ${PV(2)})`,
          p[0]!,
          p[1]!,
          p[2]!,
        );
        if (v.base)
          out(
            v.current,
            `(${S(v.base, 'V_B')} − 0.7 V) ÷ ${P(4)}`,
            `(${V(v.base, 'V')} − 0.7 V) ÷ ${PV(4)}`,
            v.base,
            p[4]!,
          );
        if (v.current)
          out(
            v.vce,
            `${P(0)} − ${S(v.current, 'I_C')}(${P(3)} + ${P(4)})`,
            `${PV(0)} − ${V(v.current, 'A')} × (${PV(3)} + ${PV(4)})`,
            p[0]!,
            v.current,
            p[3]!,
            p[4]!,
          );
        lines.push(
          nums.active === false
            ? 'V_CE is 0.2 V or less: the transistor saturates and the active-mode formulas no longer hold.'
            : 'Active: V_CE is above 0.2 V. Stiff divider (base current ignored), V_BE = 0.7 V, I_E ≈ I_C.',
        );
        break;
      case 'mosfetCS':
        out(
          v.gm,
          `2${S(v.current, 'I_D')} ÷ ${S(v.overdrive, 'V_OV')}`,
          `2 × ${V(v.current, 'A')} ÷ ${V(v.overdrive, 'V')}`,
          v.current ?? 0,
          v.overdrive ?? 0,
        );
        if (v.gm)
          out(v.gain, `−${S(v.gm, 'g_m')}${P(0)}`, `−${V(v.gm, 'S')} × ${PV(0)}`, v.gm, p[0]!);
        lines.push(
          'In saturation; a small input swing at the gate moves I_D by g_m v_gs, and R_D turns it into the output.',
        );
        break;
      case 'hybridPi':
        out(
          v.gm,
          `${S(v.current, 'I_C')} ÷ ${S(spec.vt, 'V_T')}`,
          `${V(v.current, 'A')} ÷ ${spec.vt === undefined ? '25.85 mV' : V(spec.vt, 'V')}`,
          v.current ?? 0,
          spec.vt ?? 0,
        );
        if (v.gm && v.beta !== undefined)
          out(
            v.rpi,
            `${S(v.beta, 'β')} ÷ ${S(v.gm, 'g_m')}`,
            `${V(v.beta, '')} ÷ ${V(v.gm, 'S')}`,
            v.beta,
            v.gm,
          );
        out(
          v.rp,
          `${P(0)}${P(1)} ÷ (${P(0)} + ${P(1)})`,
          `${PV(0)} × ${PV(1)} ÷ (${PV(0)} + ${PV(1)})`,
          p[0]!,
          p[1]!,
        );
        if (v.gm && v.rp)
          out(
            v.gain,
            `−${S(v.gm, 'g_m')}${S(v.rp, 'R_p')}`,
            `−${V(v.gm, 'S')} × ${V(v.rp, 'Ω')}`,
            v.gm,
            v.rp,
          );
        lines.push(
          'Small signals: the base sees r_π, the collector a current source g_m v_π into R_C ∥ R_L (emitter bypassed, r_o ignored).',
        );
        break;
    }
    return lines.join(' · ');
  }
}
