import { Circle, G } from 'react-native-svg';

import type { HrMassSpec } from '@/data/modules/typesHs2f';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { HR_WINDOW } from './earthModel';
import {
  mainSequenceT,
  MASS_MARKS,
  massLifetime,
  massLuminosity,
  MASS_RANGE,
} from './earthModelHs2f';
import { HrDiagram, X, Y } from './HrDiagram';

const sig = (x: number, n = 3) => formatNumber(Number(x.toPrecision(n)));
const years = (t: number) => (t >= 1e6 ? scientific(Number(t.toPrecision(3))) : sig(t));

/**
 * A main-sequence star placed by its mass (HrMassSpec): the H–R diagram with the masses marked
 * along the main sequence, the star at L = M^3.5 on it, and its lifetime in the caption.
 */
export function HrMass({ spec, calc }: { spec: HrMassSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const m = Math.max(MASS_RANGE.min, Math.min(MASS_RANGE.max, num(spec.mass, 1)));
  const on = known(spec.mass);
  const l = Math.min(
    HR_WINDOW.lHigh,
    Math.max(
      HR_WINDOW.lLow,
      spec.luminosity !== undefined ? num(spec.luminosity, 1) : massLuminosity(m),
    ),
  );
  const t = mainSequenceT(l);
  const life = spec.lifetime !== undefined ? num(spec.lifetime, 1e10) : massLifetime(m);
  const marks = (
    <G>
      {MASS_MARKS.filter(
        // A mark beside the star would sit on its name: left out.
        (mm) => Math.abs(Math.log10(massLuminosity(mm)) - Math.log10(l)) > 0.8,
      ).map((mm) => {
        const ml = massLuminosity(mm);
        const x = X(mainSequenceT(ml));
        const y = Y(ml);
        // Named on the band's upper right, away from the region names under it.
        return (
          <G key={mm}>
            <Circle cx={x} cy={y} r={2.5} fill={c.moonLit} />
            <HaloText
              x={x + 7}
              y={y - 8}
              text={`${formatNumber(mm)} M☉`}
              c={c}
              size={chart.label}
              anchor="start"
            />
          </G>
        );
      })}
    </G>
  );
  const name = spec.name ?? 'The star';
  const caption = on
    ? `${name}: ${sig(m)} M☉ on the main sequence shines L = ${sig(m)}^3.5 = ${sig(l)} L☉, at about ${formatNumber(Math.round(t / 10) * 10)} K. It burns hydrogen in its core for t = 10¹⁰ ÷ ${sig(m)}^2.5 = ${years(life)} years: more mass, a much shorter life.`
    : 'Type the mass to place the star on the main sequence.';
  return (
    <HrDiagram
      spec={{ kind: 'hrDiagram', temperature: t, luminosity: l, name: spec.name, fixed: true }}
      calc={calc}
      extra={marks}
      caption={caption}
    />
  );
}
