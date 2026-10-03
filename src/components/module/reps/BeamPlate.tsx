import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { BeamSpec } from '@/data/modules/typesHe1a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, BeamDefs, Dimension, Hatch, HeLabel, useBeamReader } from './beamKit';
import { Canvas, Caption } from './common';
import { url, usePaintIds } from './paint';

/** How far the middle sags in the drawing, whatever w_max is (said in the caption). */
const SAG = 22;
const H = 236;

/** A simply supported plate's edge factor (5 + ν) ÷ (1 + ν) with ν = 0.3, for its shape. */
const SIMPLE = 5.3 / 1.3;

/**
 * `plate` (HC1): a circular plate of radius a and thickness t cut through its middle (a small
 * top view shows the cut), under a uniform pressure p; its edge clamped in a wall or resting on
 * a knife edge; the bent middle surface dashed with w_max at the center (drawn bigger than
 * life). The bent shape is (1 − ρ²)² clamped, (1 − ρ²)(f − ρ²) simply supported (ρ = r ÷ a).
 */
export function BeamPlate({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  const c = usePalette();
  const B = useBeamReader(calc);
  const { v, known, rep } = B;
  const ids = usePaintIds('steel', 'light');
  const pl = spec.plate!;
  const a = Math.max(1e-9, v(pl.radius, 1));
  const t = Math.max(0, v(pl.thickness, a / 20));
  const named = pl.edge === 'clamped' || pl.edge === 'simple';
  const factor = named ? (pl.edge === 'clamped' ? 1 : SIMPLE) : v(pl.edge as string | number, 1);
  const edgeKnown = named || known(pl.edge as string | number);
  const clamped = factor <= 1 + 1e-6;
  const lenUnit =
    spec.units?.length ??
    (typeof pl.radius === 'string' ? (rep.variable(pl.radius).unit ?? 'mm') : 'mm');
  const shape = (rho: number) => {
    const r2 = Math.min(1, rho * rho);
    return clamped ? (1 - r2) ** 2 : ((1 - r2) * (factor - r2)) / factor;
  };
  const allKnown = B.all(pl.radius, pl.thickness, pl.pressure) && edgeKnown;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const cx = w / 2;
          const half = Math.min(w / 2 - 44, 150);
          const s = half / a;
          const tPx = Math.max(4, t * s);
          const thin = t * s < 4;
          const yTop = 104;
          const yMid = yTop + tPx / 2;
          const X = (r: number) => cx + r * s;
          const sag = (r: number) => (allKnown ? SAG * shape(Math.abs(r) / a) : 0);
          const n = 13;
          return (
            <Svg width={w} height={H}>
              <Defs>
                <BeamDefs ids={ids} />
              </Defs>
              {/* A small top view: the circular plate and where it is cut. */}
              <Ellipse cx={30} cy={26} rx={22} ry={11} fill={c.metal} stroke={c.metalDark} />
              <Line
                x1={6}
                y1={26}
                x2={54}
                y2={26}
                stroke={c.chartInk}
                strokeDasharray={chart.dashFine}
              />
              <HeLabel
                x={58}
                y={30}
                text="cut"
                anchor="start"
                chip={false}
                color={c.chartMuted}
                w={w}
              />
              {/* The pressure on top. */}
              {known(pl.pressure) ? (
                <G>
                  <Rect
                    x={X(-a)}
                    y={yTop - 30}
                    width={2 * half}
                    height={28}
                    fill={c.beamLoad}
                    opacity={0.1}
                  />
                  <Line
                    x1={X(-a)}
                    y1={yTop - 30}
                    x2={X(a)}
                    y2={yTop - 30}
                    stroke={c.beamLoad}
                    strokeWidth={chart.stroke}
                  />
                  {[...Array(n).keys()].map((i) => {
                    const x = X(-a + (2 * a * i) / (n - 1));
                    return (
                      <Arrow
                        key={i}
                        x1={x}
                        y1={yTop - 30}
                        x2={x}
                        y2={yTop - 2}
                        color={c.beamLoad}
                        width={1.5}
                        head={6}
                      />
                    );
                  })}
                  <HeLabel
                    x={cx}
                    y={yTop - 36}
                    text={B.named(pl.pressure, 'p', v(pl.pressure))}
                    color={c.beamLoad}
                    w={w}
                  />
                </G>
              ) : null}
              {/* The plate's section, painted steel, to scale. */}
              <Rect
                x={X(-a)}
                y={yTop}
                width={2 * half}
                height={tPx}
                fill={url(ids.steel)}
                stroke={c.metalDark}
              />
              {/* Its edge: clamped in a wall, or resting on knife edges. */}
              {edgeKnown ? (clamped ? clampedEdges() : simpleEdges()) : null}
              {/* The bent middle surface, dashed. */}
              {allKnown ? (
                <Path
                  d={`M ${[...Array(81).keys()]
                    .map((i) => {
                      const r = -a + (2 * a * i) / 80;
                      return `${X(r)} ${yMid + sag(r)}`;
                    })
                    .join(' L ')}`}
                  stroke={c.beamDeflect}
                  strokeWidth={chart.stroke}
                  strokeDasharray="6 4"
                  fill="none"
                />
              ) : null}
              <Line
                x1={cx}
                y1={yTop - 50}
                x2={cx}
                y2={yTop + tPx + SAG + 30}
                stroke={c.chartMuted}
                strokeDasharray="8 3 2 3"
                strokeWidth={1}
              />
              {allKnown && pl.deflection !== undefined && known(pl.deflection) ? (
                <G>
                  <Line
                    x1={cx + 6}
                    y1={yMid}
                    x2={cx + 6}
                    y2={yMid + SAG}
                    stroke={c.beamDeflect}
                    strokeWidth={1.5}
                  />
                  <HeLabel
                    x={cx + 10}
                    y={yMid + SAG + 16}
                    text={B.named(pl.deflection, 'w_max', 0)}
                    color={c.beamDeflect}
                    anchor="start"
                    w={w}
                  />
                </G>
              ) : null}
              {pl.stress !== undefined && known(pl.stress) ? (
                <HeLabel
                  x={X(-a) + 4}
                  y={yTop + tPx + SAG + 30}
                  text={B.named(pl.stress, 'σ_max', 0)}
                  anchor="start"
                  w={w}
                />
              ) : null}
              {known(pl.radius) ? (
                <Dimension
                  x1={cx}
                  x2={X(a)}
                  y={H - 22}
                  text={B.named(pl.radius, 'a', a, lenUnit)}
                  w={w}
                />
              ) : null}
              {known(pl.thickness) ? (
                <HeLabel
                  x={w - 4}
                  y={yTop - 40}
                  text={B.named(pl.thickness, 't', t, lenUnit)}
                  anchor="end"
                  w={w}
                />
              ) : null}
              {thin && known(pl.thickness) ? (
                <HeLabel
                  x={w - 4}
                  y={yTop - 24}
                  text="(drawn thicker)"
                  anchor="end"
                  chip={false}
                  color={c.chartMuted}
                  w={w}
                />
              ) : null}
            </Svg>
          );

          function clampedEdges() {
            return (
              <G>
                {[-1, 1].map((side) => {
                  const x = X(side * a);
                  const out = side < 0 ? x - 16 : x;
                  return (
                    <G key={side}>
                      <Rect
                        x={out}
                        y={yTop - 20}
                        width={16}
                        height={tPx + 40}
                        fill={c.chartGrid}
                        opacity={0.7}
                      />
                      <Hatch
                        x1={yTop - 20}
                        x2={yTop + tPx + 20}
                        y={x}
                        vertical
                        side={side < 0 ? -1 : 1}
                        depth={8}
                      />
                    </G>
                  );
                })}
              </G>
            );
          }

          function simpleEdges() {
            return (
              <G>
                {[-1, 1].map((side) => {
                  const x = X(side * a) - side * 4;
                  const y = yTop + tPx;
                  return (
                    <G key={side}>
                      <Polygon
                        points={`${x},${y} ${x - 8},${y + 14} ${x + 8},${y + 14}`}
                        fill={c.card}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      <Hatch x1={x - 12} x2={x + 12} y={y + 14} depth={5} />
                    </G>
                  );
                })}
              </G>
            );
          }
        }}
      </Canvas>
      <Caption>
        {[
          edgeKnown
            ? clamped
              ? 'Clamped edge: the plate leaves the wall level; the stress is largest at the edge.'
              : 'Simply supported edge: the plate turns freely there and sags about four times as far.'
            : 'Type the edge to draw how the plate is held.',
          'w_max = f × pa⁴ ÷ (64D), with D = Et³ ÷ (12(1 − ν²)).',
          ...(allKnown ? ['The sag is drawn bigger than life.'] : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}
