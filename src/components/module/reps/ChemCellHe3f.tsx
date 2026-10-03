/**
 * The college options of `chemDiagram` mode `cell` (HC56, C-P9; `typesHe3f.ts`): a cell at the
 * page's concentrations, the ions as dots in proportion and the Nernst shift on a volt scale
 * (a concentration cell when one metal stands in both beakers), or an electrolysis that counts
 * its electrons: Q = It, n(e⁻) = Q ÷ F, n = n(e⁻) ÷ z, m = nM. Glassware and metals painted;
 * the scale and the count flat. A "?" value draws nothing for itself.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type {
  CellConcentrations,
  CellElectrolysis,
  ChemCellHe3fSpec,
} from '@/data/modules/typesHe3f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { arrowHead } from './graphKit';
import { fig3 } from './he1dText';
import {
  CELL_DOTS,
  cellQ,
  dotsFor,
  electrolysis,
  FARADAY,
  nernstE,
  perSecond,
  R_GAS,
} from './he3fMath';
import { Beaker, BeakerWall, ionOf, jitter, metalFill, minus, numReader } from './he3fKit';
import { MathText } from './hsdText';
import { axisOf, ticksOf } from './hsjPlot';
import { Deepen, Glass, Metal, Sheen, url, usePaintIds } from './paint';

const volts = (v: number) => `${minus(fig3(v))} V`;

export function ChemCellHe3f({ spec, calc }: { spec: ChemCellHe3fSpec; calc: Calculator }) {
  return 'electrolysis' in spec ? (
    <Electrolysis spec={spec} calc={calc} />
  ) : (
    <Concentrations spec={spec} calc={calc} />
  );
}

function Concentrations({ spec, calc }: { spec: CellConcentrations; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const ids = usePaintIds('glass', 'water', 'sheen', 'dial', 'rod');
  const [ma, mc] = spec.metals;
  const same = ma === mc;
  const [ca, cc] = [num(spec.concentrations.anode), num(spec.concentrations.cathode)];
  const n = num(spec.n);
  const T = spec.T === undefined ? 298.15 : num(spec.T);
  const e0 = spec.standard === undefined ? (same ? 0 : undefined) : num(spec.standard);
  const R = spec.R ?? R_GAS;
  const F = spec.F ?? FARADAY;
  const Qnamed = num(spec.Q);
  const Q = Qnamed ?? (ca !== undefined && cc !== undefined && cc > 0 ? cellQ(ca, cc) : undefined);
  const Enamed = num(spec.E);
  const E =
    Enamed ??
    (e0 !== undefined && n !== undefined && T !== undefined && Q !== undefined && Q > 0 && n > 0
      ? nernstE(e0, n, T, Q, R, F)
      : undefined);
  const shift = E !== undefined && e0 !== undefined ? E - e0 : undefined;
  const ions = spec.ions ?? [ionOf(ma, n), ionOf(mc, n)];
  const richest = Math.max(ca ?? 0, cc ?? 0);
  const concText = (x: NumOrVarLike) =>
    typeof x === 'number' ? `${fig3(x)} M` : rep.known(x) ? rep.value(x) : '?';

  return (
    <View>
      <Canvas aspect={(w) => 354 / w}>
        {({ w }) => {
          const bw = Math.min(140, w * 0.38);
          const cx = [w * 0.25, w * 0.75];
          const top = 86;
          const bottom = 212;
          const level = 100;
          const wireY = 26;
          const ex = [cx[0]! - bw * 0.3, cx[1]! + bw * 0.3];
          const lx = [cx[0]! + bw * 0.32, cx[1]! - bw * 0.32];
          const elTop = 58;
          const bridgeTop = 70;
          const bridgeFoot = level + 44;
          const forward = E === undefined || E >= 0;
          // Free spots in a solution: a jittered grid clear of the electrode and the bridge leg.
          const spots = (i: number) => {
            const out: [number, number][] = [];
            const left = cx[i]! - bw / 2 + 7;
            const cols = Math.floor((bw - 14) / 11);
            const rows = Math.floor((bottom - level - 12) / 12);
            for (let r = 0; r < rows; r++)
              for (let k = 0; k < cols; k++) {
                const x = left + k * 11 + 5 + (jitter(r, k) - 0.5) * 4;
                const y = level + 10 + r * 12 + (jitter(k, r + 7) - 0.5) * 4;
                if (Math.abs(x - ex[i]!) < 13) continue;
                if (Math.abs(x - lx[i]!) < 12 && y < bridgeFoot + 6) continue;
                out.push([x, y]);
              }
            // A fixed shuffle, so a few dots spread over the whole beaker.
            return out
              .map((p, k) => ({ p, key: jitter(k + 3, i + 11) }))
              .sort((a, b) => a.key - b.key)
              .map((s) => s.p);
          };
          const concs = [ca, cc];
          // The volt scale under the cell: E° and E, the shift between them.
          const sy = 310;
          const vs = [e0, E].filter((v): v is number => v !== undefined);
          const span = vs.length ? Math.max(...vs) - Math.min(...vs) : 0;
          const ax = axisOf(
            vs.length ? Math.min(...vs) - Math.max(0.02, span * 0.5) : -0.1,
            vs.length ? Math.max(...vs) + Math.max(0.02, span * 0.5) : 1.2,
            4,
          );
          const [pl, pr] = [22, w - 22];
          const X = (v: number) => pl + ((v - ax.lo) / (ax.hi - ax.lo)) * (pr - pl);
          return (
            <Svg width={w} height={354}>
              <Defs>
                <Glass id={ids.glass} />
                <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                <Sheen id={ids.sheen} strength={0.8} />
                <Metal id={ids.dial} light={c.metal} dark={c.metalDark} />
                <Sheen id={ids.rod} strength={1} />
              </Defs>
              {/* Wires from each electrode to the meter. */}
              {ex.map((x, i) => (
                <Path
                  key={`w${i}`}
                  d={`M ${x} ${elTop} L ${x} ${wireY} L ${w / 2 + (i === 0 ? -36 : 36)} ${wireY}`}
                  stroke={c.copper}
                  strokeWidth={3}
                  fill="none"
                  strokeLinejoin="round"
                />
              ))}
              {[0, 1].map((i) => {
                const m = spec.metals[i]!;
                const conc = concs[i];
                const count = conc === undefined ? 0 : dotsFor(conc, richest);
                const pts = spots(i).slice(0, count);
                return (
                  <G key={i}>
                    <Beaker
                      cx={cx[i]!}
                      bw={bw}
                      top={top}
                      bottom={bottom}
                      level={level}
                      ids={ids}
                      tint={m === 'Cu' ? c.copperIon : undefined}
                    />
                    {pts.map(([x, y], k) => (
                      <Circle
                        key={k}
                        cx={x}
                        cy={y}
                        r={3.2}
                        fill={c.chartHighlight}
                        stroke={c.card}
                        strokeWidth={0.8}
                      />
                    ))}
                    {/* Less than one dot's worth: one hollow dot says "a few". */}
                    {conc !== undefined && conc > 0 && count === 0 && spots(i)[0] ? (
                      <Circle
                        cx={spots(i)[0]![0]}
                        cy={spots(i)[0]![1]}
                        r={3.2}
                        fill="none"
                        stroke={c.chartHighlight}
                        strokeWidth={1.4}
                      />
                    ) : null}
                    <Rect
                      x={ex[i]! - 7}
                      y={elTop}
                      width={14}
                      height={bottom - 12 - elTop}
                      fill={metalFill(m, c)}
                      stroke={c.metalDark}
                      strokeWidth={1}
                    />
                    <Rect
                      x={ex[i]! - 7}
                      y={elTop}
                      width={14}
                      height={bottom - 12 - elTop}
                      fill={url(ids.rod)}
                    />
                    <BeakerWall cx={cx[i]!} bw={bw} top={top} bottom={bottom} />
                    <ChartText
                      x={cx[i]!}
                      y={bottom + 17}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {`${m} ${(i === 0) === forward ? 'anode (−)' : 'cathode (+)'}`}
                    </ChartText>
                    <ChartText
                      x={cx[i]!}
                      y={bottom + 33}
                      textAnchor="middle"
                      fontSize={chart.label}
                    >
                      {`[${ions[i]}] ${concText(i === 0 ? spec.concentrations.anode : spec.concentrations.cathode)}`}
                    </ChartText>
                  </G>
                );
              })}
              {/* The salt bridge. */}
              <Path
                d={`M ${lx[0]} ${bridgeFoot} L ${lx[0]} ${bridgeTop} L ${lx[1]} ${bridgeTop} L ${lx[1]} ${bridgeFoot}`}
                stroke={c.glassEdge}
                strokeWidth={15}
                fill="none"
                strokeLinejoin="round"
              />
              <Path
                d={`M ${lx[0]} ${bridgeFoot} L ${lx[0]} ${bridgeTop} L ${lx[1]} ${bridgeTop} L ${lx[1]} ${bridgeFoot}`}
                stroke={c.saltBridge}
                strokeWidth={12}
                fill="none"
                strokeLinejoin="round"
              />
              <ChartText
                x={w / 2}
                y={bridgeTop + 4}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                KNO₃
              </ChartText>
              {/* Electrons along the wire, anode to cathode, once E says which way. */}
              {E !== undefined && Math.abs(E) > 1e-9
                ? [0.2, 0.8].map((t) => {
                    const dir = E > 0 ? 1 : -1;
                    const x = ex[0]! + (ex[1]! - ex[0]!) * t;
                    return (
                      <G key={t}>
                        <Circle
                          cx={x}
                          cy={wireY}
                          r={5.5}
                          fill={c.chartSecond}
                          stroke={c.chartInk}
                          strokeWidth={0.8}
                        />
                        <Path d={arrowHead(x + dir * 15, wireY, dir, 0, 7)} fill={c.chartInk} />
                      </G>
                    );
                  })
                : null}
              {E !== undefined && Math.abs(E) > 1e-9 ? (
                <ChartText x={ex[0]! + 6} y={wireY + 20} fontSize={chart.label} fontWeight="700">
                  e⁻
                </ChartText>
              ) : null}
              {/* The voltmeter. */}
              <Rect
                x={w / 2 - 36}
                y={wireY - 18}
                width={72}
                height={36}
                rx={6}
                fill={url(ids.dial)}
                stroke={c.metalDark}
              />
              <Rect x={w / 2 - 31} y={wireY - 13} width={62} height={20} rx={3} fill={c.paper} />
              <ChartText
                x={w / 2}
                y={wireY + 3}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {E === undefined ? '?' : volts(E)}
              </ChartText>
              {/* The volt scale. */}
              <Line x1={pl} y1={sy} x2={pr} y2={sy} stroke={c.chartInk} strokeWidth={1.2} />
              {ticksOf(ax).map((t) => (
                <G key={t}>
                  <Line x1={X(t)} y1={sy} x2={X(t)} y2={sy + 5} stroke={c.chartInk} />
                  <ChartText
                    x={X(t)}
                    y={sy + 18}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {minus(String(t))}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={pr}
                y={sy + 34}
                textAnchor="end"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                volts
              </ChartText>
              {e0 !== undefined ? (
                <G>
                  <Line
                    x1={X(e0)}
                    y1={sy - 30}
                    x2={X(e0)}
                    y2={sy}
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  <MathText
                    text="E°"
                    {...fitLabel(
                      X(e0) + (shift !== undefined && shift > 0 ? -6 : 6),
                      'E°',
                      chart.label,
                      w,
                      shift !== undefined && shift > 0 ? 'end' : 'start',
                      6,
                    )}
                    y={sy - 20}
                    fontSize={chart.label}
                    fontWeight="700"
                  />
                </G>
              ) : null}
              {E !== undefined ? (
                <G>
                  <Circle cx={X(E)} cy={sy} r={5} fill={c.chartHighlight} />
                  <MathText
                    text="E"
                    {...fitLabel(
                      X(E) + (shift !== undefined && shift > 0 ? 7 : -7),
                      'E',
                      chart.label,
                      w,
                      shift !== undefined && shift > 0 ? 'start' : 'end',
                      7,
                    )}
                    y={sy - 8}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  />
                </G>
              ) : null}
              {shift !== undefined &&
              e0 !== undefined &&
              E !== undefined &&
              Math.abs(X(E) - X(e0)) > 12 ? (
                <G>
                  <Line
                    x1={X(e0)}
                    y1={sy - 30}
                    x2={X(E) - Math.sign(X(E) - X(e0)) * 6}
                    y2={sy - 30}
                    stroke={c.chartHighlight}
                    strokeWidth={1.6}
                  />
                  <Path
                    d={arrowHead(X(E), sy - 30, Math.sign(X(E) - X(e0)), 0, 7)}
                    fill={c.chartHighlight}
                  />
                </G>
              ) : null}
              {Q !== undefined && shift !== undefined ? (
                <MathText
                  text={`Q = ${fig3(Q)}: −(RT ÷ nF) ln Q = ${volts(shift)}`}
                  {...fitLabel(
                    e0 === undefined || E === undefined ? w / 2 : (X(e0) + X(E)) / 2,
                    `Q = ${fig3(Q)}: −(RT ÷ nF) ln Q = ${volts(shift)}`,
                    chart.label,
                    w,
                  )}
                  y={sy - 40}
                  fontSize={chart.label}
                  fontWeight="700"
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          same
            ? `One metal both sides: a concentration cell, E° = 0. The dilute side is oxidized, so its ions grow.`
            : `E° = ${e0 === undefined ? '?' : volts(e0)} at 1 M; here Q = [${ions[0]}] ÷ [${ions[1]}] = ${Q === undefined ? '?' : fig3(Q)}.`,
          E !== undefined && e0 !== undefined && n !== undefined && Q !== undefined
            ? `E = E° − (RT ÷ nF) ln Q = ${volts(e0)} − (${formatNumber(R)} × ${formatNumber(T ?? 298.15)} ÷ (${fig3(n)} × ${formatNumber(F)})) × ln ${fig3(Q)} = ${volts(E)}.`
            : 'Type the values to read E.',
          ...(E !== undefined && E < 0
            ? ['E is negative: as drawn the cell runs backward, so the electrodes swap jobs.']
            : []),
          `Dots: each beaker's ions in proportion (${CELL_DOTS} for the richer one).`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

type NumOrVarLike = number | string;

function Electrolysis({ spec, calc }: { spec: CellElectrolysis; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const ids = usePaintIds('glass', 'water', 'sheen', 'box', 'rod');
  const e = spec.electrolysis;
  const F = e.F ?? FARADAY;
  const I = num(e.current);
  const t = num(e.time, perSecond);
  const z = num(e.z);
  const M = num(e.molar);
  const count =
    I !== undefined && t !== undefined && z !== undefined && z > 0
      ? electrolysis(I, t, z, M, F)
      : undefined;
  const charge = num(e.charge) ?? (I !== undefined && t !== undefined ? I * t : undefined);
  const electrons = num(e.electrons) ?? (charge !== undefined ? charge / F : undefined);
  const moles = num(e.moles) ?? count?.moles;
  const mass = num(e.mass) ?? count?.mass;
  const ion = ionOf(e.metal, z);
  const text = (x: NumOrVarLike | undefined, fallback: string) =>
    x === undefined
      ? fallback
      : typeof x === 'number'
        ? fallback
        : rep.known(x)
          ? rep.value(x)
          : '?';
  const rows: [string, string][] = [
    ['Charge  Q = It', charge === undefined ? '?' : `${fig3(charge)} C`],
    ['Electrons  n(e⁻) = Q ÷ F', electrons === undefined ? '?' : `${fig3(electrons)} mol`],
    ['Metal  n = n(e⁻) ÷ z', moles === undefined ? '?' : `${fig3(moles)} mol`],
    ...(e.molar !== undefined || e.mass !== undefined
      ? ([['Mass  m = nM', mass === undefined ? '?' : `${fig3(mass)} g`]] as [string, string][])
      : []),
  ];

  return (
    <View>
      <Canvas aspect={(w) => (262 + rows.length * 24) / w}>
        {({ w }) => {
          const bw = Math.min(230, w * 0.64);
          const cx = w / 2;
          const top = 96;
          const bottom = 206;
          const level = 110;
          const ax = cx - bw * 0.28;
          const kx = cx + bw * 0.28;
          const box = { x: cx - 58, y: 8, w: 116, h: 44 };
          const wireY = box.y + box.h / 2;
          const elTop = 72;
          const live = I !== undefined && I > 0;
          const tableTop = 266;
          return (
            <Svg width={w} height={262 + rows.length * 24}>
              <Defs>
                <Glass id={ids.glass} />
                <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                <Sheen id={ids.sheen} strength={0.8} />
                <Metal id={ids.box} light={c.metal} dark={c.metalDark} />
                <Sheen id={ids.rod} />
              </Defs>
              {/* Wires: + terminal to the anode, − terminal to the cathode. */}
              <Path
                d={`M ${box.x} ${wireY} L ${ax} ${wireY} L ${ax} ${elTop}`}
                stroke={c.copper}
                strokeWidth={3}
                fill="none"
                strokeLinejoin="round"
              />
              <Path
                d={`M ${box.x + box.w} ${wireY} L ${kx} ${wireY} L ${kx} ${elTop}`}
                stroke={c.copper}
                strokeWidth={3}
                fill="none"
                strokeLinejoin="round"
              />
              <Beaker
                cx={cx}
                bw={bw}
                top={top}
                bottom={bottom}
                level={level}
                ids={ids}
                tint={e.metal === 'Cu' ? c.copperIon : undefined}
              />
              {/* Ions drifting to the cathode. */}
              {[0, 1, 2, 3, 4].map((k) => {
                const x = ax + 22 + k * ((kx - ax - 50) / 4);
                const y = level + 24 + (k % 2) * 30 + jitter(k, 2) * 10;
                return (
                  <G key={k}>
                    <Circle cx={x} cy={y} r={4} fill={c.chartHighlight} stroke={c.card} />
                    {live ? (
                      <Path d={arrowHead(x + 14, y, 1, 0, 6)} fill={c.chartHighlight} />
                    ) : null}
                  </G>
                );
              })}
              {/* The anode (the metal's source) and the cathode, coated with new metal. */}
              <Rect
                x={ax - 8}
                y={elTop}
                width={16}
                height={bottom - 12 - elTop}
                fill={metalFill(e.metal, c)}
                stroke={c.metalDark}
              />
              <Rect
                x={ax - 8}
                y={elTop}
                width={16}
                height={bottom - 12 - elTop}
                fill={url(ids.rod)}
              />
              <Rect
                x={kx - 8}
                y={elTop}
                width={16}
                height={bottom - 12 - elTop}
                fill={c.silver}
                stroke={c.metalDark}
              />
              {mass !== undefined && mass > 0 ? (
                <Rect
                  x={kx - 11}
                  y={level + 6}
                  width={22}
                  height={bottom - 12 - level - 6}
                  rx={3}
                  fill={metalFill(e.metal, c)}
                  stroke={c.metalDark}
                />
              ) : null}
              <Rect
                x={kx - 8}
                y={elTop}
                width={16}
                height={bottom - 12 - elTop}
                fill={url(ids.rod)}
              />
              <BeakerWall cx={cx} bw={bw} top={top} bottom={bottom} />
              {/* Electrons: out of the − terminal into the cathode, out of the anode to +. */}
              {live
                ? (
                    [
                      [kx, (wireY + elTop) / 2 + 4, 1],
                      [ax, (wireY + elTop) / 2 - 4, -1],
                    ] as const
                  ).map(([x, y, dir]) => (
                    <G key={x}>
                      <Circle
                        cx={x}
                        cy={y}
                        r={5.5}
                        fill={c.chartSecond}
                        stroke={c.chartInk}
                        strokeWidth={0.8}
                      />
                      <Path d={arrowHead(x, y + dir * 14, 0, dir, 7)} fill={c.chartInk} />
                      <ChartText
                        x={x + (x > cx ? 10 : -10)}
                        y={y + 4}
                        textAnchor={x > cx ? 'start' : 'end'}
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        e⁻
                      </ChartText>
                    </G>
                  ))
                : null}
              {/* The DC supply. */}
              <Rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={6}
                fill={url(ids.box)}
                stroke={c.metalDark}
              />
              <Rect
                x={box.x + 6}
                y={box.y + 5}
                width={box.w - 12}
                height={20}
                rx={3}
                fill={c.paper}
              />
              <MathText
                text={I === undefined ? 'I = ?' : `I = ${text(e.current, `${fig3(I)} A`)}`}
                x={cx}
                y={box.y + 20}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              />
              <ChartText x={box.x + 10} y={box.y + 39} fontSize={chart.label} fontWeight="700">
                +
              </ChartText>
              <ChartText
                x={box.x + box.w - 10}
                y={box.y + 39}
                textAnchor="end"
                fontSize={chart.label}
                fontWeight="700"
              >
                −
              </ChartText>
              <MathText
                text={`t = ${text(e.time, t === undefined ? '?' : `${fig3(t)} s`)}`}
                x={cx}
                y={box.y + box.h + 16}
                textAnchor="middle"
                fontSize={chart.label}
              />
              <ChartText
                x={ax}
                y={bottom + 17}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                anode (+)
              </ChartText>
              <ChartText
                x={kx}
                y={bottom + 17}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                cathode (−)
              </ChartText>
              <ChartText x={cx} y={bottom + 36} textAnchor="middle" fontSize={chart.label}>
                {z === undefined
                  ? `${ion} + electrons → ${e.metal}`
                  : `${ion} + ${z === 1 ? '' : z}e⁻ → ${e.metal}`}
              </ChartText>
              {/* The count, row by row. */}
              {rows.map(([label, value], k) => (
                <G key={label}>
                  <Rect
                    x={12}
                    y={tableTop + k * 24 - 15}
                    width={w - 24}
                    height={21}
                    rx={4}
                    fill={k % 2 === 0 ? c.chartFill : c.card}
                  />
                  <MathText text={label} x={20} y={tableTop + k * 24} fontSize={chart.label} />
                  <ChartText
                    x={w - 20}
                    y={tableTop + k * 24}
                    textAnchor="end"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {value}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Each ${ion} takes ${z === undefined ? '?' : z} electrons from the cathode, so the metal is the electrons counted ÷ z.`,
          `F = ${formatNumber(F)} C per mole of electrons.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}
