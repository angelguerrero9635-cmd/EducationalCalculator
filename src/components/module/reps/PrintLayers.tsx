/**
 * HC167 `printLayers` (PrintLayersSpec in typesHe4l.ts): a metal part in its powder bed on the
 * build plate, sliced into layers (enlarged; a break when there are many), H and t
 * dimensioned and the laser on the top layer; or, with θ, the sloped face as a stair of layers
 * against the true face with the cusp c = t cos θ marked; and a time bar for one layer (the scan
 * and the recoat to scale). The part and plate are painted; the bar is flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { PrintLayersSpec } from '@/data/modules/typesHe4l';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';
import { cuspOf, si4l } from './he4lMath';
import { LitRect, TopLight, url, usePaintIds } from './paint';

type X = PrintLayersSpec['layer'] | undefined;
const f3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

export function PrintLayers({ spec, calc }: { spec: PrintLayersSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('light');
  const k = (x: X) => x !== undefined && r.known(x);
  const si = (x: X, unit: string) => r.v(x) * si4l(r.unitOf(x, unit));
  const tag = (x: X, sym: string) => (x === undefined ? '' : r.tag(x, sym, r.v(x)));
  const t = k(spec.layer) ? si(spec.layer, 'mm') : undefined;
  const n = k(spec.layers) ? Math.round(r.v(spec.layers)) : undefined;
  const theta = spec.angle !== undefined && k(spec.angle) ? r.v(spec.angle) : undefined;
  const slope = spec.angle !== undefined;
  const scan =
    k(spec.area) && k(spec.hatch) && k(spec.speed)
      ? si(spec.area, 'mm²') / (si(spec.hatch, 'mm') * si(spec.speed, 'mm/s'))
      : undefined;
  const recoat = k(spec.recoat) ? si(spec.recoat, 's') : undefined;
  const tLayer = k(spec.layerTime) ? si(spec.layerTime, 's') : undefined;
  const bar = spec.layerTime !== undefined || spec.recoat !== undefined || spec.area !== undefined;
  const barTotal = tLayer ?? (scan ?? 0) + (recoat ?? 0);

  const lines: string[] = [];
  const s = (x: X, f: string) => r.symbol(x, f);
  const txt = (x: X) => r.text(x, r.v(x));
  if (slope) {
    if (t !== undefined && theta !== undefined)
      lines.push(
        `${s(spec.cusp, 'c')} = ${s(spec.layer, 't')} cos ${s(spec.angle, 'θ')} = ${txt(spec.layer)} × cos ${txt(spec.angle)} = ${spec.cusp !== undefined && k(spec.cusp) ? txt(spec.cusp) : `${f3(cuspOf(r.v(spec.layer), theta))} ${r.unitOf(spec.layer, 'mm')}`}: how far each step stands off the face.`,
      );
    else lines.push(`Type t and ${s(spec.angle, 'θ')} to draw the steps.`);
    lines.push('Steps enlarged; θ is measured from the build plate.');
  } else {
    if (k(spec.height) && k(spec.layer) && n !== undefined)
      lines.push(
        `${s(spec.layers, 'n')} = ${s(spec.height, 'H')} ÷ ${s(spec.layer, 't')} = ${txt(spec.height)} ÷ ${txt(spec.layer)} = ${formatNumber(n)} layers.`,
      );
    else if (t === undefined) lines.push(`Type ${s(spec.layer, 't')} to slice the part.`);
  }
  if (bar && scan !== undefined && recoat !== undefined)
    lines.push(
      `One layer: ${s(spec.area, 'A')} ÷ (${s(spec.hatch, 's')}${s(spec.speed, 'v')}) + ${s(spec.recoat, 't_r')} = ${f3(scan)} s + ${f3(recoat)} s${k(spec.layerTime) ? ` = ${txt(spec.layerTime)}` : ''}.`,
    );
  if (spec.buildTime !== undefined && k(spec.buildTime) && k(spec.layerTime) && k(spec.layers))
    lines.push(
      `${s(spec.buildTime, 'T')} = ${s(spec.layers, 'n')} × ${s(spec.layerTime, 't_layer')} = ${txt(spec.buildTime)}.`,
    );
  if (!slope) lines.push('Layers enlarged.');

  const top = 14;
  // The stack: layers 16 px each (enlarged), all of them up to 12, else 5 + a break + 2.
  const lh = 16;
  const many = n === undefined || n > 12;
  const rows = many ? 7 : n;
  const breakH = many ? 30 : 0;
  const stackH = rows * lh + breakH;
  // The stair: five steps (three on a shallow face), as big as the width allows.
  const th = theta === undefined ? 30 : Math.max(3, Math.min(90, theta));
  const tan = Math.tan((th * Math.PI) / 180);
  const steps = tan < 0.45 ? 3 : 5;
  const stairOf = (w: number) => {
    const xR = w - 70;
    const xL = 18;
    const ht = Math.max(
      8,
      Math.min(32, 168 / steps, tan > 50 ? 32 : ((xR - xL - 40) * tan) / steps),
    );
    return { xR, xL, ht, run: tan > 1e3 ? 0 : ht / tan };
  };
  const partOf = (w: number) => (slope ? steps * stairOf(w).ht + 40 : stackH + 52);
  const barH = bar ? 72 : 0;
  return (
    <View>
      <Canvas aspect={(w) => (top + partOf(w) + (slope ? 36 : 18) + barH) / w}>
        {({ w, h }) => {
          const plateY = top + partOf(w);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
              </Defs>
              {slope ? stair(w, plateY) : stack(w, plateY)}
              {/* The build plate. */}
              <LitRect
                x={10}
                y={plateY}
                width={w - 20}
                height={14}
                rx={2}
                fill={c.silver}
                stroke={c.silverDark}
                lightId={ids.light}
              />
              {bar ? timeBar(w, plateY + 30) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );

  /** The part in its powder bed, layers enlarged, a break when there are many. */
  function stack(w: number, plateY: number): ReactNode {
    const x0 = Math.round(w * 0.36);
    const x1 = Math.round(w * 0.66);
    const yTop = plateY - stackH;
    // Row i (0 = the first layer) and its y range; rows 5 and 6 are the last two.
    const rowY = (i: number) => (many && i >= 5 ? yTop + (6 - i) * lh : plateY - (i + 1) * lh);
    const grains: ReactNode[] = [];
    for (let gy = yTop + 4; gy < plateY - 2; gy += 6)
      for (let gx = 14; gx < w - 14; gx += 7) {
        if (gx > x0 - 3 && gx < x1 + 3) continue;
        const jx = ((gx * 7 + gy * 13) % 5) - 2;
        grains.push(
          <Circle key={`${gx},${gy}`} cx={gx + jx} cy={gy} r={1.4} fill={c.he4lPowderGrain} />,
        );
      }
    const zig = (y: number) => {
      let d = `M ${x0 - 6} ${y}`;
      for (let x = x0 - 6, i = 0; x <= x1 + 6; x += 8, i++) d += ` L ${x} ${y + (i % 2 ? 4 : -4)}`;
      return d;
    };
    const laserX = x0 + (x1 - x0) * 0.62;
    return (
      <G>
        {/* The powder bed, filled to the part's top. */}
        <Rect x={10} y={yTop} width={w - 20} height={stackH} fill={c.he4lPowder} />
        {grains}
        {/* The part, its layers. */}
        <LitRect
          x={x0}
          y={yTop}
          width={x1 - x0}
          height={stackH}
          fill={c.metal}
          stroke={c.metalDark}
          lightId={ids.light}
        />
        {t !== undefined
          ? Array.from({ length: rows }, (_, i) => (
              <Line
                key={`l${i}`}
                x1={x0}
                x2={x1}
                y1={rowY(i)}
                y2={rowY(i)}
                stroke={c.metalDark}
                strokeWidth={0.8}
              />
            ))
          : null}
        {many && t !== undefined ? (
          <G>
            <Rect
              x={x0 - 6}
              y={plateY - 5 * lh - breakH}
              width={x1 - x0 + 12}
              height={breakH}
              fill={c.card}
            />
            <Path d={zig(plateY - 5 * lh - 3)} stroke={c.metalDark} fill="none" />
            <Path d={zig(plateY - 5 * lh - breakH + 3)} stroke={c.metalDark} fill="none" />
            <ChartText
              x={(x0 + x1) / 2}
              y={plateY - 5 * lh - breakH / 2 + 4}
              textAnchor="middle"
              fontWeight="700"
            >
              {n !== undefined ? `${formatNumber(n)} layers` : '…'}
            </ChartText>
          </G>
        ) : null}
        {/* t on the first layer, at the right. */}
        {t !== undefined ? (
          <G>
            <Path
              d={`M ${x1 + 4} ${plateY - lh} h 6 v ${lh} h -6`}
              stroke={c.chartInk}
              fill="none"
              strokeWidth={1.2}
            />
            <HeLabel
              x={x1 + 14}
              y={plateY - lh / 2 + 4}
              anchor="start"
              text={tag(spec.layer, 't')}
              w={w}
            />
          </G>
        ) : null}
        {/* H at the left, the part's whole height (drawn broken). */}
        {spec.height !== undefined ? (
          <G>
            <Line
              x1={x0 - 12}
              x2={x0 - 12}
              y1={yTop}
              y2={plateY}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            <Line x1={x0 - 17} x2={x0 - 7} y1={yTop} y2={yTop} stroke={c.chartInk} />
            <Line x1={x0 - 17} x2={x0 - 7} y1={plateY} y2={plateY} stroke={c.chartInk} />
            {k(spec.height) ? (
              <HeLabel
                x={x0 - 18}
                y={(yTop + plateY) / 2 + 4}
                anchor="end"
                text={tag(spec.height, 'H')}
                w={w}
              />
            ) : null}
          </G>
        ) : null}
        {/* The laser melting the top layer. */}
        <Line x1={laserX - 26} y1={2} x2={laserX} y2={yTop} stroke={c.he4lLaser} strokeWidth={2} />
        <Circle cx={laserX} cy={yTop} r={4} fill={c.he4lLaser} opacity={0.85} />
        <ChartText x={laserX - 32} y={14} fill={c.he4lLaser} textAnchor="end">
          laser
        </ChartText>
      </G>
    );
  }

  /** The sloped face: a stair of enlarged layers against the true face, one cusp marked. */
  function stair(w: number, plateY: number): ReactNode {
    const { xR, xL, ht, run } = stairOf(w);
    // The true face runs up from (xR, plateY) at θ; layer i's edge is where the face is at its
    // bottom, so its top corner stands off the face.
    const edge = (i: number) => xR - i * run;
    const show = t !== undefined && theta !== undefined;
    let d = `M ${xL} ${plateY}`;
    for (let i = 0; i < steps; i++)
      d += ` L ${edge(i)} ${plateY - i * ht} L ${edge(i)} ${plateY - (i + 1) * ht}`;
    d += ` L ${xL} ${plateY - steps * ht} Z`;
    const faceEnd = { x: xR - steps * run, y: plateY - steps * ht };
    // The cusp on the middle step: its corner, and the foot of the square to the face.
    const j = steps === 3 ? 1 : 2;
    const corner = { x: edge(j), y: plateY - (j + 1) * ht };
    const a = (th * Math.PI) / 180;
    const ux = -Math.cos(a);
    const uy = -Math.sin(a);
    const along = (corner.x - xR) * ux + (corner.y - plateY) * uy;
    const foot = { x: xR + along * ux, y: plateY + along * uy };
    const arcR = 30;
    return (
      <G>
        {show ? (
          <G>
            <Path d={d} fill={c.metal} stroke={c.metalDark} strokeWidth={1} />
            <Path d={d} fill={url(ids.light)} />
            {Array.from({ length: steps - 1 }, (_, i) => (
              <Line
                key={`s${i}`}
                x1={xL}
                x2={edge(i + 1)}
                y1={plateY - (i + 1) * ht}
                y2={plateY - (i + 1) * ht}
                stroke={c.metalDark}
                strokeWidth={0.8}
              />
            ))}
            {/* The true face, dashed. */}
            <Line
              x1={xR}
              y1={plateY}
              x2={faceEnd.x - 14 * Math.cos(a)}
              y2={faceEnd.y - 14 * Math.sin(a)}
              stroke={c.he4lFace}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dash}
            />
            {/* The cusp: the triangle off the face, and c square to it. */}
            <Polygon
              points={`${corner.x},${corner.y} ${edge(j)},${plateY - j * ht} ${edge(j + 1)},${corner.y}`}
              fill={c.he4lFace}
              opacity={0.25}
            />
            <Line
              x1={corner.x}
              y1={corner.y}
              x2={foot.x}
              y2={foot.y}
              stroke={c.he4lFace}
              strokeWidth={2}
            />
            <Circle cx={corner.x} cy={corner.y} r={2.5} fill={c.he4lFace} />
            <HeLabel
              x={corner.x + 10}
              y={corner.y - 8}
              anchor="start"
              text={
                spec.cusp !== undefined && k(spec.cusp)
                  ? tag(spec.cusp, 'c')
                  : `c = ${f3(cuspOf(r.v(spec.layer), theta!))} ${r.unitOf(spec.layer, 'mm')}`
              }
              color={c.he4lFace}
              w={w}
            />
            {/* t on the bottom step, at its edge. */}
            <Path
              d={`M ${edge(0) + 6} ${plateY} h 6 v ${-ht} h -6`}
              stroke={c.chartInk}
              fill="none"
              strokeWidth={1.2}
            />
            <HeLabel
              x={edge(0) + 19}
              y={plateY - ht / 2 + 4}
              anchor="start"
              text={tag(spec.layer, 't')}
              w={w}
            />
            {/* θ between the plate and the face. */}
            <Path
              d={`M ${xR - arcR} ${plateY} A ${arcR} ${arcR} 0 0 1 ${xR - arcR * Math.cos(a)} ${plateY - arcR * Math.sin(a)}`}
              stroke={c.chartInk}
              fill="none"
              strokeWidth={1.2}
            />
            <HeLabel
              x={xR - arcR}
              y={plateY + 32}
              anchor="middle"
              text={tag(spec.angle, 'θ')}
              w={w}
            />
          </G>
        ) : null}
      </G>
    );
  }

  /** One layer's time: the scan, then the recoat, to scale. */
  function timeBar(w: number, y: number): ReactNode {
    const x0 = 16;
    const x1 = w - 16;
    const total = barTotal > 0 ? barTotal : 1;
    const sx = (x: number) => x0 + (x / total) * (x1 - x0);
    const scanEnd = scan !== undefined ? sx(Math.min(scan, total)) : x0;
    return (
      <G>
        {scan !== undefined ? (
          <Rect x={x0} y={y} width={scanEnd - x0} height={16} fill={c.he4lLaser} opacity={0.85} />
        ) : null}
        {recoat !== undefined ? (
          <Rect
            x={scanEnd}
            y={y}
            width={sx(Math.min(total, (scan ?? 0) + recoat)) - scanEnd}
            height={16}
            fill={c.he4lRecoat}
          />
        ) : null}
        <Rect
          x={x0}
          y={y}
          width={x1 - x0}
          height={16}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1}
        />
        {scan !== undefined ? (
          <ChartText x={x0} y={y + 32} fill={c.chartMuted}>
            {`scan ${f3(scan)} s`}
          </ChartText>
        ) : null}
        {recoat !== undefined ? (
          <ChartText x={x1} y={y + 32} textAnchor="end" fill={c.chartMuted}>
            {`recoat ${f3(recoat)} s`}
          </ChartText>
        ) : null}
        {tLayer !== undefined ? (
          <HeLabel
            x={(x0 + x1) / 2}
            y={y + 48}
            text={`${tag(spec.layerTime, 't_layer')} per layer`}
            w={w}
          />
        ) : null}
      </G>
    );
  }
}
