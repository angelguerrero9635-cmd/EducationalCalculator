/**
 * Electrons in atoms (H45), flat diagrams:
 * - `boxes`: orbital boxes at their energies, filled in Aufbau order (the 4s box below 3d),
 *   one up arrow in each box of a subshell before any pairs (Hund's rule), a pair always one
 *   up and one down (Pauli); the configuration written above.
 * - `ladder`: hydrogen's energy levels to scale, an electron's drop from one level to a lower
 *   one, and the photon it gives off, placed on the spectrum.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { OrbitalDiagramSpec } from '@/data/modules/typesHsi';
import { isOrbitalHe4d, type OrbitalHe4dSpec } from '@/data/modules/typesHe4d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { chargeSup } from './AtomModel';
import { OrbitalHe4d } from './OrbitalHe4d';
import { element } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  AUFBAU,
  arrowsIn,
  aufbauRank,
  bandOf,
  configuration,
  isException,
  levelEnergy,
  notation,
  orbitals,
  photonEnergy,
  photonWavelength,
  RYDBERG_EV,
  seriesOf,
  shorthand,
  subshellName,
  unpaired,
  type Subshell,
} from './electrons';
import { reader } from './graphKit';
import { MathChip } from './hsdText';
import { url, usePaintIds } from './paint';
import { OrbitalMo } from './OrbitalMo';

export function OrbitalDiagram({ spec, calc }: { spec: OrbitalDiagramSpec; calc: Calculator }) {
  if (isOrbitalHe4d(spec)) return <OrbitalHe4d spec={spec} calc={calc} />; // HC109, HC110
  if (spec.mode === 'ladder') return <Ladder spec={spec} calc={calc} />;
  if (spec.mode === 'mo') return <OrbitalMo spec={spec} calc={calc} />; // HC70
  return <Boxes spec={spec} calc={calc} />;
}

// ─── Boxes ───────────────────────────────────────────────────────────────────

const STEP = 44;
const TOP = 34;

function Boxes({
  spec,
  calc,
}: {
  spec: Extract<OrbitalDiagramSpec, { mode: 'boxes' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const zr = spec.element === undefined ? undefined : read(spec.element);
  const er = spec.electrons === undefined ? zr! : read(spec.electrons);
  const e = Math.max(0, Math.round(er.value));
  const z = zr ? Math.max(1, Math.round(zr.value)) : e;
  const known = er.known && (zr?.known ?? true);
  const cfg = configuration(z, e);
  const el = zr ? element(z) : undefined;
  const q = z - e;
  // Every subshell up to the highest one holding electrons, empty ones as open boxes.
  const last = Math.max(0, ...cfg.map(aufbauRank));
  const shown: Subshell[] = AUFBAU.slice(0, last + 1).map(([n, l]) => ({
    n,
    l,
    e: cfg.find((s) => s.n === n && s.l === l)?.e ?? 0,
  }));
  const ns = [...new Set(shown.map((s) => s.n))].sort((a, b) => a - b);
  const colBoxes = ns.map((n) =>
    Math.max(...shown.filter((s) => s.n === n).map((s) => orbitals(s.l))),
  );
  const text = notation(cfg);
  const short = shorthand(cfg);
  const single = unpaired(cfg);
  const height = TOP + (last + 1) * STEP + 8;
  const ionText = chargeSup(q);

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const left = 30;
          const gap = 12;
          const bw = Math.min(
            24,
            (w - left - 8 - gap * (ns.length - 1)) / colBoxes.reduce((a, b) => a + b, 0),
          );
          const colX: number[] = [];
          let x =
            left +
            (w - left - 8 - (colBoxes.reduce((a, b) => a + b, 0) * bw + gap * (ns.length - 1))) / 2;
          colBoxes.forEach((k) => {
            colX.push(x);
            x += k * bw + gap;
          });
          const yOf = (rank: number) => h - 26 - rank * STEP;
          const arrow = (ax: number, y0: number, up: boolean, color: string) => {
            const [a, b] = up ? [y0 + bw - 4, y0 + 4] : [y0 + 4, y0 + bw - 4];
            const d = up ? 1 : -1;
            return (
              <G>
                <Line x1={ax} y1={a} x2={ax} y2={b + d * 3} stroke={color} strokeWidth={1.8} />
                <Path d={`M ${ax} ${b} l -3.5 ${d * 5} l 7 0 z`} fill={color} />
              </G>
            );
          };
          return (
            <Svg width={w} height={h}>
              {/* Energy rises up the page. */}
              <Line
                x1={12}
                y1={h - 20}
                x2={12}
                y2={TOP + 4}
                stroke={c.chartMuted}
                strokeWidth={1.2}
              />
              <Path d={`M 12 ${TOP} l -4 8 l 8 0 z`} fill={c.chartMuted} />
              <ChartText x={20} y={TOP + 6} fontSize={chart.label} fill={c.chartMuted}>
                Energy
              </ChartText>
              <ChartText
                x={w / 2}
                y={18}
                fontSize={chart.emphasis}
                fontWeight="700"
                textAnchor="middle"
                opacity={known ? 1 : 0.4}
              >
                {`${el ? `${el.symbol}${ionText ? ionText : ''}: ` : ''}${known ? text || '(no electrons)' : '?'}`}
              </ChartText>
              <G opacity={known ? 1 : 0.35}>
                {shown.map((s) => {
                  const col = ns.indexOf(s.n);
                  const k = orbitals(s.l);
                  const x0 = colX[col]! + ((colBoxes[col]! - k) * bw) / 2;
                  const y0 = yOf(aufbauRank(s)) - bw;
                  const arrows = arrowsIn(s);
                  return (
                    <G key={subshellName(s)}>
                      {arrows.map((a, i) => (
                        <G key={i}>
                          <Rect
                            x={x0 + i * bw}
                            y={y0}
                            width={bw}
                            height={bw}
                            fill={c.card}
                            stroke={c.chartInk}
                            strokeWidth={1.2}
                          />
                          {a >= 1
                            ? arrow(
                                x0 + i * bw + (a === 2 ? bw * 0.32 : bw / 2),
                                y0,
                                true,
                                a === 1 ? c.chartHighlight : c.chartInk,
                              )
                            : null}
                          {a === 2 ? arrow(x0 + i * bw + bw * 0.68, y0, false, c.chartInk) : null}
                        </G>
                      ))}
                      <ChartText
                        x={x0 + (k * bw) / 2}
                        y={y0 + bw + 13}
                        fontSize={chart.label}
                        fontWeight="700"
                        textAnchor="middle"
                        fill={s.e ? c.chartInk : c.chartMuted}
                      >
                        {subshellName(s)}
                      </ChartText>
                    </G>
                  );
                })}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? [
              `${e} electrons${el ? ` (${el.name}${ionText ? ` ion, charge ${q > 0 ? '+' : '−'}${Math.abs(q)}` : ''})` : ''}: ${short}.`,
              'Boxes fill from the lowest energy up; each box of a subshell takes one arrow before any takes two, and two arrows in a box point opposite ways.',
              `Unpaired electrons (single arrows, lit): ${single}.`,
              q === 0 && isException(z)
                ? `${el?.name} is an exception: an s electron moves into d, which is then half full or full.`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the number of electrons.'}
      </Caption>
    </View>
  );
}

// ─── Ladder ──────────────────────────────────────────────────────────────────

/** A wavelength's color in the visible band, or undefined outside it. */
function spectrumColor(nm: number, c: Palette): string | undefined {
  if (nm < 380 || nm > 750) return undefined;
  if (nm < 450) return c.spectrumViolet;
  if (nm < 495) return c.spectrumBlue;
  if (nm < 570) return c.spectrumGreen;
  if (nm < 590) return c.spectrumYellow;
  if (nm < 620) return c.spectrumOrange;
  return c.spectrumRed;
}

function Ladder({
  spec,
  calc,
}: {
  spec: Exclude<Extract<OrbitalDiagramSpec, { mode: 'ladder' }>, OrbitalHe4dSpec>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('band');
  const ur = read(spec.upper);
  const lr = read(spec.lower);
  const levels = spec.levels ?? 6;
  const up = Math.round(ur.value);
  const lo = Math.round(lr.value);
  const known = ur.known && lr.known && up > lo;
  // A "?" level is not marked: the example's levels are not drawn behind a "?".
  const upMark = ur.known ? up : NaN;
  const loMark = lr.known ? lo : NaN;
  const E = known ? photonEnergy(up, lo) : undefined;
  const nm = E ? photonWavelength(E) : undefined;
  const color = nm ? spectrumColor(nm, c) : undefined;
  const series = seriesOf(lo);

  return (
    <View>
      <Canvas aspect={(w) => 370 / w}>
        {({ w, h }) => {
          const top = 40;
          const bottom = h - 110;
          // A drop between higher levels zooms in: the scale starts a little below the lower
          // level, and the levels under it are listed below a break.
          const floor = known && lo > 1 ? levelEnergy(lo) * 1.2 : -RYDBERG_EV;
          const yOf = (en: number) => top + (en / floor) * (bottom - top);
          const all = Array.from({ length: levels }, (_, i) => i + 1);
          const below = all.filter((n) => levelEnergy(n) < floor - 1e-9);
          const x0 = 58;
          const x1 = Math.min(w - 110, 250);
          const ax = x0 + (x1 - x0) * 0.45;
          // Labels skip a level too close to the one below it.
          let lastY = Infinity;
          const zeroY = top - 4;
          const labelled = all
            .filter((n) => !below.includes(n))
            .map((n) => {
              const y = yOf(levelEnergy(n));
              const show = (lastY - y >= 13 && y - zeroY >= 14) || n === upMark || n === loMark;
              if (show) lastY = y;
              return { n, y, show: show && (n <= 4 || n === up || n === lo) };
            });
          const zig = (y: number) =>
            `M ${x0} ${y} ` +
            Array.from(
              { length: 12 },
              (_, k) => `L ${x0 + ((k + 1) * (x1 - x0)) / 12} ${y + (k % 2 ? -4 : 4)}`,
            ).join(' ');
          const sy0 = h - 44;
          const sx = (lam: number) => 16 + ((lam - 380) / (750 - 380)) * (w - 32);
          const wave = (xa: number, ya: number, len: number) =>
            Array.from({ length: 25 }, (_, k) => {
              const t = k / 24;
              return `${k === 0 ? 'M' : 'L'} ${xa + t * len} ${ya + Math.sin(t * Math.PI * 6) * 5}`;
            }).join(' ');
          return (
            <Svg width={w} height={h}>
              <Defs>
                <LinearGradient id={ids.band} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={c.spectrumViolet} />
                  <Stop offset="0.2" stopColor={c.spectrumBlue} />
                  <Stop offset="0.42" stopColor={c.spectrumGreen} />
                  <Stop offset="0.55" stopColor={c.spectrumYellow} />
                  <Stop offset="0.66" stopColor={c.spectrumOrange} />
                  <Stop offset="1" stopColor={c.spectrumRed} />
                </LinearGradient>
              </Defs>
              <Line
                x1={x0}
                y1={top}
                x2={x1}
                y2={top}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <ChartText x={x1 + 6} y={zeroY} fontSize={chart.label} fill={c.chartMuted}>
                0 eV (free)
              </ChartText>
              {labelled.map(({ n, y, show }) => (
                <G key={n}>
                  <Line
                    x1={x0}
                    y1={y}
                    x2={x1}
                    y2={y}
                    stroke={n === upMark || n === loMark ? c.chartInk : c.chartMuted}
                    strokeWidth={n === upMark || n === loMark ? chart.stroke : 1.2}
                  />
                  {show ? (
                    <>
                      <ChartText
                        x={x0 - 6}
                        y={y + 4}
                        fontSize={chart.label}
                        fontWeight="700"
                        textAnchor="end"
                      >
                        {`n = ${n}`}
                      </ChartText>
                      <ChartText x={x1 + 6} y={y + 4} fontSize={chart.label} fill={c.chartMuted}>
                        {`${formatNumber(Number(levelEnergy(n).toFixed(2)))} eV`}
                      </ChartText>
                    </>
                  ) : null}
                </G>
              ))}
              {below.length ? (
                <G>
                  <Path d={zig(bottom + 14)} fill="none" stroke={c.chartMuted} strokeWidth={1.2} />
                  <ChartText x={x0} y={bottom + 32} fontSize={chart.label} fill={c.chartMuted}>
                    {`Below: ${below
                      .slice()
                      .reverse()
                      .map(
                        (n) => `n = ${n} (${formatNumber(Number(levelEnergy(n).toFixed(2)))} eV)`,
                      )
                      .join(', ')}`}
                  </ChartText>
                </G>
              ) : null}
              {known ? (
                <G>
                  <Line
                    x1={ax}
                    y1={yOf(levelEnergy(up))}
                    x2={ax}
                    y2={yOf(levelEnergy(lo)) - 8}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Path
                    d={`M ${ax} ${yOf(levelEnergy(lo))} l -6 -10 l 12 0 z`}
                    fill={c.chartHighlight}
                  />
                  <Path
                    d={wave(
                      ax + 10,
                      (yOf(levelEnergy(up)) + yOf(levelEnergy(lo))) / 2,
                      x1 - ax - 16,
                    )}
                    fill="none"
                    stroke={color ?? c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <MathChip
                    x={ax - 8}
                    y={(yOf(levelEnergy(up)) + yOf(levelEnergy(lo))) / 2 + 5}
                    text={`${formatNumber(Number(E!.toPrecision(3)))} eV`}
                    w={w}
                    h={h}
                    anchor="end"
                  />
                </G>
              ) : null}
              {/* The visible spectrum, the line marked on it (or an arrow to where it is). */}
              <Rect x={16} y={sy0} width={w - 32} height={16} rx={3} fill={url(ids.band)} />
              <ChartText x={16} y={sy0 + 30} fontSize={chart.label} fill={c.chartMuted}>
                380 nm
              </ChartText>
              <ChartText
                x={w - 16}
                y={sy0 + 30}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="end"
              >
                750 nm
              </ChartText>
              {nm && color ? (
                <G>
                  <Rect x={sx(nm) - 2} y={sy0 - 6} width={4} height={28} fill={c.chartInk} />
                  <ChartText
                    x={Math.min(w - 60, Math.max(60, sx(nm)))}
                    y={sy0 - 10}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {`${formatNumber(Math.round(nm))} nm`}
                  </ChartText>
                </G>
              ) : nm ? (
                <ChartText
                  x={nm < 380 ? 16 : w - 16}
                  y={sy0 - 10}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor={nm < 380 ? 'start' : 'end'}
                >
                  {nm < 380
                    ? `← ${formatNumber(Math.round(nm))} nm (ultraviolet)`
                    : `${formatNumber(Math.round(nm))} nm (infrared) →`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known && E && nm
          ? [
              `The electron drops from n = ${up} to n = ${lo}${series ? ` (the ${series} series)` : ''}.`,
              lo > 1
                ? `Drawn to scale from n = ${lo} up; the lower levels are listed below the break.`
                : undefined,
              `Photon energy = 13.6 × (1/${lo}² − 1/${up}²) = ${formatNumber(Number(E.toPrecision(4)))} eV.`,
              `Wavelength = 1240 ÷ ${formatNumber(Number(E.toPrecision(4)))} = ${formatNumber(Math.round(nm))} nm: ${bandOf(nm)}.`,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type an upper level above the lower one.'}
      </Caption>
    </View>
  );
}
