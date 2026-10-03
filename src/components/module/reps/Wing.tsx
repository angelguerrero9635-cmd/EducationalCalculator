/**
 * HC24 `wing` (WingSpec in typesHe2h.ts): an airfoil section from the NACA four-digit equations,
 * tilted by α against the relative wind, with lift ⟂ the wind (not the chord), drag along it, a
 * surface pressure arrow or a circulation loop; or a wing's planform to scale with its tip
 * vortices, and the view from behind with the downwash. The wing is painted aluminium; the wind,
 * arrows, brackets and loops stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { WingSpec } from '@/data/modules/typesHe2h';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  camber,
  camberForZeroLift,
  halfThickness,
  nacaOf,
  nacaOutline,
  planformBox,
  sectionVectors,
  toDeg,
  toRad,
  zeroLiftAngle,
  type Naca,
} from './aeroMath';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import { Deepen, Sheen, url, usePaintIds } from './paint';

const BW = 356;

/** Wing sections and planforms (WingSpec). */
export function Wing({ spec, calc }: { spec: WingSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('skin', 'sheen');
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  /** "α = 4°" for a variable, or the number for a fixed field; undefined while "?". */
  const lab = (x: NumOrVar | undefined, name = '') =>
    x === undefined
      ? undefined
      : typeof x === 'string'
        ? valueLabel(x)
        : name
          ? `${name} = ${r4(x)}`
          : undefined;
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);

  let body: ReactNode = null;
  let BH = 250;
  let caption = '';
  const rows: string[] = [];

  if ((spec.mode ?? 'section') === 'section') {
    // ── The section ──
    const alpha = get(spec.alpha) ?? 0;
    const aL0 = get(spec.alphaL0);
    const d = spec.digits;
    const digits = d ? [get(d.d1), get(d.d2), get(d.d34)] : undefined;
    const known = !digits || digits.every((x) => x !== undefined);
    const naca: Naca = digits
      ? known
        ? nacaOf(digits[0]!, digits[1]!, digits[2]!)
        : { m: 0, p: 0.4, t: 0.12 }
      : { m: aL0 !== undefined ? camberForZeroLift(aL0) : 0.02, p: 0.4, t: 0.12 };
    const C = 200;
    const P = { x: 150, y: 132 };
    const v = sectionVectors(alpha);
    const pt = (x: number, y: number) => ({
      x: P.x + (x - 0.25) * C * v.chord[0] + y * C * v.up[0],
      y: P.y + (x - 0.25) * C * v.chord[1] + y * C * v.up[1],
    });
    const outline = nacaOutline(naca, 60)
      .map(([x, y], k) => {
        const q = pt(x, y);
        return `${k ? 'L' : 'M'} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
      })
      .join(' ');
    const camberPath = Array.from({ length: 41 }, (_, k) => {
      const q = pt(k / 40, camber(naca, k / 40));
      return `${k ? 'L' : 'M'} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
    }).join(' ');
    const LE = pt(0, 0);
    const TE = pt(1, 0);
    const hasWind = spec.alpha !== undefined || spec.speed !== undefined;
    const cl = get(spec.cl);
    const cd = get(spec.cd);
    const L = get(spec.forces?.lift);
    const D = get(spec.forces?.drag);
    // Lift to scale: 100 px for L (D in proportion), or 45 px per unit of c_l (at most 110).
    let lift: { len: number; drag: number } | undefined;
    if (spec.forces) {
      if (L !== undefined && L !== 0)
        lift = { len: 100 * Math.sign(L), drag: D !== undefined ? (100 * D) / Math.abs(L) : 0 };
    } else if (cl !== undefined && cl !== 0) {
      const len = Math.max(-110, Math.min(110, 45 * cl));
      lift = { len, drag: cd !== undefined ? (Math.abs(len) * cd) / Math.abs(cl) : 0 };
    }
    const gamma = get(spec.circulation?.gamma);
    const Lp = get(spec.circulation?.lift);
    if (spec.circulation && gamma !== undefined && gamma !== 0 && !lift) {
      lift = Lp !== undefined && Lp !== 0 ? { len: 100 * Math.sign(Lp), drag: 0 } : undefined;
    }
    const liftLabel = spec.forces
      ? lab(spec.forces.lift, 'L')
      : spec.circulation
        ? lab(spec.circulation.lift, 'L′')
        : lab(spec.cl, 'c_l');
    const dragLabel = spec.forces ? lab(spec.forces.drag, 'D') : lab(spec.cd, 'c_d');
    // The pressure point: on the surface at `at` × c, its outward normal.
    const cp = get(spec.pressure?.cp);
    let press: ReactNode = null;
    if (spec.pressure) {
      const at = spec.pressure.at ?? 0.3;
      const sgn = spec.pressure.surface === 'lower' ? -1 : 1;
      const yc = camber(naca, at);
      const half = (x: number) => halfThickness(naca.t, x);
      const S = pt(at, yc + sgn * half(at));
      const S2 = pt(at + 0.01, camber(naca, at + 0.01) + sgn * half(at + 0.01));
      const tx = S2.x - S.x;
      const ty = S2.y - S.y;
      const tl = Math.hypot(tx, ty);
      // Outward: the tangent turned up for the upper surface, down for the lower.
      const o = sgn > 0 ? { x: ty / tl, y: -tx / tl } : { x: -ty / tl, y: tx / tl };
      const len = cp !== undefined ? Math.max(10, Math.min(110, 70 * Math.abs(cp))) : 0;
      const speedLab = lab(spec.pressure.speed, 'V');
      press = (
        <G>
          <Circle cx={S.x} cy={S.y} r={3} fill={c.chartInk} />
          {cp !== undefined && cp !== 0 && (
            <Arrow
              x1={cp < 0 ? S.x + o.x * 3 : S.x + o.x * (len + 3)}
              y1={cp < 0 ? S.y + o.y * 3 : S.y + o.y * (len + 3)}
              x2={cp < 0 ? S.x + o.x * (len + 3) : S.x + o.x * 3}
              y2={cp < 0 ? S.y + o.y * (len + 3) : S.y + o.y * 3}
              color={cp < 0 ? c.aeroDrag : c.aeroLift}
              width={2.5}
            />
          )}
          {cp !== undefined && (
            <ChartText
              x={S.x + o.x * (len + 3) + 8}
              y={S.y + o.y * (len + 3) + (o.y < 0 ? 4 : 12)}
              fontSize={chart.label}
              fontWeight="bold"
              fill={cp < 0 ? c.aeroDrag : c.aeroLift}
              halo
            >
              {`${lab(spec.pressure.cp, 'C_p') ?? ''} (${cp < 0 ? 'suction' : cp > 0 ? 'pressure' : 'free stream'})`}
            </ChartText>
          )}
          {speedLab && (
            <G>
              <Arrow
                x1={S.x + (tx / tl) * 8 + o.x * 9}
                y1={S.y + (ty / tl) * 8 + o.y * 9}
                x2={S.x + (tx / tl) * 62 + o.x * 9}
                y2={S.y + (ty / tl) * 62 + o.y * 9}
                color={c.aeroWind}
                width={1.8}
              />
              <ChartText
                x={S.x + (tx / tl) * 66 + o.x * 9 + 4}
                y={S.y + (ty / tl) * 66 + o.y * 9 + 4}
                fontSize={chart.label}
                fill={c.aeroWind}
                halo
              >
                {speedLab}
              </ChartText>
            </G>
          )}
        </G>
      );
    }
    // The circulation loop: clockwise (over the top to the right) for positive Γ.
    let loop: ReactNode = null;
    if (spec.circulation) {
      const M = pt(0.5, 0);
      const [rx, ry] = [128, 54];
      const cw = gamma === undefined || gamma >= 0;
      const marks = [-0.5, 0.5, 1.5, 2.5].map((k) => {
        const t = (k * Math.PI) / 2;
        const x = M.x + rx * Math.cos(t);
        const y = M.y + ry * Math.sin(t);
        // Clockwise on screen: the tangent (−sin t, cos t) scaled; anticlockwise reversed.
        const s = cw ? 1 : -1;
        const dx = -rx * Math.sin(t) * s;
        const dy = ry * Math.cos(t) * s;
        const l = Math.hypot(dx, dy);
        return (
          <Arrow
            key={k}
            x1={x - (dx / l) * 9}
            y1={y - (dy / l) * 9}
            x2={x + (dx / l) * 6}
            y2={y + (dy / l) * 6}
            color={c.aeroVortex}
            width={1.6}
          />
        );
      });
      loop = (
        <G>
          <Ellipse
            cx={M.x}
            cy={M.y}
            rx={rx}
            ry={ry}
            stroke={c.aeroVortex}
            strokeWidth={1.4}
            strokeDasharray={gamma === undefined ? chart.dash : undefined}
            fill="none"
          />
          {gamma !== undefined && marks}
          <ChartText
            x={M.x + rx * Math.cos(-2.4) - 4}
            y={M.y + ry * Math.sin(-2.4) - 6}
            fontSize={chart.label}
            fontWeight="bold"
            textAnchor="end"
            fill={c.aeroVortex}
            halo
          >
            {lab(spec.circulation.gamma, 'Γ') ?? 'Γ'}
          </ChartText>
        </G>
      );
    }
    // Chord bracket under the section (along the chord), and the NACA marks.
    const low = Math.min(...nacaOutline(naca, 30).map(([, y]) => y));
    const bA = pt(0, low - 0.09);
    const bB = pt(1, low - 0.09);
    const chordLab = lab(spec.chord, 'c');
    const tAt = 0.3;
    const tTop = pt(tAt, camber(naca, tAt) + halfThickness(naca.t, tAt));
    const tBot = pt(tAt, camber(naca, tAt) - halfThickness(naca.t, tAt));
    const pPeak = pt(naca.p, camber(naca, naca.p));
    const pFoot = pt(naca.p, 0);
    const marks = !!d && known;
    const windY = [P.y - 66, P.y + 52];
    body = (
      <G>
        {/* The relative wind, from the left, and its speed. */}
        {hasWind &&
          windY.map((y) => (
            <Arrow key={y} x1={8} y1={y} x2={62} y2={y} color={c.aeroWind} width={2} />
          ))}
        {hasWind && (
          <ChartText x={8} y={windY[0]! - 9} fontSize={chart.label} fill={c.aeroWind}>
            {lab(spec.speed, 'V∞') ?? 'Relative wind'}
          </ChartText>
        )}
        {/* The wind's line through the leading edge and the chord's, with α between them. */}
        {hasWind && spec.alpha !== undefined && (
          <G>
            <Line
              x1={LE.x - 64}
              x2={LE.x}
              y1={LE.y}
              y2={LE.y}
              stroke={c.aeroWind}
              strokeDasharray={chart.dash}
            />
            <Line
              x1={LE.x - 64 * v.chord[0]}
              y1={LE.y - 64 * v.chord[1]}
              x2={TE.x + 18 * v.chord[0]}
              y2={TE.y + 18 * v.chord[1]}
              stroke={c.chartMuted}
              strokeDasharray={chart.dashFine}
            />
            {Math.abs(alpha) > 0.2 && (
              <Path
                d={`M ${LE.x - 48} ${LE.y} A 48 48 0 0 ${alpha > 0 ? 1 : 0} ${LE.x - 48 * v.chord[0]} ${LE.y - 48 * v.chord[1]}`}
                stroke={c.chartInk}
                strokeWidth={1.2}
                fill="none"
              />
            )}
            <ChartText
              x={LE.x - 54}
              y={alpha >= 0 ? LE.y + 16 : LE.y - 8}
              fontSize={chart.label}
              textAnchor="end"
              halo
            >
              {lab(spec.alpha, 'α') ?? 'α'}
            </ChartText>
          </G>
        )}
        {loop}
        {/* The section in aluminium, its camber line inside. */}
        <Path d={outline} fill={url(paint.skin)} stroke={c.metalDark} strokeWidth={1.2} />
        <Path d={outline} fill={url(paint.sheen)} />
        <Path
          d={camberPath}
          stroke={c.chartInk}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
          fill="none"
        />
        {/* The zero-lift line through the trailing edge, α − α_L0 from the wind. */}
        {hasWind && aL0 !== undefined && aL0 < 0 && (
          <Line
            x1={TE.x}
            y1={TE.y}
            x2={TE.x - 150 * Math.cos(toRad(alpha - aL0))}
            y2={TE.y - 150 * Math.sin(toRad(alpha - aL0))}
            stroke={c.aeroLift}
            strokeWidth={1}
            strokeDasharray={chart.dash}
          />
        )}
        {hasWind && aL0 !== undefined && aL0 < 0 && (
          <ChartText
            x={TE.x}
            y={TE.y + 20}
            fontSize={chart.label}
            textAnchor="end"
            fill={c.aeroLift}
            halo
          >
            {lab(spec.alphaL0, 'α_L0') ?? ''}
          </ChartText>
        )}
        {/* NACA marks: the max camber at x = p, the thickness at 30% of the chord. */}
        {marks && naca.m > 0 && (
          <G>
            <Line
              x1={pFoot.x}
              y1={pFoot.y}
              x2={pPeak.x}
              y2={pPeak.y}
              stroke={c.aeroLift}
              strokeWidth={2}
            />
            <Circle cx={pPeak.x} cy={pPeak.y} r={3} fill={c.aeroLift} />
            <Line
              x1={pPeak.x}
              y1={pPeak.y - 4}
              x2={pPeak.x}
              y2={P.y - 46}
              stroke={c.aeroLift}
              strokeWidth={1}
            />
            <ChartText
              x={pPeak.x}
              y={P.y - 50}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.aeroLift}
              halo
            >
              max camber
            </ChartText>
          </G>
        )}
        {marks && (
          <G>
            <Line
              x1={tTop.x}
              y1={tTop.y}
              x2={tBot.x}
              y2={tBot.y}
              stroke={c.chartInk}
              strokeWidth={1.4}
            />
            <Line
              x1={tTop.x - 4}
              x2={tTop.x + 4}
              y1={tTop.y}
              y2={tTop.y}
              stroke={c.chartInk}
              strokeWidth={1.4}
            />
            <Line
              x1={tBot.x - 4}
              x2={tBot.x + 4}
              y1={tBot.y}
              y2={tBot.y}
              stroke={c.chartInk}
              strokeWidth={1.4}
            />
            <ChartText x={tTop.x} y={tTop.y - 7} fontSize={chart.label} textAnchor="middle" halo>
              t
            </ChartText>
          </G>
        )}
        {press}
        {/* Lift ⟂ the wind from the quarter chord, drag along it, the resultant dashed. */}
        {lift && (
          <G>
            {spec.forces && lift.drag > 0 && (
              <Line
                x1={P.x}
                y1={P.y}
                x2={P.x + lift.drag}
                y2={P.y - lift.len}
                stroke={c.chartMuted}
                strokeWidth={1.2}
                strokeDasharray={chart.dash}
              />
            )}
            <Arrow x1={P.x} y1={P.y} x2={P.x} y2={P.y - lift.len} color={c.aeroLift} width={3} />
            {liftLabel && (
              <ChartText
                x={P.x + 10}
                y={lift.len > 0 ? P.y - lift.len + 10 : P.y - lift.len - 2}
                fontSize={chart.label}
                fontWeight="bold"
                fill={c.aeroLift}
                halo
              >
                {liftLabel}
              </ChartText>
            )}
            {lift.drag > 0 && (
              <Line
                x1={P.x}
                y1={P.y}
                x2={P.x + lift.drag}
                y2={P.y}
                stroke={c.aeroDrag}
                strokeWidth={3}
              />
            )}
          </G>
        )}
        {lift && dragLabel && (spec.forces || cd !== undefined) && (
          <ChartText
            x={P.x + Math.max(lift.drag, 0) + 8}
            y={P.y + 22}
            fontSize={chart.label}
            fill={c.aeroDrag}
            halo
          >
            {`${dragLabel} →`}
          </ChartText>
        )}
        {/* The chord, bracketed under the section. */}
        {chordLab && (
          <G>
            <Line x1={bA.x} y1={bA.y} x2={bB.x} y2={bB.y} stroke={c.chartInk} strokeWidth={1.1} />
            {[bA, bB].map((q, k) => (
              <Line
                key={k}
                x1={q.x - 5 * v.up[0]}
                y1={q.y - 5 * v.up[1]}
                x2={q.x + 5 * v.up[0]}
                y2={q.y + 5 * v.up[1]}
                stroke={c.chartInk}
                strokeWidth={1.1}
              />
            ))}
            <ChartText
              x={(bA.x + bB.x) / 2}
              y={(bA.y + bB.y) / 2 + 17}
              fontSize={chart.label}
              textAnchor="middle"
              halo
            >
              {chordLab}
            </ChartText>
          </G>
        )}
      </G>
    );
    BH = Math.max(P.y + 74, (bA.y + bB.y) / 2 + 28, lift && lift.len < 0 ? P.y - lift.len + 16 : 0);
    // Rows: the NACA values.
    if (marks) {
      const tags = [lab(spec.camber), lab(spec.camberAt), lab(spec.thickness)].filter(
        (t): t is string => !!t,
      );
      if (tags.length) rows.push(tags.join(' · '));
    }
    // The caption: the relation the picture shows.
    const parts: string[] = [];
    if (d && !known) parts.push('Type the four digits to draw the section.');
    if (marks) {
      parts.push(
        `NACA ${digits![0]}${digits![1]}${String(digits![2]).padStart(2, '0')}: camber ${r4(naca.m * 100)}% of the chord at ${r4(naca.p * 100)}% from the leading edge, ${r4(naca.t * 100)}% thick.`,
      );
    }
    if (spec.forces) {
      if (L !== undefined && D !== undefined && D !== 0)
        parts.push(`Lift is ⟂ the wind, drag along it: L ÷ D = ${r4(L / D)}.`);
      else parts.push('Lift is ⟂ the oncoming wind, not the chord.');
    } else if (spec.circulation) {
      parts.push(
        gamma !== undefined
          ? `Γ = ${r4(gamma)} m²/s turns ${gamma >= 0 ? 'clockwise' : 'anticlockwise'} round the section: L′ = ρ∞V∞Γ, lift ⟂ the wind.`
          : 'Type Γ to draw the circulation.',
      );
    } else if (spec.pressure) {
      if (cp !== undefined)
        parts.push(
          cp < 0
            ? `Cₚ = ${r4(cp)}: faster than the free stream, the pressure is below p∞ and pulls outward.`
            : cp > 0
              ? `Cₚ = ${r4(cp)}: slower than the free stream, the pressure is above p∞ and pushes in.`
              : 'Cₚ = 0: the local speed equals V∞.',
        );
    } else if (hasWind && aL0 !== undefined && spec.alpha !== undefined) {
      const abs = alpha - aL0;
      parts.push(
        `cₗ = 2π(α − α₀) with α₀ the zero-lift angle: 2π × ${r4(toRad(abs))} rad = ${r4(2 * Math.PI * toRad(abs))}.`,
      );
      if (aL0 === 0) parts.push('A symmetric section: no camber, zero lift at α = 0.');
    } else if (hasWind) {
      parts.push('Lift is ⟂ the relative wind, not the chord.');
    }
    if (!digits && aL0 !== undefined && aL0 < 0)
      parts.push(
        `Drawn with ${r4(naca.m * 100)}% camber at 40% of the chord, which thin-airfoil theory gives α₀ = ${r4(toDeg(zeroLiftAngle(naca)))}°.`,
      );
    caption = parts.join(' ');
  } else {
    // ── The planform from above, and from behind ──
    const b0 = get(spec.span);
    const AR = get(spec.aspectRatio);
    const cr0 = get(spec.rootChord);
    const ct0 = get(spec.tipChord) ?? cr0;
    const real = b0 !== undefined && cr0 !== undefined && ct0 !== undefined && b0 > 0 && cr0 > 0;
    const box = real
      ? planformBox(b0!, cr0!, ct0!)
      : AR !== undefined && AR > 0
        ? planformBox(AR, 1, 1)
        : undefined;
    const top = 30;
    const cx = BW / 2;
    const root = box?.root ?? 60;
    const tip = box?.tip ?? 60;
    const half = (box?.span ?? 300) / 2;
    const cq = top + root / 4; // the quarter-chord line, straight across
    const wingPath = `M ${cx} ${cq - root / 4} L ${cx + half} ${cq - tip / 4} L ${cx + half} ${cq + (3 * tip) / 4} L ${cx} ${cq + (3 * root) / 4} L ${cx - half} ${cq + (3 * tip) / 4} L ${cx - half} ${cq - tip / 4} Z`;
    const back = cq + (3 * root) / 4;
    const tipBack = cq + (3 * tip) / 4;
    const trail = (x: number, side: number) => {
      // A vortex trailing from the tip: a corkscrew drawn as loops, drifting inboard a little.
      const pts: string[] = [];
      for (let k = 0; k <= 60; k++) {
        const t = k / 60;
        const y = tipBack + 4 + t * 64;
        const xx = x - side * (t * 8) + 6 * Math.sin(t * Math.PI * 7) * side;
        pts.push(`${k ? 'L' : 'M'} ${xx.toFixed(1)} ${y.toFixed(1)}`);
      }
      return pts.join(' ');
    };
    const rearY = Math.max(back, tipBack + 64) + 52;
    const ai = get(spec.alphaI);
    const dw = ai !== undefined ? Math.max(6, Math.min(40, ai * 14)) : 0;
    const spanLab = lab(spec.span, 'b');
    const areaLab = lab(spec.area, 'S');
    const arLab = lab(spec.aspectRatio, 'AR');
    body = (
      <G>
        {box ? (
          <G>
            <Path d={wingPath} fill={url(paint.skin)} stroke={c.metalDark} strokeWidth={1.2} />
            <Path d={wingPath} fill={url(paint.sheen)} />
          </G>
        ) : (
          <Path d={wingPath} fill="none" stroke={c.chartMuted} strokeDasharray={chart.dash} />
        )}
        {/* The span above the wing. */}
        {spanLab && (
          <G>
            <Line x1={cx - half} x2={cx + half} y1={top - 14} y2={top - 14} stroke={c.chartInk} />
            <Line x1={cx - half} x2={cx - half} y1={top - 19} y2={top - 9} stroke={c.chartInk} />
            <Line x1={cx + half} x2={cx + half} y1={top - 19} y2={top - 9} stroke={c.chartInk} />
            <ChartText x={cx} y={top - 18} fontSize={chart.label} textAnchor="middle" halo>
              {spanLab}
            </ChartText>
          </G>
        )}
        {/* Root and tip chords. */}
        {lab(spec.rootChord, 'c_r') && spec.rootChord !== undefined && (
          <G>
            <Line
              x1={cx}
              x2={cx}
              y1={cq - root / 4}
              y2={back}
              stroke={c.chartInk}
              strokeDasharray={chart.dashFine}
            />
            <ChartText x={cx + 5} y={back + 15} fontSize={chart.label} halo>
              {lab(spec.rootChord, 'c_r')!}
            </ChartText>
          </G>
        )}
        {spec.tipChord !== undefined && lab(spec.tipChord, 'c_t') && (
          <ChartText
            x={cx + half - 16}
            y={tipBack + 15}
            fontSize={chart.label}
            textAnchor="end"
            halo
          >
            {lab(spec.tipChord, 'c_t')!}
          </ChartText>
        )}
        {/* S on the left half, AR on the right, over the painted skin. */}
        {[areaLab, arLab].map((t, k) =>
          t ? (
            <ChartText
              key={k}
              x={cx + (k ? 1 : -1) * Math.max(half / 2, 40)}
              y={root < 22 ? back + 16 : cq + root / 4 + 4}
              fontSize={chart.label}
              textAnchor="middle"
              fontWeight="bold"
            >
              {t}
            </ChartText>
          ) : null,
        )}
        {/* Tip vortices trailing behind. */}
        {[-1, 1].map((s) => (
          <Path
            key={s}
            d={trail(cx + s * half, s)}
            stroke={c.aeroVortex}
            strokeWidth={1.4}
            fill="none"
          />
        ))}
        <ChartText
          x={cx}
          y={tipBack + 52}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.aeroVortex}
        >
          tip vortices trail behind
        </ChartText>
        {/* From behind: the wing edge-on, the vortices turning, the downwash between. */}
        <ChartText x={8} y={rearY - 28} fontSize={chart.label} fill={c.chartMuted}>
          From behind
        </ChartText>
        <Rect
          x={cx - half}
          y={rearY - 3}
          width={2 * half}
          height={6}
          rx={3}
          fill={url(paint.skin)}
          stroke={c.metalDark}
        />
        {[-1, 1].map((s) => {
          const x = cx + s * half;
          // Left tip clockwise, right tip anticlockwise: up outboard, down inboard.
          return (
            <G key={s}>
              <Circle
                cx={x}
                cy={rearY}
                r={15}
                stroke={c.aeroVortex}
                strokeWidth={1.4}
                fill="none"
              />
              <Arrow
                x1={x - s * 15}
                y1={rearY + 6}
                x2={x - s * 15}
                y2={rearY + 12}
                color={c.aeroVortex}
                width={1.4}
              />
              <Arrow
                x1={x + s * 15}
                y1={rearY - 6}
                x2={x + s * 15}
                y2={rearY - 12}
                color={c.aeroVortex}
                width={1.4}
              />
            </G>
          );
        })}
        {dw > 0 &&
          [-0.5, -0.17, 0.17, 0.5].map((f) => (
            <Arrow
              key={f}
              x1={cx + f * half * 1.1}
              y1={rearY + 8}
              x2={cx + f * half * 1.1}
              y2={rearY + 8 + dw}
              color={c.aeroWind}
              width={2}
            />
          ))}
        <ChartText
          x={cx}
          y={rearY + 8 + Math.max(dw, 6) + 15}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.aeroWind}
          halo
        >
          {ai !== undefined
            ? `downwash · ${lab(spec.alphaI, 'α_i') ?? ''}`
            : 'downwash between the tips'}
        </ChartText>
      </G>
    );
    BH = rearY + 8 + Math.max(dw, 6) + 26;
    const CL = get(spec.CL);
    const e = get(spec.e);
    const CDi = get(spec.CDi);
    const coeffs = [
      lab(spec.CL, 'C_L'),
      lab(spec.e, 'e'),
      lab(spec.CDi, 'C_Di'),
      lab(spec.taper, 'λ'),
    ].filter((t): t is string => !!t);
    if (coeffs.length) rows.push(coeffs.join(' · '));
    const parts: string[] = [];
    if (box && real) parts.push(`Drawn to scale: AR = b² ÷ S = ${r4(box.aspect)}.`);
    else if (box) parts.push(`Drawn rectangular with span ÷ chord = AR = ${r4(AR!)}.`);
    else parts.push('Type the span and chords, or AR, to draw the wing.');
    if (CL !== undefined && AR !== undefined && e !== undefined && CDi !== undefined)
      parts.push(`Induced drag: ${r4(CL)}² ÷ (π × ${r4(e)} × ${r4(AR)}) = ${r4(CDi)}.`);
    if (ai !== undefined)
      parts.push('The vortices push the air behind the wing down; a longer wing pushes it less.');
    caption = parts.join(' ');
  }

  const rowTop = BH;
  const lines = [...rows, ...moreLines];
  if (lines.length) BH += lines.length * LH + 6;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={paint.skin} from={c.metal} to={c.metalDark} />
              <Sheen id={paint.sheen} vertical />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {lines.map((t, k) => (
                <ChartText key={t} x={8} y={rowTop + 6 + k * LH} fontSize={chart.label}>
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
