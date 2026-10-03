/**
 * Shared pieces of group HE3L's college pictures (RayHe3l, PhaseSpace, WaveHe3l): values read in
 * SI from their units (a "?" reads undefined, so nothing is drawn for it), a value's label as the
 * page shows it, and the colour of light of a wavelength.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { useValueLabel } from './he1fKit';
import { fmt } from './he2fKit';
import { unitSI } from './he3lMath';

export function useHe3l(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  /**
   * A value in SI, or undefined while "?". A variable is read in its shown unit and turned to SI
   * from the unit's name (`per` per unit when the table doesn't know it); a fixed number is in
   * the field's own unit, `per` SI each.
   */
  const si = (x: NumOrVar | undefined, per = 1): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x * per;
    if (!rep.known(x)) return undefined;
    return rep.shown(x) * unitSI(rep.unit(x), per);
  };
  /**
   * A label for a field: the page's own ("λ = 500 nm") for a variable, else `symbol = value unit`
   * from `fallback` (SI ÷ `per`), or undefined while it is "?".
   */
  const label = (
    x: NumOrVar | undefined,
    symbol: string,
    fallback: number | undefined,
    unit = '',
    per = 1,
  ): string | undefined => {
    if (typeof x === 'string') return rep.known(x) ? valueLabel(x) : undefined;
    if (fallback === undefined || !Number.isFinite(fallback)) return undefined;
    const gap = unit === '' || unit === '°' ? '' : ' ';
    return `${symbol} = ${fmt(fallback / per)}${gap}${unit}`;
  };
  const known = (x: NumOrVar | undefined) => typeof x !== 'string' || rep.known(x);
  return { rep, si, label, known, valueLabel };
}

/** The colour of light of λ nm (muted outside the visible band). */
export function lightColor(c: Palette, nm: number | undefined) {
  if (nm === undefined || nm < 380 || nm > 750) return c.chartMuted;
  if (nm < 450) return c.spectrumViolet;
  if (nm < 495) return c.spectrumBlue;
  if (nm < 570) return c.spectrumGreen;
  if (nm < 590) return c.spectrumYellow;
  if (nm < 620) return c.spectrumOrange;
  return c.spectrumRed;
}

/** The colour's name, for a caption. */
export function lightName(nm: number) {
  if (nm < 380) return 'ultraviolet, not seen';
  if (nm > 750) return 'infrared, not seen';
  if (nm < 450) return 'violet';
  if (nm < 495) return 'blue';
  if (nm < 570) return 'green';
  if (nm < 590) return 'yellow';
  if (nm < 620) return 'orange';
  return 'red';
}
