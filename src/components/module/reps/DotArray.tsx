import { useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { bracePath } from './braces';
import { Ball, BoxShadow, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, DragHandle, fitLabel, setPair, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'array' }>;

/**
 * A rectangular array: counters in a plastic tray, or unit squares on a crisp grid, with a
 * brace for the rows at the left and one for the number in each row on top. Sized from the
 * rows and columns shown and centred. Drag the corner to resize; a faint ghost row and
 * column show where the next ones go.
 */
export function DotArray({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('a', 'b', 'light');
  const rep = useRep(calc);
  const start = useRef({ r: 0, c: 0 });
  // The cell size while a handle is dragged (so the picture doesn't rescale under the finger).
  const last = useRef<{ cell: number; stacked: boolean } | null>(null);
  const [frozen, setFrozen] = useState<{ cell: number; stacked: boolean } | null>(null);
  const rows = Math.max(0, Math.round(rep.shown(spec.rows)));
  const cols = Math.max(0, Math.round(rep.shown(spec.columns)));
  // A factor past `max` (1 × 97) is drawn cut off at `max` dots; the caption says so.
  const dr = Math.min(spec.max, rows);
  const dc = Math.min(spec.max, cols);
  const cut = rows > spec.max || cols > spec.max;
  const sums = Array.from({ length: rows }, () => cols).join(' + ');
  // Break apart a factor: the first `first` columns, then the rest.
  const split = spec.split;
  const firstCols = split ? Math.min(cols, Math.max(0, Math.round(rep.shown(split.first)))) : cols;
  const sym = (id: string) => rep.variable(id).symbol;

  // A "?" factor draws one row or column, but the caption says "?" rather than counting it.
  const rowsKnown = rep.known(spec.rows);
  const colsKnown = rep.known(spec.columns);
  const known = rowsKnown && colsKnown;
  const rv = rep.value(spec.rows, false);
  const cv = rep.value(spec.columns, false);
  const caption = !known
    ? rep.early
      ? `${rv} ${rv === '1' ? 'row' : 'rows'} of ${cv}: ${rep.value(spec.total, false)}`
      : rep.words
        ? `${rv} ${rv === '1' ? 'row' : 'rows'} of ${cv}: ${rv} × ${cv} = ${rep.value(spec.total, false)}`
        : `${sym(spec.rows)} = ${rv} ${rv === '1' ? 'row' : 'rows'} of ${sym(spec.columns)} = ${cv}: ${rv} × ${cv} = ${rep.label(spec.total, false)}`
    : rep.early
      ? // One row has nothing to add up: "1 row of 5: 5".
        rows === 1
        ? `1 row of ${cols}: ${rep.value(spec.total, false)}`
        : `${rows} rows of ${cols}: ${sums || '0'} = ${rep.value(spec.total, false)}`
      : split
        ? `${rows} × ${cols} = ${rows} × ${firstCols} + ${rows} × ${cols - firstCols} = ${rows * firstCols} + ${rows * (cols - firstCols)} = ${rows * cols}`
        : spec.turned
          ? `${rows} ${rows === 1 ? 'row' : 'rows'} of ${cols} = ${cols} rows of ${rows}: ${rows} × ${cols} = ${cols} × ${rows} = ${rows * cols}`
          : rep.words
            ? `${rows} ${rows === 1 ? 'row' : 'rows'} of ${cols}: ${rows} × ${cols} = ${rep.value(spec.total, false)}`
            : `${sym(spec.rows)} = ${rows} ${rows === 1 ? 'row' : 'rows'} of ${sym(spec.columns)} = ${cols}: ${sums || '0'} = ${rep.label(spec.total, false)}`;

  // Braces say "3 rows" and "4 in each row"; with `sides` or a split they give the numbers.
  const wordy = !spec.sides && !split;
  const counters = spec.cell !== 'square';
  const ghostC = dc < spec.max && !spec.turned ? 1 : 0;
  const ghostR = dr < spec.max && !spec.turned && !split ? 1 : 0;
  const firstText = `${rows} × ${firstCols} = ${rows * firstCols}`;
  const secondText = `${rows} × ${cols - firstCols} = ${rows * (cols - firstCols)}`;
  /** Width of a row brace's label: the number over "rows" (words) or the number alone. */
  const leftW = (n: number, isKnown: boolean) =>
    Math.max((isKnown ? String(n) : '?').length * chart.emphasis * 0.62, wordy ? 30 : 0);

  /**
   * Cell size from the rows and columns shown (at most 44 px), the tray centred, and the
   * canvas cropped to what is drawn. A drag keeps the size it started with unless the array
   * would run out of room.
   */
  const layout = (w: number) => {
    const edge = 6;
    const pad = counters ? 6 : 0;
    const braceGap = 19; // brace depth and the gaps between the label, the brace and the tray
    const gl = leftW(rows, rowsKnown) + braceGap;
    const gl2 = leftW(cols, colsKnown) + braceGap;
    const top = 36;
    const right = 14;
    const between = 26;
    const room = w - 2 * edge - gl - 2 * pad - right;
    let cell: number;
    let stacked = false;
    if (spec.turned) {
      const side = Math.min(40, (room - between - gl2 - 2 * pad) / Math.max(1, dc + dr));
      const stack = Math.min(40, room / Math.max(1, dc, dr), 320 / Math.max(1, dr + dc));
      stacked = stack > side * 1.3;
      cell = stacked ? stack : side;
    } else {
      cell = Math.min(44, room / Math.max(1, dc + 2 * ghostC));
    }
    if (frozen) {
      cell = Math.min(cell, frozen.cell);
      stacked = frozen.stacked;
    }
    const trayW = (k: number) => k * cell + 2 * pad;
    const textW = (t: string) => t.length * chart.value * 0.58;
    const stagger =
      !!split &&
      firstCols > 0 &&
      firstCols < cols &&
      (cols * cell) / 2 - (textW(firstText) + textW(secondText)) / 2 < 12;
    const below = split ? (stagger ? 52 : 34) : ghostR * cell + right + 4;
    const contentW = spec.turned
      ? stacked
        ? gl + trayW(Math.max(dc, dr))
        : gl + trayW(dc) + between + gl2 + trayW(dr)
      : gl + trayW(dc) + right;
    const x0 = Math.max(edge, (w - contentW) / 2) + gl + pad;
    const y0 = top + pad;
    const h1 = top + dr * cell + 2 * pad;
    const height = spec.turned
      ? stacked
        ? h1 + 12 + top + dc * cell + 2 * pad + 8
        : Math.max(h1, top + dc * cell + 2 * pad) + 8
      : h1 + below;
    // The turned copy: dc rows of dr, beside the array or under it.
    const x1 = stacked ? x0 : x0 + dc * cell + pad + between + gl2 + pad;
    const y1 = stacked ? h1 + 12 + top + pad : y0;
    return { cell, pad, stagger, stacked, x0, y0, x1, y1, height };
  };

  const brace = (d: string, key: string) => (
    <Path
      key={key}
      d={d}
      fill="none"
      stroke={c.chartInk}
      strokeWidth={chart.strokeLight}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  /** One array: a tray of counters or a grid of squares, the ghost row and column, braces. */
  const drawArray = (
    key: string,
    r: number,
    k: number,
    x0: number,
    y0: number,
    cell: number,
    pad: number,
    cw: number,
    o: {
      ghosts: boolean;
      rowsText: string;
      colsText: string;
      rowsKnown: boolean;
      colsKnown: boolean;
    },
  ) => {
    const out: ReactNode[] = [];
    const W = k * cell;
    const H = r * cell;
    const rad = cell * 0.36;
    if (o.ghosts) {
      const ghost = (gx: number, gy: number, i: string) =>
        counters ? (
          <Circle
            key={`${key}g${i}`}
            cx={gx + cell / 2}
            cy={gy + cell / 2}
            r={rad}
            fill="none"
            stroke={c.chartMuted}
            strokeOpacity={0.5}
            strokeDasharray={chart.dashFine}
          />
        ) : (
          <Rect
            key={`${key}g${i}`}
            x={gx + 2}
            y={gy + 2}
            width={cell - 4}
            height={cell - 4}
            fill="none"
            stroke={c.chartMuted}
            strokeOpacity={0.5}
            strokeDasharray={chart.dashFine}
          />
        );
      if (ghostC) for (let i = 0; i < r; i++) out.push(ghost(x0 + W + pad, y0 + i * cell, `c${i}`));
      if (ghostR) for (let i = 0; i < k; i++) out.push(ghost(x0 + i * cell, y0 + H + pad, `r${i}`));
    }
    if (counters && r > 0 && k > 0) {
      const tray = { x: x0 - pad, y: y0 - pad, width: W + 2 * pad, height: H + 2 * pad };
      out.push(
        <BoxShadow key={`${key}sh`} {...tray} r={pad + 2} />,
        <Rect
          key={`${key}tray`}
          {...tray}
          rx={pad + 2}
          fill={c.plastic}
          stroke={c.chartGrid}
          strokeWidth={chart.strokeLight}
        />,
        <Rect key={`${key}lit`} {...tray} rx={pad + 2} fill={url(paint.light)} />,
      );
      // A faint flat band on every other row, so the rows read as rows.
      for (let i = 1; i < r; i += 2)
        out.push(
          <Rect
            key={`${key}band${i}`}
            x={x0 - pad / 2}
            y={y0 + i * cell + 1}
            width={W + pad}
            height={cell - 2}
            rx={(cell - 2) / 2}
            fill={c.chartHighlight}
            opacity={0.08}
          />,
        );
    }
    for (let i = 0; i < r * k; i++) {
      const col = i % k;
      const x = x0 + col * cell;
      const y = y0 + Math.floor(i / k) * cell;
      const second = !!split && key === 'a' && col >= firstCols;
      out.push(
        counters ? (
          <G key={`${key}${i}`}>
            {/* The counter's shadow in its well, then the counter. */}
            <Circle cx={x + cell / 2 + 0.6} cy={y + cell / 2 + 1.2} r={rad} fill={c.shadow} />
            <Circle
              cx={x + cell / 2}
              cy={y + cell / 2}
              r={rad}
              fill={second ? url(paint.b) : url(paint.a)}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
          </G>
        ) : (
          <Rect
            key={`${key}${i}`}
            x={x}
            y={y}
            width={cell}
            height={cell}
            fill={second ? c.chartSecond : split ? c.chartHighlight : c.chartFill}
            opacity={second ? 0.45 : split ? 0.2 : 1}
          />
        ),
      );
    }
    // Squares: a crisp grid, light inner lines and a heavier outline.
    if (!counters && r > 0 && k > 0) {
      const inner = { stroke: c.chartInk, strokeOpacity: 0.5, strokeWidth: 1 };
      for (let i = 1; i < k; i++)
        out.push(
          <Line
            key={`${key}v${i}`}
            x1={x0 + i * cell}
            y1={y0}
            x2={x0 + i * cell}
            y2={y0 + H}
            {...inner}
          />,
        );
      for (let i = 1; i < r; i++)
        out.push(
          <Line
            key={`${key}h${i}`}
            x1={x0}
            y1={y0 + i * cell}
            x2={x0 + W}
            y2={y0 + i * cell}
            {...inner}
          />,
        );
      out.push(
        <Rect
          key={`${key}out`}
          x={x0}
          y={y0}
          width={W}
          height={H}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />,
      );
    }
    if (r > 0 && k > 0) {
      // Row brace at the left, its tip pointing at the label.
      const bx = x0 - pad - 5;
      out.push(brace(bracePath(bx, y0 + H, bx, y0, 8), `${key}rb`));
      const [num, word] = o.rowsText.split(' ');
      const ly = y0 + H / 2;
      const twoLines = !!word && H >= 30;
      out.push(
        <ChartText
          key={`${key}rn`}
          x={bx - 12}
          y={twoLines ? ly - 1 : ly + 5}
          fontSize={chart.emphasis}
          fontWeight="700"
          fill={o.rowsKnown ? c.chartInk : c.chartHighlight}
          textAnchor="end"
        >
          {twoLines || !word ? num : `${num} ${word}`}
        </ChartText>,
      );
      if (twoLines)
        out.push(
          <ChartText
            key={`${key}rw`}
            x={bx - 12}
            y={ly + 14}
            fontSize={chart.label}
            fill={c.chartMuted}
            textAnchor="end"
          >
            {word}
          </ChartText>,
        );
      // Column brace(s) on top: one over each part when the columns are split.
      const by = y0 - pad - 5;
      const parts: [number, number][] =
        split && key === 'a'
          ? (
              [
                [0, firstCols],
                [firstCols, k],
              ] as [number, number][]
            ).filter(([a, b]) => b > a)
          : [[0, k]];
      for (const [a, b] of parts) {
        const xa = x0 + a * cell + (a === 0 ? 0 : 3);
        const xb = x0 + b * cell - (b === k ? 0 : 3);
        out.push(brace(bracePath(xa, by, xb, by, 8), `${key}cb${a}`));
        const text = parts.length > 1 ? String(b - a) : o.colsText;
        const isKnown = parts.length > 1 ? colsKnown && rep.known(split!.first) : o.colsKnown;
        const [n, ...rest] = text.split(' ');
        out.push(
          <ChartText
            key={`${key}ct${a}`}
            {...fitLabel((xa + xb) / 2, text, chart.value, cw)}
            y={by - 14}
            fontSize={chart.value}
            fill={c.chartMuted}
          >
            <TSpan
              fontSize={chart.emphasis}
              fontWeight="700"
              fill={isKnown ? c.chartInk : c.chartHighlight}
            >
              {n}
            </TSpan>
            {rest.length ? ` ${rest.join(' ')}` : ''}
          </ChartText>,
        );
      }
    }
    return out;
  };

  const rowsWord = (n: number, isKnown: boolean) =>
    `${isKnown ? n : '?'}${wordy ? (n === 1 && isKnown ? ' row' : ' rows') : ''}`;
  const eachWord = (n: number, isKnown: boolean) =>
    `${isKnown ? n : '?'}${wordy ? ' in each row' : ''}`;

  return (
    <View>
      <Canvas aspect={(w) => layout(w).height / w}>
        {({ w, h }) => {
          const { cell, pad, stagger, stacked, x0, y0, x1, y1 } = layout(w);
          last.current = { cell, stacked };
          const divider = x0 + firstCols * cell;
          const bottom = y0 + dr * cell + pad;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={paint.a} color={c.chartHighlight} />
                  <Ball id={paint.b} color={c.chartSecond} />
                  <TopLight id={paint.light} />
                </Defs>
                {drawArray('a', dr, dc, x0, y0, cell, pad, w, {
                  ghosts: true,
                  rowsText: rowsWord(rows, rowsKnown),
                  colsText: eachWord(cols, colsKnown),
                  rowsKnown,
                  colsKnown,
                })}
                {spec.turned
                  ? drawArray('t', dc, dr, x1, y1, cell, pad, w, {
                      ghosts: false,
                      rowsText: rowsWord(cols, colsKnown),
                      colsText: eachWord(rows, rowsKnown),
                      rowsKnown: colsKnown,
                      colsKnown: rowsKnown,
                    })
                  : null}
                {split && firstCols > 0 && firstCols < cols ? (
                  <Line
                    x1={divider}
                    y1={y0 - pad - 1}
                    x2={divider}
                    y2={bottom + 1}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : null}
                {split && firstCols > 0 ? (
                  <ChartText
                    {...fitLabel(x0 + (firstCols * cell) / 2, firstText, chart.value, w)}
                    y={bottom + 26}
                    fontSize={chart.value}
                    fontWeight="600"
                  >
                    {firstText}
                  </ChartText>
                ) : null}
                {split && cols > firstCols ? (
                  <ChartText
                    {...fitLabel(
                      divider + ((cols - firstCols) * cell) / 2,
                      secondText,
                      chart.value,
                      w,
                    )}
                    y={bottom + (stagger ? 46 : 26)}
                    fontSize={chart.value}
                    fontWeight="600"
                  >
                    {secondText}
                  </ChartText>
                ) : null}
              </Svg>
              <DragHandle
                testID="drag-corner"
                x={x0 + dc * cell + pad}
                y={bottom}
                label={`${rep.variable(spec.rows).name} and ${rep.variable(spec.columns).name}`}
                onStart={() => {
                  start.current = { r: dr, c: dc };
                  setFrozen(last.current);
                }}
                onEnd={() => setFrozen(null)}
                onMove={(dx, dy) =>
                  setPair(
                    calc,
                    rep,
                    split ? rep.pin([split.first]) : {},
                    {
                      [spec.rows]: rep.snapTo(spec.rows, start.current.r + dy / cell),
                      [spec.columns]: rep.snapTo(spec.columns, start.current.c + dx / cell),
                    },
                    Math.abs(dx) >= Math.abs(dy)
                      ? [spec.columns, spec.rows]
                      : [spec.rows, spec.columns],
                  )
                }
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{cut ? `${caption} (the first ${spec.max} shown)` : caption}</Caption>
      {split ? (
        <Steppers
          calc={calc}
          items={[
            { var: split.first, steps: [1], pin: [spec.rows, spec.columns] },
            { var: spec.rows, steps: [1], pin: [spec.columns, split.first] },
          ]}
        />
      ) : null}
    </View>
  );
}
