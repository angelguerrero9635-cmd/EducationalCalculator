import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Deepen, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'hanger' }>;
type Stage = 'equation' | 'take' | 'split';

/** One thing on a tray: an x-block or a unit weight, crossed out or faded by the stage. */
interface Item {
  kind: 'x' | 'u';
  out: boolean;
  faded: boolean;
}

/** Where each item sits on a tray, from the tray's left end and its top (y up is negative). */
interface Placed extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GAP = 3;

/** Items packed in rows from the tray up, left to right, wrapping at the tray's width. */
function pack(items: Item[], width: number, block: number, unit: { w: number; h: number }) {
  const placed: Placed[] = [];
  let x = 0;
  let base = 0;
  let rowH = 0;
  for (const it of items) {
    const w = it.kind === 'x' ? block : unit.w;
    const h = it.kind === 'x' ? block : unit.h;
    if (x > 0 && x + w > width) {
      base += rowH + GAP;
      x = 0;
      rowH = 0;
    }
    placed.push({ ...it, x, y: -base - h, w, h });
    x += w + GAP;
    rowH = Math.max(rowH, h);
  }
  // Center each row on the tray.
  const rows = new Map<number, Placed[]>();
  for (const p of placed) {
    const key = Math.round(p.y + p.h);
    rows.set(key, [...(rows.get(key) ?? []), p]);
  }
  for (const row of rows.values()) {
    const last = row[row.length - 1]!;
    const shift = (width - (last.x + last.w)) / 2;
    for (const p of row) p.x += shift;
  }
  return { placed, height: base + rowH };
}

/**
 * A hanger diagram: a wooden beam hangs from a hook, and each end holds a tray of x-blocks
 * (wood, marked with the unknown's letter) and unit weights (metal, marked 1). It hangs level
 * when both sides weigh the same and tips toward the heavier side. The stage buttons take the
 * same from both sides (crossed out), then keep one of as many equal parts as there are
 * blocks: one block balances its share of the weights.
 */
export function Hanger({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('light', 'metal', 'beam');
  const [stage, setStage] = useState<Stage>('equation');
  const letter = rep.words ? '?' : rep.variable(spec.unknown).symbol;
  const known = (v: string | number | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const count = (v: string | number | undefined) =>
    v === undefined
      ? 0
      : typeof v === 'number'
        ? v
        : rep.known(v)
          ? Math.max(0, Math.round(rep.shown(v)))
          : 0;
  const text = (v: string | number | undefined) => (known(v) ? `${count(v)}` : '?');
  const [xl, ul, xr, ur] = [spec.left.x, spec.left.units, spec.right.x, spec.right.units].map(
    count,
  ) as [number, number, number, number];
  const xKnown = rep.known(spec.unknown);
  const x = rep.shown(spec.unknown);
  const weight = (xs: number, us: number) => xs * x + us;
  const [wl, wr] = [weight(xl, ul), weight(xr, ur)];
  // Tips toward the heavier side, at most 9°, only when the unknown is known.
  const tilt = xKnown ? Math.max(-1, Math.min(1, ((wr - wl) / Math.max(wl, wr, 1)) * 3)) * 9 : 0;

  // What each stage takes away and keeps.
  const takeX = Math.min(xl, xr);
  const takeU = Math.min(ul, ur);
  const after = { xl: xl - takeX, ul: ul - takeU, xr: xr - takeX, ur: ur - takeU };
  // Split: blocks alone on one side, weights alone on the other.
  const split =
    after.xl > 0 && after.ul === 0 && after.xr === 0
      ? { blocks: after.xl, units: after.ur, side: 'left' as const }
      : after.xr > 0 && after.ur === 0 && after.xl === 0
        ? { blocks: after.xr, units: after.ul, side: 'right' as const }
        : undefined;
  const share = split && split.units % split.blocks === 0 ? split.units / split.blocks : undefined;
  const taking = stage !== 'equation';
  const splitting = stage === 'split' && split !== undefined && xKnown;

  const items = (xs: number, us: number, blocksSide: boolean) => {
    const out: Item[] = [];
    for (let i = 0; i < xs; i++) {
      const crossed = taking && i >= xs - takeX;
      out.push({ kind: 'x', out: crossed, faded: splitting && blocksSide && !crossed && i > 0 });
    }
    for (let i = 0; i < us; i++) {
      const crossed = taking && i >= us - takeU;
      out.push({
        kind: 'u',
        out: crossed,
        faded: splitting && !blocksSide && !crossed && share !== undefined && i >= share,
      });
    }
    return out;
  };
  const leftItems = items(xl, ul, split?.side === 'left');
  const rightItems = items(xr, ur, split?.side === 'right');

  // Sizes that fit the trays: blocks up to 28 px, weights up to 18 × 16.
  const trayWidth = (w: number) => Math.min(150, w / 2 - 22);
  const sizes = (w: number) => {
    const tw = trayWidth(w) - 8;
    const most = Math.max(xl, xr, 1);
    const block = Math.max(16, Math.min(28, tw / Math.min(most, 4) - GAP));
    const units = Math.max(ul, ur);
    const uw = units > 30 ? 11 : units > 18 ? 14 : 18;
    return { tw, block, unit: { w: uw, h: Math.round(uw * 0.9) } };
  };
  const layout = (w: number) => {
    const { tw, block, unit } = sizes(w);
    const L = pack(leftItems, tw, block, unit);
    const R = pack(rightItems, tw, block, unit);
    return { L, R, stack: Math.max(L.height, R.height, 20) };
  };
  const top = 30;
  const heightFor = (w: number) => {
    const arm = w / 2 - trayWidth(w) / 2 - 6;
    return top + arm * Math.sin((9 * Math.PI) / 180) * 2 + 16 + layout(w).stack + 22 + 16;
  };

  const side = (xs: string | number | undefined, us: string | number | undefined) => {
    const parts: string[] = [];
    if (xs !== undefined && (!known(xs) || count(xs) > 0))
      parts.push(known(xs) && count(xs) === 1 ? letter : `${text(xs)}${letter}`);
    if (us !== undefined && (!known(us) || count(us) > 0)) parts.push(text(us));
    return parts.length ? parts.join(' + ') : '0';
  };
  const plain = (xs: number, us: number) =>
    [xs ? (xs === 1 ? letter : `${xs}${letter}`) : '', us ? `${us}` : '']
      .filter(Boolean)
      .join(' + ') || '0';
  const eq = `${side(spec.left.x, spec.left.units)} = ${side(spec.right.x, spec.right.units)}`;
  const allKnown = [spec.left.x, spec.left.units, spec.right.x, spec.right.units].every(known);
  const xs = formatNumber(x);
  const sub = (xn: number, un: number) =>
    [xn ? (xn === 1 ? xs : `${xn} × ${xs}`) : '', un ? `${un}` : ''].filter(Boolean).join(' + ') ||
    '0';
  const weighs = (xn: number, un: number, total: number) =>
    xn && (un || xn > 1) ? `${sub(xn, un)} = ${formatNumber(total)}` : undefined;
  const lines: string[] = [eq];
  if (!allKnown) lines.push('Type the numbers on each side.');
  else if (stage === 'equation') {
    if (!xKnown) lines.push(`Level: the two sides weigh the same. ${letter} = ?`);
    else {
      const w1 = weighs(xl, ul, wl);
      const w2 = weighs(xr, ur, wr);
      if (w1) lines.push(w1);
      if (w2) lines.push(w2);
      lines.push(
        Math.abs(wl - wr) < 1e-9
          ? `Level: both sides weigh ${formatNumber(wl)}.`
          : `Not level: ${formatNumber(wl)} on the left, ${formatNumber(wr)} on the right.`,
      );
    }
  } else {
    const took = [
      takeX ? (takeX === 1 ? letter : `${takeX}${letter}`) : '',
      takeU ? `${takeU}` : '',
    ]
      .filter(Boolean)
      .join(' and ');
    const now = `${plain(after.xl, after.ul)} = ${plain(after.xr, after.ur)}`;
    lines.push(
      took ? `Take ${took} from both sides: still level.` : 'Nothing is on both sides to take.',
    );
    lines.push(now);
    if (stage === 'split') {
      if (!split)
        lines.push('The blocks and the weights are not on opposite sides, so it can’t split.');
      else if (!xKnown)
        lines.push(`Split both sides into ${split.blocks} equal parts. ${letter} = ?`);
      else if (split.blocks === 1)
        lines.push(`One block balances ${split.units}. ${letter} = ${xs}`);
      else
        lines.push(
          `Split both sides into ${split.blocks} equal parts: one block balances one part.`,
          `${letter} = ${split.units} ÷ ${split.blocks} = ${formatNumber(split.units / split.blocks)}`,
        );
    }
  }

  return (
    <View>
      {spec.steps ? (
        <View style={{ paddingHorizontal: space.md, marginBottom: space.sm }}>
          <SegmentedControl<Stage>
            segments={[
              { value: 'equation', label: 'Equation' },
              { value: 'take', label: 'Take away' },
              { value: 'split', label: 'Split' },
            ]}
            value={stage}
            onChange={setStage}
          />
        </View>
      ) : null}
      <Canvas aspect={(w) => heightFor(w) / w}>
        {({ w, h }) => {
          const cx = w / 2;
          const tw = trayWidth(w);
          const arm = w / 2 - tw / 2 - 6;
          const { L, R, stack } = layout(w);
          const beamY = top + arm * Math.sin((9 * Math.PI) / 180);
          const t = (tilt * Math.PI) / 180;
          const ends = [
            { x: cx - arm * Math.cos(t), y: beamY - arm * Math.sin(t) },
            { x: cx + arm * Math.cos(t), y: beamY + arm * Math.sin(t) },
          ];
          // The beam: a wooden bar, turned by the tilt.
          const bar = (half: number, th: number) => {
            const [dx, dy] = [Math.cos(t), Math.sin(t)];
            const [nx, ny] = [-dy * th, dx * th];
            return [
              [cx - half * dx - nx, beamY - half * dy - ny],
              [cx + half * dx - nx, beamY + half * dy - ny],
              [cx + half * dx + nx, beamY + half * dy + ny],
              [cx - half * dx + nx, beamY - half * dy + ny],
            ]
              .map((p) => p.join(','))
              .join(' ');
          };
          const tray = (end: { x: number; y: number }, packed: typeof L, key: string) => {
            const spreadY = end.y + 14;
            const trayY = spreadY + stack + 18;
            const left = end.x - tw / 2;
            const inner = left + 4;
            return (
              <G key={key}>
                <Line
                  x1={end.x}
                  y1={end.y}
                  x2={end.x}
                  y2={spreadY}
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                />
                <Line
                  x1={left + 2}
                  y1={spreadY}
                  x2={left + tw - 2}
                  y2={spreadY}
                  stroke={c.metalDark}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {[left + 3, left + tw - 3].map((sx) => (
                  <Line
                    key={sx}
                    x1={sx}
                    y1={spreadY}
                    x2={sx}
                    y2={trayY}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                  />
                ))}
                <Rect
                  x={left}
                  y={trayY}
                  width={tw}
                  height={7}
                  rx={2}
                  fill={c.wood}
                  stroke={c.woodDark}
                  strokeWidth={1.2}
                />
                <Rect x={left} y={trayY} width={tw} height={7} rx={2} fill={url(paint.light)} />
                {packed.placed.map((p, i) => {
                  const px = inner + p.x;
                  const py = trayY + p.y - 0.5;
                  const opacity = p.faded ? 0.22 : p.out ? 0.5 : 1;
                  const cross = p.out ? (
                    <Path
                      d={`M ${px - 1} ${py - 1} L ${px + p.w + 1} ${py + p.h + 1} M ${px + p.w + 1} ${py - 1} L ${px - 1} ${py + p.h + 1}`}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                  ) : null;
                  if (p.kind === 'x')
                    return (
                      <G key={i}>
                        <G opacity={opacity}>
                          <Rect
                            x={px}
                            y={py}
                            width={p.w}
                            height={p.h}
                            rx={3}
                            fill={c.wood}
                            stroke={c.woodDark}
                            strokeWidth={1.2}
                          />
                          <Rect
                            x={px}
                            y={py}
                            width={p.w}
                            height={p.h}
                            rx={3}
                            fill={url(paint.light)}
                          />
                          <ChartText
                            x={px + p.w / 2}
                            y={py + p.h / 2 + p.w * 0.19}
                            fontSize={Math.round(p.w * 0.55)}
                            fontWeight="700"
                            fontStyle="italic"
                            fill={c.coinInk}
                            textAnchor="middle"
                          >
                            {letter}
                          </ChartText>
                        </G>
                        {cross}
                      </G>
                    );
                  // A unit weight: a metal block with a knob, stamped 1.
                  const knob = p.h * 0.28;
                  return (
                    <G key={i}>
                      <G opacity={opacity}>
                        <Rect
                          x={px + p.w * 0.36}
                          y={py}
                          width={p.w * 0.28}
                          height={knob + 1}
                          rx={1.5}
                          fill={c.metalDark}
                        />
                        <Path
                          d={`M ${px + 2} ${py + knob} L ${px + p.w - 2} ${py + knob} L ${px + p.w} ${py + p.h} L ${px} ${py + p.h} Z`}
                          fill={url(paint.metal)}
                          stroke={c.metalDark}
                          strokeWidth={1}
                          strokeLinejoin="round"
                        />
                        {p.w >= 14 ? (
                          <ChartText
                            x={px + p.w / 2}
                            y={py + p.h - 2.5}
                            fontSize={p.w >= 18 ? chart.tiny : 8}
                            fontWeight="700"
                            textAnchor="middle"
                          >
                            1
                          </ChartText>
                        ) : null}
                      </G>
                      {cross}
                    </G>
                  );
                })}
              </G>
            );
          };
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} />
                <Deepen id={paint.metal} from={c.metal} to={c.metalDark} />
                <Deepen id={paint.beam} from={c.wood} to={c.woodDark} />
              </Defs>
              {/* The hook and its ring. */}
              <Path
                d={`M ${cx} 4 L ${cx} ${beamY - 12}`}
                stroke={c.metalDark}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <Circle
                cx={cx}
                cy={beamY - 7}
                r={5}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={2}
              />
              <Polygon
                points={bar(arm + 4, 4.5)}
                fill={url(paint.beam)}
                stroke={c.woodDark}
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
              <Circle cx={cx} cy={beamY} r={3} fill={c.metalDark} />
              {tray(ends[0]!, L, 'L')}
              {tray(ends[1]!, R, 'R')}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
