/**
 * HC160 `dialyzer` (DialyzerSpec in typesHe4k.ts): a hollow-fiber dialyzer, painted. Blood runs
 * left to right through the fibers, its urea dots thinning from C_in to C_out; dialysate runs the
 * other way through the shell. Under it, the blood flow as a band with its cleared share
 * (C_in − C_out) ÷ C_in shaded: the clearance K. No handles.
 */
import { View } from 'react-native';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { DialyzerSpec } from '@/data/modules/typesHe4k';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText, fitLabel } from './common';
import { Arrow, BW, Board } from './fluidKit';
import { clearance, ureaDots } from './he4kMath';
import { n3, useReader } from './he4kKit';
import { Sheen, url, usePaintIds } from './paint';

const H = 262;
/** The shell, the headers and the ports, in design units. */
const S = { x0: 62, x1: 278, y0: 74, y1: 134 };
const PORT_Y = 104;
const FIBERS = [84, 94, 104, 114, 124];
const BAND = { x0: 40, x1: 300, y0: 214, y1: 234 };

export function Dialyzer({ spec, calc }: { spec: DialyzerSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('shell', 'tube');
  const { get, text, say, label } = useReader(calc);
  const qb = get(spec.qb);
  const cin = get(spec.cin);
  const cout = get(spec.cout);
  const t = get(spec.t);
  const v = get(spec.v);
  const bothC = cin !== undefined && cout !== undefined && cin > 0 && cout >= 0;
  const wrong = bothC && cout > cin;
  const share = bothC && !wrong ? (cin - cout) / cin : undefined;
  const K = share !== undefined && qb !== undefined ? clearance(qb, cin!, cout!) : undefined;
  const ktv =
    K !== undefined && t !== undefined && v !== undefined && v > 0
      ? (K * t) / (1000 * v)
      : undefined;

  const lines: string[] = [];
  if (wrong)
    lines.push(
      `C_out = ${text(spec.cout)} is above C_in = ${text(spec.cin)}: a dialyzer only takes urea out of the blood, so C_out ≤ C_in.`,
    );
  else if (K !== undefined)
    lines.push(
      `K = Q_b(C_in − C_out) ÷ C_in = ${text(spec.qb, '', false)} × (${text(spec.cin, '', false)} − ${text(spec.cout, '', false)}) ÷ ${text(spec.cin, '', false)} = ${say(spec.k, K, 'mL/min')}: ${n3(100 * share!)}% of the blood flow is cleared of urea.`,
    );
  else lines.push('Type Q_b, C_in and C_out to draw the urea and the cleared share.');
  if (ktv !== undefined) {
    const urr = 1 - Math.exp(-ktv);
    lines.push(
      `Kt/V = ${n3(K!)} × ${text(spec.t, '', false)} ÷ (${text(spec.v, '', false)} × 1000) = ${say(spec.ktv, ktv, '', false)}; URR = 1 − e^(−Kt/V) = ${say(spec.urr, 100 * urr, '%')}.`,
    );
  }

  // Urea dots along each fiber, crowded where C is high.
  const len = S.x1 - S.x0;
  const r = bothC && !wrong ? Math.max(1e-4, cout! / cin!) : undefined;
  const dots =
    r === undefined
      ? []
      : FIBERS.flatMap((y, i) =>
          ureaDots(r, len, 14, ((i * 2) % 5) / 5 + 0.1).map((x) => ({ x: S.x0 + x, y })),
        );

  const qbText = label('Q_b', spec.qb);
  const cinText = label('C_in', spec.cin);
  const coutText = label('C_out', spec.cout);
  const qdText = label('Q_d', spec.qd);
  const kText = K === undefined ? undefined : `K = ${say(spec.k, K, 'mL/min')}`;
  const bandW = BAND.x1 - BAND.x0;
  const kMid = share === undefined ? 0 : BAND.x0 + (bandW * share) / 2;

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G opacity={wrong ? 0.4 : 1}>
            <Defs>
              <Sheen id={ids.shell} vertical strength={0.6} />
              <Sheen id={ids.tube} vertical strength={0.8} />
            </Defs>
            {/* Blood lines in and out, on the axis. */}
            {[
              [4, 40],
              [300, 336],
            ].map(([a, b]) => (
              <G key={`t${a}`}>
                <Rect x={a} y={PORT_Y - 5} width={b! - a!} height={10} fill={c.he4kBlood} />
                <Rect x={a} y={PORT_Y - 5} width={b! - a!} height={10} fill={url(ids.tube)} />
              </G>
            ))}
            <Arrow x1={6} y1={PORT_Y - 12} x2={34} y2={PORT_Y - 12} color={c.he4kBlood} />
            <Arrow x1={304} y1={PORT_Y - 12} x2={334} y2={PORT_Y - 12} color={c.he4kBlood} />
            {/* Dialysate ports under the shell: in at the right, out at the left. */}
            {[96, 244].map((x) => (
              <G key={`d${x}`}>
                <Rect x={x - 5} y={S.y1 - 2} width={10} height={28} fill={c.he4kDialysate} />
                <Rect x={x - 5} y={S.y1 - 2} width={10} height={28} fill={url(ids.tube)} />
              </G>
            ))}
            <Arrow x1={84} y1={S.y1 + 4} x2={84} y2={S.y1 + 26} color={c.he4kDialysate} />
            <Arrow x1={256} y1={S.y1 + 26} x2={256} y2={S.y1 + 4} color={c.he4kDialysate} />
            {/* Headers. */}
            <Path
              d={`M ${S.x0} ${S.y0 + 6} C ${S.x0 - 26} ${S.y0 + 6} ${S.x0 - 26} ${S.y1 - 6} ${S.x0} ${S.y1 - 6} Z`}
              fill={c.plastic}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            <Path
              d={`M ${S.x1} ${S.y0 + 6} C ${S.x1 + 26} ${S.y0 + 6} ${S.x1 + 26} ${S.y1 - 6} ${S.x1} ${S.y1 - 6} Z`}
              fill={c.plastic}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            {/* The shell full of dialysate, the fibers through it. */}
            <Rect
              x={S.x0}
              y={S.y0}
              width={len}
              height={S.y1 - S.y0}
              rx={6}
              fill={c.plastic}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            <Rect
              x={S.x0 + 1}
              y={S.y0 + 1}
              width={len - 2}
              height={S.y1 - S.y0 - 2}
              rx={5}
              fill={c.he4kDialysate}
              opacity={0.22}
            />
            {FIBERS.map((y) => (
              <G key={`f${y}`}>
                <Line x1={S.x0} y1={y} x2={S.x1} y2={y} stroke={c.he4kFiber} strokeWidth={7} />
                <Line x1={S.x0} y1={y} x2={S.x1} y2={y} stroke={c.he4kBlood} strokeWidth={3.6} />
              </G>
            ))}
            {/* Dialysate's way between the fibers: chevrons pointing left. */}
            {[89, 99, 109, 119].flatMap((y) =>
              [110, 170, 230].map((x) => (
                <Path
                  key={`v${x}-${y}`}
                  d={`M ${x + 3} ${y - 3} L ${x - 1} ${y} L ${x + 3} ${y + 3}`}
                  stroke={c.he4kDialysate}
                  strokeWidth={1.4}
                  fill="none"
                />
              )),
            )}
            {dots.map((d, i) => (
              <Circle
                key={`u${i}`}
                cx={d.x}
                cy={d.y}
                r={2.8}
                fill={c.he4kUrea}
                stroke={c.he4kFiber}
                strokeWidth={0.8}
              />
            ))}
            <Rect x={S.x0} y={S.y0} width={len} height={S.y1 - S.y0} rx={6} fill={url(ids.shell)} />
            {/* Labels: blood at the top corners, dialysate under its ports. */}
            <ChartText x={4} y={22} fontWeight="700" fill={c.he4kBlood}>
              Blood in
            </ChartText>
            {cinText ? (
              <ChartText x={4} y={38}>
                {cinText}
              </ChartText>
            ) : null}
            {qbText ? (
              <ChartText x={4} y={54}>
                {qbText}
              </ChartText>
            ) : null}
            <ChartText x={BW - 4} y={22} textAnchor="end" fontWeight="700" fill={c.he4kBlood}>
              Blood out
            </ChartText>
            {coutText ? (
              <ChartText x={BW - 4} y={38} textAnchor="end">
                {coutText}
              </ChartText>
            ) : null}
            <ChartText x={96} y={S.y1 + 44} textAnchor="middle" fill={c.he4kDialysate}>
              Dialysate out
            </ChartText>
            <ChartText x={244} y={S.y1 + 44} textAnchor="middle" fill={c.he4kDialysate}>
              Dialysate in
            </ChartText>
            {qdText ? (
              <ChartText x={244} y={S.y1 + 60} textAnchor="middle">
                {qdText}
              </ChartText>
            ) : null}
            {/* The blood flow and its cleared share. */}
            {qb !== undefined ? (
              <G>
                <Rect
                  x={BAND.x0}
                  y={BAND.y0}
                  width={bandW}
                  height={BAND.y1 - BAND.y0}
                  fill={c.he4kBlood}
                  opacity={0.2}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {share !== undefined ? (
                  <Rect
                    x={BAND.x0}
                    y={BAND.y0}
                    width={bandW * share}
                    height={BAND.y1 - BAND.y0}
                    fill={c.he4kCleared}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ) : null}
                {kText ? (
                  <ChartText
                    {...fitLabel(kMid, kText, chart.label, BW)}
                    y={BAND.y0 - 7}
                    fontWeight="700"
                    fill={c.he4kCleared}
                  >
                    {kText}
                  </ChartText>
                ) : null}
                <ChartText x={(BAND.x0 + BAND.x1) / 2} y={BAND.y1 + 17} textAnchor="middle">
                  {share !== undefined
                    ? `Cleared: ${n3(100 * share)}% of Q_b = ${text(spec.qb)}`
                    : `Blood flow Q_b = ${text(spec.qb)}`}
                </ChartText>
              </G>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
