/**
 * `machining` (HC83): a cut in steel with a carbide tool. Turning (the bar in its chuck, the
 * tool feeding along it, an end view with v = πDN tangent at the tool, and the cut enlarged with
 * its depth and feed marks); milling (a cutter of n_t teeth over a block cut to depth d across
 * width w, the table feed, and each tooth's bite enlarged); and the ideal finish (tool-nose arcs
 * f apart leaving cusps h = f² ÷ 8r, the mean line and R_a), heights enlarged.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { MachiningSpec } from '@/data/modules/typesHe3i';
import { withUnicodeSubscripts } from '@/engine/subscripts';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { fmt, HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { DimLine, useHe3iReader } from './he3iKit';
import { CurvedArrow } from './hs3aKit';
import { Vec } from './hskKit';
import { profile } from './machiningMath';
import { Metal, Sheen, url, usePaintIds } from './paint';

export function Machining({ spec, calc }: { spec: MachiningSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('bar', 'sheen', 'chuck', 'block');
  const mode = spec.mode;
  // Geometry in mm, whatever unit each value is in.
  const mm = (x: MachiningSpec['diameter'], fb: number) =>
    x === undefined ? fb : r.si(x, 'mm') * 1000;
  const D = Math.max(1e-6, mm(spec.diameter, 50));
  const d = Math.max(0, mm(spec.depth, 1));
  const L = Math.max(1e-6, mm(spec.length, 4 * D));
  const f = Math.max(1e-6, mm(spec.feed, 0.2));
  const width = Math.max(1e-6, mm(spec.width, D / 2));
  const nose = Math.max(1e-6, mm(spec.radius, 0.8));
  const teeth = Math.max(1, Math.min(24, Math.round(r.v(spec.teeth, 4))));
  const k = r.known;
  const tag = (x: MachiningSpec['diameter'], sym: string, unit: string) =>
    x === undefined ? '' : r.tag(x, sym, r.v(x), unit);

  const caption = (() => {
    const out: string[] = [];
    const s = (x: MachiningSpec['diameter'], f0: string) => r.symbol(x, f0);
    const val = (x: MachiningSpec['diameter'], u: string) => r.text(x, r.v(x), u);
    if (
      mode !== 'finish' &&
      spec.speed !== undefined &&
      k(spec.speed) &&
      k(spec.diameter) &&
      k(spec.rpm)
    )
      out.push(
        `${s(spec.speed, 'v')} = π${s(spec.diameter, 'D')}${s(spec.rpm, 'N')} = π × ${fmt(D / 1000)} m × ${val(spec.rpm, 'rpm')} = ${val(spec.speed, 'm/min')}.`,
      );
    if (
      mode === 'turning' &&
      spec.rate &&
      k(spec.rate) &&
      k(spec.speed) &&
      k(spec.feed) &&
      k(spec.depth)
    )
      out.push(
        `MRR = ${s(spec.speed, 'v')}${s(spec.feed, 'f')}${s(spec.depth, 'd')} = ${val(spec.rate, 'cm³/min')}.`,
      );
    if (
      mode === 'turning' &&
      spec.time &&
      k(spec.time) &&
      k(spec.length) &&
      k(spec.feed) &&
      k(spec.rpm)
    )
      out.push(
        `${s(spec.time, 'T_m')} = ${s(spec.length, 'L')} ÷ (${s(spec.feed, 'f')}${s(spec.rpm, 'N')}) = ${val(spec.time, 'min')}.`,
      );
    if (mode === 'milling' && spec.tableFeed && k(spec.tableFeed))
      out.push(
        `${s(spec.tableFeed, 'f_r')} = ${s(spec.rpm, 'N')}${s(spec.teeth, 'n_t')}${s(spec.toothFeed, 'f_t')} = ${val(spec.tableFeed, 'mm/min')}.`,
      );
    if (mode === 'milling' && spec.rate && k(spec.rate))
      out.push(
        `MRR = ${s(spec.width, 'w')}${s(spec.depth, 'd')}${s(spec.tableFeed, 'f_r')} = ${val(spec.rate, 'cm³/min')}.`,
      );
    if (mode === 'finish') {
      if (spec.roughness && k(spec.roughness) && k(spec.feed) && k(spec.radius))
        out.push(
          `${s(spec.roughness, 'R_a')} ≈ ${s(spec.feed, 'f')}² ÷ (32${s(spec.radius, 'r')}) = ${val(spec.roughness, 'μm')}; the cusps stand about 4 × ${s(spec.roughness, 'R_a')} high.`,
        );
    }
    if (mode !== 'finish') out.push('Depth and feed are enlarged in the detail.');
    return out.join(' ');
  })();

  const aspect = mode === 'turning' ? 0.86 : mode === 'milling' ? 0.98 : 0.66;
  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.sheen} vertical />
              <Metal id={ids.chuck} light={c.metal} dark={c.metalDark} />
              <Metal id={ids.bar} light={c.silver} dark={c.silverDark} />
            </Defs>
            {mode === 'turning' ? turning(w, h) : mode === 'milling' ? milling(w, h) : finish(w, h)}
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );

  /** A carbide insert with its rounded nose at (x, y), pointing up (or `dir` radians). */
  function insert(x: number, y: number, size: number, rot = 0) {
    return (
      <G transform={`translate(${x} ${y}) rotate(${rot})`}>
        <Rect
          x={-size * 0.35}
          y={size * 0.55}
          width={size * 0.7}
          height={size * 1.6}
          fill={c.metal}
          stroke={c.metalDark}
        />
        <Path
          d={`M 0 0 Q ${size * 0.12} 0 ${size * 0.2} ${size * 0.12} L ${size * 0.55} ${size * 0.75} L ${-size * 0.55} ${size * 0.75} L ${-size * 0.2} ${size * 0.12} Q ${-size * 0.12} 0 0 0 Z`}
          fill={c.he3iCarbide}
          stroke={c.he3iCarbideLight}
          strokeWidth={0.8}
        />
      </G>
    );
  }

  function turning(w: number, h: number) {
    // Side view: the chuck at the left, the bar along x, the tool part way along the cut.
    const x0 = 46;
    const room = w - x0 - 24;
    const s = Math.min(room / (L * 1.15), 64 / D);
    const len = Math.min(room, L * 1.15 * s);
    const xEnd = x0 + len;
    const R = (D / 2) * s;
    const yc = R + 44;
    const dPx = Math.max(3, d * s);
    const xTool = xEnd - Math.min(L * s, len) * 0.45;
    const xCutEnd = xEnd - L * s;
    const yFeed = yc + R + 34;
    // End view and the enlarged cut, under the side view.
    const er = 40;
    const ex = 16 + er;
    const ey = yFeed + 34 + er;
    const box = { x: 128, y: yFeed + 16, w: w - 136, h: h - yFeed - 24 };
    const showFeed = k(spec.feed);
    const showDepth = k(spec.depth);
    // N: an arrow wrapping round the front of the bar near its free end.
    const xa = xEnd - 16;
    const wrap = `M ${xa - 6} ${yc - R - 5} A 9 ${R + 5} 0 0 1 ${xa - 6} ${yc + R + 5}`;
    return (
      <G>
        {/* The chuck and its jaws. */}
        <Rect
          x={8}
          y={yc - 46}
          width={30}
          height={92}
          rx={4}
          fill={url(ids.chuck)}
          stroke={c.metalDark}
        />
        <Rect x={36} y={yc - R - 12} width={10} height={12} fill={c.metal} stroke={c.metalDark} />
        <Rect x={36} y={yc + R} width={10} height={12} fill={c.metal} stroke={c.metalDark} />
        {/* The bar: full D up to the tool, turned down by d behind it. */}
        <Rect
          x={x0}
          y={yc - R}
          width={xTool - x0}
          height={2 * R}
          fill={url(ids.bar)}
          stroke={c.silverDark}
        />
        <Rect
          x={xTool}
          y={yc - R + dPx}
          width={xEnd - xTool}
          height={2 * R - 2 * dPx}
          fill={url(ids.bar)}
          stroke={c.silverDark}
        />
        <Rect x={x0} y={yc - R} width={xEnd - x0} height={2 * R} fill={url(ids.sheen)} />
        {/* Feed marks on the turned part. */}
        {Array.from({ length: Math.max(0, Math.floor((xEnd - xTool - 4) / 5)) }, (_, i) => (
          <Line
            key={i}
            x1={xTool + 4 + i * 5}
            y1={yc - R + dPx + 1}
            x2={xTool + 2 + i * 5}
            y2={yc + R - dPx - 1}
            stroke={c.silverDark}
            strokeWidth={0.5}
            opacity={0.6}
          />
        ))}
        {/* The tool, below the bar, its nose at the cut; the chip curling away. */}
        {insert(xTool, yc + R - dPx, 14)}
        <Path
          d={`M ${xTool + 4} ${yc + R - dPx + 2} q 10 4 12 14 q 2 10 -6 12 q -8 0 -6 -8`}
          stroke={c.he3iChipHot}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {/* The tool feeds f per turn toward the chuck. */}
        {showFeed ? (
          <G>
            <Vec
              x1={xTool - 12}
              y1={yFeed}
              x2={xTool - 56}
              y2={yFeed}
              color={c.he3iFeed}
              width={2.5}
            />
            <HeLabel
              x={xTool - 62}
              y={yFeed + 4}
              anchor="end"
              text={tag(spec.feed, 'f', 'mm/rev')}
              color={c.he3iFeed}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {/* N, wrapping round the bar near its free end. */}
        {k(spec.rpm) ? (
          <G>
            <Path d={wrap} stroke={c.he3iOmega} strokeWidth={2} fill="none" />
            <Path
              d={`M ${xa - 6} ${yc + R + 5} l -7 -3 l 3 -6 Z`}
              fill={c.he3iOmega}
              stroke={c.he3iOmega}
              strokeWidth={1.5}
            />
            <HeLabel
              x={xa + 6}
              y={yc + R + 22}
              anchor="end"
              text={tag(spec.rpm, 'N', 'rpm')}
              color={c.he3iOmega}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {/* D across the uncut bar, L along the cut. */}
        {k(spec.diameter) ? (
          <G>
            <Line
              x1={x0 + 16}
              y1={yc - R}
              x2={x0 + 16}
              y2={yc + R}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <HeLabel
              x={x0 + 22}
              y={yc + 4}
              anchor="start"
              text={tag(spec.diameter, 'D', 'mm')}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {k(spec.length) && spec.length !== undefined ? (
          <DimLine
            x1={Math.max(x0, xCutEnd)}
            x2={xEnd}
            y={yc - R - 14}
            text={tag(spec.length, 'L', 'mm')}
            w={w}
          />
        ) : null}
        {/* End view: the bar's circle, the cut ring, v tangent at the tool. */}
        <Circle cx={ex} cy={ey} r={er} fill={url(ids.bar)} stroke={c.silverDark} />
        <Circle
          cx={ex}
          cy={ey}
          r={er * (1 - Math.min(0.9, (2 * d) / D))}
          fill="none"
          stroke={c.silverDark}
          strokeDasharray="3 3"
        />
        <Circle cx={ex} cy={ey} r={2.5} fill={c.silverDark} />
        {insert(ex + er + 1, ey, 11, -90)}
        <CurvedArrow
          cx={ex}
          cy={ey}
          r={er - 12}
          from={Math.PI * 0.9}
          to={Math.PI * 0.35}
          color={c.he3iOmega}
          width={2}
          head={7}
        />
        {k(spec.speed) ? (
          <G>
            <Vec
              x1={ex + er - 5}
              y1={ey - 26}
              x2={ex + er - 5}
              y2={ey + 12}
              color={c.he3iSpeed}
              width={2.5}
            />
            <HeLabel
              x={8}
              y={ey + er + 18}
              anchor="start"
              text={tag(spec.speed, 'v', 'm/min')}
              color={c.he3iSpeed}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        <ChartText
          x={ex}
          y={ey - er - 6}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          End view
        </ChartText>
        {/* The cut enlarged: depth d and the feed marks f apart. */}
        <Rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={6}
          fill={c.chartSurface}
          stroke={c.chartGrid}
        />
        <ChartText x={box.x + 8} y={box.y + 16} fontSize={chart.label} fill={c.chartMuted}>
          The cut, enlarged
        </ChartText>
        {(() => {
          const base = box.y + box.h - 30;
          const dp = Math.min(box.h - 56, 56);
          const top = base - dp;
          const xt = box.x + box.w * 0.4;
          const fp = 16;
          const marks = Math.max(0, Math.floor((box.x + box.w - 10 - xt) / fp));
          const scallop = Array.from({ length: marks }, (_, i) => {
            const a = xt + i * fp;
            return `Q ${a + fp / 2} ${base - 9} ${a + fp} ${base}`;
          }).join(' ');
          const xLast = xt + marks * fp;
          return (
            <G>
              <Path
                d={`M ${box.x + 8} ${top} L ${xt} ${top} L ${xt} ${base} ${scallop} L ${box.x + box.w - 8} ${base} L ${box.x + box.w - 8} ${box.y + box.h - 8} L ${box.x + 8} ${box.y + box.h - 8} Z`}
                fill={url(ids.bar)}
                stroke={c.silverDark}
              />
              {insert(xt + 1, base - 1, 20, 180)}
              {showDepth ? (
                <G>
                  <Line x1={box.x + 24} y1={top} x2={box.x + 24} y2={base} stroke={c.chartInk} />
                  <Line
                    x1={box.x + 20}
                    y1={base}
                    x2={xt}
                    y2={base}
                    stroke={c.chartInk}
                    strokeDasharray="2 2"
                  />
                  <HeLabel
                    x={box.x + 30}
                    y={(top + base) / 2 + 12}
                    anchor="start"
                    text={tag(spec.depth, 'd', 'mm')}
                    w={w}
                    size={chart.label}
                  />
                </G>
              ) : null}
              {showFeed && marks >= 2 ? (
                <G>
                  <Line
                    x1={xLast - 2 * fp}
                    y1={base + 6}
                    x2={xLast - fp}
                    y2={base + 6}
                    stroke={c.he3iFeed}
                    strokeWidth={2}
                  />
                  <ChartText
                    x={xLast - 1.5 * fp}
                    y={base + 19}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                    fontStyle="italic"
                    fill={c.he3iFeed}
                  >
                    f
                  </ChartText>
                </G>
              ) : null}
            </G>
          );
        })()}
      </G>
    );
  }

  function milling(w: number, _h: number) {
    // A peripheral cutter over a block drawn in oblique; the block moves under it at f_r.
    const s = Math.min((w - 60) / (2.6 * D), 140 / D);
    const R = (D / 2) * s;
    const cx = w * 0.46;
    const cy = 30 + R;
    const dPx = Math.max(3, d * s);
    const topUncut = cy + R - dPx;
    const topCut = cy + R;
    const blockH = Math.max(40, Math.min(64, 0.5 * D * s));
    const ox = Math.min(46, width * s * 0.5);
    const oy = -ox * 0.55;
    const left = 16;
    const right = w - 20 - ox;
    const cutX = cx;
    const blockFront = `M ${left} ${topCut} L ${cutX - 2} ${topCut} L ${cutX + 6} ${topUncut} L ${right} ${topUncut} L ${right} ${topCut + blockH} L ${left} ${topCut + blockH} Z`;
    const blockTop = `M ${left} ${topCut} L ${left + ox} ${topCut + oy} L ${cutX - 2 + ox} ${topCut + oy} L ${cutX + 6 + ox} ${topUncut + oy} L ${right + ox} ${topUncut + oy} L ${right} ${topUncut} L ${cutX + 6} ${topUncut} L ${cutX - 2} ${topCut} Z`;
    const blockSide = `M ${right} ${topUncut} L ${right + ox} ${topUncut + oy} L ${right + ox} ${topCut + blockH + oy} L ${right} ${topCut + blockH} Z`;
    const toothAt = (i: number) => (2 * Math.PI * i) / teeth + Math.PI / 2;
    const yFeed = topCut + blockH + 16;
    const yDetail = yFeed + 26;
    return (
      <G>
        {/* The block, steel, cut down by d behind the cutter. */}
        <Path d={blockTop} fill={c.silver} stroke={c.silverDark} />
        <Path d={blockSide} fill={c.silverDark} stroke={c.silverDark} />
        <Path d={blockFront} fill={url(ids.bar)} stroke={c.silverDark} />
        {/* The cutter: a disk with n_t carbide teeth, turning at N. */}
        <Circle cx={cx} cy={cy} r={R} fill={url(ids.chuck)} stroke={c.metalDark} />
        <Circle cx={cx} cy={cy} r={R * 0.22} fill={c.metalDark} />
        {Array.from({ length: teeth }, (_, i) => {
          const a = toothAt(i);
          const tx = cx + (R - 1) * Math.cos(a);
          const ty = cy + (R - 1) * Math.sin(a);
          const deg = (a * 180) / Math.PI + 90;
          return (
            <G key={i} transform={`translate(${tx} ${ty}) rotate(${deg})`}>
              <Path
                d="M -6 2 L -6 -4 L 5 -7 L 5 2 Z"
                fill={c.he3iCarbide}
                stroke={c.he3iCarbideLight}
                strokeWidth={0.8}
              />
            </G>
          );
        })}
        <CurvedArrow
          cx={cx}
          cy={cy}
          r={R * 0.6}
          from={Math.PI * 0.95}
          to={Math.PI * 0.3}
          color={c.he3iOmega}
          width={2}
          head={8}
        />
        {/* The chip leaving the tooth in the cut. */}
        <Path
          d={`M ${cx + 6} ${topCut - 3} q 7 -3 11 -11 q 2 -6 -3 -8`}
          stroke={c.he3iChipHot}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {k(spec.rpm) ? (
          <HeLabel
            x={cx - R - 6}
            y={cy - R * 0.5}
            anchor="end"
            text={tag(spec.rpm, 'N', 'rpm')}
            color={c.he3iOmega}
            w={w}
            size={chart.label}
          />
        ) : null}
        {k(spec.teeth) && spec.teeth !== undefined ? (
          <HeLabel
            x={cx + R + 10}
            y={cy - R * 0.5}
            anchor="start"
            text={tag(spec.teeth, 'n_t', '')}
            w={w}
            size={chart.label}
          />
        ) : null}
        {k(spec.diameter) ? (
          <G>
            <Line
              x1={cx - R}
              y1={cy}
              x2={cx + R}
              y2={cy}
              stroke={c.chartInk}
              strokeDasharray="4 3"
            />
            <HeLabel
              x={cx}
              y={cy + 16}
              text={tag(spec.diameter, 'D', 'mm')}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {k(spec.speed) && spec.speed !== undefined ? (
          <G>
            <Vec
              x1={cx - 46}
              y1={cy - R - 7}
              x2={cx}
              y2={cy - R - 7}
              color={c.he3iSpeed}
              width={2.5}
            />
            <HeLabel
              x={cx + 8}
              y={cy - R - 3}
              anchor="start"
              text={tag(spec.speed, 'v', 'm/min')}
              color={c.he3iSpeed}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {/* d at the step, w along the receding edge, f_r under the block. */}
        {k(spec.depth) ? (
          <G>
            <Line x1={cutX + 8} y1={topUncut} x2={cutX + 8} y2={topCut + 10} stroke={c.chartInk} />
            <Line
              x1={left}
              y1={topUncut}
              x2={cutX - 6}
              y2={topUncut}
              stroke={c.chartMuted}
              strokeDasharray="3 3"
            />
            <HeLabel
              x={cutX + 14}
              y={topCut + 18}
              anchor="start"
              text={tag(spec.depth, 'd', 'mm')}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {k(spec.width) && spec.width !== undefined ? (
          <HeLabel
            x={right + ox + 2}
            y={topUncut + oy - 8}
            anchor="end"
            text={tag(spec.width, 'w', 'mm')}
            w={w}
            size={chart.label}
          />
        ) : null}
        {k(spec.tableFeed) && spec.tableFeed !== undefined ? (
          <G>
            <Vec
              x1={left + 20}
              y1={yFeed}
              x2={left + 80}
              y2={yFeed}
              color={c.he3iFeed}
              width={2.5}
            />
            <HeLabel
              x={left + 88}
              y={yFeed + 4}
              anchor="start"
              text={tag(spec.tableFeed, 'f_r', 'mm/min')}
              color={c.he3iFeed}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {/* One tooth's bite, enlarged: two tooth paths f_t apart cut a comma-shaped chip. */}
        {(() => {
          const rr = 56;
          const gap = 14;
          const dd = 26;
          const bx = w * 0.5;
          const by = yDetail + 14 + dd - rr;
          const surf = by + rr - dd;
          const th = Math.acos(1 - dd / rr);
          const n = 16;
          const arc = (dx: number, from: number, to: number) =>
            Array.from({ length: n + 1 }, (_, i) => {
              const t = from + ((to - from) * i) / n;
              return [bx + dx + rr * Math.sin(t), by + rr * Math.cos(t)] as const;
            });
          const chip = [...arc(gap, 0, th), ...arc(0, th, 0)];
          const pathOf = (pts: readonly (readonly [number, number])[]) =>
            pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
          return (
            <G>
              <ChartText x={16} y={yDetail + 14} fontSize={chart.label} fill={c.chartMuted}>
                One tooth’s bite,
              </ChartText>
              <ChartText x={16} y={yDetail + 30} fontSize={chart.label} fill={c.chartMuted}>
                enlarged
              </ChartText>
              <Rect
                x={bx - 30}
                y={surf}
                width={rr + gap + 60}
                height={dd + 14}
                fill={url(ids.bar)}
                opacity={0.5}
              />
              <Line
                x1={bx - 30}
                y1={surf}
                x2={bx + rr + gap + 30}
                y2={surf}
                stroke={c.silverDark}
              />
              <Path
                d={`${pathOf(chip)} Z`}
                fill={c.he3iChipHot}
                stroke={c.chartInk}
                strokeWidth={0.8}
              />
              <Path
                d={pathOf(arc(0, -0.4, th + 0.3))}
                stroke={c.chartMuted}
                fill="none"
                strokeDasharray="3 3"
              />
              <Path d={pathOf(arc(gap, -0.4, th + 0.3))} stroke={c.chartInk} fill="none" />
              <Line
                x1={bx}
                y1={by + rr + 8}
                x2={bx + gap}
                y2={by + rr + 8}
                stroke={c.he3iFeed}
                strokeWidth={2}
              />
              {k(spec.toothFeed) && spec.toothFeed !== undefined ? (
                <HeLabel
                  x={bx - 6}
                  y={by + rr + 12}
                  anchor="end"
                  text={tag(spec.toothFeed, 'f_t', 'mm')}
                  color={c.he3iFeed}
                  w={w}
                  size={chart.label}
                />
              ) : null}
            </G>
          );
        })()}
      </G>
    );
  }

  function finish(w: number, h: number) {
    // The profile over four and a half feeds; heights enlarged so the cusps show.
    const P = profile(f, nose);
    const cusp = (f * f) / (8 * nose);
    const x0 = 24;
    const span = 4.5 * f;
    const sx = (w - 2 * x0) / span;
    const base = h * 0.64;
    const sy = (h * 0.24) / Math.max(1e-12, cusp);
    const E = sy / sx;
    const X = (x: number) => x0 + x * sx;
    const Y = (y: number) => base - y * sy;
    const n = 240;
    const off = 0.25 * f;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const x = (i / n) * span;
      return [X(x), Y(P.height(x - off))] as const;
    });
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
    const yMean = Y(P.mean);
    const groove = (i: number) => X(i * f + off);
    // The tool nose sits in the fourth groove, its arc the groove's own (heights enlarged too).
    const gx = groove(3);
    const arc = Array.from({ length: 41 }, (_, i) => {
      const dx = (-0.6 + (1.2 * i) / 40) * f;
      const y = nose - Math.sqrt(Math.max(0, nose * nose - dx * dx));
      return `${i ? 'L' : 'M'} ${gx + dx * sx} ${Y(y) - 1}`;
    }).join(' ');
    const toolTop = Y(cusp) - 64;
    const showF = k(spec.feed);
    const ra = r.symbol(spec.roughness, 'R_a');
    return (
      <G>
        {/* Departures from the mean line, shaded: their mean is R_a. */}
        <Path
          d={`${line} L ${pts[n]![0]} ${yMean} L ${pts[0]![0]} ${yMean} Z`}
          fill={c.he3iSpeed}
          opacity={0.18}
        />
        <Path
          d={`${line} L ${pts[n]![0]} ${base + 40} L ${pts[0]![0]} ${base + 40} Z`}
          fill={url(ids.bar)}
          stroke={c.silverDark}
        />
        <Path d={line} stroke={c.chartInk} strokeWidth={1.6} fill="none" />
        <Line
          x1={x0}
          y1={yMean}
          x2={w - x0}
          y2={yMean}
          stroke={c.he3iSpeed}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
        {/* The tool, its nose in a groove. */}
        <Path
          d={`${arc} L ${gx + 0.6 * f * sx + 14} ${toolTop} L ${gx - 0.6 * f * sx - 4} ${toolTop} Z`}
          fill={c.he3iCarbide}
          stroke={c.he3iCarbideLight}
        />
        {k(spec.radius) && spec.radius !== undefined ? (
          <HeLabel
            x={gx - 0.6 * f * sx - 10}
            y={toolTop + 14}
            anchor="end"
            text={tag(spec.radius, 'r', 'mm')}
            w={w}
            size={chart.label}
          />
        ) : null}
        {/* f between two groove bottoms. */}
        {showF ? (
          <DimLine
            x1={groove(0)}
            x2={groove(1)}
            y={Y(cusp) - 16}
            text={tag(spec.feed, 'f', 'mm/rev')}
            w={w}
          />
        ) : null}
        {/* The cusp's height. */}
        {showF && k(spec.radius) ? (
          <G>
            <Line
              x1={groove(1) + (f / 2) * sx}
              y1={Y(cusp)}
              x2={groove(1) + (f / 2) * sx}
              y2={base}
              stroke={c.chartInk}
            />
            <HeLabel
              x={groove(1) + (f / 2) * sx + 6}
              y={(Y(cusp) + base) / 2 - 8}
              anchor="start"
              text={
                spec.cusp && k(spec.cusp)
                  ? tag(spec.cusp, 'h', 'μm')
                  : withUnicodeSubscripts(`h ≈ 4 × ${ra}`)
              }
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {spec.roughness !== undefined && k(spec.roughness) ? (
          <HeLabel
            x={w - x0}
            y={base + 30}
            anchor="end"
            text={`mean line, ${tag(spec.roughness, 'R_a', 'μm')}`}
            color={c.he3iSpeed}
            w={w}
            size={chart.label}
          />
        ) : null}
        <ChartText x={x0} y={h - 6} fontSize={chart.label} fill={c.chartMuted}>
          {`Heights drawn ×${fmt(E)} their true scale.`}
        </ChartText>
      </G>
    );
  }
}
