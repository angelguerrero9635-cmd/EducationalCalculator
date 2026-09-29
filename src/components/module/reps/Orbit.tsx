import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
} from './common';
import { usePaintIds, url } from './paint';
import { PLANET_LABEL, Planet, RADIUS_KM } from './planetArt';

type Spec = Extract<Representation, { kind: 'orbit' }>;

/** Where the planet sits on its orbit: up and to the right of the sun. */
const AT = (-35 * Math.PI) / 180;

/**
 * An orbit (Grade 8): the sun, a planet on its orbit `distance` AU away (Earth's orbit, 1 AU,
 * dashed for comparison) and, with `moon`, a moon going round the planet. The sun's pull on the
 * planet is an arrow toward the sun as long as `pull` (Earth's pull, 1, sets the scale); the
 * planet's motion is a dashed arrow along the orbit, so the pull bends its path into a circle.
 * Drag the planet in or out. Bodies are not to the orbit's scale.
 */
export function Orbit({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sun');
  const start = useRef({ d: 0 });
  const planet = spec.planet ?? 'earth';
  const d = Math.max(0.01, rep.val(spec.distance));
  const F = Math.max(0, rep.val(spec.pull));
  // The drawing's scales stay put while the planet is dragged.
  const scale = useFrozen({ au: niceCeil(Math.max(d, 1)), pull: niceCeil(Math.max(F, 1)) });
  const dVar = rep.variable(spec.distance);

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const cx = w * 0.44;
          const cy = h * 0.54;
          const rho = Math.min(w * 0.44, h / 2) - 22;
          const perAU = rho / scale.value.au;
          const orbitR = d * perAU;
          const px = cx + orbitR * Math.cos(AT);
          const py = cy + orbitR * Math.sin(AT);
          const sunR = Math.min(20, rho * 0.16);
          // Bodies a little bigger than the dots they'd be, in the order of their real sizes.
          const pr = 6 * (RADIUS_KM[planet] / RADIUS_KM.earth) ** 0.35;
          // The pull: 70 px for the scale's pull, but never past the sun's edge.
          const room = Math.max(0, orbitR - sunR - pr - 6);
          const pullLen = Math.min(room, (70 * F) / scale.value.pull);
          const [ux, uy] = [-Math.cos(AT), -Math.sin(AT)];
          const ax = px + ux * (pr + 2);
          const ay = py + uy * (pr + 2);
          const bx = ax + ux * pullLen;
          const by = ay + uy * pullLen;
          const head = (x: number, y: number, dx: number, dy: number, color: string) => (
            <Path
              d={`M ${x} ${y} L ${x - 8 * dx + 4.5 * dy} ${y - 8 * dy - 4.5 * dx} L ${x - 8 * dx - 4.5 * dy} ${y - 8 * dy + 4.5 * dx} Z`}
              fill={color}
            />
          );
          // The motion: along the orbit, counterclockwise as seen from above the north pole.
          const [tx, ty] = [Math.sin(AT), -Math.cos(AT)];
          const moveLen = 46;
          const moonR = pr + 16;
          const moonA = (60 * Math.PI) / 180;
          const mx = px + moonR * Math.cos(moonA);
          const my = py + moonR * Math.sin(moonA);
          // The pull to 3 figures, in Earth's pull (55.6, not 55.5556).
          const pullText = rep.known(spec.pull)
            ? `${rep.variable(spec.pull).symbol} = ${formatNumber(Number(F.toPrecision(3)))} × Earth’s pull`
            : rep.label(spec.pull);
          // Close to the sun the arrow is short: its label goes in the bottom corner, off the
          // orbit and the planet.
          const pullCorner = orbitR < 70;
          const dText = rep.label(spec.distance);
          // The distance label beside the line to the sun (below it), the pull's above its arrow.
          const [nx, ny] = [-uy, ux];
          const midX = cx + (px - cx) * 0.3 - nx * 12;
          const midY = cy + (py - cy) * 0.3 - ny * 12 + 4;
          const pullX = (ax + bx) / 2 + nx * 10;
          const pullY = (ay + by) / 2 + ny * 10;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <RadialGradient id={ids.sun} cx="0.5" cy="0.5" r="0.5">
                    <Stop offset="0" stopColor={c.sunDisk} stopOpacity={0.55} />
                    <Stop offset="1" stopColor={c.sunDisk} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                {/* Earth's orbit for comparison, then this planet's. */}
                {Math.abs(d - 1) > 1e-9 && perAU < rho * 1.2 ? (
                  <G>
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={perAU}
                      fill="none"
                      stroke={c.chartGrid}
                      strokeDasharray={chart.dashFine}
                    />
                    <ChartText
                      x={cx - perAU * 0.71 - 4}
                      y={cy + perAU * 0.71 + 12}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      1 AU
                    </ChartText>
                  </G>
                ) : null}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={orbitR}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  opacity={rep.known(spec.distance) ? 1 : 0.45}
                />
                {/* The sun, glowing. */}
                <Circle cx={cx} cy={cy} r={sunR * 2} fill={url(ids.sun)} />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={sunR}
                  fill={c.sunDisk}
                  stroke={c.sunRay}
                  strokeWidth={2}
                />
                <ChartText
                  x={cx}
                  y={cy + sunR + 14}
                  fontSize={chart.small}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Sun
                </ChartText>
                {/* The distance, sun to planet. */}
                <Line
                  x1={cx}
                  y1={cy}
                  x2={px}
                  y2={py}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                  opacity={0.7}
                />
                <ChartText
                  {...fitLabel(midX, dText, chart.label, w, 'start')}
                  y={midY}
                  fontSize={chart.label}
                  fontWeight="600"
                  opacity={rep.known(spec.distance) ? 1 : 0.45}
                >
                  {dText}
                </ChartText>

                {/* The planet's motion along its orbit. */}
                <Line
                  x1={px + tx * (pr + 3)}
                  y1={py + ty * (pr + 3)}
                  x2={px + tx * moveLen}
                  y2={py + ty * moveLen}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dashFine}
                />
                {head(px + tx * (moveLen + 6), py + ty * (moveLen + 6), tx, ty, c.chartInk)}

                {/* The sun's pull on the planet. */}
                <G opacity={rep.known(spec.pull) ? 1 : 0.45}>
                  {pullLen > 8 ? (
                    <>
                      <Line
                        x1={ax}
                        y1={ay}
                        x2={bx - ux * 6}
                        y2={by - uy * 6}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeHeavy + 1}
                        strokeLinecap="round"
                      />
                      {head(bx + ux * 2, by + uy * 2, ux, uy, c.chartHighlight)}
                    </>
                  ) : F > 0 ? (
                    // Too weak for a shaft at this scale: just the head, at the planet.
                    head(ax + ux * 8, ay + uy * 8, ux, uy, c.chartHighlight)
                  ) : null}
                  <ChartText
                    {...(pullCorner
                      ? { x: 6, textAnchor: 'start' as const }
                      : fitLabel(pullX, pullText, chart.label, w, 'end'))}
                    y={pullCorner ? h - 8 : pullY}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {pullText}
                  </ChartText>
                </G>

                <Planet name={planet} x={px} y={py} r={pr} faded={!rep.known(spec.distance)} />
                {spec.moon ? (
                  <G>
                    <Circle
                      cx={px}
                      cy={py}
                      r={moonR}
                      fill="none"
                      stroke={c.chartGrid}
                      strokeDasharray={chart.dashFine}
                    />
                    <Planet name="moon" x={mx} y={my} r={Math.max(2.5, pr * 0.27)} />
                    {/* The planet's pull on the moon. */}
                    <Path
                      d={`M ${mx + (px - mx) * 0.22} ${my + (py - my) * 0.22} L ${mx + (px - mx) * 0.55} ${my + (py - my) * 0.55}`}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    {head(
                      mx + (px - mx) * 0.62,
                      my + (py - my) * 0.62,
                      (px - mx) / moonR,
                      (py - my) / moonR,
                      c.chartHighlight,
                    )}
                  </G>
                ) : null}
                {/* Which planet, and its mass, in the corner. */}
                <ChartText x={6} y={14} fontSize={chart.label} fontWeight="700">
                  {/* Earth only at Earth's distance and mass; any other is "Planet". */}
                  {spec.planet ||
                  (Math.abs(d - 1) < 1e-9 &&
                    (!spec.mass || Math.abs(rep.val(spec.mass) - 1) < 1e-9))
                    ? PLANET_LABEL[planet]
                    : 'Planet'}
                </ChartText>
                {spec.mass ? (
                  <ChartText
                    x={6}
                    y={29}
                    fontSize={chart.small}
                    fontWeight="600"
                    opacity={rep.known(spec.mass) ? 1 : 0.45}
                  >
                    {rep.label(spec.mass)}
                  </ChartText>
                ) : null}
              </Svg>
              <DragHandle
                testID="drag-planet"
                x={px + Math.cos(AT) * (pr + 16)}
                y={py + Math.sin(AT) * (pr + 16)}
                label={dVar.name}
                onStart={() => {
                  scale.freeze();
                  start.current = { d: orbitR };
                }}
                onMove={(dx, dy) => {
                  // Along the line from the sun: out for farther, in for nearer.
                  const r = start.current.d + dx * Math.cos(AT) + dy * Math.sin(AT);
                  calc.set(
                    {
                      ...(spec.mass ? rep.pin([spec.mass]) : {}),
                      [spec.distance]: rep.snapTo(spec.distance, Math.max(0, r) / perAU),
                    },
                    rep.slide(spec.distance),
                  );
                }}
                onEnd={scale.release}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** pull = mass ÷ distance², worked with every number. */
  function caption(): string {
    const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
    const [Fs, ds] = [sym(spec.pull), sym(spec.distance)];
    const [ms, mv] = spec.mass ? [sym(spec.mass), rep.value(spec.mass, false)] : ['1', '1'];
    const dv = rep.value(spec.distance, false);
    const rule = 'The sun’s pull bends the planet’s path into an orbit.';
    return `${rule} · ${Fs} = ${ms} ÷ ${ds}² = ${mv} ÷ ${dv}² = ${rep.value(spec.pull)}`;
  }
}
