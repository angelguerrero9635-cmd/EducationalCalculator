import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { BeamSpec } from '@/data/modules/typesHe1a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, BeamDefs, Dimension, Hatch, HeLabel, fmt, useBeamReader } from './beamKit';
import { bucklingShape, endsOfK, halfWave, nearestK } from './beamMath';
import { Canvas, Caption } from './common';
import { url, usePaintIds } from './paint';

/** The column's width and its sway at the buckled shape's peak, px. */
const COL_W = 14;
const SWAY = 26;

const END_NAMES = { fixed: 'fixed', pin: 'pinned', free: 'free' } as const;

/**
 * `column` (HC1): an upright column, its ends drawn by K (0.5 fixed–fixed, 0.7 fixed–pinned,
 * 1 pinned–pinned, 2 fixed–free), the buckled shape over the straight one (dashed), the
 * inflection points marked and the half-wave KL bracketed between them; a fixed–free column's
 * mirror image is drawn below its base, so its half-wave 2L shows. P pushes down on top.
 */
export function BeamColumn({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  const c = usePalette();
  const B = useBeamReader(calc);
  const { v, known, rep } = B;
  const ids = usePaintIds('steel', 'light');
  const col = spec.column!;
  const kKnown = known(col.k);
  const K = nearestK(v(col.k, 1));
  const ends = endsOfK(K);
  const L = v(spec.length, 1);
  const lenUnit =
    spec.units?.length ??
    (typeof spec.length === 'string' ? (rep.variable(spec.length).unit ?? 'm') : 'm');
  const fu = spec.units?.force ?? 'kN';
  const mirror = kKnown && K === 2;
  const H = mirror ? 340 : 316;
  const [h0, h1] = halfWave(K);
  const concrete = col.material === 'concrete';
  const body = concrete ? c.beamConcrete : c.metal;
  const edge = concrete ? c.beamConcreteDark : c.metalDark;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const colPx = mirror ? 124 : 214;
          const yTop = 62;
          const yBot = yTop + colPx;
          const xc = w * 0.42;
          const Y = (s: number) => yBot - s * colPx;
          const Xs = (s: number) => xc + (kKnown ? SWAY * bucklingShape(K, s) : 0);
          const pts = (a: number, b: number) =>
            [...Array(61).keys()].map((i) => {
              const s = a + ((b - a) * i) / 60;
              return `${Xs(s)} ${Y(s)}`;
            });
          const topX = Xs(1);
          return (
            <Svg width={w} height={H}>
              <Defs>
                <BeamDefs ids={ids} />
              </Defs>
              {/* The straight column, dashed: where it stood before it buckled. */}
              <Line
                x1={xc - COL_W / 2}
                y1={yBot}
                x2={xc - COL_W / 2}
                y2={yTop}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={xc + COL_W / 2}
                y1={yBot}
                x2={xc + COL_W / 2}
                y2={yTop}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
              {/* The buckled column, painted: its body, a lit edge and its outline. */}
              <Path
                d={`M ${pts(0, 1).join(' L ')}`}
                stroke={edge}
                strokeWidth={COL_W + 2}
                fill="none"
                strokeLinecap="butt"
              />
              <Path
                d={`M ${pts(0, 1).join(' L ')}`}
                stroke={body}
                strokeWidth={COL_W}
                fill="none"
                strokeLinecap="butt"
              />
              <Path
                d={`M ${pts(0, 1)
                  .map((p) => {
                    const [x, y] = p.split(' ').map(Number);
                    return `${x! - COL_W / 4} ${y}`;
                  })
                  .join(' L ')}`}
                stroke={c.shine}
                strokeOpacity={0.35 * c.sheen}
                strokeWidth={2}
                fill="none"
              />
              {mirror ? (
                <Path
                  d={`M ${pts(-1, 0).join(' L ')}`}
                  stroke={c.beamDeflect}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                />
              ) : null}
              {renderBottom(xc, yBot, w)}
              {renderTop(topX, yTop)}
              {/* The inflection points: the half-wave's ends. */}
              {kKnown
                ? [h0, h1]
                    .filter((s) => s > 0.001 && s < 0.999)
                    .map((s, i) => (
                      <Circle
                        key={i}
                        cx={Xs(s)}
                        cy={Y(s)}
                        r={4}
                        fill={c.card}
                        stroke={c.beamDeflect}
                        strokeWidth={2}
                      />
                    ))
                : null}
              {mirror ? (
                <Circle
                  cx={Xs(-1)}
                  cy={Y(-1)}
                  r={4}
                  fill={c.card}
                  stroke={c.beamDeflect}
                  strokeWidth={2}
                />
              ) : null}
              {/* KL, bracketed between the half-wave's ends, and L. */}
              {kKnown ? (
                <G>
                  <Line
                    x1={xc + SWAY + 34}
                    y1={Y(h0)}
                    x2={xc + SWAY + 34}
                    y2={Y(h1)}
                    stroke={c.beamDeflect}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={xc + SWAY + 28}
                    y1={Y(h0)}
                    x2={xc + SWAY + 40}
                    y2={Y(h0)}
                    stroke={c.beamDeflect}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={xc + SWAY + 28}
                    y1={Y(h1)}
                    x2={xc + SWAY + 40}
                    y2={Y(h1)}
                    stroke={c.beamDeflect}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={Xs(h0) + 6}
                    y1={Y(h0)}
                    x2={xc + SWAY + 28}
                    y2={Y(h0)}
                    stroke={c.beamDeflect}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <Line
                    x1={Xs(h1) + 6}
                    y1={Y(h1)}
                    x2={xc + SWAY + 28}
                    y2={Y(h1)}
                    stroke={c.beamDeflect}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                  <HeLabel
                    x={xc + SWAY + 44}
                    y={(Y(h0) + Y(h1)) / 2 - 4}
                    text={
                      col.effective !== undefined && known(col.effective)
                        ? B.named(col.effective, 'KL', 0)
                        : `KL = ${fmt(K)}L`
                    }
                    color={c.beamDeflect}
                    anchor="start"
                    w={w}
                  />
                  {known(col.k) && typeof col.k === 'string' ? (
                    <HeLabel
                      x={xc + SWAY + 44}
                      y={(Y(h0) + Y(h1)) / 2 + 14}
                      text={B.named(col.k, 'K', K)}
                      anchor="start"
                      w={w}
                    />
                  ) : null}
                </G>
              ) : null}
              {known(spec.length) ? (
                <G>
                  <Line
                    x1={xc - 46}
                    y1={yBot}
                    x2={xc - 46}
                    y2={yTop}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <Line
                    x1={xc - 52}
                    y1={yBot}
                    x2={xc - 40}
                    y2={yBot}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <Line
                    x1={xc - 52}
                    y1={yTop}
                    x2={xc - 40}
                    y2={yTop}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <HeLabel
                    x={xc - 52}
                    y={(yTop + yBot) / 2 + 4}
                    text={B.named(spec.length, 'L', L, lenUnit)}
                    anchor="end"
                    w={w}
                  />
                </G>
              ) : null}
              {/* The load on top. */}
              {renderLoad(topX, yTop, w)}
              {col.stress !== undefined && known(col.stress) ? (
                <HeLabel
                  x={xc - 52}
                  y={(yTop + yBot) / 2 + 24}
                  text={B.named(col.stress, 'σ_cr', 0)}
                  anchor="end"
                  w={w}
                />
              ) : null}
              {col.slenderness !== undefined && known(col.slenderness) ? (
                <HeLabel
                  x={xc - 52}
                  y={(yTop + yBot) / 2 + 44}
                  text={B.named(col.slenderness, 'KL/r', 0)}
                  anchor="end"
                  w={w}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  function renderLoad(x: number, yTop: number, w: number) {
    const cap = ends.top === 'fixed' ? 12 : ends.top === 'pin' ? 10 : 0;
    const id = col.pcr ?? col.load;
    const showLabel = id !== undefined && known(id);
    return (
      <G>
        <Arrow
          x1={x}
          y1={yTop - cap - 46}
          x2={x}
          y2={yTop - cap - 2}
          color={c.beamLoad}
          width={chart.strokeHeavy}
          head={10}
        />
        {showLabel ? (
          <HeLabel
            x={x + 8}
            y={yTop - cap - 30}
            text={B.named(id, col.pcr ? 'P_cr' : 'P', v(id), fu)}
            color={c.beamLoad}
            anchor="start"
            w={w}
          />
        ) : null}
      </G>
    );
  }

  /** The bottom: a fixed base (a footing, hatched) or a pin on hatched ground. */
  function renderBottom(x: number, y: number, w: number) {
    if (!kKnown) return <Hatch x1={x - 34} x2={x + 34} y={y} />;
    if (ends.bottom === 'fixed')
      return (
        <G>
          <Rect x={x - 34} y={y} width={68} height={12} fill={c.chartGrid} opacity={0.7} />
          <Hatch x1={x - 34} x2={x + 34} y={y} depth={10} />
          <HeLabel
            x={Math.min(w - 4, x + 40)}
            y={y + 14}
            text="fixed"
            chip={false}
            anchor="start"
            color={c.chartMuted}
            w={w}
          />
        </G>
      );
    return (
      <G>
        <Polygon
          points={`${x},${y} ${x - 10},${y + 15} ${x + 10},${y + 15}`}
          fill={c.card}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
        <Circle cx={x} cy={y + 3} r={2.5} fill={c.chartInk} />
        <Hatch x1={x - 16} x2={x + 16} y={y + 15} depth={6} />
        <HeLabel
          x={x + 20}
          y={y + 14}
          text="pinned"
          chip={false}
          anchor="start"
          color={c.chartMuted}
          w={w}
        />
      </G>
    );
  }

  /**
   * The top: fixed (a cap between two guides, so it slides down but can't turn or sway), pinned
   * (a hinge held sideways by a link to a wall) or free.
   */
  function renderTop(x: number, y: number) {
    if (!kKnown || ends.top === 'free') return null;
    if (ends.top === 'fixed')
      return (
        <G>
          <Rect x={x - 16} y={y - 12} width={32} height={12} fill={c.metal} stroke={c.metalDark} />
          <Hatch x1={y - 30} x2={y + 6} y={x - 18} vertical side={-1} depth={7} />
          <Hatch x1={y - 30} x2={y + 6} y={x + 18} vertical side={1} depth={7} />
        </G>
      );
    return (
      <G>
        <Circle
          cx={x}
          cy={y - 4}
          r={5}
          fill={c.card}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
        <Line
          x1={x - 5}
          y1={y - 4}
          x2={x - 30}
          y2={y - 4}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
        <Hatch x1={y - 16} x2={y + 8} y={x - 30} vertical side={-1} depth={7} />
      </G>
    );
  }

  function captionLines(): string[] {
    if (!kKnown) return ['Type K to draw the ends and the buckled shape.'];
    const out = [
      `K = ${fmt(K)}: ${END_NAMES[ends.bottom]} at the bottom, ${END_NAMES[ends.top]} on top.`,
      K === 2
        ? 'The shape and its mirror image below the base make one half-wave, KL = 2L long.'
        : K === 1
          ? 'The whole column bends in one half-wave: KL = L.'
          : `The half-wave between the inflection points (circles) is KL = ${fmt(K)}L.`,
    ];
    if (col.pcr !== undefined)
      out.push('P_cr = π²EI ÷ (KL)²: the shorter the half-wave, the more it takes.');
    return out;
  }
}

/**
 * `panel` (HC1): a skin panel b wide between two stringers, squeezed along them by σ, buckled in
 * half-waves about b long: each bulges out (lit) or in (shaded) in turn; under it the skin's
 * section along the middle, a wave of that many half-waves (drawn bigger than life).
 */
export function BeamPanel({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  const c = usePalette();
  const B = useBeamReader(calc);
  const { v, known, rep } = B;
  const ids = usePaintIds('steel', 'light');
  const p = spec.panel!;
  const b = Math.max(1e-9, v(p.width, 1));
  const a = p.length !== undefined ? Math.max(b * 0.5, v(p.length, 3 * b)) : 3 * b;
  const waves = Math.max(1, Math.min(8, Math.round(a / b)));
  const lenUnit =
    spec.units?.length ??
    (typeof p.width === 'string' ? (rep.variable(p.width).unit ?? 'mm') : 'mm');
  const H = 268;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const padL = 40;
          const padR = 64;
          const s = Math.min((w - padL - padR) / a, 110 / b);
          const pw = a * s;
          const ph = b * s;
          const x0 = padL + (w - padL - padR - pw) / 2;
          const y0 = 44;
          const half = pw / waves;
          const ySec = y0 + ph + 70;
          return (
            <Svg width={w} height={H}>
              <Defs>
                <BeamDefs ids={ids} />
              </Defs>
              {/* The skin, aluminum, with its half-waves bulging out and in. */}
              <Rect x={x0} y={y0} width={pw} height={ph} fill={c.metal} />
              {[...Array(waves).keys()].map((i) => (
                <Ellipse
                  key={i}
                  cx={x0 + half * (i + 0.5)}
                  cy={y0 + ph / 2}
                  rx={half * 0.42}
                  ry={ph * 0.36}
                  fill={i % 2 ? c.shade : c.shine}
                  opacity={(i % 2 ? 0.18 : 0.45) * (0.5 + c.sheen / 2)}
                />
              ))}
              {[...Array(waves - 1).keys()].map((i) => (
                <Line
                  key={i}
                  x1={x0 + half * (i + 1)}
                  y1={y0 + 4}
                  x2={x0 + half * (i + 1)}
                  y2={y0 + ph - 4}
                  stroke={c.metalDark}
                  strokeDasharray={chart.dashFine}
                  strokeWidth={1}
                />
              ))}
              <Rect x={x0} y={y0} width={pw} height={ph} fill="none" stroke={c.metalDark} />
              {/* The stringers along the long edges. */}
              <Rect
                x={x0 - 6}
                y={y0 - 8}
                width={pw + 12}
                height={9}
                rx={2}
                fill={url(ids.steel)}
                stroke={c.metalDark}
              />
              <Rect
                x={x0 - 6}
                y={y0 + ph - 1}
                width={pw + 12}
                height={9}
                rx={2}
                fill={url(ids.steel)}
                stroke={c.metalDark}
              />
              {/* The squeeze along the stringers, at both ends. */}
              {[0.25, 0.5, 0.75].map((f) => (
                <G key={f}>
                  <Arrow
                    x1={x0 - 30}
                    y1={y0 + ph * f}
                    x2={x0 - 4}
                    y2={y0 + ph * f}
                    color={c.beamLoad}
                    width={chart.stroke}
                  />
                  <Arrow
                    x1={x0 + pw + 30}
                    y1={y0 + ph * f}
                    x2={x0 + pw + 4}
                    y2={y0 + ph * f}
                    color={c.beamLoad}
                    width={chart.stroke}
                  />
                </G>
              ))}
              {p.stress !== undefined && known(p.stress) ? (
                <HeLabel
                  x={x0 + pw / 2}
                  y={y0 - 16}
                  text={B.named(p.stress, 'σ_cr', 0)}
                  color={c.beamLoad}
                  w={w}
                />
              ) : null}
              {known(p.width) ? (
                <G>
                  <Line
                    x1={x0 + pw + 40}
                    y1={y0}
                    x2={x0 + pw + 40}
                    y2={y0 + ph}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <Line
                    x1={x0 + pw + 34}
                    y1={y0}
                    x2={x0 + pw + 46}
                    y2={y0}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <Line
                    x1={x0 + pw + 34}
                    y1={y0 + ph}
                    x2={x0 + pw + 46}
                    y2={y0 + ph}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <HeLabel
                    x={w - 4}
                    y={y0 + ph + 26}
                    text={B.named(p.width, 'b', b, lenUnit)}
                    anchor="end"
                    w={w}
                  />
                </G>
              ) : null}
              {p.length !== undefined && known(p.length) ? (
                <Dimension
                  x1={x0}
                  x2={x0 + pw}
                  y={y0 + ph + 26}
                  text={B.named(p.length, 'a', a, lenUnit)}
                  w={w}
                />
              ) : null}
              {/* The section along the middle: the skin's wave between the ribs. */}
              <Line
                x1={x0}
                y1={ySec - 16}
                x2={x0}
                y2={ySec + 16}
                stroke={c.metalDark}
                strokeWidth={3}
              />
              <Line
                x1={x0 + pw}
                y1={ySec - 16}
                x2={x0 + pw}
                y2={ySec + 16}
                stroke={c.metalDark}
                strokeWidth={3}
              />
              <Line
                x1={x0}
                y1={ySec}
                x2={x0 + pw}
                y2={ySec}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
                strokeWidth={1}
              />
              <Path
                d={`M ${[...Array(121).keys()]
                  .map(
                    (i) =>
                      `${x0 + (pw * i) / 120} ${ySec - 10 * Math.sin((Math.PI * waves * i) / 120)}`,
                  )
                  .join(' L ')}`}
                stroke={c.metalDark}
                strokeWidth={3}
                fill="none"
              />
              <HeLabel
                x={x0}
                y={ySec + 34}
                text="Section along the middle"
                anchor="start"
                chip={false}
                color={c.chartMuted}
                w={w}
              />
              {p.thickness !== undefined && known(p.thickness) ? (
                <HeLabel
                  x={x0 + pw}
                  y={ySec + 34}
                  text={B.named(p.thickness, 't', v(p.thickness), lenUnit)}
                  anchor="end"
                  w={w}
                />
              ) : null}
              {p.k !== undefined && known(p.k) ? (
                <HeLabel x={x0} y={y0 - 16} text={B.named(p.k, 'k', v(p.k))} anchor="start" w={w} />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${waves} half-wave${waves === 1 ? '' : 's'}, each about as long as the panel is wide (b).`,
          'σ_cr = kπ²E ÷ (12(1 − ν²)) × (t ÷ b)²: a thicker or narrower panel holds more.',
          'The wave in the section is drawn bigger than life.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
