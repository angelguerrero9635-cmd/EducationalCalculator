/**
 * HC166 `gearPair` (GearPairSpec in typesHe4l.ts): spur gears in steel, face on, teeth counted
 * and drawn to scale (pitch circle d = mN dashed, addendum m, dedendum 1.25m), each pitch circle
 * touching its mate's. A pair, a simple train with an idler, or a compound train (gears 2 and 3
 * on one shaft, gear 3 in front). Speeds as turning arrows, W_t at the first pitch point.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Path } from 'react-native-svg';

import type { GearPairSpec } from '@/data/modules/typesHe4l';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HeLabel } from './beamKit';
import { Canvas, Caption } from './common';
import { useHe3iReader } from './he3iKit';
import { gearLayout, gearOutline, trainValue } from './he4lMath';
import { CurvedArrow } from './hs3aKit';
import { Vec } from './hskKit';
import { Metal, url, usePaintIds } from './paint';

type X = GearPairSpec['module'];
const SUB = '₀₁₂₃₄₅₆₇₈₉';

export function GearPair({ spec, calc }: { spec: GearPairSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('steel', 'front');
  const k = (x: X | null | undefined) => x !== undefined && x !== null && r.known(x);
  const count = Math.min(4, spec.teeth.length);
  const teeth = spec.teeth
    .slice(0, count)
    .map((x) => (k(x) ? Math.max(3, Math.round(r.v(x))) : undefined));
  const all = teeth.every((n) => n !== undefined);
  // Drawn with m = 1: the picture scales with m, so m only labels.
  const lay = gearLayout(teeth.map((n) => n ?? 20));
  const speed = (i: number) => {
    const x = spec.speeds?.[i];
    return x !== undefined && x !== null && k(x) ? r.v(x) : undefined;
  };
  const sym = (x: X | null | undefined, f: string) =>
    x === undefined || x === null ? f : r.symbol(x, f);
  const tagOf = (x: X | null | undefined, f: string) =>
    x === undefined || x === null || !k(x) ? '' : `${sym(x, f)} = ${r.text(x, r.v(x))}`;

  const lines: string[] = [];
  if (!all) lines.push('Type every gear’s teeth to draw the train.');
  if (count === 2 && all) {
    const [n1, n2] = [speed(0), speed(1)];
    if (n1 !== undefined && n2 !== undefined)
      lines.push(
        `The pitch circles roll together: ${sym(spec.speeds?.[0], 'n₁')}${sym(spec.teeth[0], 'N₁')} = ${sym(spec.speeds?.[1], 'n₂')}${sym(spec.teeth[1], 'N₂')}, ${r.text(spec.speeds![0] ?? undefined, n1)} × ${teeth[0]} = ${r.text(spec.speeds![1] ?? undefined, n2)} × ${teeth[1]}.`,
      );
    if (spec.diameters && k(spec.module))
      lines.push(
        `d = mN: ${teeth.map((n, i) => `${tagOf(spec.diameters?.[i], `d${SUB[i + 1]}`) || `d${SUB[i + 1]}`} = ${r.text(spec.module, r.v(spec.module))} × ${n}`).join(', ')}.`,
      );
  }
  if (count > 2 && all) {
    const e = trainValue(teeth as number[]);
    const drv = count === 4 ? `${teeth[0]} × ${teeth[2]}` : `${teeth[0]}`;
    const dvn = count === 4 ? `${teeth[1]} × ${teeth[3]}` : `${teeth[2]}`;
    lines.push(
      `${count === 4 ? 'Gears 2 and 3 share a shaft. ' : 'Gear 2 is an idler: it turns the train’s direction, not its ratio. '}e = ΠN driving ÷ ΠN driven = ${drv} ÷ ${count === 4 ? `(${dvn})` : dvn} = ${spec.value !== undefined && k(spec.value) ? r.text(spec.value, r.v(spec.value)) : formatNumber(Number(e.toPrecision(4)))}.`,
    );
    const [nIn, nOut] = [speed(0), speed(count - 1)];
    if (nIn !== undefined && nOut !== undefined)
      lines.push(
        `n out = e × n in = ${r.text(spec.speeds![count - 1] ?? undefined, nOut)}${count === 4 ? ', the same way round as gear 1' : ''}.`,
      );
  }
  if (spec.pitchSpeed !== undefined && k(spec.pitchSpeed))
    lines.push(`At the pitch point ${tagOf(spec.pitchSpeed, 'V')}.`);
  if (spec.force !== undefined && k(spec.force) && spec.power !== undefined && k(spec.power))
    lines.push(
      `${sym(spec.force, 'W_t')} = ${sym(spec.power, 'P')} ÷ ${sym(spec.pitchSpeed, 'V')}: the tangential force at the mesh.`,
    );

  const showForce = spec.force !== undefined && k(spec.force) && all;
  const twoRows = !!spec.diameters;
  return (
    <View>
      <Canvas
        aspect={(w) => {
          const s = Math.min((w - 24) / lay.width, 250 / lay.height);
          return (lay.height * s + 40 + (twoRows ? 34 : 20)) / w;
        }}
      >
        {({ w }) => {
          const s = Math.min((w - 24) / lay.width, 250 / lay.height);
          const ox = (w - lay.width * s) / 2 - lay.minX * s;
          const oy = 40 - lay.minY * s;
          const X = (x: number) => ox + x * s;
          const Y = (y: number) => oy + y * s;
          const h = lay.height * s + 40 + (twoRows ? 34 : 20);
          const gear = (i: number) => {
            const g = lay.gears[i]!;
            const n = teeth[i];
            if (n === undefined) return null;
            const rp = (g.N / 2) * s;
            const front = count === 4 && i >= 2;
            return (
              <G key={`g${i}`}>
                {front ? (
                  <Circle cx={X(g.x) + 3} cy={Y(g.y) + 4} r={rp + s} fill={c.shade} opacity={0.3} />
                ) : null}
                <Path
                  d={gearOutline(X(g.x), Y(g.y), g.N, s, g.phase)}
                  fill={url(front ? ids.front : ids.steel)}
                  stroke={c.silverDark}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
                <Circle
                  cx={X(g.x)}
                  cy={Y(g.y)}
                  r={Math.max(4, rp - 2.6 * s)}
                  fill="none"
                  stroke={c.silverDark}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <Circle
                  cx={X(g.x)}
                  cy={Y(g.y)}
                  r={rp}
                  fill="none"
                  stroke={c.he4lPitch}
                  strokeWidth={1.2}
                  strokeDasharray={chart.dash}
                />
                <Circle
                  cx={X(g.x)}
                  cy={Y(g.y)}
                  r={Math.max(5, Math.min(rp * 0.22, 14))}
                  fill={c.metal}
                  stroke={c.metalDark}
                />
                <Circle
                  cx={X(g.x)}
                  cy={Y(g.y)}
                  r={Math.max(2.5, Math.min(rp * 0.1, 7))}
                  fill={c.card}
                  stroke={c.metalDark}
                />
              </G>
            );
          };
          const arrow = (i: number) => {
            const g = lay.gears[i]!;
            if (teeth[i] === undefined || speed(i) === undefined) return null;
            // Gear 3 of a compound train turns with gear 2: one arrow, on gear 2.
            if (count === 4 && i === 2) return null;
            const rr = (g.N / 2 + 1.6) * s + 5;
            const cw = g.turn > 0;
            return (
              <CurvedArrow
                key={`a${i}`}
                cx={X(g.x)}
                cy={Y(g.y)}
                r={rr}
                from={cw ? (2 * Math.PI) / 3 : Math.PI / 3}
                to={cw ? Math.PI / 3 : (2 * Math.PI) / 3}
                color={c.he4lTurn}
                width={2}
                head={8}
              />
            );
          };
          // Labels: speeds above each gear (gear 4 below), teeth and d under (gear 2 of a
          // compound train above, beside its speed), on chips.
          const labels: { x: number; y: number; text: string; color?: string }[] = [];
          lay.gears.forEach((g, i) => {
            if (teeth[i] === undefined) return;
            const nt = tagOf(spec.teeth[i], `N${SUB[i + 1]}`);
            const dt = tagOf(spec.diameters?.[i], `d${SUB[i + 1]}`);
            const st = count === 4 && i === 2 ? '' : tagOf(spec.speeds?.[i], `n${SUB[i + 1]}`);
            const rp = (g.N / 2 + 1.6) * s;
            // The second stage of a compound train is labelled on its faces (gear 3 in front
            // of gear 2, gear 4 under gear 2's rim), below the hub.
            if (count === 4 && i >= 2) {
              labels.push({ x: X(g.x), y: Y(g.y) + Math.max(14, rp * 0.22 + 14), text: nt });
              if (i === 3 && st)
                labels.push({ x: X(g.x), y: Y(g.y) + rp + 16, text: st, color: c.he4lTurn });
              return;
            }
            const top = Y(g.y) - rp - 10;
            const bottom = Y(g.y) + rp + 16;
            if (st) labels.push({ x: X(g.x), y: top - 4, text: st, color: c.he4lTurn });
            const under = bottom;
            if (count === 4 && i === 1) {
              labels.push({
                x: X(g.x),
                y: st ? top - 20 : top - 4,
                text: [nt, dt].filter(Boolean).join(', '),
              });
              return;
            }
            labels.push({ x: X(g.x), y: under, text: nt });
            if (dt) labels.push({ x: X(g.x), y: under + 16, text: dt });
          });
          const p = lay.pitch;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Metal id={ids.steel} light={c.silver} dark={c.silverDark} />
                <Metal id={ids.front} light={c.metal} dark={c.metalDark} />
              </Defs>
              {lay.gears.map((_, i) => gear(i))}
              {lay.gears.map((_, i) => arrow(i))}
              {showForce ? (
                <G>
                  <Vec
                    x1={X(p.x)}
                    y1={Y(p.y)}
                    x2={X(p.x)}
                    y2={Y(p.y) + Math.min(46, (lay.gears[0]!.N / 2) * s + 14)}
                    color={c.he4lForce}
                    width={2.5}
                  />
                  <HeLabel
                    x={X(p.x) + 8}
                    y={Y(p.y) + 18}
                    anchor="start"
                    text={tagOf(spec.force, 'W_t')}
                    color={c.he4lForce}
                    w={w}
                  />
                </G>
              ) : null}
              {all ? <Circle cx={X(p.x)} cy={Y(p.y)} r={3} fill={c.he4lForce} /> : null}
              {labels.map((l, i) => (
                <HeLabel key={`l${i}`} x={l.x} y={l.y} text={l.text} color={l.color} w={w} />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
