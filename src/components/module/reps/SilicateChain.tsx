/**
 * HC117 `silicateChain` (SilicateChainSpec in typesHe4f.ts): SiO₄ tetrahedra seen from above,
 * each a triangle with O at its corners and Si at its centre (the fourth O on top, a ring round
 * the Si), sharing corners as the structure does; the repeat unit boxed with its tetrahedra lit,
 * shared oxygens ringed, and the unit's oxygens and charge counted under it. The atoms are
 * painted balls; the net is flat. No handles.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import type { SilicateChainSpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Ball, url, usePaintIds } from './paint';
import {
  SILICATE_SHARES,
  boxedOxygens,
  cornerKey,
  silicateFormula,
  silicateStructure,
  wholeRepeat,
  type Tetrahedron,
} from './silicateMath';

const BW = 360;
const TOP = 30;
const AREA_H = 160;
const n3 = (x: number) => formatNumber(Number(x.toPrecision(4)));

const centroidOf = (t: Tetrahedron): [number, number] => [
  (t.corners[0]![0] + t.corners[1]![0] + t.corners[2]![0]) / 3,
  (t.corners[0]![1] + t.corners[1]![1] + t.corners[2]![1]) / 3,
];

export function SilicateChain({ spec, calc }: { spec: SilicateChainSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('o', 'si');
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const s = get(spec.shared);
  const nRaw = get(spec.units);
  const n = nRaw === undefined ? undefined : Math.round(nRaw);
  const valid = s !== undefined && SILICATE_SHARES.includes(s);
  const st =
    s === undefined ? undefined : silicateStructure(valid ? s : 0, n ?? 0, spec.form ?? 'chain');
  const hasBox = valid && n !== undefined && n >= 1;
  const whole = hasBox && wholeRepeat(s!, n!);
  const boxed = st && hasBox ? st.tets.filter((t) => t.boxed) : [];
  const oxygens = st && whole ? boxedOxygens(st) : undefined;
  const charge = oxygens !== undefined && n !== undefined ? 4 * n - 2 * oxygens : undefined;

  // The view: chains run on past both ends (faded), a net fills a window, the rest show whole.
  const repeating = valid && (s === 2 ? spec.form !== 'ring' : s! >= 2);
  const net = valid && s! >= 3;
  const inView = (t: Tetrahedron) => {
    const [x, y] = centroidOf(t);
    if (!repeating) return true;
    if (net) return x > 0.2 && x < 9.4 && Math.abs(y) < 1.8;
    return x > -1.6 && x < 8.6;
  };
  const shown = st ? st.tets.filter(inView) : [];
  const xs = shown.flatMap((t) => t.corners.map((p) => p[0]));
  const ys = shown.flatMap((t) => t.corners.map((p) => p[1]));
  const [x0, x1, y0, y1] = xs.length
    ? [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    : [0, 1, 0, 1];
  const t = Math.min(40, (BW - 40) / (x1 - x0 + 0.5), AREA_H / (y1 - y0 + 0.5));
  const ox = BW / 2 - (t * (x0 + x1)) / 2;
  const oy = TOP + AREA_H / 2 - (t * (y0 + y1)) / 2;
  const X = (x: number) => ox + t * x;
  const Y = (y: number) => oy + t * y;
  const faded = (tt: Tetrahedron) => {
    if (!repeating || net) return false;
    const [x] = centroidOf(tt);
    return x < -0.6 || x > 7.6;
  };
  const corners = new Map<string, [number, number]>();
  for (const tt of shown) for (const p of tt.corners) corners.set(cornerKey(p), p);
  const bx = boxed.flatMap((b) => b.corners.map((p) => p[0]));
  const by = boxed.flatMap((b) => b.corners.map((p) => p[1]));
  const box = boxed.length
    ? {
        x: X(Math.min(...bx)) - 0.32 * t,
        y: Y(Math.min(...by)) - 0.32 * t,
        w: t * (Math.max(...bx) - Math.min(...bx)) + 0.64 * t,
        h: t * (Math.max(...by) - Math.min(...by)) + 0.64 * t,
      }
    : undefined;
  const legendY = TOP + AREA_H + 32;
  const height = legendY + 46;

  const say = (v: V, x: number) =>
    v !== undefined && typeof v === 'string' && known(v) ? rep.value(v, false) : n3(x);
  const lines: string[] = [];
  if (s === undefined)
    lines.push('Type the oxygens each tetrahedron shares to draw the structure.');
  else if (!valid)
    lines.push(
      `No silicate shares ${n3(s)} oxygens per tetrahedron: the structures share 0, 1, 2, 2.5, 3 or 4.`,
    );
  else {
    lines.push(`${st!.name} (${st!.example}): each tetrahedron shares ${n3(s)} of its 4 oxygens.`);
    if (oxygens !== undefined && n !== undefined) {
      lines.push(
        `O per Si = 4 − ${n3(s)} ÷ 2 = ${say(spec.perSi, 4 - s / 2)}. In the box: O = ${n} × ${n3(4 - s / 2)} = ${say(spec.oxygens, oxygens)}.`,
      );
      lines.push(
        `Charge = −${n} × (4 − ${n3(s)}) = ${say(spec.charge, charge!)}: ${silicateFormula(n, oxygens, charge!)}.`,
      );
    } else if (hasBox)
      lines.push(
        `A double chain repeats every 2 Si (one tetrahedron sharing 3, one sharing 2): ${n} Si box part of a repeat, so take an even n.`,
      );
    else lines.push('Type the Si in the unit to box it and count its oxygens.');
  }

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.o} color={c.atomO} />
              <Ball id={ids.si} color={c.he4fSilicon} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {st ? (
                <ChartText x={BW / 2} y={18} textAnchor="middle" fontWeight="700">
                  {valid ? `${st.name} · ${st.example}` : 'No such structure'}
                </ChartText>
              ) : null}
              <G opacity={valid ? 1 : 0.3}>
                {/* Tetrahedra: the boxed ones lit. */}
                {shown.map((tt, i) => (
                  <Path
                    key={`t${i}`}
                    d={`M${tt.corners.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('L')}Z`}
                    fill={hasBox && tt.boxed ? c.he4fTetraLit : c.he4fTetra}
                    stroke={c.chartInk}
                    strokeWidth={1}
                    strokeLinejoin="round"
                    opacity={faded(tt) ? 0.4 : 1}
                  />
                ))}
                {/* Si at each centre with its apex O on top (a ring); a shared apex ringed too. */}
                {shown.map((tt, i) => {
                  const [cx, cy] = centroidOf(tt);
                  return (
                    <G key={`s${i}`} opacity={faded(tt) ? 0.4 : 1}>
                      <Circle cx={X(cx)} cy={Y(cy)} r={0.11 * t} fill={url(ids.si)} />
                      <Circle
                        cx={X(cx)}
                        cy={Y(cy)}
                        r={0.19 * t}
                        fill="none"
                        stroke={c.atomO}
                        strokeWidth={2}
                      />
                      {st!.apicalShared ? (
                        <Circle
                          cx={X(cx)}
                          cy={Y(cy)}
                          r={0.27 * t}
                          fill="none"
                          stroke={c.chartHighlight}
                          strokeWidth={1.5}
                        />
                      ) : null}
                    </G>
                  );
                })}
                {/* Corner oxygens, shared ones ringed. */}
                {[...corners.entries()].map(([k, [x, y]]) => {
                  const sharedO = (st!.holders.get(k) ?? 0) > 1;
                  return (
                    <G key={k}>
                      {sharedO ? (
                        <Circle
                          cx={X(x)}
                          cy={Y(y)}
                          r={0.3 * t}
                          fill="none"
                          stroke={c.chartHighlight}
                          strokeWidth={1.5}
                        />
                      ) : null}
                      <Circle cx={X(x)} cy={Y(y)} r={0.19 * t} fill={url(ids.o)} />
                    </G>
                  );
                })}
              </G>
              {box ? (
                <G opacity={whole ? 1 : 0.4}>
                  <Rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={4}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText
                    x={box.x + 2}
                    y={TOP + AREA_H + 10}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    halo
                  >
                    {`repeat unit: ${n} Si`}
                  </ChartText>
                </G>
              ) : null}
              {/* Key and the count. */}
              {valid ? (
                <G>
                  <Circle cx={22} cy={legendY - 4} r={6} fill={url(ids.o)} />
                  <ChartText x={32} y={legendY}>
                    O
                  </ChartText>
                  <Circle
                    cx={64}
                    cy={legendY - 4}
                    r={9}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={1.5}
                  />
                  <Circle cx={64} cy={legendY - 4} r={6} fill={url(ids.o)} />
                  <ChartText x={78} y={legendY}>
                    shared O (½ each)
                  </ChartText>
                  <Circle cx={208} cy={legendY - 4} r={3.5} fill={url(ids.si)} />
                  <Circle
                    cx={208}
                    cy={legendY - 4}
                    r={6.5}
                    fill="none"
                    stroke={c.atomO}
                    strokeWidth={2}
                  />
                  <ChartText x={220} y={legendY}>
                    Si, O on top
                  </ChartText>
                  {oxygens !== undefined && n !== undefined ? (
                    <ChartText
                      x={BW / 2}
                      y={legendY + 28}
                      textAnchor="middle"
                      fontSize={chart.emphasis}
                      fontWeight="700"
                    >
                      {`${n} Si, ${n3(oxygens)} O in the box: ${silicateFormula(n, oxygens, charge!)}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
