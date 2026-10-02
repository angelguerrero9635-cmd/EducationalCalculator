/**
 * HC64 `bitFields` (BitFieldsSpec in typesHe3d.ts): a word as a bar cut into named fields to
 * scale, the bit numbers at their edges and the widths written in; an address's bits written
 * under it by octet with its mask; or a packet's headers added one layer at a time around the
 * payload, with a to-scale strip of the frame. Flat; fields alternate two fills and are named.
 */
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { BitFieldsSpec } from '@/data/modules/typesHe3d';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { bitsOf, fromOctets, placeFields } from './bitMath';
import { Canvas, Caption, ChartText } from './common';
import { fmt4, textW, useReader } from './he3dKit';

type Reader = ReturnType<typeof useReader>;

export function BitFields({ spec, calc }: { spec: BitFieldsSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const drawn = spec.mode === 'headers' ? headers(spec, r, c) : word(spec, r, c);
  return (
    <>
      <Canvas aspect={(w) => (typeof drawn.h === 'number' ? drawn.h : drawn.h(w)) / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {drawn.body(w)}
          </Svg>
        )}
      </Canvas>
      <Caption>{drawn.caption}</Caption>
    </>
  );
}

/** The labels of `more`, as the page shows them. */
const moreText = (spec: BitFieldsSpec, r: Reader) =>
  (spec.more ?? []).map((id) => r.lab(id, id)).filter((x): x is string => !!x);

// ─── a word ───────────────────────────────────────────────────────────────────

function word(spec: BitFieldsSpec, r: Reader, c: Palette) {
  const W = r.get(spec.word);
  const fields =
    W !== undefined && W > 0 && Number.isInteger(W)
      ? placeFields(spec.fields ?? [], W, r.get)
      : undefined;
  const octets = spec.octets?.map((o) => r.get(o));
  const value =
    octets && octets.every((o) => o !== undefined)
      ? fromOctets(octets as number[])
      : r.get(spec.value);
  const mask = r.get(spec.mask);
  const showBits = W !== undefined && W <= 32 && value !== undefined;
  const fits =
    fields !== undefined &&
    fields.every((f) => f.bits >= 0) &&
    fields.reduce((s, f) => s + f.bits, 0) === W;
  const BAR = 30;
  const rowsY = 128; // with two rows of names under the bar; less with fewer
  /** Rows under the bar for the names of fields too narrow to hold them (0, 1 or 2). */
  const nameRows = (w: number) => {
    if (W === undefined || !fields) return 0;
    const cw = (w - 16) / W;
    const n = fields.filter(
      (f) => f.bits > 0 && textW(f.name, chart.label, true) + 6 > f.bits * cw,
    ).length;
    return Math.min(2, n);
  };
  const h = (w: number) => {
    const under = nameRows(w) * 16;
    return showBits ? rowsY - 32 + under + (mask !== undefined ? 78 : 36) + 6 : BAR + 52 + under;
  };
  const body = (w: number) => {
    if (W === undefined || !fields) return <G />;
    const x0 = 8;
    const cw = (w - 16) / W;
    const x = (bitFromLeft: number) => x0 + bitFromLeft * cw;
    const bits = showBits ? bitsOf(value!, W) : [];
    return (
      <G opacity={fits ? 1 : 0.45}>
        {fields.map((f, i) => {
          if (f.bits <= 0) return null;
          const left = x(W - 1 - f.hi);
          const fw = f.bits * cw;
          const nameFits = textW(f.name, chart.label, true) + 6 <= fw;
          const widthText = nameFits ? `${fmt4(f.bits)} bits` : fmt4(f.bits);
          return (
            <G key={i}>
              <Rect
                x={left}
                y={BAR}
                width={fw}
                height={44}
                fill={i % 2 ? c.chartSurface : c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={left + fw / 2}
                y={BAR + 18}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {nameFits ? f.name : ''}
              </ChartText>
              <ChartText
                x={left + fw / 2}
                y={BAR + (nameFits ? 36 : 27)}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {textW(widthText) + 4 <= fw ? widthText : ''}
              </ChartText>
              {/* Bit numbers at the field's edges (one when it is a single bit). */}
              <ChartText x={left + 2} y={BAR - 6} fontSize={chart.label} fill={c.chartMuted}>
                {String(f.hi)}
              </ChartText>
              {f.bits > 1 && fw >= textW(`${f.hi}`) + textW(`${f.lo}`) + 8 ? (
                <ChartText
                  x={left + fw - 2}
                  y={BAR - 6}
                  textAnchor="end"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {String(f.lo)}
                </ChartText>
              ) : null}
            </G>
          );
        })}
        {/* A field too narrow for its name has it under the bar. */}
        {fields
          .filter((f) => f.bits > 0 && textW(f.name, chart.label, true) + 6 > f.bits * cw)
          .map((f, j) => {
            // Narrow fields' names alternate two rows, so neighbours never meet.
            const tw = textW(f.name, chart.label, true);
            const mid = x(W - 1 - f.hi) + (f.bits * cw) / 2;
            return (
              <ChartText
                key={`n${f.name}`}
                x={Math.min(w - tw / 2 - 2, Math.max(tw / 2 + 2, mid))}
                y={BAR + 60 + (j % 2) * 16}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {f.name}
              </ChartText>
            );
          })}
        {showBits ? (
          <G>
            <BitRow
              y={rowsY - 32 + nameRows(w) * 16}
              bits={bits}
              x={x}
              cw={cw}
              c={c}
              label={
                octets
                  ? `Address ${(octets as number[]).map(fmt4).join('.')}`
                  : `Value ${fmt4(value!)}`
              }
              split={fields.map((f) => W - 1 - f.lo)}
            />
            {mask !== undefined && W === 32 ? (
              <BitRow
                y={rowsY - 32 + nameRows(w) * 16 + 42}
                bits={Array.from({ length: 32 }, (_, i) => (i < mask ? 1 : 0))}
                x={x}
                cw={cw}
                c={c}
                label={`Mask ${maskQuad(mask)} (/${fmt4(mask)})`}
                split={[mask - 1]}
              />
            ) : null}
          </G>
        ) : null}
      </G>
    );
  };
  const parts: string[] = [];
  if (W !== undefined && fields) {
    parts.push(
      `${fields
        .filter((f) => f.bits > 0)
        .map((f) => `${f.name} ${fmt4(f.bits)}`)
        .join(
          ' + ',
        )} = ${fmt4(fields.reduce((s, f) => s + f.bits, 0))} bits${fits ? `, the whole ${fmt4(W)}-bit word.` : `, not the ${fmt4(W)}-bit word: the fields don’t fit.`}`,
    );
  }
  parts.push(...moreText(spec, r));
  return { h, body, caption: parts.join(' · ') };
}

/** The dotted-quad mask of a prefix length. */
const maskQuad = (n: number) =>
  [0, 1, 2, 3].map((k) => 256 - 2 ** (8 - Math.max(0, Math.min(8, n - 8 * k)))).join('.');

/** A row of bits in cells, its label over it, octets parted by heavy lines, fields by a gap. */
function BitRow({
  y,
  bits,
  x,
  cw,
  c,
  label,
  split,
}: {
  y: number;
  bits: (0 | 1)[];
  x: (i: number) => number;
  cw: number;
  c: Palette;
  label: string;
  /** Bit positions (from the left) after which a field ends: a highlight line there. */
  split: number[];
}) {
  return (
    <G>
      <ChartText x={x(0)} y={y - 6} fontSize={chart.label} fontWeight="700">
        {label}
      </ChartText>
      {bits.map((b, i) => (
        <G key={i}>
          <Rect
            x={x(i)}
            y={y}
            width={cw}
            height={22}
            fill={b ? c.chartFill : c.chartSurface}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
          <ChartText
            x={x(i) + cw / 2}
            y={y + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight={b ? '700' : '400'}
          >
            {String(b)}
          </ChartText>
        </G>
      ))}
      {bits.map((_, i) =>
        i > 0 && i % 8 === 0 ? (
          <Line
            key={`o${i}`}
            x1={x(i)}
            y1={y - 2}
            x2={x(i)}
            y2={y + 24}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
        ) : null,
      )}
      {split
        .filter((s) => s >= 0 && s < bits.length - 1)
        .map((s) => (
          <Line
            key={`s${s}`}
            x1={x(s + 1)}
            y1={y - 4}
            x2={x(s + 1)}
            y2={y + 26}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
          />
        ))}
    </G>
  );
}

// ─── headers ──────────────────────────────────────────────────────────────────

function headers(spec: BitFieldsSpec, r: Reader, c: Palette) {
  const payload = r.get(spec.payload);
  const layers = (spec.layers ?? []).map((l) => ({ ...l, n: r.get(l.bytes) }));
  const known = payload !== undefined && layers.every((l) => l.n !== undefined);
  const frame = known ? payload + layers.reduce((s, l) => s + l.n!, 0) : undefined;
  const ROWH = 54;
  const rows = layers.length + 1;
  const h = 10 + rows * ROWH + 58;
  const body = (w: number) => {
    const HW = Math.min(64, (w - 140) / Math.max(1, layers.length));
    const right = w - 62;
    return (
      <G>
        {Array.from({ length: rows }, (_, k) => {
          const y = 10 + k * ROWH + 16;
          // Row k: the payload with the first k headers, outermost on the left.
          const on = layers.slice(0, k).reverse();
          const left = 8;
          const pw = right - left - on.length * HW;
          const name = k === 0 ? 'data' : (layers[k - 1]!.unit ?? `with ${layers[k - 1]!.name}`);
          const bytes = known
            ? payload + layers.slice(0, k).reduce((s, l) => s + l.n!, 0)
            : undefined;
          return (
            <G key={k}>
              <ChartText x={left} y={y - 4} fontSize={chart.label} fill={c.chartMuted}>
                {name}
              </ChartText>
              {on.map((l, j) => (
                <G key={l.name}>
                  <Rect
                    x={left + j * HW}
                    y={y}
                    width={HW}
                    height={34}
                    fill={j % 2 ? c.chartSurface : c.chartFill}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={left + j * HW + HW / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {textW(l.name, chart.label, true) + 4 <= HW ? l.name : l.name.slice(0, 3)}
                  </ChartText>
                  <ChartText
                    x={left + j * HW + HW / 2}
                    y={y + 29}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {l.n !== undefined ? `${fmt4(l.n)} B` : ''}
                  </ChartText>
                </G>
              ))}
              <Rect
                x={left + on.length * HW}
                y={y}
                width={pw}
                height={34}
                fill={c.codeLit}
                stroke={c.chartInk}
                strokeWidth={1}
              />
              <ChartText
                x={left + on.length * HW + pw / 2}
                y={y + 21}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {payload !== undefined ? `payload ${fmt4(payload)} B` : 'payload'}
              </ChartText>
              <ChartText
                x={w - 6}
                y={y + 21}
                textAnchor="end"
                fontSize={chart.label}
                fontWeight="700"
              >
                {bytes !== undefined ? `${fmt4(bytes)} B` : ''}
              </ChartText>
            </G>
          );
        })}
        {/* The frame to scale: the headers' share is the thin part on the left. */}
        {known && frame ? (
          <G>
            <ChartText x={8} y={10 + rows * ROWH + 12} fontSize={chart.label} fill={c.chartMuted}>
              to scale
            </ChartText>
            <Rect
              x={8}
              y={10 + rows * ROWH + 18}
              width={w - 16}
              height={18}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <Rect
              x={8 + ((w - 16) * (frame - payload)) / frame}
              y={10 + rows * ROWH + 18}
              width={((w - 16) * payload) / frame}
              height={18}
              fill={c.codeLit}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <ChartText
              x={w / 2}
              y={10 + rows * ROWH + 32}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
            >
              {`payload ${fmt4((100 * payload) / frame)}% of the frame`}
            </ChartText>
          </G>
        ) : null}
      </G>
    );
  };
  const parts: string[] = [];
  if (known && frame !== undefined) {
    parts.push(
      `frame = ${fmt4(payload)} + ${layers.map((l) => fmt4(l.n!)).join(' + ')} = ${fmt4(frame)} B.`,
    );
    parts.push(
      `efficiency = ${fmt4(payload)} ÷ ${fmt4(frame)} = ${fmt4((100 * payload) / frame)}%.`,
    );
    parts.push(
      'Each layer adds its header in front of what it carries; the headers are not to scale.',
    );
  } else parts.push('Each layer adds its header in front of what it carries.');
  return { h, body, caption: parts.join(' ') };
}
