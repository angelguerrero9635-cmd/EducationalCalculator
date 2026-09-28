import { useRef } from 'react';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Crate, Tag, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, DragHandle, fitLabel, niceCeil, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'force' }>;

/** Arrow shafts and heads: the force is heavier than the acceleration. */
const FORCE_SHAFT = 6;
const ACCEL_SHAFT = 4;
const HEAD = 14;

/** A thick arrow along y from x1 to its tip x2, with a filled head no longer than the arrow. */
function Arrow({
  x1,
  x2,
  y,
  shaft,
  color,
  faded,
}: {
  x1: number;
  x2: number;
  y: number;
  shaft: number;
  color: string;
  faded?: boolean;
}) {
  const len = x2 - x1;
  if (len < 1) return null;
  const head = Math.min(HEAD, len);
  const half = shaft + 2.5;
  return (
    <G opacity={faded ? 0.4 : 1}>
      {len > head ? (
        <Line x1={x1} y1={y} x2={x2 - head + 1} y2={y} stroke={color} strokeWidth={shaft} />
      ) : null}
      <Path
        d={`M ${x2} ${y} L ${x2 - head} ${y - half} L ${x2 - head} ${y + half} Z`}
        fill={color}
      />
    </G>
  );
}

/**
 * A crate on a floor pushed by the net force: a thick accent arrow from its face, as long as
 * the force, with the handle at its head (drag it); above, a solid arrow as long as the
 * acceleration, with speed lines behind the crate while it speeds up. Each arrow's scale fits
 * its value (fixed while dragging), so the lengths stay proportional to F and a.
 */
export function ForceDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light', 'floor');
  const rep = useRep(calc);
  const start = useRef(0);
  const F = Math.max(0, rep.val(spec.force));
  const a = Math.max(0, rep.val(spec.acceleration));
  // Extents in the shown units (N or lbf), a little past the value so the arrow can grow under
  // the finger; the page's extent only sets a floor for values near 0.
  const extent = (shown: number, floor: number) => Math.max(floor / 10, niceCeil(shown * 1.2));
  const fit = useFrozen({
    force: extent(rep.shown(spec.force), spec.forceExtent) * rep.factor(spec.force),
    accel:
      extent(rep.shown(spec.acceleration), spec.accelerationExtent) * rep.factor(spec.acceleration),
  });
  const massLabel = rep.label(spec.mass);
  const fLabel = rep.label(spec.force);
  const aLabel = rep.label(spec.acceleration);
  const moving = rep.known(spec.acceleration) && a > 0;

  return (
    <Canvas aspect={(w) => 200 / w}>
      {({ w, h }) => {
        const ground = h - 26;
        const size = 110;
        const bx = 40;
        const by = ground - size;
        const fx0 = bx + size;
        const fScale = (w - fx0 - 22) / fit.value.force;
        const fx1 = fx0 + F * fScale;
        const fy = by + size / 2 + 8;
        const ay = by - 22;
        const aScale = (w - bx - 22) / fit.value.accel;
        const ax1 = bx + a * aScale;
        // The force's value over its arrow, or past the handle when the arrow is short.
        const fTextW = fLabel.length * chart.value * 0.58;
        const fAt =
          fx1 - fx0 >= fTextW + 24
            ? fitLabel((fx0 + fx1 - HEAD) / 2, fLabel, chart.value, w)
            : fitLabel(fx1 + 16, fLabel, chart.value, w, 'start', 16);
        return (
          <>
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} />
                <TopLight id={paint.floor} strength={0.7} />
              </Defs>
              {/* A floor with a light hatch. */}
              <Rect x={0} y={ground} width={w} height={14} fill={c.chartFill} />
              <Rect x={0} y={ground} width={w} height={14} fill={url(paint.floor)} />
              {Array.from({ length: Math.ceil(w / 16) }, (_, i) => (
                <Line
                  key={i}
                  x1={i * 16 + 4}
                  y1={ground + 12}
                  x2={i * 16 + 12}
                  y2={ground + 3}
                  stroke={c.chartGrid}
                  strokeWidth={chart.strokeLight}
                />
              ))}
              <Line
                x1={0}
                y1={ground}
                x2={w}
                y2={ground}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />

              {/* Speed lines behind the crate while it speeds up. */}
              {moving
                ? [0.3, 0.55, 0.8].map((k, i) => (
                    <Line
                      key={k}
                      x1={bx - 30 + i * 4}
                      y1={by + size * k}
                      x2={bx - 8}
                      y2={by + size * k}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeLinecap="round"
                    />
                  ))
                : null}

              <Crate
                x={bx}
                y={by}
                size={size}
                lightId={paint.light}
                label={<Tag cx={bx + size / 2} cy={by + size * 0.34} chars={massLabel.length} />}
              />
              <ChartText
                x={bx + size / 2}
                y={by + size * 0.34 + 4.5}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                opacity={rep.known(spec.mass) ? 1 : 0.45}
              >
                {massLabel}
              </ChartText>

              {/* Acceleration: a solid arrow above the crate, as long as a. */}
              <Arrow
                x1={bx}
                x2={ax1}
                y={ay}
                shaft={ACCEL_SHAFT}
                color={c.chartSecond}
                faded={!rep.known(spec.acceleration)}
              />
              <ChartText
                {...fitLabel(bx, aLabel, chart.label, w, 'start')}
                y={ay - 12}
                fontSize={chart.label}
                fontWeight="700"
                opacity={rep.known(spec.acceleration) ? 1 : 0.45}
              >
                {aLabel}
              </ChartText>

              {/* The net force: a thick accent arrow from the crate's face, as long as F. */}
              <Arrow
                x1={fx0}
                x2={fx1}
                y={fy}
                shaft={FORCE_SHAFT}
                color={c.chartHighlight}
                faded={!rep.known(spec.force)}
              />
              <ChartText
                {...fAt}
                y={fy - 16}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartHighlight}
                opacity={rep.known(spec.force) ? 1 : 0.45}
              >
                {fLabel}
              </ChartText>
            </Svg>
            <DragHandle
              testID="drag-force"
              x={Math.max(fx1 - HEAD - 10, fx0)}
              y={fy}
              label={rep.variable(spec.force).name}
              onStart={() => {
                start.current = F;
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx) =>
                calc.set(
                  {
                    ...rep.pin([spec.mass]),
                    [spec.force]: rep.snapTo(spec.force, start.current + dx / fScale),
                  },
                  rep.slide(spec.force),
                )
              }
            />
          </>
        );
      }}
    </Canvas>
  );
}
