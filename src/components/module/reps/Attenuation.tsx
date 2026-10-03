/**
 * HC161 `attenuation` (AttenuationSpec in typesHe4k.ts). `beam`: twenty photon tracks from an
 * X-ray source into a painted slab drawn to scale across, each stopping at its quantile depth
 * of e^(−μz), half-value layers dashed and marked ½, ¼ …, and the curve I ÷ I₀ = e^(−μz) under
 * it on the same depth axis. `echo`: a probe over two tissues and the pulse's round trip drawn
 * against time, down to the boundary at t ÷ 2 and back at t: d = ct ÷ 2. No handles.
 */
import { View } from 'react-native';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { AttenuationSpec } from '@/data/modules/typesHe4k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText, fitLabel, niceCeil } from './common';
import { Arrow, BW, Board, niceStep } from './fluidKit';
import { echoDepth, PHOTONS, photonDepths, photonRows, reflected } from './he4kMath';
import { n3, useReader, type Reader } from './he4kKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';

const FRACTIONS = ['½', '¼', '⅛', '1/16', '1/32', '1/64', '1/128', '1/256'];

export function Attenuation({ spec, calc }: { spec: AttenuationSpec; calc: Calculator }) {
  const reader = useReader(calc);
  return spec.mode === 'echo' ? (
    <Echo spec={spec} reader={reader} />
  ) : (
    <Beam spec={spec} reader={reader} />
  );
}

// ─── The beam through a slab ────────────────────────────────────────────────────

const S0 = 56;
const S1 = 304;
const TOP = 40;
const BOTTOM = 130;
const AXIS = 138;
const P0 = 172;
const P1 = 240;

function Beam({ spec, reader }: { spec: AttenuationSpec; reader: Reader }) {
  const c = usePalette();
  const ids = usePaintIds('slab', 'box');
  const { get, text, say } = reader;
  const mu = get(spec.mu);
  const x = get(spec.x);
  const okMu = mu !== undefined && mu > 0;
  const okX = x !== undefined && x > 0;
  const T = okMu && okX ? Math.exp(-mu * x) : undefined;
  const hvl = okMu ? Math.LN2 / mu : undefined;
  const span = okX ? x : 1;
  const sx = (z: number) => S0 + (Math.min(z, span) / span) * (S1 - S0);
  const depths = okMu ? photonDepths(mu) : [];
  const rows = photonRows();
  const through = okX ? depths.filter((z) => z > x).length : 0;
  const halves = okX && hvl !== undefined ? Math.floor(x / hvl + 1e-9) : 0;
  const gap = okX && hvl !== undefined ? ((S1 - S0) * hvl) / x : 0;
  // Half-value lines while they stay 6 px apart; labels while 26 px (else every other one).
  const lineEvery = gap >= 6 ? 1 : Math.ceil(6 / Math.max(gap, 1e-9));
  const labelEvery = gap >= 26 ? 1 : gap >= 13 ? 2 : 0;
  // Past ⅛ the fractions widen: they need 40 px each.
  const labelMax = gap >= 40 ? FRACTIONS.length : 3;
  const hvLines = Array.from({ length: Math.min(halves, 400) }, (_, i) => i + 1).filter(
    (k) => k % lineEvery === 0,
  );
  const ticks: number[] = [];
  if (okX) {
    const step = niceStep(x, 4);
    for (let z = 0; z <= x * (1 + 1e-9); z += step) ticks.push(Number(z.toPrecision(10)));
  }
  const curve = okMu
    ? Array.from({ length: 81 }, (_, i) => {
        const z = (span * i) / 80;
        const y = P1 - Math.exp(-mu * z) * (P1 - P0);
        return `${i ? 'L' : 'M'}${sx(z).toFixed(1)},${y.toFixed(1)}`;
      }).join('')
    : '';

  const lines: string[] = [];
  if (T === undefined) lines.push('Type μ and the thickness x to send the beam through.');
  else {
    lines.push(
      `I ÷ I₀ = e^(−μx) = e^(−${text(spec.mu, '', false)} × ${text(spec.x, '', false)}) = ${say(spec.share, 100 * T, '%')} gets through: ${through} of the ${PHOTONS} tracks drawn cross the slab.`,
    );
    lines.push(
      `HVL = ln 2 ÷ μ = ${say(spec.hvl, hvl!, 'cm')}: each one halves the beam, and x holds ${n3(x! / hvl!)} of them.`,
    );
  }

  return (
    <View>
      <Board
        height={252}
        draw={() => (
          <G>
            <Defs>
              <TopLight id={ids.slab} />
              <Sheen id={ids.box} vertical />
            </Defs>
            {/* Source and detector. */}
            <Rect x={4} y={62} width={40} height={46} rx={4} fill={c.metal} />
            <Rect x={4} y={62} width={40} height={46} rx={4} fill={url(ids.box)} />
            <Rect
              x={4}
              y={62}
              width={40}
              height={46}
              rx={4}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <ChartText x={24} y={89} textAnchor="middle" fontWeight="700">
              X-ray
            </ChartText>
            <Rect x={320} y={TOP + 2} width={14} height={BOTTOM - TOP - 4} fill={c.metalDark} />
            <Rect x={320} y={TOP + 2} width={14} height={BOTTOM - TOP - 4} fill={url(ids.box)} />
            {/* The slab. */}
            <Rect
              x={S0}
              y={TOP}
              width={S1 - S0}
              height={BOTTOM - TOP}
              fill={c.he4kSlab}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <Rect x={S0} y={TOP} width={S1 - S0} height={BOTTOM - TOP} fill={url(ids.slab)} />
            {/* Half-value layers. */}
            {hvLines.map((k) => (
              <G key={`h${k}`}>
                <Line
                  x1={sx(k * hvl!)}
                  y1={TOP - 4}
                  x2={sx(k * hvl!)}
                  y2={BOTTOM}
                  stroke={c.he4kHvl}
                  strokeWidth={1.2}
                  strokeDasharray={chart.dashFine}
                />
                <Circle cx={sx(k * hvl!)} cy={P1 - 0.5 ** k * (P1 - P0)} r={2.6} fill={c.he4kHvl} />
                {labelEvery && k % labelEvery === 0 && k <= labelMax ? (
                  <ChartText
                    x={sx(k * hvl!)}
                    y={TOP - 8}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4kHvl}
                  >
                    {FRACTIONS[k - 1]!}
                  </ChartText>
                ) : null}
              </G>
            ))}
            {/* Photon tracks: each stops where it is absorbed or scattered out. */}
            {depths.map((z, i) => {
              const y = TOP + 6 + rows[i]! * ((BOTTOM - TOP - 12) / (PHOTONS - 1));
              const out = okX && z > x!;
              const end = out ? 316 : sx(z);
              return (
                <G key={`p${i}`}>
                  {out ? (
                    <Arrow
                      x1={44}
                      y1={y}
                      x2={end}
                      y2={y}
                      color={c.he4kPhoton}
                      width={1.4}
                      head={6}
                    />
                  ) : (
                    <G>
                      <Line
                        x1={44}
                        y1={y}
                        x2={end}
                        y2={y}
                        stroke={c.he4kPhoton}
                        strokeWidth={1.4}
                      />
                      <Circle cx={end} cy={y} r={2.2} fill={c.he4kPhoton} />
                    </G>
                  )}
                </G>
              );
            })}
            {/* The depth axis. */}
            <Line x1={S0} y1={AXIS} x2={S1} y2={AXIS} stroke={c.chartInk} strokeWidth={1} />
            {ticks.map((z) => (
              <G key={`t${z}`}>
                <Line x1={sx(z)} y1={AXIS} x2={sx(z)} y2={AXIS + 4} stroke={c.chartInk} />
                <ChartText x={sx(z)} y={AXIS + 16} textAnchor="middle" fill={c.chartMuted}>
                  {formatNumber(z)}
                </ChartText>
              </G>
            ))}
            {okX ? (
              <ChartText x={S1 + 14} y={AXIS + 16} fill={c.chartMuted}>
                cm
              </ChartText>
            ) : null}
            {/* I ÷ I₀ against depth. */}
            <Line x1={S0} y1={P0 - 4} x2={S0} y2={P1} stroke={c.chartInk} strokeWidth={1} />
            <Line x1={S0} y1={P1} x2={S1} y2={P1} stroke={c.chartInk} strokeWidth={1} />
            <Line x1={S0} y1={P0} x2={S1} y2={P0} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText x={S0 - 5} y={P0 + 4} textAnchor="end" fill={c.chartMuted}>
              1
            </ChartText>
            <ChartText x={S0 - 5} y={P1 + 4} textAnchor="end" fill={c.chartMuted}>
              0
            </ChartText>
            <ChartText x={4} y={(P0 + P1) / 2 + 4}>
              I ÷ I₀
            </ChartText>
            {okMu ? (
              <Path d={curve} fill="none" stroke={c.he4kPhoton} strokeWidth={chart.stroke} />
            ) : null}
            {T !== undefined ? (
              <G>
                <Circle
                  cx={S1}
                  cy={P1 - T * (P1 - P0)}
                  r={4.5}
                  fill={c.background}
                  stroke={c.he4kPhoton}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  {...fitLabel(S1 - 8, say(spec.share, 100 * T, '%'), chart.label, BW, 'end')}
                  y={P1 - T * (P1 - P0) - 9}
                  fontWeight="700"
                  fill={c.he4kPhoton}
                  halo
                >
                  {say(spec.share, 100 * T, '%')}
                </ChartText>
              </G>
            ) : null}
            {/* Header: μ, and the half-value layer's key. */}
            {text(spec.mu) ? <ChartText x={4} y={16}>{`μ = ${text(spec.mu)}`}</ChartText> : null}
            {hvl !== undefined ? (
              <ChartText x={BW - 4} y={16} textAnchor="end" fill={c.he4kHvl}>
                {`HVL = ${say(spec.hvl, hvl, 'cm')}`}
              </ChartText>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

// ─── The echo ───────────────────────────────────────────────────────────────────

const SKIN = 44;
const DEEP = 214;
const T0 = 134;
const T1 = 324;
const TAXIS = 228;

function Echo({ spec, reader }: { spec: AttenuationSpec; reader: Reader }) {
  const c = usePalette();
  const ids = usePaintIds('tissue', 'probe');
  const { get, text, say, label } = reader;
  const t = get(spec.t);
  const speed = get(spec.c ?? 1540);
  const dGiven = get(spec.d);
  const d = dGiven ?? (t !== undefined && speed !== undefined ? echoDepth(speed, t) : undefined);
  const okT = t !== undefined && t > 0;
  const okD = d !== undefined && d > 0;
  const dMax = okD ? niceCeil(d * 1.3) : 10;
  const yB = okD ? SKIN + ((DEEP - SKIN) * d) / dMax : (SKIN + DEEP) / 2;
  const tx = (f: number) => T0 + f * (T1 - T0);
  const z1 = get(spec.z1);
  const z2 = get(spec.z2);
  const R = z1 !== undefined && z2 !== undefined && z1 + z2 > 0 ? reflected(z1, z2) : undefined;
  const [name1, name2] = spec.layers ?? ['Tissue 1', 'Tissue 2'];
  const z1Text = label('Z₁', spec.z1);
  const z2Text = label('Z₂', spec.z2);
  const dText = okD ? `d = ${say(spec.d, d, 'cm')}` : undefined;
  const rText = R === undefined ? undefined : `R = ${say(spec.r, 100 * R, '%')} returns`;

  const lines: string[] = [];
  if (okT && okD)
    lines.push(
      `d = ct ÷ 2 = ${text(spec.c ?? 1540, 'm/s', false)} × ${text(spec.t, '', false)} × 10⁻⁶ ÷ 2 = ${n3(d / 100)} m = ${say(spec.d, d, 'cm')}: the pulse goes down and back, so the boundary is half the round trip deep.`,
    );
  else lines.push('Type the echo time t to place the boundary.');
  if (R !== undefined)
    lines.push(
      `R = ((Z₂ − Z₁) ÷ (Z₂ + Z₁))² = ((${text(spec.z2, '', false)} − ${text(spec.z1, '', false)}) ÷ (${text(spec.z2, '', false)} + ${text(spec.z1, '', false)}))² = ${say(spec.r, 100 * R, '%')} of the intensity comes back; the rest goes on (dashed).`,
    );

  return (
    <View>
      <Board
        height={258}
        draw={() => (
          <G>
            <Defs>
              <TopLight id={ids.tissue} />
              <Sheen id={ids.probe} />
            </Defs>
            {/* The two tissues, to scale in depth. */}
            <Rect x={0} y={SKIN} width={BW} height={yB - SKIN} fill={c.he4kFat} />
            <Rect x={0} y={yB} width={BW} height={DEEP - yB} fill={c.he4kMuscle} />
            <Rect x={0} y={SKIN} width={BW} height={DEEP - SKIN} fill={url(ids.tissue)} />
            <Line x1={0} y1={SKIN} x2={BW} y2={SKIN} stroke={c.chartInk} strokeWidth={1.5} />
            {okD ? (
              <Line x1={0} y1={yB} x2={BW} y2={yB} stroke={c.chartInk} strokeWidth={1.5} />
            ) : null}
            {/* The probe on the skin, over time zero. */}
            <Path
              d={`M ${T0 - 16} ${SKIN} L ${T0 - 12} 12 Q ${T0} 4 ${T0 + 12} 12 L ${T0 + 16} ${SKIN} Z`}
              fill={c.plastic}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />
            <Path
              d={`M ${T0 - 16} ${SKIN} L ${T0 - 12} 12 Q ${T0} 4 ${T0 + 12} 12 L ${T0 + 16} ${SKIN} Z`}
              fill={url(ids.probe)}
            />
            <ChartText x={T0 - 22} y={24} textAnchor="end" fontWeight="700">
              Probe
            </ChartText>
            {/* Tissue names and impedances, left of the pulse. */}
            <ChartText x={6} y={SKIN + 18} fontWeight="700">
              {name1}
            </ChartText>
            {z1Text ? (
              <ChartText x={6} y={SKIN + 34}>
                {z1Text}
              </ChartText>
            ) : null}
            {okD ? (
              <G>
                <ChartText x={6} y={yB + 18} fontWeight="700">
                  {name2}
                </ChartText>
                {z2Text ? (
                  <ChartText x={6} y={yB + 34}>
                    {z2Text}
                  </ChartText>
                ) : null}
              </G>
            ) : null}
            {/* The round trip: down at c, back at c; the transmitted part goes on. */}
            {okT && okD ? (
              <G>
                <Arrow
                  x1={tx(0)}
                  y1={SKIN}
                  x2={tx(0.5)}
                  y2={yB}
                  color={c.he4kPulse}
                  width={chart.stroke}
                />
                <Arrow
                  x1={tx(0.5)}
                  y1={yB}
                  x2={tx(1)}
                  y2={SKIN}
                  color={c.he4kPulse}
                  width={chart.stroke}
                />
                <Line
                  x1={tx(0.5)}
                  y1={yB}
                  x2={tx(0.5) + ((tx(0.5) - tx(0)) * (DEEP - yB)) / (yB - SKIN)}
                  y2={DEEP}
                  stroke={c.he4kPulse}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                <Circle cx={tx(0.5)} cy={yB} r={4} fill={c.he4kPulse} />
                {dText ? (
                  <ChartText x={BW - 6} y={yB - 7} textAnchor="end" fontWeight="700" halo>
                    {dText}
                  </ChartText>
                ) : null}
                {rText ? (
                  <ChartText x={BW - 4} y={24} textAnchor="end" fill={c.he4kPulse} fontWeight="700">
                    {rText}
                  </ChartText>
                ) : null}
              </G>
            ) : null}
            {/* Time along the bottom. */}
            <Line x1={T0} y1={TAXIS} x2={T1} y2={TAXIS} stroke={c.chartInk} strokeWidth={1} />
            {okT
              ? [0, 0.5, 1].map((f) => {
                  const s =
                    f === 0 ? '0' : f === 0.5 ? `t ÷ 2 = ${n3(t / 2)}` : `t = ${text(spec.t)}`;
                  return (
                    <G key={`k${f}`}>
                      <Line x1={tx(f)} y1={TAXIS} x2={tx(f)} y2={TAXIS + 4} stroke={c.chartInk} />
                      <ChartText
                        {...fitLabel(tx(f), s, chart.label, BW)}
                        y={TAXIS + 18}
                        fill={c.chartMuted}
                      >
                        {s}
                      </ChartText>
                    </G>
                  );
                })
              : null}
            <ChartText x={T0 - 8} y={TAXIS + 4} textAnchor="end" fill={c.chartMuted}>
              time
            </ChartText>
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
