/**
 * HC13 `velocityProfile`: velocity arrows across a tube or a blood vessel cut lengthwise, between
 * two plates or through a falling film; a concentration line across a film or up a Stefan tube;
 * and three boundary layers side by side (VelocityProfileSpec in typesHe1f.ts). Tubes, plates,
 * walls and glass are painted; the profiles, scales and brackets stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { VelocityProfileSpec } from '@/data/modules/typesHe1f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import { Deepen, Glass, Sheen, url, usePaintIds } from './paint';
import {
  filmSpeed,
  layerRatio,
  plateSpeed,
  siGetter,
  stefanFlux,
  stefanFraction,
  TUBE_STATIONS,
  tubeCentre,
  tubeSpeed,
} from './velocityProfileMath';

const BW = 356;

/** A dimension bracket from (x1, y1) to (x2, y2) with end ticks, its label beside the middle. */
function Bracket({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) {
  const across = x1 === x2;
  const t = 5;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.2} />
      {across ? (
        <G>
          <Line x1={x1 - t} x2={x1 + t} y1={y1} y2={y1} stroke={color} strokeWidth={1.2} />
          <Line x1={x2 - t} x2={x2 + t} y1={y2} y2={y2} stroke={color} strokeWidth={1.2} />
        </G>
      ) : (
        <G>
          <Line x1={x1} x2={x1} y1={y1 - t} y2={y1 + t} stroke={color} strokeWidth={1.2} />
          <Line x1={x2} x2={x2} y1={y2 - t} y2={y2 + t} stroke={color} strokeWidth={1.2} />
        </G>
      )}
    </G>
  );
}

/** Velocity and concentration profiles (VelocityProfileSpec). */
export function VelocityProfile({ spec, calc }: { spec: VelocityProfileSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('wall', 'sheen', 'fluid', 'glass', 'liquid');
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar) => (typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined);
  const si = siGetter(spec, get);
  /** The label of a field ("R = 0.001 m"), or undefined while it is "?". */
  const lab = (field: keyof VelocityProfileSpec) => {
    const x = spec[field];
    if (typeof x === 'string') return valueLabel(x);
    if (typeof x === 'number') return `${field} = ${formatNumber(x)}`;
    return undefined;
  };
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);

  let body: ReactNode = null;
  let BH = 250;
  let caption = '';

  // ── A tube or a vessel cut lengthwise ──
  if (spec.mode === 'tube') {
    const R = si('R');
    const Q = si('Q');
    const vavg0 = si('vavg');
    const vmax =
      si('vmax') ??
      (vavg0 !== undefined ? 2 * vavg0 : Q !== undefined && R ? tubeCentre(Q, R) : undefined);
    const vavg = vmax === undefined ? undefined : vmax / 2;
    const top = 44;
    const wall = 11;
    const rpx = 62;
    const cy = top + wall + rpx;
    const x0 = 34;
    const x1 = BW - 34;
    const sx = 112;
    const full = 120;
    /** Under the tube: the first row of labels, the L bracket, then the speed scale. */
    const b0 = cy + rpx + wall;
    const scale = vmax !== undefined && vmax > 0 ? niceCeil(vmax) : undefined;
    const len = (v: number) => (scale ? (v / scale) * full : 0);
    const vessel = !!spec.vessel;
    const wallFill = url(paint.wall);
    const env = scale
      ? Array.from({ length: 41 }, (_, k) => {
          const s = -1 + k / 20;
          return `${k ? 'L' : 'M'} ${sx + len(tubeSpeed(vmax!, s))} ${cy + s * rpx}`;
        }).join(' ')
      : '';
    const dP =
      si('dP') ??
      (si('P1') !== undefined && si('P2') !== undefined ? si('P1')! - si('P2')! : undefined);
    const tau = si('tauW');
    const Re = si('Re');
    BH = b0 + 80;
    body = (
      <G>
        {/* The fluid, and the walls cut lengthwise (steel, or a vessel's wall). */}
        <Rect
          x={x0}
          y={top + wall}
          width={x1 - x0}
          height={2 * rpx}
          fill={vessel ? c.profileBlood : c.water}
          opacity={vessel ? 0.22 : 0.3}
        />
        {[top, cy + rpx].map((y) => (
          <G key={y}>
            <Rect
              x={x0}
              y={y}
              width={x1 - x0}
              height={wall}
              rx={vessel ? 5 : 1}
              fill={wallFill}
              stroke={vessel ? c.profileBlood : c.metalDark}
              strokeWidth={1}
            />
            <Rect
              x={x0}
              y={y}
              width={x1 - x0}
              height={wall}
              rx={vessel ? 5 : 1}
              fill={url(paint.sheen)}
            />
          </G>
        ))}
        <Line
          x1={x0}
          x2={x1}
          y1={cy}
          y2={cy}
          stroke={c.chartMuted}
          strokeDasharray={chart.dashFine}
        />
        {/* The station's arrows, v = v_max(1 − r²/R²), and the parabola through their tips. */}
        <Line x1={sx} x2={sx} y1={top + wall} y2={cy + rpx} stroke={c.chartInk} strokeWidth={1} />
        {scale &&
          TUBE_STATIONS.map((s) => {
            const l = len(tubeSpeed(vmax!, s));
            return l > 3 ? (
              <Arrow
                key={s}
                x1={sx}
                y1={cy + s * rpx}
                x2={sx + l}
                y2={cy + s * rpx}
                color={c.chartHighlight}
                width={2}
              />
            ) : null;
          })}
        {scale && (
          <Path
            d={env}
            stroke={c.chartHighlight}
            strokeWidth={1.2}
            strokeDasharray={chart.dash}
            fill="none"
          />
        )}
        {/* v_avg: the mean, half the centre speed. */}
        {scale && vavg !== undefined && (
          <G>
            <Line
              x1={sx + len(vavg)}
              x2={sx + len(vavg)}
              y1={top + wall + 4}
              y2={b0 + 6}
              stroke={c.chartInk}
              strokeDasharray={chart.dash}
            />
            <ChartText x={sx + len(vavg) + 4} y={b0 + 16} fontSize={chart.label}>
              {lab('vavg') ?? `v_avg = ${r4(vavg)} m/s`}
            </ChartText>
          </G>
        )}
        {scale && vmax !== undefined && (
          <ChartText
            x={sx + len(vmax) + 6}
            y={cy + 4}
            fontSize={chart.label}
            fontWeight="bold"
            fill={c.chartHighlight}
            halo
          >
            {lab('vmax') ?? `v_max = ${r4(vmax)} m/s`}
          </ChartText>
        )}
        {/* τ_w: the fluid drags the wall along, ticks just inside each wall. */}
        {tau !== undefined &&
          [top + wall + 3, cy + rpx - 3].flatMap((y) =>
            [x1 - 100, x1 - 70, x1 - 40].map((x) => (
              <Arrow
                key={`${x}-${y}`}
                x1={x - 12}
                y1={y}
                x2={x + 6}
                y2={y}
                color={c.hopBack}
                width={1.5}
              />
            )),
          )}
        {tau !== undefined && (
          <ChartText x={x1} y={top - 6} fontSize={chart.label} textAnchor="end" fill={c.hopBack}>
            {lab('tauW') ?? ''}
          </ChartText>
        )}
        {/* R from the axis to the wall. */}
        {R !== undefined && (
          <G>
            <Bracket x1={x1 - 10} y1={cy} x2={x1 - 10} y2={top + wall} color={c.chartInk} />
            <ChartText x={x1 - 18} y={top + wall + 30} fontSize={chart.label} textAnchor="end" halo>
              {lab('R') ?? ''}
            </ChartText>
          </G>
        )}
        {/* The ends: P₁ and P₂ (or ΔP), and L between them. */}
        {lab('P1') && (
          <ChartText x={x0} y={top - 6} fontSize={chart.label}>
            {lab('P1')!}
          </ChartText>
        )}
        {lab('P2') && (
          <ChartText x={x1} y={b0 + 16} fontSize={chart.label} textAnchor="end">
            {lab('P2')!}
          </ChartText>
        )}
        {!lab('P1') && lab('dP') && (
          <ChartText x={x0} y={top - 6} fontSize={chart.label}>
            {lab('dP')!}
          </ChartText>
        )}
        {/* The flow rate the arrows are drawn from, over the tube. */}
        {lab('Q') && (
          <ChartText x={x0} y={top - 22} fontSize={chart.label} fontWeight="bold">
            {lab('Q')!}
          </ChartText>
        )}
        {lab('L') && (
          <G>
            <Bracket x1={x0} y1={b0 + 28} x2={x1} y2={b0 + 28} color={c.chartInk} />
            <ChartText x={(x0 + x1) / 2} y={b0 + 44} fontSize={chart.label} textAnchor="middle">
              {lab('L')!}
            </ChartText>
          </G>
        )}
        <Arrow x1={x0} y1={b0 + 12} x2={x0 + 36} y2={b0 + 12} color={c.chartMuted} width={1.5} />
        <ChartText x={x0 + 42} y={b0 + 16} fontSize={chart.label} fill={c.chartMuted}>
          flow
        </ChartText>
        {/* The speed scale under the station. */}
        {scale && (
          <G>
            <Line x1={sx} x2={sx + full} y1={b0 + 56} y2={b0 + 56} stroke={c.chartMuted} />
            {[0, 0.5, 1].map((f) => (
              <G key={f}>
                <Line
                  x1={sx + f * full}
                  x2={sx + f * full}
                  y1={b0 + 52}
                  y2={b0 + 60}
                  stroke={c.chartMuted}
                />
                <ChartText
                  x={sx + f * full}
                  y={b0 + 74}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {`${formatNumber(Number((f * scale).toPrecision(3)))}${f === 1 ? ' m/s' : ''}`}
                </ChartText>
              </G>
            ))}
          </G>
        )}
      </G>
    );
    const bits: string[] = [];
    if (vmax !== undefined && vavg !== undefined)
      bits.push(`v_max = 2v_avg = 2 × ${r4(vavg)} = ${r4(vmax)} m/s at the centre, 0 at the wall.`);
    if (dP !== undefined && R !== undefined && si('L') && tau !== undefined)
      bits.push(`τ_w = ΔPR ÷ 2L = ${r4(tau)} Pa.`);
    if (Re !== undefined && !spec.vessel)
      bits.push(
        Re < 2100
          ? `Re = ${r4(Re)}: laminar.`
          : `Re = ${r4(Re)}: past 2100 the parabola no longer holds.`,
      );
    bits.push(`Not to scale: the ${vessel ? 'vessel' : 'tube'} is far longer than it is wide.`);
    caption = vmax === undefined ? 'Type the flow to draw the profile.' : bits.join(' ');
  }

  // ── Two plates: Couette flow ──
  if (spec.mode === 'plates') {
    const V = si('V');
    const top = 52;
    const gap = 120;
    const bot = top + gap;
    const sx = 150;
    const full = 150;
    const arrows = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
    BH = 236;
    body = (
      <G>
        <Rect x={40} y={top} width={BW - 80} height={gap} fill={c.water} opacity={0.25} />
        {[top - 14, bot].map((y) => (
          <G key={y}>
            <Rect
              x={40}
              y={y}
              width={BW - 80}
              height={14}
              fill={url(paint.wall)}
              stroke={c.metalDark}
            />
            <Rect x={40} y={y} width={BW - 80} height={14} fill={url(paint.sheen)} />
          </G>
        ))}
        <Line x1={sx} x2={sx} y1={top} y2={bot} stroke={c.chartInk} />
        {V !== undefined &&
          arrows.map((eta) => (
            <Arrow
              key={eta}
              x1={sx}
              y1={bot - eta * gap}
              x2={sx + (plateSpeed(V, eta) / V) * full}
              y2={bot - eta * gap}
              color={c.chartHighlight}
              width={2}
            />
          ))}
        {V !== undefined && (
          <Line
            x1={sx}
            y1={bot}
            x2={sx + full}
            y2={top}
            stroke={c.chartHighlight}
            strokeDasharray={chart.dash}
          />
        )}
        {/* The top plate moves at V; the bottom one is still. */}
        <Arrow
          x1={BW - 130}
          y1={top - 26}
          x2={BW - 50}
          y2={top - 26}
          color={c.chartInk}
          width={3}
        />
        <ChartText
          x={BW - 136}
          y={top - 22}
          fontSize={chart.label}
          textAnchor="end"
          fontWeight="bold"
        >
          {lab('V') ?? 'moving plate'}
        </ChartText>
        <ChartText
          x={BW - 44}
          y={bot + 30}
          fontSize={chart.label}
          textAnchor="end"
          fill={c.chartMuted}
        >
          still plate
        </ChartText>
        <Bracket x1={60} y1={top} x2={60} y2={bot} color={c.chartInk} />
        <ChartText x={66} y={(top + bot) / 2 + 4} fontSize={chart.label}>
          {lab('h') ?? 'h'}
        </ChartText>
        {lab('tauW') && (
          <ChartText
            x={sx - 6}
            y={top + 16}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.hopBack}
          >
            {lab('tauW')!}
          </ChartText>
        )}
      </G>
    );
    const tau = si('tauW');
    caption =
      V === undefined
        ? 'Type the plate’s speed to draw the profile.'
        : `A straight line from 0 at the still plate to V at the moving one${tau !== undefined ? `; τ = μV ÷ h = ${r4(tau)} Pa everywhere in the gap` : ''}.`;
  }

  // ── A film falling down a wall ──
  if (spec.mode === 'film') {
    const vavg = si('vavg');
    const vmax = si('vmax') ?? (vavg !== undefined ? 1.5 * vavg : undefined);
    const beta = si('angle') ?? 0;
    const wx = 70;
    const fw = 80;
    const y0 = 30;
    const y1 = 210;
    const sy = 70;
    const full = 110;
    const scale = vmax !== undefined && vmax > 0 ? niceCeil(vmax) : undefined;
    const len = (v: number) => (scale ? (v / scale) * full : 0);
    const etas = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
    BH = 250;
    body = (
      <G transform={`rotate(${-beta} ${wx} ${(y0 + y1) / 2})`}>
        <Rect
          x={wx - 18}
          y={y0}
          width={18}
          height={y1 - y0}
          fill={url(paint.wall)}
          stroke={c.metalDark}
        />
        <Rect x={wx - 18} y={y0} width={18} height={y1 - y0} fill={url(paint.sheen)} />
        <Rect x={wx} y={y0} width={fw} height={y1 - y0} fill={url(paint.liquid)} opacity={0.55} />
        <Line x1={wx} x2={wx + fw} y1={sy} y2={sy} stroke={c.chartInk} />
        {scale &&
          etas.map((eta) => (
            <Arrow
              key={eta}
              x1={wx + eta * fw}
              y1={sy}
              x2={wx + eta * fw}
              y2={sy + len(filmSpeed(vmax!, eta))}
              color={c.chartHighlight}
              width={2}
            />
          ))}
        {scale && (
          <Path
            d={Array.from(
              { length: 21 },
              (_, k) =>
                `${k ? 'L' : 'M'} ${wx + (k / 20) * fw} ${sy + len(filmSpeed(vmax!, k / 20))}`,
            ).join(' ')}
            stroke={c.chartHighlight}
            strokeDasharray={chart.dash}
            fill="none"
          />
        )}
        {scale && vavg !== undefined && (
          <Line
            x1={wx + 2}
            x2={wx + fw}
            y1={sy + len(vavg)}
            y2={sy + len(vavg)}
            stroke={c.chartInk}
            strokeDasharray={chart.dash}
          />
        )}
        <Bracket x1={wx} y1={y1 + 10} x2={wx + fw} y2={y1 + 10} color={c.chartInk} />
      </G>
    );
    const labels = (
      <G>
        <ChartText x={wx + fw + 14} y={sy + 4} fontSize={chart.label}>
          free surface
        </ChartText>
        {scale && vmax !== undefined && (
          <ChartText
            x={wx + fw + 14}
            y={sy + len(vmax) + 4}
            fontSize={chart.label}
            fontWeight="bold"
            fill={c.chartHighlight}
          >
            {`v_max = 1.5v_avg = ${r4(vmax)} m/s`}
          </ChartText>
        )}
        {scale && vavg !== undefined && (
          <ChartText x={wx + fw + 14} y={sy + len(vavg) + 4} fontSize={chart.label}>
            {lab('vavg') ?? ''}
          </ChartText>
        )}
        <ChartText x={wx + fw / 2} y={y1 + 28} fontSize={chart.label} textAnchor="middle">
          {lab('delta') ?? 'δ'}
        </ChartText>
        <ChartText x={wx + fw + 14} y={y1 - 10} fontSize={chart.label} fill={c.chartMuted}>
          {`${lab('angle') ?? ''}${lab('angle') ? ' from vertical' : ''}`}
        </ChartText>
      </G>
    );
    body = (
      <G>
        {body}
        {labels}
      </G>
    );
    caption =
      vmax === undefined
        ? 'Type the film’s values to draw the profile.'
        : `The film is still at the wall and fastest at its free surface, where nothing drags it: v_max = 1.5v_avg = ${r4(vmax)} m/s.`;
  }

  // ── Steady diffusion across a film ──
  if (spec.mode === 'concentration') {
    const c1 = si('cA1');
    const c2 = si('cA2');
    const fx0 = 126;
    const fx1 = 230;
    const yb = 190;
    const yt = 50;
    const top = c1 !== undefined || c2 !== undefined ? niceCeil(Math.max(c1 ?? 0, c2 ?? 0)) : 1;
    const yOf = (v: number) => yb - (v / top) * (yb - yt);
    BH = 250;
    body = (
      <G>
        <Rect
          x={fx0}
          y={yt - 10}
          width={fx1 - fx0}
          height={yb - yt + 10}
          fill={c.chartSurface}
          stroke={c.chartGrid}
        />
        <Line x1={fx0} x2={fx0} y1={yt - 10} y2={yb} stroke={c.chartInk} strokeWidth={2} />
        <Line x1={fx1} x2={fx1} y1={yt - 10} y2={yb} stroke={c.chartInk} strokeWidth={2} />
        <Line x1={fx0} x2={fx1} y1={yb} y2={yb} stroke={c.chartInk} />
        {c1 !== undefined && c2 !== undefined && (
          <G>
            <Path
              d={`M ${fx0} ${yb} L ${fx0} ${yOf(c1)} L ${fx1} ${yOf(c2)} L ${fx1} ${yb} Z`}
              fill={c.chartHighlight}
              opacity={0.15}
            />
            <Line
              x1={fx0}
              y1={yOf(c1)}
              x2={fx1}
              y2={yOf(c2)}
              stroke={c.chartHighlight}
              strokeWidth={2.5}
            />
          </G>
        )}
        {c1 !== undefined && (
          <ChartText
            x={fx0 - 6}
            y={yOf(c1) + 4}
            fontSize={chart.label}
            textAnchor="end"
            fontWeight="bold"
          >
            {lab('cA1') ?? ''}
          </ChartText>
        )}
        {c2 !== undefined && (
          <ChartText x={fx1 + 6} y={yOf(c2) + 4} fontSize={chart.label} fontWeight="bold">
            {lab('cA2') ?? ''}
          </ChartText>
        )}
        {c1 !== undefined && c2 !== undefined && c1 !== c2 && (
          <G>
            <Arrow
              x1={c1 > c2 ? fx0 + 40 : fx1 - 40}
              y1={yt + 4}
              x2={c1 > c2 ? fx1 - 40 : fx0 + 40}
              y2={yt + 4}
              color={c.chartInk}
              width={3}
            />
            <ChartText
              x={(fx0 + fx1) / 2}
              y={yt - 16}
              fontSize={chart.label}
              textAnchor="middle"
              fontWeight="bold"
            >
              {lab('flux') ?? 'N_A'}
            </ChartText>
          </G>
        )}
        <Bracket x1={fx0} y1={yb + 14} x2={fx1} y2={yb + 14} color={c.chartInk} />
        <ChartText x={(fx0 + fx1) / 2} y={yb + 30} fontSize={chart.label} textAnchor="middle">
          {lab('L') ?? 'L'}
        </ChartText>
        <ChartText
          x={(fx0 + fx1) / 2}
          y={yb - 8}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          film
        </ChartText>
      </G>
    );
    const D = si('D');
    const L = si('L');
    caption =
      c1 === undefined || c2 === undefined
        ? 'Type both concentrations to draw the line.'
        : `In steady diffusion the line is straight: the flux is the same at every depth${D !== undefined && L ? `, N_A = D(c_A1 − c_A2) ÷ L = ${r4((D * (c1 - c2)) / L)} mol/(m²·s)` : ''}.`;
  }

  // ── A Stefan tube ──
  if (spec.mode === 'stefan') {
    const x1 = si('x1');
    const x2 = si('x2');
    const tx0 = 100;
    const tx1 = 150;
    const ytop = 40;
    const ysurf = 190;
    const ybot = 220;
    const px0 = 200;
    const px1 = BW - 20;
    const top = x1 !== undefined ? niceCeil(Math.max(x1, x2 ?? 0)) : 1;
    const xOf = (x: number) => px0 + (x / top) * (px1 - px0);
    const zOf = (zeta: number) => ysurf - zeta * (ysurf - ytop);
    const curve =
      x1 !== undefined && x2 !== undefined && x1 < 1 && x2 < 1
        ? Array.from(
            { length: 31 },
            (_, k) => `${k ? 'L' : 'M'} ${xOf(stefanFraction(x1, x2, k / 30))} ${zOf(k / 30)}`,
          ).join(' ')
        : undefined;
    BH = 262;
    body = (
      <G>
        <Rect x={tx0} y={ysurf} width={tx1 - tx0} height={ybot - ysurf} fill={url(paint.liquid)} />
        <Rect
          x={tx0}
          y={ytop}
          width={tx1 - tx0}
          height={ybot - ytop}
          fill={url(paint.glass)}
          opacity={0.6}
        />
        <Path
          d={`M ${tx0} ${ytop} L ${tx0} ${ybot} L ${tx1} ${ybot} L ${tx1} ${ytop}`}
          stroke={c.glassEdge}
          strokeWidth={2.5}
          fill="none"
        />
        <Arrow
          x1={(tx0 + tx1) / 2}
          y1={ysurf - 14}
          x2={(tx0 + tx1) / 2}
          y2={ytop + 24}
          color={c.chartHighlight}
          width={3}
        />
        <ChartText x={8} y={18} fontSize={chart.label} fontWeight="bold">
          {lab('flux') ?? 'N_A'}
        </ChartText>
        <ChartText
          x={(tx0 + tx1) / 2}
          y={ybot + 16}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          liquid A
        </ChartText>
        <Bracket x1={tx0 - 14} y1={ysurf} x2={tx0 - 14} y2={ytop} color={c.chartInk} />
        <ChartText x={tx0 - 20} y={(ysurf + ytop) / 2 + 4} fontSize={chart.label} textAnchor="end">
          {lab('L') ?? 'L'}
        </ChartText>
        {/* x_A against height, on its own axes beside the tube. */}
        <Line x1={px0} x2={px0} y1={ytop} y2={ysurf} stroke={c.chartInk} />
        <Line x1={px0} x2={px1} y1={ysurf} y2={ysurf} stroke={c.chartInk} />
        <ChartText
          x={px1}
          y={ysurf + 34}
          fontSize={chart.label}
          textAnchor="end"
          fill={c.chartMuted}
        >
          {`x_A, 0 to ${formatNumber(top)}`}
        </ChartText>
        {curve && <Path d={curve} stroke={c.chartHighlight} strokeWidth={2.5} fill="none" />}
        {curve && (
          <Line
            x1={xOf(x1!)}
            y1={zOf(0)}
            x2={xOf(x2!)}
            y2={zOf(1)}
            stroke={c.chartMuted}
            strokeDasharray={chart.dashFine}
          />
        )}
        {x1 !== undefined && (
          <ChartText
            x={xOf(x1)}
            y={ysurf + 16}
            fontSize={chart.label}
            textAnchor="middle"
            fontWeight="bold"
          >
            {lab('x1') ?? ''}
          </ChartText>
        )}
        {x2 !== undefined && (
          <ChartText x={xOf(x2) + 6} y={ytop - 6} fontSize={chart.label} fontWeight="bold">
            {lab('x2') ?? ''}
          </ChartText>
        )}
        {[tx1, px0].map((x) => (
          <G key={x}>
            <Line
              x1={x === tx1 ? tx1 : px0 - 6}
              x2={x === tx1 ? px0 - 6 : px0}
              y1={ysurf}
              y2={ysurf}
              stroke={c.chartGrid}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={x === tx1 ? tx1 : px0 - 6}
              x2={x === tx1 ? px0 - 6 : px0}
              y1={ytop}
              y2={ytop}
              stroke={c.chartGrid}
              strokeDasharray={chart.dashFine}
            />
          </G>
        ))}
      </G>
    );
    const cc = si('c');
    const D = si('D');
    const L = si('L');
    caption =
      x1 === undefined || x2 === undefined
        ? 'Type the mole fractions to draw the profile.'
        : `A diffuses up through gas that stays put, so it is carried by its own flow too: the curve bends from the straight dashed line${cc !== undefined && D !== undefined && L ? `. N_A = (cD ÷ L) ln((1 − x_A2) ÷ (1 − x_A1)) = ${r4(stefanFlux(cc, D, L, x1, x2))} mol/(m²·s)` : ''}.`;
  }

  // ── Three boundary layers side by side ──
  if (spec.mode === 'analogy') {
    const Pr = si('Pr');
    const Sc = si('Sc');
    const panels = [
      { name: 'velocity', ratio: 1, label: 'δ', color: c.chartHighlight },
      ...(Pr !== undefined && Pr > 0
        ? [
            {
              name: 'temperature',
              ratio: layerRatio(Pr),
              label: `δ_T = ${r4(layerRatio(Pr))}δ`,
              color: c.physHot,
            },
          ]
        : []),
      ...(Sc !== undefined && Sc > 0
        ? [
            {
              name: 'concentration',
              ratio: layerRatio(Sc),
              label: `δ_c = ${r4(layerRatio(Sc))}δ`,
              color: c.lineSum,
            },
          ]
        : []),
    ];
    const pw = (BW - 16) / 3;
    const base = 150;
    const maxRatio = Math.max(...panels.map((p) => p.ratio));
    const d0 = Math.min(70, 110 / maxRatio);
    BH = 230;
    body = (
      <G>
        {panels.map((p, k) => {
          const x0 = 8 + k * pw + 6;
          const x1 = x0 + pw - 12;
          const d = d0 * p.ratio;
          // δ grows as √x from the leading edge.
          const edge = Array.from({ length: 21 }, (_, i) => {
            const f = i / 20;
            return `${i ? 'L' : 'M'} ${x0 + f * (x1 - x0)} ${base - d * Math.sqrt(f)}`;
          }).join(' ');
          return (
            <G key={p.name}>
              <Path d={`${edge} L ${x1} ${base} Z`} fill={p.color} opacity={0.15} />
              <Path d={edge} stroke={p.color} strokeWidth={2} fill="none" />
              <Rect
                x={x0}
                y={base}
                width={x1 - x0}
                height={10}
                fill={url(paint.wall)}
                stroke={c.metalDark}
              />
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <Arrow
                  key={f}
                  x1={x1 - 30}
                  y1={base - f * d}
                  x2={x1 - 30 + 24 * Math.min(1, 1.5 * f - 0.5 * f ** 3)}
                  y2={base - f * d}
                  color={p.color}
                  width={1.5}
                />
              ))}
              <ChartText
                x={(x0 + x1) / 2}
                y={base + 28}
                fontSize={chart.label}
                textAnchor="middle"
                fontWeight="bold"
              >
                {p.name}
              </ChartText>
              <ChartText x={(x0 + x1) / 2} y={base + 44} fontSize={chart.label} textAnchor="middle">
                {p.label}
              </ChartText>
            </G>
          );
        })}
        <ChartText x={8} y={20} fontSize={chart.label} fill={c.chartMuted}>
          {[lab('Re'), lab('Pr'), lab('Sc')].filter(Boolean).join(' · ')}
        </ChartText>
      </G>
    );
    const parts: string[] = [];
    if (Pr !== undefined && Pr > 0) parts.push(`δ_T = δPr^(−1/3) = ${r4(layerRatio(Pr))}δ`);
    if (Sc !== undefined && Sc > 0) parts.push(`δ_c = δSc^(−1/3) = ${r4(layerRatio(Sc))}δ`);
    caption = parts.length
      ? `${parts.join('; ')}. The thinner the layer, the steeper its gradient at the wall and the faster the transfer.`
      : 'Type Pr or Sc to draw the other layers.';
  }

  // Further values under the picture.
  const moreTop = BH;
  if (moreLines.length) BH += moreLines.length * LH + 8;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen
                id={paint.wall}
                from={spec.vessel ? c.profileWall : c.metal}
                to={spec.vessel ? c.profileBlood : c.metalDark}
              />
              <Sheen id={paint.sheen} vertical />
              <Deepen id={paint.liquid} from={c.waterTop} to={c.waterDeep} />
              <Glass id={paint.glass} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {moreLines.map((t, k) => (
                <ChartText key={t} x={8} y={moreTop + 4 + k * LH} fontSize={chart.label}>
                  {t}
                </ChartText>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
