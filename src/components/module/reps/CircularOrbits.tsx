/**
 * The college `circularMotion` modes (HC35, typesHe2f.ts): a Hohmann transfer between two
 * circular orbits, a point on an ellipse with its vis-viva speed, two planets' angles over a
 * synodic period, and path (n–t) coordinates on a curve. Orbits are drawn to scale from the
 * values (the central body to scale when its radius is given); bodies are painted, the orbits
 * and arrows flat. A "?" input draws no orbit or arrow that needs it.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type {
  CircularMotionHe2fSpec,
  CmHohmann,
  CmPair,
  CmTangential,
  CmVisViva,
} from '@/data/modules/typesHe2f';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { anomalyAt, ellipseOf, hohmannOf, synodicOf, visViva } from './he2fMath';
import { fmt, Tag, tagW, tipLabel, valueText } from './he2fKit';
import { formulaOnly, Vec } from './hskKit';
import { Ball, url, usePaintIds } from './paint';
import { Planet, PLANET_LABEL } from './planetArt';

type Pt = { x: number; y: number };

function useVals(calc: Calculator) {
  const rep = useRep(calc);
  const num = (x: NumOrVar | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const ok = (...xs: (NumOrVar | undefined)[]) =>
    xs.every((x) => typeof x !== 'string' || rep.known(x));
  const text = (x: NumOrVar | undefined, computed: number, unit: string) =>
    valueText(rep, x, computed, unit);
  return { rep, num, ok, text };
}

const caption = (lines: string[], all: boolean) => (all ? lines : formulaOnly(lines)).join(' · ');

export function CircularOrbits({ spec, calc }: { spec: CircularMotionHe2fSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'hohmann':
      return <Hohmann s={spec} calc={calc} />;
    case 'visViva':
      return <VisViva s={spec} calc={calc} />;
    case 'pair':
      return <Pair s={spec} calc={calc} />;
    default:
      return <Tangential s={spec} calc={calc} />;
  }
}

/** The central body at O: Earth painted (to scale when `R` px is given), or the Sun. */
function Body({ body, O, R, sunId }: { body: 'earth' | 'sun'; O: Pt; R: number; sunId: string }) {
  return body === 'sun' ? (
    <Circle cx={O.x} cy={O.y} r={R} fill={url(sunId)} />
  ) : (
    <Planet name="earth" x={O.x} y={O.y} r={R} />
  );
}

/** A length with its unit as the page writes it (km by default). */
const unitOf = (rep: ReturnType<typeof useRep>, id: NumOrVar | undefined, d: string) =>
  (typeof id === 'string' ? rep.unit(id) : undefined) ?? d;

// ─── Hohmann transfer ───────────────────────────────────────────────────────

function Hohmann({ s, calc }: { s: CmHohmann; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, ok, text } = useVals(calc);
  const ids = usePaintIds('sun');
  const mu = Math.max(1e-30, num(s.mu, 1));
  const r1 = Math.max(1e-9, num(s.r1, 1));
  const r2 = Math.max(1e-9, num(s.r2, 2));
  const all = ok(s.mu, s.r1, s.r2);
  const h = hohmannOf(mu, r1, r2);
  const body = s.body ?? 'earth';
  const L = unitOf(rep, s.r1, 'km');
  const V = unitOf(rep, s.dv1 ?? s.vinf ?? s.v1, 'km/s');
  const tofScale = s.tofScale ?? 1;
  const tofUnit = unitOf(rep, s.tof, tofScale === 3600 ? 'h' : tofScale === 86400 ? 'd' : 's');
  const H = 356;
  const dep = s.vinf ? 'v∞' : 'Δv₁';
  // An orbit that dips inside the central body can't be flown: drawn faded, the reason said.
  const inside = s.bodyRadius !== undefined && num(s.bodyRadius) >= Math.min(r1, r2);
  const dv1 = h.dv1;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const O = { x: w * 0.5, y: 160 };
          const R2 = Math.min(w * 0.42, 140);
          const k = R2 / Math.max(r1, r2);
          const [p1, p2] = [r1 * k, r2 * k];
          // The ellipse's center: halfway between departure (right, on r₁) and arrival (left).
          const ex = O.x + (p1 - p2) / 2;
          const ax = h.a * k;
          const bx = h.b * k;
          const scaled = s.bodyRadius !== undefined ? num(s.bodyRadius) * k : undefined;
          const Rb = Math.max(
            4,
            Math.min(Math.min(p1, p2) * 0.9, scaled ?? Math.min(p1 * 0.6, 18)),
          );
          const toScale = scaled !== undefined && Math.abs(Rb - scaled) < 0.5;
          const kv = 56 / Math.max(1e-9, Math.abs(dv1), Math.abs(h.dv2));
          const D = { x: O.x + p1, y: O.y };
          const A = { x: O.x - p2, y: O.y };
          const t1 = { x: D.x, y: D.y - kv * dv1 };
          const t2 = { x: A.x, y: A.y + kv * h.dv2 };
          const depRight = D.x + 12 + tagW(`${dep} = ${text(s.vinf ?? s.dv1, dv1, V)}`) < w;
          return (
            <Svg width={w} height={H} opacity={inside ? 0.45 : 1}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
              </Defs>
              {[p1, p2].map((r, i) => (
                <Circle
                  key={i}
                  cx={O.x}
                  cy={O.y}
                  r={r}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                />
              ))}
              {all ? (
                <G>
                  <Line
                    x1={A.x}
                    y1={O.y}
                    x2={D.x}
                    y2={O.y}
                    stroke={c.chartGrid}
                    strokeDasharray={chart.dashFine}
                  />
                  {/* The transfer: the half flown solid (counterclockwise, over the top). */}
                  <Path
                    d={`M ${D.x} ${D.y} A ${ax} ${bx} 0 0 0 ${A.x} ${A.y}`}
                    stroke={c.chartHighlight}
                    strokeWidth={2.5}
                    fill="none"
                  />
                  <Path
                    d={`M ${A.x} ${A.y} A ${ax} ${bx} 0 0 0 ${D.x} ${D.y}`}
                    stroke={c.chartHighlight}
                    strokeOpacity={0.3}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Circle cx={ex} cy={O.y} r={2.5} fill={c.chartHighlight} />
                </G>
              ) : null}
              <Body body={body} O={O} R={body === 'sun' ? 9 : Rb} sunId={ids.sun} />
              {s.planets ? (
                <G>
                  <Planet name={s.planets[0]} x={D.x} y={D.y} r={6} />
                  <Planet name={s.planets[1]} x={A.x} y={A.y} r={6} />
                </G>
              ) : (
                <Circle cx={D.x} cy={D.y} r={3.5} fill={c.chartInk} />
              )}
              {all ? (
                <G>
                  <Vec x1={D.x} y1={D.y} x2={t1.x} y2={t1.y} color={c.forceApplied} />
                  <Tag
                    x={depRight ? D.x + 8 : D.x - 8}
                    y={(D.y + t1.y) / 2 + 4}
                    text={`${dep} = ${text(s.vinf ?? s.dv1, dv1, V)}`}
                    anchor={depRight ? 'start' : 'end'}
                    color={c.forceApplied}
                    w={w}
                  />
                  <Vec x1={A.x} y1={A.y} x2={t2.x} y2={t2.y} color={c.forceApplied} />
                  <Tag
                    x={A.x + 8}
                    y={(A.y + t2.y) / 2 + 4}
                    text={`Δv₂ = ${text(s.dv2, h.dv2, V)}`}
                    anchor="start"
                    color={c.forceApplied}
                    w={w}
                  />
                  <Tag
                    x={ex}
                    y={O.y - bx - 8}
                    text={`TOF = ${text(s.tof, h.tof / tofScale, tofUnit)}`}
                    color={c.chartHighlight}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={O.y + R2 + 22}
                    text={`r₁ = ${text(s.r1, r1, L)} · r₂ = ${text(s.r2, r2, L)}`}
                    chip={false}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={O.y + R2 + 40}
                    text={`a = (r₁ + r₂) ÷ 2 = ${text(s.a, h.a, L)}`}
                    chip={false}
                    color={c.chartHighlight}
                    w={w}
                  />
                </G>
              ) : null}
              {body === 'sun' || (s.bodyRadius !== undefined && !toScale) ? (
                <Tag
                  x={w - 6}
                  y={14}
                  text={body === 'sun' ? 'Sun and planets not to scale' : 'body not to scale'}
                  anchor="end"
                  chip={false}
                  bold={false}
                  color={c.chartMuted}
                  w={w}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption(lines(), all)}</Caption>
    </View>
  );

  function lines(): string[] {
    if (inside)
      return [
        'An orbit inside the central body is not possible: r₁ and r₂ must be bigger than its radius.',
      ];
    return [
      `a = (r₁ + r₂) ÷ 2 = (${fmt(r1)} + ${fmt(r2)}) ÷ 2 = ${fmt(h.a)} ${L}`,
      `${dep} = √(μ(2 ÷ r₁ − 1 ÷ a)) − √(μ ÷ r₁) = ${fmt(h.vp)} − ${fmt(h.v1)} = ${fmt(dv1)} ${V}`,
      `Δv₂ = √(μ ÷ r₂) − √(μ(2 ÷ r₂ − 1 ÷ a)) = ${fmt(h.v2)} − ${fmt(h.va)} = ${fmt(h.dv2)} ${V}`,
      `TOF = π√(a³ ÷ μ) = ${fmt(h.tof / tofScale)} ${tofUnit}, half the transfer orbit`,
    ];
  }
}

// ─── Vis-viva ───────────────────────────────────────────────────────────────

function VisViva({ s, calc }: { s: CmVisViva; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, ok, text } = useVals(calc);
  const ids = usePaintIds('sun');
  const mu = Math.max(1e-30, num(s.mu, 1));
  const rp = Math.max(1e-9, num(s.rp, 1));
  const raIn = num(s.ra, 2);
  const rIn = num(s.r, rp);
  const ra = Math.max(rp, raIn);
  const r = Math.min(ra, Math.max(rp, rIn));
  // r_a below r_p, or r off the ellipse: drawn faded (r held at the nearer end), the reason said.
  const bad =
    raIn < rp
      ? 'r_a must be at least r_p: the apogee is the far end of the orbit.'
      : rIn < rp * (1 - 1e-9) || rIn > ra * (1 + 1e-9)
        ? 'r must lie between r_p and r_a: the orbit never goes nearer or farther.'
        : undefined;
  const all = ok(s.mu, s.rp, s.ra, s.r);
  const el = ellipseOf(rp, ra);
  const v = visViva(mu, r, el.a);
  const vp = visViva(mu, rp, el.a);
  const va = visViva(mu, ra, el.a);
  const nu = anomalyAt(rp, ra, r);
  const L = unitOf(rep, s.r, 'km');
  const Vu = unitOf(rep, s.v, 'km/s');
  const H = 320;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const k = Math.min((w - 40) / (rp + ra), 190 / Math.max(1e-9, 2 * el.b));
          const C = { x: w / 2, y: 140 };
          const O = { x: C.x + el.c * k, y: C.y };
          const Pp = { x: O.x + rp * k, y: C.y };
          const Pa = { x: O.x - ra * k, y: C.y };
          const P = { x: O.x + r * Math.cos(nu) * k, y: O.y - r * Math.sin(nu) * k };
          // The velocity is along the orbit (counterclockwise): d/dν of the position.
          const dr = (r * r * el.e * Math.sin(nu)) / el.p;
          const vx = dr * Math.cos(nu) - r * Math.sin(nu);
          const vy = dr * Math.sin(nu) + r * Math.cos(nu);
          const n = Math.hypot(vx, vy) || 1;
          const kv = 64 / Math.max(1e-9, vp);
          const tip = { x: P.x + (vx / n) * kv * v, y: P.y - (vy / n) * kv * v };
          const vLabel = `v = ${text(s.v, v, Vu)}`;
          // Near apogee the short v arrow points down onto r_a's label: v's label goes right of
          // its tip and r_a's drops a line.
          const nearA = Math.hypot(P.x - Pa.x, P.y - C.y) < 24;
          const at = nearA
            ? { x: tip.x + 10, y: tip.y + 4, anchor: 'start' as const }
            : tipLabel(P, tip, vLabel, w);
          const scaled = s.bodyRadius !== undefined ? num(s.bodyRadius) * k : undefined;
          const Rb = Math.max(4, Math.min(rp * k * 0.9, scaled ?? 10));
          const mid = { x: (O.x + P.x) / 2, y: (O.y + P.y) / 2 };
          return (
            <Svg width={w} height={H} opacity={bad ? 0.45 : 1}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
              </Defs>
              <Path
                d={`M ${Pp.x} ${C.y} A ${el.a * k} ${el.b * k} 0 1 0 ${Pa.x} ${C.y} A ${el.a * k} ${el.b * k} 0 1 0 ${Pp.x} ${C.y}`}
                stroke={c.chartHighlight}
                strokeWidth={2}
                fill="none"
              />
              <Line
                x1={Pa.x}
                y1={C.y}
                x2={Pp.x}
                y2={C.y}
                stroke={c.chartGrid}
                strokeDasharray={chart.dashFine}
              />
              <Body body={s.body ?? 'earth'} O={O} R={Rb} sunId={ids.sun} />
              {all ? (
                <G>
                  <Line
                    x1={O.x}
                    y1={O.y}
                    x2={P.x}
                    y2={P.y}
                    stroke={c.chartInk}
                    strokeDasharray={chart.dashFine}
                  />
                  <Tag
                    x={mid.x - 8}
                    y={mid.y - 6}
                    text={`r = ${text(s.r, r, L)}`}
                    anchor="end"
                    w={w}
                  />
                  <Vec x1={P.x} y1={P.y} x2={tip.x} y2={tip.y} color={c.forceApplied} />
                  <Tag
                    x={at.x}
                    y={at.y}
                    text={vLabel}
                    anchor={at.anchor}
                    color={c.forceApplied}
                    w={w}
                  />
                  <Circle cx={P.x} cy={P.y} r={4} fill={c.chartInk} />
                  <Circle cx={Pp.x} cy={C.y} r={3} fill={c.chartHighlight} />
                  <Circle cx={Pa.x} cy={C.y} r={3} fill={c.chartHighlight} />
                  {/* The ends named beside them (a big body covers the perigee side); their
                      values in a row under the orbit. */}
                  <Tag x={Pp.x + 6} y={C.y + 5} text="r_p" anchor="start" chip={false} w={w} />
                  <Tag
                    x={Pa.x + 6}
                    y={nearA ? C.y + 42 : C.y - 8}
                    text="r_a"
                    anchor="start"
                    chip={false}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={H - 48}
                    text={`r_p = ${text(s.rp, rp, L)}, r_a = ${text(s.ra, ra, L)}`}
                    chip={false}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={H - 30}
                    text={`a = (r_p + r_a) ÷ 2 = ${text(s.a, el.a, L)}`}
                    chip={false}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={H - 12}
                    text={`v_p = ${fmt(vp)} ${Vu}, v_a = ${fmt(va)} ${Vu}`}
                    chip={false}
                    bold={false}
                    color={c.chartMuted}
                    w={w}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {caption(
          bad
            ? [bad]
            : [
                `a = (r_p + r_a) ÷ 2 = (${fmt(rp)} + ${fmt(ra)}) ÷ 2 = ${fmt(el.a)} ${L}`,
                `Vis-viva: v = √(μ(2 ÷ r − 1 ÷ a)) = √(${fmt(mu)} × (2 ÷ ${fmt(r)} − 1 ÷ ${fmt(el.a)})) = ${fmt(v)} ${Vu}`,
                'Fastest at perigee, slowest at apogee: energy is shared between speed and height.',
              ],
          all,
        )}
      </Caption>
    </View>
  );
}

// ─── Two planets ────────────────────────────────────────────────────────────

function Pair({ s, calc }: { s: CmPair; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, ok, text } = useVals(calc);
  const ids = usePaintIds('sun');
  const t1 = Math.max(1e-9, num(s.t1, 1));
  const t2 = Math.max(1e-9, num(s.t2, 2));
  const all = ok(s.t1, s.t2, s.time);
  const S = synodicOf(t1, t2);
  const t = s.time !== undefined ? num(s.time) : S;
  const th1 = (360 * t) / t1;
  const th2 = (360 * t) / t2;
  const [n1, n2] = s.planets ?? ['earth', 'mars'];
  const U = unitOf(rep, s.t1, 'd');
  const laps = (th: number) => {
    const n = Math.floor(th / 360 + 1e-9);
    const rest = th - 360 * n;
    return n ? `${n} lap${n > 1 ? 's' : ''} + ${fmt(rest, 3)}°` : `${fmt(rest, 3)}°`;
  };
  const H = 350;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const O = { x: w / 2, y: 152 };
          const R2 = Math.min(w * 0.42, 132);
          const [inner, outer] = t1 <= t2 ? [t1, t2] : [t2, t1];
          const R1 = R2 * Math.cbrt((inner / outer) ** 2);
          const rad1 = t1 <= t2 ? R1 : R2;
          const rad2 = t1 <= t2 ? R2 : R1;
          const at = (r: number, deg: number) => ({
            x: O.x + r * Math.cos((deg * Math.PI) / 180),
            y: O.y - r * Math.sin((deg * Math.PI) / 180),
          });
          const arc = (r: number, deg: number) => {
            const d = ((deg % 360) + 360) % 360;
            const e = at(r, d);
            return d < 0.5
              ? ''
              : `M ${O.x + r} ${O.y} A ${r} ${r} 0 ${d > 180 ? 1 : 0} 0 ${e.x} ${e.y}`;
          };
          const P1 = at(rad1, th1);
          const P2 = at(rad2, th2);
          const aligned = Math.abs(((((th1 - th2) % 360) + 540) % 360) - 180) > 179;
          const out = (r: number, deg: number, d: number) => at(r + d, deg);
          return (
            <Svg width={w} height={H}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
              </Defs>
              {[rad1, rad2].map((r, i) => (
                <Circle
                  key={i}
                  cx={O.x}
                  cy={O.y}
                  r={r}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
              ))}
              <Line
                x1={O.x}
                y1={O.y}
                x2={O.x + R2 + 14}
                y2={O.y}
                stroke={c.chartGrid}
                strokeDasharray={chart.dashFine}
              />
              <Circle cx={O.x} cy={O.y} r={10} fill={url(ids.sun)} />
              {all ? (
                <G>
                  <Path
                    d={arc(rad1 - 8, th1)}
                    stroke={c.chartHighlight}
                    strokeWidth={2}
                    fill="none"
                  />
                  <Path d={arc(rad2 + 8, th2)} stroke={c.chartSecond} strokeWidth={2} fill="none" />
                  {aligned ? (
                    <Line
                      x1={O.x}
                      y1={O.y}
                      x2={out(rad2, th2, 16).x}
                      y2={out(rad2, th2, 16).y}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dashFine}
                    />
                  ) : null}
                  <Planet name={n1} x={O.x + rad1} y={O.y} r={5} faded />
                  <Planet name={n2} x={O.x + rad2} y={O.y} r={5} faded />
                  <Planet name={n1} x={P1.x} y={P1.y} r={7} />
                  <Planet name={n2} x={P2.x} y={P2.y} r={7} />
                  <Tag
                    x={O.x + rad2 + 10}
                    y={O.y + 18}
                    text="t = 0"
                    anchor="end"
                    chip={false}
                    bold={false}
                    color={c.chartMuted}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={O.y + R2 + 26}
                    text={`${PLANET_LABEL[n1]}: θ₁ = 360° × t ÷ T₁ = ${laps(th1)}`}
                    chip={false}
                    color={c.chartHighlight}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={O.y + R2 + 44}
                    text={`${PLANET_LABEL[n2]}: θ₂ = 360° × t ÷ T₂ = ${laps(th2)}`}
                    chip={false}
                    color={c.chartSecond}
                    w={w}
                  />
                  <Tag
                    x={w / 2}
                    y={O.y + R2 + 62}
                    text={`t = ${s.time !== undefined ? text(s.time, t, U) : `S = ${text(s.synodic, S, U)}`}`}
                    chip={false}
                    w={w}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {caption(
          [
            `1 ÷ S = 1 ÷ T₁ − 1 ÷ T₂ = 1 ÷ ${fmt(t1, 6)} − 1 ÷ ${fmt(t2, 6)}, so S = ${fmt(S)} ${U}`,
            'The inner planet gains one lap on the outer one each synodic period: then they line up again.',
          ],
          all,
        )}
      </Caption>
    </View>
  );
}

// ─── Path coordinates ───────────────────────────────────────────────────────

function Tangential({ s, calc }: { s: CmTangential; calc: Calculator }) {
  const c = usePalette();
  const { num, ok, text } = useVals(calc);
  const v = num(s.speed);
  const rho = Math.max(1e-9, num(s.rho, 1));
  const at = num(s.at);
  const an = (v * v) / rho;
  const a = Math.hypot(at, an);
  const all = ok(s.speed, s.rho, s.at);
  const H = 300;

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const R = 130;
          const C = { x: w * 0.42, y: 92 + R };
          const P = { x: C.x, y: C.y - R };
          const pt = (deg: number) => ({
            x: C.x + R * Math.cos((deg * Math.PI) / 180),
            y: C.y - R * Math.sin((deg * Math.PI) / 180),
          });
          // Clockwise on the page: the direction of travel at angle φ.
          const dir = (deg: number) => ({
            x: Math.sin((deg * Math.PI) / 180),
            y: Math.cos((deg * Math.PI) / 180),
          });
          const [s0, s1] = [pt(130), pt(50)];
          const [d0, d1] = [dir(130), dir(50)];
          const ka = 92 / Math.max(1e-9, Math.abs(at), an, a);
          const At = { x: P.x + at * ka, y: P.y };
          const An = { x: P.x, y: P.y + an * ka };
          const Af = { x: P.x + at * ka, y: P.y + an * ka };
          return (
            <Svg width={w} height={H}>
              <Circle
                cx={C.x}
                cy={C.y}
                r={R}
                fill="none"
                stroke={c.chartGrid}
                strokeDasharray={chart.dashFine}
              />
              {/* The path: the arc at P, straightening beyond it. */}
              <Path
                d={`M ${s0.x - d0.x * 70} ${s0.y - d0.y * 70 + 12} Q ${s0.x - d0.x * 30} ${s0.y - d0.y * 30} ${s0.x} ${s0.y} A ${R} ${R} 0 0 1 ${s1.x} ${s1.y} Q ${s1.x + d1.x * 30} ${s1.y + d1.y * 30} ${s1.x + d1.x * 70} ${s1.y + d1.y * 70 - 12}`}
                stroke={c.chartInk}
                strokeWidth={2.5}
                fill="none"
              />
              <Line
                x1={P.x}
                y1={P.y}
                x2={C.x}
                y2={C.y}
                stroke={c.chartMuted}
                strokeDasharray={chart.dash}
              />
              <Circle cx={C.x} cy={C.y} r={3.5} fill={c.chartInk} />
              <Tag
                x={C.x + 8}
                y={C.y - 30}
                text={`ρ = ${ok(s.rho) ? text(s.rho, rho, 'm') : '?'}`}
                anchor="start"
                w={w}
              />
              <Tag
                x={C.x}
                y={C.y + 20}
                text="center of curvature"
                chip={false}
                bold={false}
                color={c.chartMuted}
                w={w}
              />
              {all ? (
                <G>
                  <Vec
                    x1={P.x - 30}
                    y1={P.y - 18}
                    x2={P.x + 60}
                    y2={P.y - 18}
                    color={c.chartHighlight}
                    width={2}
                    head={8}
                  />
                  <Tag
                    x={P.x - 36}
                    y={P.y - 14}
                    text={`v = ${text(s.speed, v, 'm/s')}`}
                    anchor="end"
                    color={c.chartHighlight}
                    w={w}
                  />
                  <Path
                    d={`M ${At.x} ${At.y} L ${Af.x} ${Af.y} L ${An.x} ${An.y}`}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Vec x1={P.x} y1={P.y} x2={At.x} y2={At.y} color={c.forceApplied} />
                  <Tag
                    x={At.x + (at >= 0 ? 6 : -6)}
                    y={P.y + 4}
                    text={`a_t = ${text(s.at, at, 'm/s²')}`}
                    anchor={at >= 0 ? 'start' : 'end'}
                    color={c.forceApplied}
                    w={w}
                  />
                  <Vec x1={P.x} y1={P.y} x2={An.x} y2={An.y} color={c.forceNormal} />
                  <Tag
                    x={at >= 0 ? P.x - 6 : P.x + 6}
                    y={An.y - 4}
                    text={`a_n = ${text(s.an, an, 'm/s²')}`}
                    anchor={at >= 0 ? 'end' : 'start'}
                    color={c.forceNormal}
                    w={w}
                  />
                  <Vec x1={P.x} y1={P.y} x2={Af.x} y2={Af.y} color={c.forceNet} width={3.5} />
                  <Tag
                    x={Af.x + (at >= 0 ? 6 : -6)}
                    y={Af.y + 14}
                    text={`a = ${text(s.accel, a, 'm/s²')}`}
                    anchor={at >= 0 ? 'start' : 'end'}
                    color={c.forceNet}
                    w={w}
                  />
                </G>
              ) : null}
              <Circle cx={P.x} cy={P.y} r={4} fill={c.chartInk} />
              <Tag x={P.x + 4} y={P.y - 26} text="P" chip={false} w={w} />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {caption(
          [
            `a_n = v² ÷ ρ = ${fmt(v)}² ÷ ${fmt(rho)} = ${fmt(an)} m/s², toward the center of curvature`,
            `a = √(a_t² + a_n²) = √(${at < 0 ? `(${fmt(at)})` : fmt(at)}² + ${fmt(an)}²) = ${fmt(a)} m/s²`,
            'ρ is drawn the same length whatever its value: the arrows are to scale, the path is not.',
          ],
          all,
        )}
      </Caption>
    </View>
  );
}
