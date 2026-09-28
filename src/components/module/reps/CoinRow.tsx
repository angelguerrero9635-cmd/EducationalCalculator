import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import type { Representation } from '@/data/modules';
import { chart, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'coinRow' }>;

/** US coins with their values in cents and diameters in mm (drawn to relative size). */
const COINS = [
  { value: '1', label: 'Penny', many: 'pennies', cents: 1, mm: 19.05 },
  { value: '5', label: 'Nickel', many: 'nickels', cents: 5, mm: 21.21 },
  { value: '10', label: 'Dime', many: 'dimes', cents: 10, mm: 17.91 },
  { value: '25', label: 'Quarter', many: 'quarters', cents: 25, mm: 24.26 },
] as const;
type CoinValue = (typeof COINS)[number]['value'];
type CoinKind = (typeof COINS)[number];

/** Coins per row: the row wraps in fives, so the count reads in groups of five. */
const PER_ROW = 5;
/** Pixels per mm at full size: a quarter is 58 px across; the others keep their true ratio. */
const PX_PER_MM = 2.4;
/** Space between coins, and the running total's line under each coin. */
const GAP = 12;
const TOTAL_LINE = 22;
const ROW_GAP = 14;

/**
 * A head in profile facing right, in a unit box centred on 0 (forehead at the top, neck at the
 * bottom), stamped faintly on the face like the relief on a real coin.
 */
const PROFILE =
  'M -0.18 -0.62 C 0.05 -0.66 0.26 -0.5 0.28 -0.3 L 0.3 -0.2 L 0.4 -0.06 L 0.3 -0.02 ' +
  'L 0.31 0.08 L 0.26 0.12 L 0.28 0.2 C 0.2 0.3 0.08 0.3 0.02 0.3 L 0.06 0.5 ' +
  'L -0.3 0.5 C -0.3 0.3 -0.42 0.18 -0.44 -0.05 C -0.46 -0.4 -0.36 -0.58 -0.18 -0.62 Z';

/**
 * One coin in metal: copper for a penny, silver for the rest, lit from the top left, with a
 * raised rim, a ridged edge on dimes and quarters (as real ones have), a faint profile in
 * relief and the value stamped bold on the face.
 */
function RealCoin({
  coin,
  cx,
  cy,
  d,
  ids,
}: {
  coin: CoinKind;
  cx: number;
  cy: number;
  d: number;
  ids: { rim: string; recess: string };
}) {
  const c = usePalette();
  const penny = coin.cents === 1;
  const [light, dark] = penny ? [c.copper, c.copperDark] : [c.silver, c.silverDark];
  const r = d / 2;
  const reeded = coin.cents === 10 || coin.cents === 25;
  const ridges = Math.round(d * 1.5);
  const rim = Math.max(3.5, r * 0.14);
  // Lincoln faces right on a penny; the silver coins' portraits face left.
  const flip = penny ? 1 : -1;
  const s = r * 0.6;
  return (
    <G>
      {/* A flat disc on the table: its shadow falls down and to the right. */}
      <Circle cx={cx + 1.5} cy={cy + 2.5} r={r} fill={c.shadow} />
      <Circle cx={cx} cy={cy} r={r} fill={url(ids.rim)} stroke={dark} strokeWidth={1} />
      {reeded
        ? Array.from({ length: ridges }, (_, i) => {
            const a = (i / ridges) * Math.PI * 2;
            return (
              <Line
                key={i}
                x1={cx + Math.cos(a) * (r - 0.6)}
                y1={cy + Math.sin(a) * (r - 0.6)}
                x2={cx + Math.cos(a) * (r - 2.2)}
                y2={cy + Math.sin(a) * (r - 2.2)}
                stroke={dark}
                strokeOpacity={0.6}
                strokeWidth={0.8}
              />
            );
          })
        : null}
      {/* The field inside the raised rim, sunk a little: shaded at the top left, lit below. */}
      <Circle cx={cx} cy={cy} r={r - rim} fill={light} />
      <Circle
        cx={cx}
        cy={cy}
        r={r - rim}
        fill={url(ids.recess)}
        stroke={dark}
        strokeOpacity={0.45}
        strokeWidth={0.8}
      />
      <Path
        d={PROFILE}
        transform={`translate(${cx - flip * r * 0.24} ${cy - r * 0.02}) scale(${flip * s} ${s})`}
        fill={dark}
        fillOpacity={0.2}
        stroke={c.shine}
        strokeOpacity={0.35 * c.sheen}
        strokeWidth={1 / s}
      />
      <ChartText
        x={cx}
        y={cy + chart.value * 0.36}
        fontSize={coin.cents === 25 ? chart.emphasis : chart.value}
        fontWeight="800"
        textAnchor="middle"
        fill={penny ? c.pennyInk : c.coinInk}
      >
        {`${coin.cents}¢`}
      </ChartText>
    </G>
  );
}

/**
 * A row of one kind of coin, picked with the buttons; − / + change how many. Coins are drawn
 * at their true sizes (a dime smallest, a quarter largest), five to a row, and each has the
 * running total under it, so the skip-count (10¢, 20¢, 30¢) shows beside the coins it counts.
 */
export function CoinRow({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('rim', 'recess');
  const rep = useRep(calc);
  const cents = rep.known(spec.value) ? Math.round(rep.shown(spec.value)) : undefined;
  const coin = COINS.find((x) => x.cents === cents);
  const known = rep.known(spec.count);
  const n = known ? Math.max(0, Math.round(rep.shown(spec.count))) : 0;
  const rows = Math.max(1, Math.ceil(n / PER_ROW));
  const mm = coin?.mm ?? COINS[3].mm;

  // Size from the coin shown and the width: five of the largest coin always fit a row.
  const scale = (w: number) => Math.min(PX_PER_MM, (w - 4 * GAP - 8) / (PER_ROW * COINS[3].mm));
  const rowH = (w: number) => mm * scale(w) + TOTAL_LINE + 6;
  const height = (w: number) => rows * rowH(w) + (rows - 1) * ROW_GAP + 10;

  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.toggle}>
        <SegmentedControl<CoinValue>
          segments={COINS.map(({ value, label }) => ({ value, label }))}
          value={(coin?.value ?? '') as CoinValue}
          onChange={(v) => calc.set({ ...rep.pin([spec.count]), [spec.value]: Number(v) })}
        />
      </View>
      {coin ? (
        <Canvas aspect={(w) => height(w) / w}>
          {({ w, h }) => {
            const d = mm * scale(w);
            const pitch = d + GAP;
            return (
              <Svg
                width={w}
                height={h}
                accessibilityLabel={`${n} ${n === 1 ? coin.label.toLowerCase() : coin.many}, counted ${Array.from({ length: n }, (_, i) => `${(i + 1) * coin.cents}¢`).join(', ')}`}
              >
                <Defs>
                  {/* Metal lit from the top left: the rim bright there, darker at the far edge. */}
                  <LinearGradient id={ids.rim} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                    <Stop offset="0" stopColor={coin.cents === 1 ? c.copper : c.silver} />
                    <Stop offset="0.45" stopColor={coin.cents === 1 ? c.copper : c.silver} />
                    <Stop offset="1" stopColor={coin.cents === 1 ? c.copperDark : c.silverDark} />
                  </LinearGradient>
                  <LinearGradient id={ids.recess} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                    <Stop offset="0" stopColor={c.shade} stopOpacity={0.2} />
                    <Stop offset="0.35" stopColor={c.shade} stopOpacity={0.04} />
                    <Stop offset="0.6" stopColor={c.shine} stopOpacity={0.12 * c.sheen} />
                    <Stop offset="1" stopColor={c.shine} stopOpacity={0.3 * c.sheen} />
                  </LinearGradient>
                </Defs>
                {n === 0 ? (
                  // No coins (or "?"): an empty spot where the coins go.
                  <G>
                    <Circle
                      cx={w / 2}
                      cy={4 + d / 2}
                      r={d / 2}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeDasharray={chart.dashFine}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={w / 2}
                      y={4 + d + 18}
                      textAnchor="middle"
                      fill={c.chartMuted}
                      fontSize={chart.value}
                    >
                      {known ? '0¢' : '?'}
                    </ChartText>
                  </G>
                ) : null}
                {Array.from({ length: n }, (_, i) => {
                  const row = Math.floor(i / PER_ROW);
                  // Every row starts at the same left edge as the first, so fives line up.
                  const cols = Math.min(PER_ROW, n);
                  const x0 = w / 2 - ((cols - 1) * pitch) / 2;
                  const col = i % PER_ROW;
                  const cx = x0 + col * pitch;
                  const cy = 4 + row * (rowH(w) + ROW_GAP) + d / 2;
                  const last = i === n - 1;
                  return (
                    <G key={i}>
                      <RealCoin coin={coin} cx={cx} cy={cy} d={d} ids={ids} />
                      <ChartText
                        x={cx}
                        y={cy + d / 2 + 18}
                        textAnchor="middle"
                        fontSize={last ? chart.emphasis : chart.label}
                        fontWeight={last ? '700' : '400'}
                        fill={last ? c.chartInk : c.chartMuted}
                      >
                        {`${(i + 1) * coin.cents}¢`}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
            );
          }}
        </Canvas>
      ) : null}
      <Caption>
        {coin
          ? `${rep.label(spec.count)} ${n === 1 ? coin.label.toLowerCase() : coin.many}: ${rep.label(spec.total)}`
          : 'Pick a coin above.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [spec.value] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.md },
});
