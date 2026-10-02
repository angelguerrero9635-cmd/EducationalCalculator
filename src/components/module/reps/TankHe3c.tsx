/**
 * HC54 (college round 3, group C): `curvedSolid` tanks for related rates and pumping work, in
 * glass and water like the K–12 solids. `fill` (a cone): the cone stands on its apex, water to
 * depth h with surface radius r = Rh ÷ H, the inflow poured in and the surface rising. `slab`
 * (a cylinder): the full tank with a thin layer at height y lifted to the outlet over the rim.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { arrowHead } from './graphKit';
import { Deepen, FloorShadow, Glass, Sheen, url, usePaintIds } from './paint';
import { coneRise, coneSurface, pumpWork, sig4 as short, slabLift } from './ratesHe3cMath';

type Spec = Extract<Representation, { kind: 'curvedSolid' }>;

export function TankHe3c({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'water', 'sheen');
  const start = useRef(0);
  const num = (x: number | string | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const R = rep.val(spec.radius);
  const H = rep.val(spec.height!);
  const tankKnown = rep.known(spec.radius) && rep.known(spec.height!);
  const op = tankKnown ? 1 : 0.35;
  const fit = useFrozen({ R, H });
  const cone = !!spec.fill && spec.shape === 'cone';
  const fill = cone ? spec.fill : undefined;
  const slab = !cone && spec.slab ? spec.slab : undefined;

  // The values each option draws ("?" draws nothing for that value).
  const depth = num(fill?.depth);
  const surface = tankKnown && depth !== undefined ? coneSurface(R, H, depth) : undefined;
  const inflow = num(fill?.inflow);
  const y = num(slab?.y);
  const above = slab ? (num(slab.above ?? 0) ?? undefined) : undefined;
  const lift =
    tankKnown && y !== undefined && above !== undefined ? slabLift(H, above, y) : undefined;

  const sym = (id: string) => rep.variable(id).symbol;
  const lines: string[] = [];
  if (fill) {
    lines.push(
      surface !== undefined && depth !== undefined
        ? `Similar triangles: r = R·h ÷ H = ${short(R)} × ${short(depth)} ÷ ${short(H)} = ${short(surface)}`
        : 'r = R·h ÷ H: type the depth',
    );
    if (fill.rise)
      lines.push(
        surface !== undefined && inflow !== undefined && surface > 0
          ? `dh/dt = (dV/dt) ÷ (πr²) = ${short(inflow)} ÷ (π × ${short(surface)}²) = ${short(coneRise(inflow, surface))}`
          : 'dh/dt = (dV/dt) ÷ (πr²)',
      );
  }
  if (slab) {
    lines.push(
      lift !== undefined && y !== undefined && above !== undefined
        ? `The slab at y = ${short(y)} lifts H + ${slab.above !== undefined && typeof slab.above === 'string' ? sym(slab.above) : 'h'} − y = ${short(H)} + ${short(above)} − ${short(y)} = ${short(lift)}`
        : 'The slab at y lifts H + h − y',
    );
    const [rho, g] = [num(slab.density), num(slab.g)];
    if (slab.work)
      lines.push(
        tankKnown && rho !== undefined && g !== undefined && above !== undefined
          ? `W = ∫ ρgπr²(H + h − y) dy from 0 to H = ρgπr²(H²/2 + hH) = ${short(pumpWork(rho, g, R, H, above))}`
          : 'W = ρgπr²(H²/2 + hH)',
      );
  }

  const layout = (w: number) => {
    const [L, Rm] = [86, 112];
    const T = cone ? 46 : 30;
    const outletUp = slab ? Math.max(0, above ?? 0) : 0;
    const s = Math.min(
      (w - L - Rm) / (2 * Math.max(fit.value.R, 1e-9)),
      210 / Math.max(fit.value.H + outletUp, 1e-9),
    );
    const Rp = R * s;
    const ry = Math.max(Rp * 0.28, 3);
    const top = T + outletUp * s + ry;
    const Hp = H * s;
    const cx = L + (w - L - Rm) / 2;
    return { s, Rp, ry, top, Hp, cx, h: top + Hp + ry + (cone ? 26 : 30) };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { s, Rp, ry, top, Hp, cx } = layout(w);
          const bottom = top + Hp;
          const dim = (x: number, y1: number, y2: number, text: string, side: 'start' | 'end') => (
            <G>
              <Line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {[y1, y2].map((yy) => (
                <Line
                  key={yy}
                  x1={x - 4}
                  y1={yy}
                  x2={x + 4}
                  y2={yy}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              ))}
              <ChartText
                x={x + (side === 'start' ? 7 : -7)}
                y={(y1 + y2) / 2 + 4}
                textAnchor={side}
                fontWeight="700"
              >
                {text}
              </ChartText>
            </G>
          );
          const pour = (x: number, y1: number, y2: number) => (
            <G>
              <Line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2 - 8}
                stroke={c.water}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Path d={arrowHead(x, y2, 0, 1, 10)} fill={c.hopBack} />
            </G>
          );
          if (cone) {
            const apex = bottom;
            const rim = top;
            const body = `M ${cx - Rp} ${rim} L ${cx} ${apex} L ${cx + Rp} ${rim} A ${Rp} ${ry} 0 0 1 ${cx - Rp} ${rim} Z`;
            const wy = depth !== undefined ? apex - depth * s : undefined;
            const rw = surface !== undefined ? surface * s : 0;
            const ryw = Math.max(rw * 0.28, 1.5);
            const water =
              wy !== undefined && rw > 0.5
                ? `M ${cx - rw} ${wy} L ${cx} ${apex} L ${cx + rw} ${wy} A ${rw} ${ryw} 0 0 1 ${cx - rw} ${wy} Z`
                : undefined;
            return (
              <>
                <Svg width={w} height={h}>
                  <Defs>
                    <Glass id={ids.glass} />
                    <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
                    <Sheen id={ids.sheen} strength={0.8} />
                  </Defs>
                  <G opacity={op}>
                    <FloorShadow cx={cx + 3} cy={apex + 4} rx={Rp * 0.5} ry={3} />
                    <Path d={body} fill={url(ids.glass)} />
                    {water ? (
                      <>
                        <Path d={water} fill={url(ids.water)} />
                        <Ellipse
                          cx={cx}
                          cy={wy}
                          rx={rw}
                          ry={ryw}
                          fill={c.waterTop}
                          stroke={c.water}
                          strokeWidth={1}
                        />
                      </>
                    ) : null}
                    <Path d={body} fill={url(ids.sheen)} />
                    <Path
                      d={`M ${cx - Rp} ${rim} L ${cx} ${apex} L ${cx + Rp} ${rim}`}
                      stroke={c.glassEdge}
                      strokeWidth={chart.stroke}
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <Ellipse
                      cx={cx}
                      cy={rim}
                      rx={Rp}
                      ry={ry}
                      fill="none"
                      stroke={c.glassEdge}
                      strokeWidth={chart.stroke}
                    />
                    {/* R on the rim, H down the left. */}
                    <Line
                      x1={cx}
                      y1={rim}
                      x2={cx + Rp}
                      y2={rim}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText x={cx + Rp + 8} y={rim + 4} fontWeight="700">
                      {rep.label(spec.radius)}
                    </ChartText>
                    {dim(cx - Rp - 14, rim, apex, rep.label(spec.height!), 'end')}
                  </G>
                  {wy !== undefined && water ? (
                    <G>
                      <Line
                        x1={cx}
                        y1={wy}
                        x2={cx + rw}
                        y2={wy}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      {fill?.r ? (
                        <Rect
                          x={cx - Math.max(6, rw * 0.35) - 12 - rep.label(fill.r).length * 7.2}
                          y={wy - ryw - 18}
                          width={rep.label(fill.r).length * 7.2 + 6}
                          height={17}
                          rx={3}
                          fill={c.card}
                          opacity={0.85}
                        />
                      ) : null}
                      {fill?.r ? (
                        <ChartText
                          x={cx - Math.max(6, rw * 0.35) - 8}
                          y={wy - ryw - 5}
                          textAnchor="end"
                          fontWeight="700"
                        >
                          {rep.label(fill.r)}
                        </ChartText>
                      ) : null}
                      {dim(
                        cx + rw + 16 + (Rp - rw) * 0.5,
                        wy,
                        apex,
                        rep.label(fill!.depth as string),
                        'start',
                      )}
                      {fill?.rise ? (
                        <G>
                          <Line
                            x1={cx + rw * 0.45}
                            y1={wy - 2}
                            x2={cx + rw * 0.45}
                            y2={wy - 18}
                            stroke={c.hopBack}
                            strokeWidth={chart.stroke + 0.5}
                          />
                          <Path d={arrowHead(cx + rw * 0.45, wy - 24, 0, -1, 9)} fill={c.hopBack} />
                        </G>
                      ) : null}
                    </G>
                  ) : null}
                  {inflow !== undefined && wy !== undefined ? (
                    <G>
                      {pour(cx - Math.max(6, rw * 0.35), 18, wy - 2)}
                      <ChartText
                        x={cx - Math.max(6, rw * 0.35) - 8}
                        y={22}
                        textAnchor="end"
                        fontWeight="700"
                        fill={c.hopBack}
                      >
                        {fill?.inflow && typeof fill.inflow === 'string'
                          ? rep.label(fill.inflow)
                          : 'dV/dt'}
                      </ChartText>
                    </G>
                  ) : null}
                </Svg>
                {tankKnown &&
                wy !== undefined &&
                typeof fill?.depth === 'string' &&
                !rep.variable(fill.depth).derived ? (
                  <DragHandle
                    testID="drag-depth"
                    x={cx}
                    y={wy}
                    label={rep.variable(fill.depth).name}
                    onStart={() => {
                      start.current = depth!;
                      fit.freeze();
                    }}
                    onEnd={fit.release}
                    onMove={(_, dy) =>
                      calc.set(
                        {
                          ...rep.pin([
                            spec.radius,
                            spec.height!,
                            ...(typeof fill.inflow === 'string' ? [fill.inflow] : []),
                          ]),
                          [fill.depth as string]: rep.snapTo(
                            fill.depth as string,
                            Math.min(H, Math.max(0, start.current - dy / s)),
                          ),
                        },
                        rep.slide(fill.depth as string),
                      )
                    }
                  />
                ) : null}
              </>
            );
          }
          // The cylinder with its slab.
          const body = `M ${cx - Rp} ${top} L ${cx - Rp} ${bottom} A ${Rp} ${ry} 0 0 0 ${cx + Rp} ${bottom} L ${cx + Rp} ${top} A ${Rp} ${ry} 0 0 0 ${cx - Rp} ${top} Z`;
          const water = `M ${cx - Rp} ${top} L ${cx - Rp} ${bottom} A ${Rp} ${ry} 0 0 0 ${cx + Rp} ${bottom} L ${cx + Rp} ${top} Z`;
          const sy = y !== undefined ? bottom - y * s : undefined;
          const outY = above !== undefined ? top - above * s : undefined;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
                  <Sheen id={ids.sheen} strength={0.8} />
                </Defs>
                <G opacity={op}>
                  <FloorShadow
                    cx={cx + 3}
                    cy={bottom + ry + 2}
                    rx={Rp * 1.1}
                    ry={Math.max(3, ry * 0.5)}
                  />
                  <Path d={body} fill={url(ids.glass)} />
                  <Path d={water} fill={url(ids.water)} />
                  <Ellipse
                    cx={cx}
                    cy={top}
                    rx={Rp}
                    ry={ry}
                    fill={c.waterTop}
                    stroke={c.water}
                    strokeWidth={1}
                  />
                  {sy !== undefined && sy >= top - 1 && sy <= bottom + 1 ? (
                    <G>
                      <Path
                        d={`M ${cx - Rp} ${sy - 3} L ${cx - Rp} ${sy + 3} A ${Rp} ${ry} 0 0 0 ${cx + Rp} ${sy + 3} L ${cx + Rp} ${sy - 3} A ${Rp} ${ry} 0 0 1 ${cx - Rp} ${sy - 3} Z`}
                        fill={c.waterDeep}
                        stroke={c.hopBack}
                        strokeWidth={chart.strokeLight}
                      />
                      <Ellipse
                        cx={cx}
                        cy={sy - 3}
                        rx={Rp}
                        ry={ry}
                        fill={c.water}
                        stroke={c.hopBack}
                        strokeWidth={chart.strokeLight}
                      />
                    </G>
                  ) : null}
                  <Path d={body} fill={url(ids.sheen)} />
                  <Path
                    d={`M ${cx - Rp} ${top} L ${cx - Rp} ${bottom} A ${Rp} ${ry} 0 0 0 ${cx + Rp} ${bottom} L ${cx + Rp} ${top}`}
                    stroke={c.glassEdge}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />
                  <Ellipse
                    cx={cx}
                    cy={top}
                    rx={Rp}
                    ry={ry}
                    fill="none"
                    stroke={c.glassEdge}
                    strokeWidth={chart.stroke}
                  />
                  {/* r across the base, its label under the tank (clear of the pipe). */}
                  <Line
                    x1={cx}
                    y1={bottom}
                    x2={cx + Rp}
                    y2={bottom}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText x={cx} y={bottom + ry + 18} textAnchor="middle" fontWeight="700">
                    {rep.label(spec.radius)}
                  </ChartText>
                  {dim(cx - Rp - 14, top, bottom, rep.label(spec.height!), 'end')}
                </G>
                {outY !== undefined && above! > 0 ? (
                  <G>
                    {/* The outlet: a pipe up from the water to h over the rim, its spout to the left. */}
                    <Line
                      x1={cx - Rp - 6}
                      y1={outY}
                      x2={cx + Rp + 40}
                      y2={outY}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Rect
                      x={cx - Rp * 0.55 - 6}
                      y={outY}
                      width={6}
                      height={top - outY}
                      fill={c.chartMuted}
                    />
                    <Rect
                      x={cx - Rp - 6}
                      y={outY - 3}
                      width={Rp * 0.45 + 6}
                      height={6}
                      fill={c.chartMuted}
                    />
                    {dim(
                      cx - Rp - 14,
                      outY,
                      top,
                      typeof slab!.above === 'string'
                        ? rep.label(slab!.above)
                        : `h = ${short(above!)}`,
                      'end',
                    )}
                  </G>
                ) : null}
                {sy !== undefined && outY !== undefined && lift !== undefined ? (
                  <G>
                    <Line
                      x1={cx + Rp + 16}
                      y1={sy}
                      x2={cx + Rp + 16}
                      y2={outY + 9}
                      stroke={c.hopBack}
                      strokeWidth={chart.stroke + 0.5}
                    />
                    <Path d={arrowHead(cx + Rp + 16, outY, 0, -1, 10)} fill={c.hopBack} />
                    <ChartText
                      x={cx + Rp + 24}
                      y={(sy + outY) / 2 + 4}
                      fontWeight="700"
                      fill={c.hopBack}
                    >
                      {slab!.lift ? rep.label(slab!.lift) : `lift ${short(lift)}`}
                    </ChartText>
                    <ChartText x={cx + Rp + 8} y={sy + 16} fontWeight="600">
                      {typeof slab!.y === 'string' ? rep.label(slab!.y) : `y = ${short(y!)}`}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {tankKnown &&
              sy !== undefined &&
              typeof slab?.y === 'string' &&
              !rep.variable(slab.y).derived ? (
                <DragHandle
                  testID="drag-slab"
                  x={cx - Rp * 0.5}
                  y={sy}
                  label={rep.variable(slab.y).name}
                  onStart={() => {
                    start.current = y!;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(_, dy) =>
                    calc.set(
                      {
                        ...rep.pin([
                          spec.radius,
                          spec.height!,
                          ...(typeof slab.above === 'string' ? [slab.above] : []),
                        ]),
                        [slab.y as string]: rep.snapTo(
                          slab.y as string,
                          Math.min(H, Math.max(0, start.current - dy / s)),
                        ),
                      },
                      rep.slide(slab.y as string),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
