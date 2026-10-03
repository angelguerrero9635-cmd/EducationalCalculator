/**
 * The `ir` card figure (HC55, `typesHe3e.ts`): an IR spectrum, 140 × 60, computed from its band
 * list (`instrumentTraceMath.ts`), never traced. Transmittance runs along the top and dips into
 * each band (shaded); the wavenumber axis runs 4000 → 400 cm⁻¹ with ticks every 1000. Flat, in
 * the card's text color.
 */
import { G, Line, Path } from 'react-native-svg';

import { irTransmittance } from '@/components/module/reps/instrumentTraceMath';
import { ChartText } from '@/components/module/reps/common';
import { IR_CARD_H, IR_CARD_W, type IrCard } from '@/data/modules/typesHe3e';
import { chart } from '@/theme';

const X0 = 4;
const X1 = IR_CARD_W - 4;
const TOP = 4;
const BASE = 40;

/** x of a wavenumber on the reversed axis. */
export const irX = (nu: number) => X0 + ((4000 - nu) / 3600) * (X1 - X0);

export function IrCardView({ f, ink, shade }: { f: IrCard; ink: string; shade: string }) {
  const n = 180;
  const pts = Array.from({ length: n + 1 }, (_, k) => {
    const nu = 4000 - (3600 * k) / n;
    return [irX(nu), TOP + (1 - irTransmittance(nu, f.bands)) * (BASE - TOP)] as const;
  });
  const line = pts.map(([x, y], k) => `${k ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <G>
      <Path d={`M ${X0} ${TOP} L${line.slice(1)} L ${X1} ${TOP} Z`} fill={shade} />
      <Path d={line} fill="none" stroke={ink} strokeWidth={chart.strokeLight} />
      <Line x1={X0} y1={BASE + 3} x2={X1} y2={BASE + 3} stroke={ink} strokeWidth={1} />
      {[4000, 3000, 2000, 1000].map((nu) => (
        <G key={nu}>
          <Line
            x1={irX(nu)}
            y1={BASE + 3}
            x2={irX(nu)}
            y2={BASE + 6}
            stroke={ink}
            strokeWidth={1}
          />
          <ChartText
            x={nu === 4000 ? X0 : irX(nu)}
            y={IR_CARD_H - 3}
            fontSize={chart.label}
            textAnchor={nu === 4000 ? 'start' : 'middle'}
            fill={ink}
          >
            {String(nu)}
          </ChartText>
        </G>
      ))}
    </G>
  );
}
