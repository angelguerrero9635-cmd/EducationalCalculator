/**
 * HC138 `spectralCurve` (SpectralCurveSpec in typesHe4h.ts): reflectance against wavelength
 * (0.4–2.5 μm) for vegetation, soil and water (and a burn scar with `after`), the red, NIR and
 * SWIR bands boxed, the pixel's reflectances as dots in their bands and the index they make.
 * Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { SpectralCurveSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { SPECTRA, SPECTRAL_BANDS, normDiff } from './he4hMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
type V = number | string | undefined;

const HEIGHT = 290;

export function SpectralCurve({ spec, calc }: { spec: SpectralCurveSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && rep.typed(v) ? rep.value(v, false) : n3(x);
  const nbr = spec.swir !== undefined;
  const red = get(spec.red);
  const nir = get(spec.nir);
  const swir = get(spec.swir);
  const nir2 = spec.after ? get(spec.after.nir) : undefined;
  const swir2 = spec.after ? get(spec.after.swir) : undefined;
  const second = nbr ? swir : red;
  const index = nir !== undefined && second !== undefined ? normDiff(nir, second) : undefined;
  const index2 = nir2 !== undefined && swir2 !== undefined ? normDiff(nir2, swir2) : undefined;
  const name = nbr ? 'NBR' : 'NDVI';
  const bName = nbr ? 'SWIR' : 'red';

  const lines: string[] = [];
  if (index !== undefined)
    lines.push(
      `${name}${spec.after ? ' before' : ''} = (NIR − ${bName}) ÷ (NIR + ${bName}) = (${say(spec.nir, nir!)} − ${say(nbr ? spec.swir : spec.red, second!)}) ÷ (${say(spec.nir, nir!)} + ${say(nbr ? spec.swir : spec.red, second!)}) = ${say(spec.index, index)}.`,
    );
  if (index2 !== undefined && spec.after)
    lines.push(
      `${name} after = (${say(spec.after.nir, nir2!)} − ${say(spec.after.swir, swir2!)}) ÷ (${say(spec.after.nir, nir2!)} + ${say(spec.after.swir, swir2!)}) = ${say(spec.after.index, index2)}.`,
    );
  if (index !== undefined && index2 !== undefined)
    lines.push(
      `dNBR = ${n3(index)} − ${index2 < 0 ? `(${n3(index2)})` : n3(index2)} = ${say(spec.change, index - index2)}.`,
    );
  if (index === undefined) lines.push(`Type the pixel’s reflectances to place its dots.`);
  if (spec.after) lines.push('Filled dots: before the fire; open squares: after.');
  lines.push('The curves are typical shapes, drawn for reference.');

  const dots: { l: number; r: number; after: boolean; label: string }[] = [];
  if (!nbr && red !== undefined)
    dots.push({ l: SPECTRAL_BANDS.red.at, r: red, after: false, label: say(spec.red, red) });
  if (nir !== undefined)
    dots.push({ l: SPECTRAL_BANDS.nir.at, r: nir, after: false, label: say(spec.nir, nir) });
  if (nbr && swir !== undefined)
    dots.push({ l: SPECTRAL_BANDS.swir.at, r: swir, after: false, label: say(spec.swir, swir) });
  if (spec.after && nir2 !== undefined)
    dots.push({ l: SPECTRAL_BANDS.nir.at, r: nir2, after: true, label: say(spec.after.nir, nir2) });
  if (spec.after && swir2 !== undefined)
    dots.push({
      l: SPECTRAL_BANDS.swir.at,
      r: swir2,
      after: true,
      label: say(spec.after.swir, swir2),
    });
  const top = Math.max(0.6, ...dots.map((d) => Math.ceil((d.r + 0.05) * 10) / 10));

  const curves: {
    key: keyof typeof SPECTRA;
    color: string;
    dash?: string;
    width: number;
    name: string;
  }[] = [
    { key: 'vegetation', color: c.regionPlus, width: chart.strokeHeavy, name: 'vegetation' },
    { key: 'soil', color: c.soilDark, dash: '7 4', width: chart.stroke, name: 'soil' },
    { key: 'water', color: c.waterDeep, dash: '2 3', width: chart.stroke, name: 'water' },
    ...(spec.after
      ? [
          {
            key: 'burned' as const,
            color: c.he4hCase,
            dash: '10 3 2 3',
            width: chart.stroke,
            name: 'burned',
          },
        ]
      : []),
  ];

  return (
    <View>
      <Canvas aspect={(w) => HEIGHT / w}>
        {({ w }) => {
          const x0 = 40;
          const x1 = w - 10;
          const y0 = 44;
          const y1 = HEIGHT - 40;
          const X = (l: number) => x0 + ((l - 0.4) / 2.1) * (x1 - x0);
          const Y = (r: number) => y1 - (r / top) * (y1 - y0);
          const path = (f: (l: number) => number) => {
            let d = '';
            for (let k = 0; k <= 210; k++) {
              const l = 0.4 + k * 0.01;
              d += `${k ? 'L' : 'M'}${X(l).toFixed(1)},${Y(f(l)).toFixed(1)}`;
            }
            return d;
          };
          const bands = nbr ? (['nir', 'swir'] as const) : (['red', 'nir'] as const);
          return (
            <Svg width={w} height={HEIGHT}>
              {/* The bands. */}
              {bands.map((b) => {
                const band = SPECTRAL_BANDS[b];
                return (
                  <G key={b}>
                    <Rect
                      x={X(band.from)}
                      y={y0}
                      width={X(band.to) - X(band.from)}
                      height={y1 - y0}
                      fill={c.chartSurface}
                      stroke={c.chartGrid}
                    />
                    <ChartText
                      x={(X(band.from) + X(band.to)) / 2}
                      y={y0 - 4}
                      textAnchor="middle"
                      fontWeight="700"
                    >
                      {b === 'red' ? 'red' : b === 'nir' ? 'NIR' : 'SWIR'}
                    </ChartText>
                  </G>
                );
              })}
              {/* The axes. */}
              <Line
                x1={x0}
                y1={y1}
                x2={x1}
                y2={y1}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Line
                x1={x0}
                y1={y0}
                x2={x0}
                y2={y1}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {[0.5, 1, 1.5, 2, 2.5].map((l) => (
                <G key={`x${l}`}>
                  <Line x1={X(l)} y1={y1} x2={X(l)} y2={y1 + 4} stroke={c.chartInk} />
                  <ChartText
                    {...fitLabel(X(l), formatNumber(l), chart.label, w)}
                    y={y1 + 16}
                    fill={c.chartMuted}
                  >
                    {formatNumber(l)}
                  </ChartText>
                </G>
              ))}
              <ChartText x={(x0 + x1) / 2} y={y1 + 32} textAnchor="middle" fill={c.chartMuted}>
                wavelength (μm)
              </ChartText>
              {[0, top / 2, top].map((r) => (
                <ChartText
                  key={`y${r}`}
                  x={x0 - 5}
                  y={Y(r) + 4}
                  textAnchor="end"
                  fill={c.chartMuted}
                >
                  {formatNumber(Number(r.toFixed(2)))}
                </ChartText>
              ))}
              <ChartText x={x0 + 5} y={y0 - 4} fill={c.chartMuted} fontStyle="italic">
                ρ
              </ChartText>
              {/* The curves, keyed along the top. */}
              {curves.map((cv) => (
                <Path
                  key={cv.key}
                  d={path(SPECTRA[cv.key])}
                  fill="none"
                  stroke={cv.color}
                  strokeWidth={cv.width}
                  strokeDasharray={cv.dash}
                />
              ))}
              {curves.map((cv, i) => {
                const kx = 12 + curves.slice(0, i).reduce((t, k) => t + 34 + k.name.length * 7, 0);
                return (
                  <G key={`k${cv.key}`}>
                    <Line
                      x1={kx}
                      y1={12}
                      x2={kx + 18}
                      y2={12}
                      stroke={cv.color}
                      strokeWidth={cv.width}
                      strokeDasharray={cv.dash}
                    />
                    <ChartText x={kx + 22} y={16}>
                      {cv.name}
                    </ChartText>
                  </G>
                );
              })}
              {/* The pixel's dots, before (filled) and after (open). */}
              {dots.map((d, i) => (
                <G key={`d${i}`}>
                  {d.after ? (
                    <Rect
                      x={X(d.l) - 5}
                      y={Y(d.r) - 5}
                      width={10}
                      height={10}
                      fill={c.background}
                      stroke={c.he4hCase}
                      strokeWidth={2}
                    />
                  ) : (
                    <Circle cx={X(d.l)} cy={Y(d.r)} r={5} fill={c.chartInk} />
                  )}
                  <ChartText
                    {...fitLabel(
                      X(d.l) + (d.l > 2 ? -9 : 9),
                      d.label,
                      chart.label,
                      w,
                      d.l > 2 ? 'end' : 'start',
                    )}
                    y={Y(d.r) + 4}
                    fontWeight="700"
                    fill={d.after ? c.he4hCase : c.chartInk}
                    halo
                  >
                    {d.label}
                  </ChartText>
                </G>
              ))}
              {index !== undefined ? (
                <ChartText x={x1} y={y0 + 16} textAnchor="end" fontWeight="700" halo>
                  {`${name}${spec.after ? ' before' : ''} = ${say(spec.index, index)}`}
                </ChartText>
              ) : null}
              {index2 !== undefined ? (
                <ChartText
                  x={x1}
                  y={y0 + 32}
                  textAnchor="end"
                  fontWeight="700"
                  fill={c.he4hCase}
                  halo
                >
                  {`after = ${say(spec.after?.index, index2)}`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
