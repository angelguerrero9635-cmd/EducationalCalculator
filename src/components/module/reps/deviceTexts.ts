/**
 * What a semiconductor schematic shows (HC39, DeviceSchematic.tsx), apart from the drawing:
 * each label's text from the page's values (a part with no variable is named only) and the
 * numbers in SI that set the arrows, the BJT's region and the rectified wave. Pure, like
 * ampTexts.ts.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { DeviceCircuit, DeviceSpec } from '@/data/modules/typesHe2d';

import { siUnit } from './ampMath';
import { withPrefix, type RepLike } from './ampTexts';
import { bjtDivider, bridge, diodeR, hybridPi, mosfetCS, zener, VT } from './deviceMath';
import type { DeviceNums, DeviceRole, DeviceTexts } from './deviceLayout';

/** Each circuit's parts, in `parts` order: their names and SI units. */
export const PARTS: Record<DeviceCircuit, [string, string][]> = {
  diodeR: [
    ['Vₛ', 'V'],
    ['V_D', 'V'],
    ['R', 'Ω'],
  ],
  zener: [
    ['Vₛ', 'V'],
    ['V_Z', 'V'],
    ['R', 'Ω'],
  ],
  bridge: [
    ['V_sec', 'V'],
    ['R', 'Ω'],
    ['C', 'F'],
  ],
  bjtDivider: [
    ['V_CC', 'V'],
    ['R₁', 'Ω'],
    ['R₂', 'Ω'],
    ['R_C', 'Ω'],
    ['R_E', 'Ω'],
  ],
  mosfetCS: [
    ['R_D', 'Ω'],
    ['V_DD', 'V'],
  ],
  hybridPi: [
    ['R_C', 'Ω'],
    ['R_L', 'Ω'],
  ],
};

const sign = (x: number | undefined) =>
  x === undefined || Math.abs(x) < 1e-15 ? undefined : Math.sign(x);

/** The labels, numbers and solved values of a semiconductor schematic. */
export function devicePicture(spec: DeviceSpec, rep: RepLike) {
  const kind = spec.device;
  const v = spec.values ?? {};
  const isVar = (x: NumOrVar | undefined): x is string => typeof x === 'string';
  const si = (x: NumOrVar | undefined): number | undefined =>
    x === undefined
      ? undefined
      : typeof x === 'number'
        ? x
        : rep.known(x)
          ? rep.val(x) * siUnit(rep.variable(x).unit)
          : undefined;
  const text = (x: NumOrVar | undefined, name: string, unit: string) =>
    isVar(x) ? rep.label(x) : x === undefined ? name : `${name} = ${withPrefix(x, unit)}`;
  const label = (id: string | undefined) => (id ? rep.label(id) : undefined);
  const part = (i: number) => si(spec.parts[i]);

  const texts: DeviceTexts = {};
  PARTS[kind].forEach(([name, unit], i) => {
    texts[`p${i}` as DeviceRole] = text(spec.parts[i], name, unit);
  });
  Object.assign(texts, {
    current: label(v.current),
    vr: label(v.vr),
    power: label(v.power),
    zener: label(v.zener),
    peak: label(v.peak),
    ripple: label(v.ripple),
    dc: label(v.dc),
    freq: v.frequency === undefined ? undefined : text(v.frequency, 'f_r', 'Hz'),
    base: label(v.base),
    vce: label(v.vce),
    overdrive: label(v.overdrive),
    gm: label(v.gm),
    rpi: label(v.rpi),
    rp: label(v.rp),
    gain: label(v.gain),
  } satisfies DeviceTexts);

  const nums: DeviceNums = {};
  let solved: Record<string, number | boolean | undefined> = {};
  switch (kind) {
    case 'diodeR': {
      const d = diodeR(part(0), part(1), part(2));
      solved = d;
      nums.loop = d.on === false ? undefined : sign(si(v.current) ?? d.i);
      break;
    }
    case 'zener': {
      texts.load = 'R_L';
      const z = zener(part(0), part(1), part(2), si(v.current));
      solved = z;
      nums.loop = sign(z.total);
      nums.zener = sign(si(v.zener) ?? z.iz);
      nums.load = sign(si(v.current));
      break;
    }
    case 'bridge': {
      texts.xName = 't';
      texts.yName = 'v';
      const fr = si(v.frequency);
      const b = bridge(part(0), si(spec.drop) ?? 0.7, fr, part(1), part(2));
      solved = b;
      nums.vp = si(v.peak) ?? b.vp;
      nums.vr = si(v.ripple) ?? b.vr;
      nums.vdc = si(v.dc) ?? b.vdc;
      nums.fr = fr;
      break;
    }
    case 'bjtDivider': {
      const b = bjtDivider(part(0), part(1), part(2), part(3), part(4));
      solved = b;
      const vce = si(v.vce) ?? b.vce;
      nums.active = vce === undefined ? undefined : vce > 0.2;
      break;
    }
    case 'mosfetCS': {
      texts.input = 'vᵢₙ';
      texts.output = 'vₒᵤₜ';
      const m = mosfetCS(si(v.current), si(v.overdrive), part(0));
      solved = m;
      nums.loop = sign(si(v.current));
      break;
    }
    case 'hybridPi': {
      const h = hybridPi(si(v.current), si(v.beta), part(0), part(1), si(spec.vt) ?? VT);
      solved = h;
      break;
    }
  }
  return { texts, nums, solved };
}
