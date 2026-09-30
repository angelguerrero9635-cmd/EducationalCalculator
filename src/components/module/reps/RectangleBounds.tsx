/**
 * H106 (round 3, group B): `rectangle` with `bounds`, the measurement bounds of an area. The
 * rectangle as measured (l by w), with the least rectangle the readings allow, (l − e) by
 * (w − e), dashed inside it and the greatest, (l + e) by (w + e), dashed outside, all to scale
 * about one center; the band between them shaded, where the true edges can be. When the band is
 * too thin to see, a close-up of the top-right corner shows the three edges e apart. Lengths are
 * read in the formula's units and labelled in the units shown.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';

type Spec = Extract<Representation, { kind: 'rectangle' }>;

export function RectangleBounds({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const b = spec.bounds!;
  const [l, w, e] = [rep.val(spec.length), rep.val(spec.width), rep.val(b.error)];
  const known = [spec.length, spec.width, b.error].every((id) => rep.known(id));
  const unit = rep.unit(spec.length);
  const fl = rep.factor(spec.length);
  const n = (x: number) => formatNumber(Number((x / fl).toPrecision(10)));
  const least = `(${n(l - e)} × ${n(w - e)})`;
  const most = `(${n(l + e)} × ${n(w + e)})`;
  const lines = !known
    ? ['Type the sides and the precision to draw the bounds.']
    : [
        `Measured ${rep.value(spec.length, false)} by ${rep.value(spec.width)}, each off by up to ${rep.label(b.error)}`,
        `Least: ${least}${b.least ? ` = ${rep.value(b.least)}` : ''}`,
        `Greatest: ${most}${b.greatest ? ` = ${rep.value(b.greatest)}` : ''}`,
        'The true edges lie in the shaded band',
      ];

  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w: W, h: H }) => {
          const pad = 26;
          const lo = [Math.max(0, l - e), Math.max(0, w - e)];
          const hi = [l + e, w + e];
          const s = Math.min((W - 2 * pad) / hi[0]!, (H - 2 * pad - 20) / hi[1]!);
          const cx = W / 2;
          const cy = pad + 6 + (H - 2 * pad - 20) / 2;
          const box = (x: number, y: number) =>
            ({ x: cx - (x * s) / 2, y: cy - (y * s) / 2, width: x * s, height: y * s }) as const;
          const inner = box(lo[0]!, lo[1]!);
          const mid = box(l, w);
          const outer = box(hi[0]!, hi[1]!);
          const band = e * s;
          // The band as one shape: the outer rectangle with the inner one cut out.
          const ring = `M ${outer.x} ${outer.y} h ${outer.width} v ${outer.height} h ${-outer.width} Z M ${inner.x} ${inner.y} v ${inner.height} h ${inner.width} v ${-inner.height} Z`;
          const zoom = band < 8 && known;
          // The close-up: the top-right corner magnified so e is 16 px.
          const k = zoom ? 16 / Math.max(band, 1e-9) : 1;
          const zx = W - pad - 96;
          const zy = pad + 4;
          return (
            <Svg width={W} height={H} opacity={known ? 1 : 0.4}>
              <Path d={ring} fill={c.boundsBand} fillRule="evenodd" />
              <Rect
                {...outer}
                fill="none"
                stroke={c.chartSecond}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Rect
                {...inner}
                fill="none"
                stroke={c.chartSecond}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Rect {...mid} fill="none" stroke={c.chartInk} strokeWidth={chart.strokeHeavy} />
              <ChartText
                x={cx}
                y={mid.y + mid.height + 18 + band}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {rep.label(spec.length)}
              </ChartText>
              <ChartText
                x={mid.x - 8 - band}
                y={cy + 4}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="end"
              >
                {rep.value(spec.width)}
              </ChartText>
              {!zoom && known ? (
                <ChartText
                  x={cx}
                  y={cy + 4}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartSecond}
                >
                  {`least ${least}, greatest ${most}`}
                </ChartText>
              ) : null}
              {zoom ? (
                <G>
                  <Rect
                    x={zx}
                    y={zy}
                    width={96}
                    height={72}
                    fill={c.card}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  {[-1, 0, 1].map((d) => {
                    // Each edge's corner, e·k apart, the measured one in the middle.
                    const x = zx + 60 + d * 16;
                    const y = zy + 24 - d * 16;
                    return (
                      <Path
                        key={`z${d}`}
                        d={`M ${zx + 4} ${y} L ${x} ${y} L ${x} ${zy + 70}`}
                        stroke={d === 0 ? c.chartInk : c.chartSecond}
                        strokeWidth={d === 0 ? chart.strokeHeavy : chart.stroke}
                        strokeDasharray={d === 0 ? undefined : chart.dashFine}
                        fill="none"
                      />
                    );
                  })}
                  <Line
                    x1={zx + 60}
                    y1={zy + 52}
                    x2={zx + 76}
                    y2={zy + 52}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={zx + 48} y={zy + 66} fontSize={chart.label} textAnchor="end">
                    {`e = ${n(e)}${unit ? ` ${unit}` : ''}`}
                  </ChartText>
                  <ChartText x={zx + 48} y={zy - 4} fontSize={chart.label} textAnchor="middle">
                    {`corner ×${formatNumber(Math.round(k))}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
