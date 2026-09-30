import { View } from 'react-native';
import Svg, { Defs, G, Line, Polygon, Rect } from 'react-native-svg';

import type { HeatEngineSpec } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import { heatEngineOf } from './hskMath';
import { sig, SubLabel } from './hskKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';

/**
 * A heat engine or a refrigerator (H64): hot and cold reservoirs, the engine between them, the
 * energy flows as bands as wide as their size (Q_H = W + Q_L), and a bar of the efficiency (or
 * the COP) against the Carnot limit. Past the limit it draws faded with the reason.
 */
export function HeatEngine({ spec, calc }: { spec: HeatEngineSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'metal');
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const mode = spec.mode ?? 'engine';
  const fridge = mode === 'refrigerator';
  const given = fridge ? spec.coldHeat : spec.hotHeat;
  const TH = si(spec.hot);
  const TC = si(spec.cold);
  const temps = spec.hot !== undefined && spec.cold !== undefined;
  const fl = heatEngineOf(mode, Math.max(0, si(given)), Math.max(0, si(spec.work)), TH, TC);
  const all = [given, spec.work, spec.hot, spec.cold].every(known);
  const impossible =
    fl.QC < -1e-9 ||
    (temps && (TH <= TC || fl.e > fl.carnot + 1e-9)) ||
    (!fridge && fl.e > 1 + 1e-9);
  const lines = captionLines();

  return (
    <View>
      <Canvas aspect={1.02}>
        {({ w, h }) => {
          const L = 12;
          const R = w - 12;
          const cx = w * 0.38;
          const hotY = [8, 58] as const;
          const coldY = [h - 118, h - 68] as const;
          const eng = { x: cx - 40, y: h * 0.33, w: 80, h: 56 };
          const big = Math.max(1e-9, fl.QH, fl.QC, fl.W);
          const k = 64 / big;
          const band = (q: number) => Math.max(q > 1e-9 ? 3 : 0, q * k);
          const [wH, wC, wW] = [band(fl.QH), band(Math.max(0, fl.QC)), band(fl.W)];
          const left = cx - wH / 2;
          // Vertical band from y1 to y2 (the arrow at y2), x from a to a + bw.
          const vband = (a: number, bw: number, y1: number, y2: number, color: string) => {
            if (bw <= 0) return null;
            const dir = y2 > y1 ? 1 : -1;
            const tip = y2;
            const base = y2 - dir * Math.min(14, Math.abs(y2 - y1) * 0.4);
            return (
              <G>
                <Rect
                  x={a}
                  y={Math.min(y1, base)}
                  width={bw}
                  height={Math.abs(base - y1)}
                  fill={color}
                  opacity={0.85}
                />
                <Polygon
                  points={`${a - 6},${base} ${a + bw + 6},${base} ${a + bw / 2},${tip}`}
                  fill={color}
                />
              </G>
            );
          };
          const wx1 = eng.x + eng.w;
          const wx2 = R - 8;
          const wy = eng.y + eng.h / 2 - wW / 2;
          const barY = h - 44;
          const scaleMax = fridge
            ? niceCeil(Math.max(fl.e, temps && Number.isFinite(fl.carnot) ? fl.carnot : 0, 1))
            : 1;
          const bx = (v: number) => L + ((R - L) * Math.min(v, scaleMax)) / scaleMax;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Sheen id={ids.metal} />
              </Defs>
              <G opacity={all && !impossible ? 1 : 0.4}>
                {/* Reservoirs. */}
                <Rect
                  x={L}
                  y={hotY[0]}
                  width={R - L}
                  height={hotY[1] - hotY[0]}
                  rx={6}
                  fill={c.physHot}
                />
                <Rect
                  x={L}
                  y={hotY[0]}
                  width={R - L}
                  height={hotY[1] - hotY[0]}
                  rx={6}
                  fill={url(ids.light)}
                />
                <ChartText
                  x={L + 10}
                  y={hotY[0] + 30}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.onAccent}
                >
                  {`Hot reservoir${temps ? `  ${sig(TH)} K` : ''}`}
                </ChartText>
                <Rect
                  x={L}
                  y={coldY[0]}
                  width={R - L}
                  height={coldY[1] - coldY[0]}
                  rx={6}
                  fill={c.physCold}
                />
                <Rect
                  x={L}
                  y={coldY[0]}
                  width={R - L}
                  height={coldY[1] - coldY[0]}
                  rx={6}
                  fill={url(ids.light)}
                />
                <ChartText
                  x={L + 10}
                  y={coldY[0] + 30}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.onAccent}
                >
                  {`Cold reservoir${temps ? `  ${sig(TC)} K` : ''}`}
                </ChartText>
                {/* Flows. */}
                {fridge ? (
                  <G>
                    {vband(left, wC, coldY[0], eng.y + eng.h, c.physCold)}
                    {vband(left, wH, eng.y, hotY[1], c.physHot)}
                  </G>
                ) : (
                  <G>
                    {vband(left, wH, hotY[1], eng.y, c.physHot)}
                    {vband(left, wC, eng.y + eng.h, coldY[0], c.physCold)}
                  </G>
                )}
                {wW > 0 ? (
                  <G>
                    <Rect
                      x={fridge ? wx1 + 14 : wx1}
                      y={wy}
                      width={wx2 - wx1 - 14}
                      height={wW}
                      fill={c.physWork}
                      opacity={0.85}
                    />
                    <Polygon
                      points={
                        fridge
                          ? `${wx1 + 14},${wy - 6} ${wx1 + 14},${wy + wW + 6} ${wx1},${wy + wW / 2}`
                          : `${wx2 - 14},${wy - 6} ${wx2 - 14},${wy + wW + 6} ${wx2},${wy + wW / 2}`
                      }
                      fill={c.physWork}
                    />
                  </G>
                ) : null}
                {/* The engine: a metal cylinder with its piston. */}
                <Rect
                  x={eng.x}
                  y={eng.y}
                  width={eng.w}
                  height={eng.h}
                  rx={8}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={1.5}
                />
                <Rect
                  x={eng.x}
                  y={eng.y}
                  width={eng.w}
                  height={eng.h}
                  rx={8}
                  fill={url(ids.metal)}
                />
                <Rect
                  x={eng.x + 12}
                  y={eng.y + 12}
                  width={eng.w - 24}
                  height={10}
                  rx={2}
                  fill={c.metalDark}
                />
                <Line
                  x1={cx}
                  y1={eng.y + 22}
                  x2={cx}
                  y2={eng.y + eng.h - 8}
                  stroke={c.metalDark}
                  strokeWidth={4}
                />
                <SubLabel
                  x={cx}
                  y={eng.y + eng.h - 10}
                  text={fridge ? 'pump' : 'engine'}
                  size={chart.label}
                  w={w}
                />
                {/* Flow labels. */}
                <SubLabel
                  x={left + wH + 10}
                  y={(hotY[1] + eng.y) / 2 + 5}
                  text={`Q_H ${sig(fl.QH)} J`}
                  anchor="start"
                  color={c.physHot}
                  w={w}
                />
                <SubLabel
                  x={left + wC + 10}
                  y={(eng.y + eng.h + coldY[0]) / 2 + 5}
                  text={`Q_L ${sig(fl.QC)} J`}
                  anchor="start"
                  color={c.physCold}
                  w={w}
                />
                <SubLabel
                  x={(wx1 + wx2) / 2 + 6}
                  y={wy - 8}
                  text={`W ${sig(fl.W)} J ${fridge ? 'in' : 'out'}`}
                  color={c.physWork}
                  w={w}
                />
              </G>
              {/* Efficiency (or COP) against the Carnot limit. */}
              <Rect
                x={L}
                y={barY}
                width={R - L}
                height={14}
                rx={3}
                fill={c.chartSurface}
                stroke={c.chartGrid}
              />
              <Rect
                x={L}
                y={barY}
                width={Math.max(0, bx(fl.e) - L)}
                height={14}
                rx={3}
                fill={impossible ? c.normalReject : c.physWork}
                opacity={all ? 1 : 0.4}
              />
              {temps && Number.isFinite(fl.carnot) && TH > TC ? (
                <G>
                  <Line
                    x1={bx(fl.carnot)}
                    y1={barY - 6}
                    x2={bx(fl.carnot)}
                    y2={barY + 20}
                    stroke={c.chartInk}
                    strokeWidth={2}
                  />
                  <SubLabel
                    x={bx(fl.carnot)}
                    y={barY - 10}
                    text={`Carnot ${fridge ? sig(fl.carnot) : `${sig(fl.carnot * 100)}%`}`}
                    size={chart.label}
                    w={w}
                  />
                </G>
              ) : null}
              <ChartText x={L} y={barY + 32} fontSize={chart.label} fill={c.chartMuted}>
                {fridge ? 'COP 0' : '0%'}
              </ChartText>
              <ChartText
                x={R}
                y={barY + 32}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="end"
              >
                {fridge ? sig(scaleMax) : '100%'}
              </ChartText>
              <SubLabel
                x={w / 2}
                y={barY + 32}
                text={fridge ? `COP ${sig(fl.e)}` : `efficiency ${sig(fl.e * 100)}%`}
                color={impossible ? c.normalReject : c.physWork}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  function captionLines(): string[] {
    const out: string[] = [];
    if (fridge) {
      out.push(
        `Q_H = Q_L + W = ${sig(fl.QC)} + ${sig(fl.W)} = ${sig(fl.QH)} J`,
        `COP = Q_L/W = ${sig(fl.QC)}/${sig(fl.W)} = ${sig(fl.e)}`,
      );
      if (temps && TH > TC)
        out.push(
          `Carnot COP = T_L/(T_H − T_L) = ${sig(TC)}/(${sig(TH)} − ${sig(TC)}) = ${sig(fl.carnot)}`,
        );
    } else {
      out.push(
        `Q_L = Q_H − W = ${sig(fl.QH)} − ${sig(fl.W)} = ${sig(fl.QC)} J`,
        `Efficiency = W/Q_H = ${sig(fl.W)}/${sig(fl.QH)} = ${sig(fl.e * 100)}%`,
      );
      if (temps && TH > 0)
        out.push(
          `Carnot limit = 1 − T_L/T_H = 1 − ${sig(TC)}/${sig(TH)} = ${sig(fl.carnot * 100)}%`,
        );
    }
    if (temps && TH <= TC) out.push('The hot reservoir must be hotter than the cold one.');
    else if (fl.QC < -1e-9) out.push('Impossible: the work can’t be more than the heat taken in.');
    else if (temps && fl.e > fl.carnot + 1e-9)
      out.push('Impossible: no engine beats the Carnot limit (the second law of thermodynamics).');
    else
      out.push(
        fridge
          ? 'Work moves heat from cold to hot, which never happens by itself.'
          : 'Some heat always goes to the cold reservoir: no engine turns all its heat into work.',
      );
    // Plain text: subscript letters (H for hot, L for low).
    return out.map((l) =>
      l.replace(/Q_H/g, 'Qₕ').replace(/Q_L/g, 'Qₗ').replace(/T_H/g, 'Tₕ').replace(/T_L/g, 'Tₗ'),
    );
  }
}
