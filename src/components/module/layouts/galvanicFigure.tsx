/**
 * The galvanic cell (H56, Grades 9–12 chemistry, explore figure): two metal electrodes, each in a
 * glass beaker of its own ion's solution, a wire through a voltmeter or a bulb, and a KNO₃ salt
 * bridge. The figure works out the anode from the standard reduction potentials, sends the
 * electrons along the wire from it to the cathode, drifts the bridge's ions (NO₃⁻ toward the
 * anode, K⁺ toward the cathode), writes both half-reactions and reads E° on the meter. The
 * anode is drawn eaten away at its foot; the cathode wears a new coat of its metal.
 */
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import type { CellMetal, GalvanicScene } from '@/data/modules/typesHsj';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { arrowHead } from '../reps/graphKit';
import { Deepen, Glass, Metal, Sheen, url, usePaintIds } from '../reps/paint';
import { Bulb } from '../reps/physicsArt';
import { CELL_METALS, cellOf, ionOf } from './galvanic';

/** Each metal's own color, and the color of its ion's solution (clear unless it has one). */
const metalColor = (m: CellMetal, c: Palette) =>
  m === 'Cu' ? c.copper : m === 'Zn' ? c.zinc : m === 'Pb' || m === 'Fe' ? c.metalDark : c.silver;
const solutionColor = (m: CellMetal, c: Palette) =>
  m === 'Cu' ? c.copperIon : m === 'Ni' || m === 'Fe' ? c.nickelIon : undefined;

/** A potential as printed: −0.76, 0.34; a negative one in brackets after a minus sign. */
const signed = (v: number) => v.toFixed(2).replace('-', '−');
const bracketed = (v: number) => (v < 0 ? `(${signed(v)})` : signed(v));

/** `reading` (H108, the calculator picture) replaces the meter's E°; "?" hides the sum under it. */
export function GalvanicFigure({ scene, reading }: { scene: GalvanicScene; reading?: string }) {
  const c = usePalette();
  const ids = usePaintIds('glass', 'sheen', 'water', 'dial', 'bulbGlass', 'bulbMetal', 'bridge');
  const cell = cellOf(scene.metals);
  const lit = scene.lit;
  return (
    <Canvas aspect={1.02}>
      {({ w, h }) => {
        const bw = Math.min(118, w * 0.31);
        const centers = [w * 0.23, w * 0.77];
        const top = h * 0.44;
        const bottom = h - 72;
        const level = top + (bottom - top) * 0.22;
        const wireY = 40;
        const meter = { x: w / 2, y: wireY };
        const electrodeX = centers.map((x, i) => x + (i === 0 ? -bw * 0.18 : bw * 0.18));
        const elTop = top - 38;
        const elBottom = bottom - 18;
        // The bridge's legs dip into each beaker on its inner side.
        const legX = centers.map((x, i) => x + (i === 0 ? bw * 0.26 : -bw * 0.26));
        const bridgeTop = top - 22;
        const bridgeFoot = level + 44;
        const tube = 15;
        const ring = (x: number, y: number, ww: number, hh: number) => (
          <Rect
            x={x}
            y={y}
            width={ww}
            height={hh}
            rx={8}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={2.5}
            strokeDasharray={chart.dash}
          />
        );
        const anodeSide = cell ? (cell.leftIsAnode ? 0 : 1) : 0;
        const cathodeSide = 1 - anodeSide;
        const electronsRight = anodeSide === 0;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Glass id={ids.glass} />
              <Sheen id={ids.sheen} strength={0.8} />
              <Deepen id={ids.water} from={c.waterTop} to={c.water} />
              <Metal id={ids.dial} light={c.metal} dark={c.metalDark} />
              <Glass id={ids.bulbGlass} />
              <Metal id={ids.bulbMetal} light={c.metal} dark={c.metalDark} />
            </Defs>
            {/* The wire over the top, from each electrode to the meter. */}
            {electrodeX.map((x, i) => (
              <Path
                key={`w${i}`}
                d={`M ${x} ${elTop} L ${x} ${wireY} L ${meter.x + (i === 0 ? -24 : 24)} ${wireY}`}
                stroke={c.copper}
                strokeWidth={3}
                fill="none"
                strokeLinejoin="round"
              />
            ))}
            {scene.metals.map((m, i) => {
              const x = centers[i]!;
              const tint = solutionColor(m, c);
              const isAnode = cell && i === anodeSide;
              const ex = electrodeX[i]!;
              return (
                <G key={i}>
                  {/* The beaker and its solution. */}
                  <Rect
                    x={x - bw / 2}
                    y={top}
                    width={bw}
                    height={bottom - top}
                    fill={url(ids.glass)}
                  />
                  <Rect
                    x={x - bw / 2}
                    y={level}
                    width={bw}
                    height={bottom - level}
                    fill={url(ids.water)}
                    opacity={tint ? 0.35 : 0.55}
                  />
                  {tint ? (
                    <Rect
                      x={x - bw / 2}
                      y={level}
                      width={bw}
                      height={bottom - level}
                      fill={tint}
                      opacity={0.7}
                    />
                  ) : null}
                  {/* The electrode: the anode eaten away at its foot, the cathode coated. */}
                  <Path
                    d={
                      isAnode
                        ? `M ${ex - 8} ${elTop} L ${ex + 8} ${elTop} L ${ex + 8} ${elBottom - 14} L ${ex + 5} ${elBottom - 6} L ${ex + 2} ${elBottom - 12} L ${ex - 2} ${elBottom - 3} L ${ex - 5} ${elBottom - 10} L ${ex - 8} ${elBottom - 4} Z`
                        : `M ${ex - 8} ${elTop} L ${ex + 8} ${elTop} L ${ex + 8} ${elBottom} L ${ex - 8} ${elBottom} Z`
                    }
                    fill={metalColor(m, c)}
                    stroke={c.metalDark}
                    strokeWidth={1}
                  />
                  <Rect
                    x={ex - 8}
                    y={elTop}
                    width={16}
                    height={elBottom - elTop - 14}
                    fill={url(ids.sheen)}
                  />
                  {cell && !isAnode ? (
                    <Rect
                      x={ex - 10}
                      y={level + 20}
                      width={20}
                      height={elBottom - level - 18}
                      rx={3}
                      fill={metalColor(m, c)}
                      stroke={c.metalDark}
                      strokeWidth={1}
                    />
                  ) : null}
                  <Rect
                    x={x - bw / 2}
                    y={top}
                    width={bw}
                    height={bottom - top}
                    fill={url(ids.sheen)}
                  />
                  <Path
                    d={`M ${x - bw / 2 - 5} ${top - 4} Q ${x - bw / 2} ${top} ${x - bw / 2} ${top + 5} L ${x - bw / 2} ${bottom - 4} Q ${x - bw / 2} ${bottom} ${x - bw / 2 + 4} ${bottom} L ${x + bw / 2 - 4} ${bottom} Q ${x + bw / 2} ${bottom} ${x + bw / 2} ${bottom - 4} L ${x + bw / 2} ${top}`}
                    stroke={c.glassEdge}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    strokeLinejoin="round"
                  />
                  {/* The metal's ion in the solution. */}
                  <ChartText
                    x={i === 0 ? x - bw / 2 + 8 : x + bw / 2 - 8}
                    y={bottom - 8}
                    textAnchor={i === 0 ? 'start' : 'end'}
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {ionOf(m)}
                  </ChartText>
                  {/* Under the beaker: the metal and its job, the half-reaction, what it does. */}
                  <ChartText
                    x={x}
                    y={bottom + 18}
                    textAnchor="middle"
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {cell
                      ? `${CELL_METALS[m].name}: ${isAnode ? 'anode (−)' : 'cathode (+)'}`
                      : CELL_METALS[m].name}
                  </ChartText>
                  {cell ? (
                    <ChartText x={x} y={bottom + 35} textAnchor="middle" fontSize={chart.label}>
                      {isAnode ? cell.oxidation : cell.reduction}
                    </ChartText>
                  ) : null}
                  {cell ? (
                    <ChartText
                      x={x}
                      y={bottom + 51}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {isAnode ? 'oxidation: loses electrons' : 'reduction: gains electrons'}
                    </ChartText>
                  ) : null}
                </G>
              );
            })}
            {/* The salt bridge: a glass U tube of KNO₃ paste, its legs in both solutions. */}
            <Path
              d={`M ${legX[0]} ${bridgeFoot} L ${legX[0]} ${bridgeTop} L ${legX[1]} ${bridgeTop} L ${legX[1]} ${bridgeFoot}`}
              stroke={c.glassEdge}
              strokeWidth={tube + 3}
              fill="none"
              strokeLinejoin="round"
            />
            <Path
              d={`M ${legX[0]} ${bridgeFoot} L ${legX[0]} ${bridgeTop} L ${legX[1]} ${bridgeTop} L ${legX[1]} ${bridgeFoot}`}
              stroke={c.saltBridge}
              strokeWidth={tube}
              fill="none"
              strokeLinejoin="round"
            />
            <ChartText
              x={w / 2}
              y={bridgeTop + 4}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartInk}
            >
              KNO₃
            </ChartText>
            {cell ? (
              <G>
                {/* Ions drift in the bridge: NO₃⁻ toward the anode, K⁺ toward the cathode. */}
                <ChartText
                  x={legX[anodeSide]! + (anodeSide === 0 ? 22 : -22)}
                  y={bridgeTop + 26}
                  textAnchor={anodeSide === 0 ? 'start' : 'end'}
                  fontSize={chart.label}
                  fill={c.hopBack}
                  fontWeight="700"
                >
                  {anodeSide === 0 ? '← NO₃⁻' : 'NO₃⁻ →'}
                </ChartText>
                <ChartText
                  x={legX[cathodeSide]! + (cathodeSide === 0 ? 22 : -22)}
                  y={bridgeTop + 26}
                  textAnchor={cathodeSide === 0 ? 'start' : 'end'}
                  fontSize={chart.label}
                  fill={c.chartHighlight}
                  fontWeight="700"
                >
                  {cathodeSide === 0 ? '← K⁺' : 'K⁺ →'}
                </ChartText>
              </G>
            ) : null}
            {/* Electrons along the wire, from the anode to the cathode. */}
            {cell
              ? [0.25, 0.5, 0.75].map((t) => {
                  const x0 = electrodeX[anodeSide]!;
                  const x1 = electrodeX[cathodeSide]!;
                  const gap = 28;
                  const run = (x1 - x0) * t;
                  const x = x0 + run;
                  if (Math.abs(x - meter.x) < gap) return null;
                  const dir = electronsRight ? 1 : -1;
                  return (
                    <G key={t}>
                      <Circle
                        cx={x}
                        cy={wireY}
                        r={6}
                        fill={c.chartSecond}
                        stroke={c.chartInk}
                        strokeWidth={0.8}
                      />
                      <Path d={arrowHead(x + dir * 18, wireY, dir, 0, 8)} fill={c.chartInk} />
                    </G>
                  );
                })
              : null}
            {cell ? (
              <ChartText
                x={electrodeX[anodeSide]! + (anodeSide === 0 ? 8 : -8)}
                y={wireY - 10}
                textAnchor={anodeSide === 0 ? 'start' : 'end'}
                fontSize={chart.label}
                fontWeight="700"
              >
                e⁻ flow
              </ChartText>
            ) : null}
            {/* The meter: a voltmeter reading E°, or a bulb lit by the current. */}
            {scene.meter === 'bulb' ? (
              <Bulb
                x={meter.x}
                y={wireY + 10}
                glow={cell ? Math.min(1, cell.voltage / 2) : 0}
                glass={ids.bulbGlass}
                metal={ids.bulbMetal}
                r={15}
              />
            ) : (
              <G>
                <Rect
                  x={meter.x - 26}
                  y={wireY - 18}
                  width={52}
                  height={36}
                  rx={6}
                  fill={url(ids.dial)}
                  stroke={c.metalDark}
                />
                <Rect
                  x={meter.x - 21}
                  y={wireY - 13}
                  width={42}
                  height={20}
                  rx={3}
                  fill={c.paper}
                />
                <ChartText
                  x={meter.x}
                  y={wireY + 2}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartInk}
                >
                  {reading ?? (cell ? `${cell.voltage.toFixed(2)} V` : '0 V')}
                </ChartText>
              </G>
            )}
            {reading === '?' ? null : cell ? (
              <ChartText
                x={meter.x}
                y={wireY + (scene.meter === 'bulb' ? 50 : 36)}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {`E° = ${signed(CELL_METALS[cell.cathode].potential)} − ${bracketed(CELL_METALS[cell.anode].potential)} = ${cell.voltage.toFixed(2)} V`}
              </ChartText>
            ) : (
              <ChartText x={meter.x} y={wireY + 36} textAnchor="middle" fontSize={chart.label}>
                The same metal twice: no voltage.
              </ChartText>
            )}
            {/* The part the scene is about, ringed. */}
            {lit === 'electrons'
              ? ring(electrodeX[0]! - 14, wireY - 26, electrodeX[1]! - electrodeX[0]! + 28, 42)
              : null}
            {lit === 'meter'
              ? ring(meter.x - 36, wireY - 26, 72, scene.meter === 'bulb' ? 60 : 50)
              : null}
            {lit === 'bridge'
              ? ring(
                  legX[0]! - 16,
                  bridgeTop - 16,
                  legX[1]! - legX[0]! + 32,
                  bridgeFoot - bridgeTop + 22,
                )
              : null}
            {lit === 'anode' || lit === 'cathode'
              ? (() => {
                  const side = lit === 'anode' ? anodeSide : cathodeSide;
                  const x = centers[side]!;
                  return ring(x - w * 0.22, top - 50, w * 0.44, bottom - top + 110);
                })()
              : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}
