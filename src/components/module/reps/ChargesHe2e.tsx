/**
 * HC29 (college round 2, group E): `charges` Gauss surfaces (`gauss`: a charged ball, a line
 * charge, a sheet, each with its dashed Gaussian surface, E arrows on it and the enclosed
 * charge shaded) and continuous distributions (`distribution`: a ring or a disk with dE from
 * two opposite pieces and E_z summed on the axis; a charge over a grounded plane with its image
 * and the induced charge). Physics in he2eMath.ts; a "?" box draws nothing for its value.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { ChargesDistribution, ChargesGauss } from '@/data/modules/typesHe2e';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { arrowAt, pathOf, traceLine, type Pole } from './fieldLines';
import { arrowHead } from './graphKit';
import { ids, inside, Lab, labW, n3, ProfileGraph, useHe2e, useScaleDrag } from './he2eKit';
import { diskOf, electricOf, gaussOf, imageOf, ringOf } from './he2eMath';
import { Vec, worked } from './hskKit';
import { Ball, Sheen, url, usePaintIds } from './paint';

type Spec = ChargesGauss | ChargesDistribution;

export function ChargesHe2e({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if ('gauss' in spec) {
    switch (spec.gauss.shape) {
      case 'sphere':
        return <SphereView spec={spec} calc={calc} />;
      case 'line':
        return <LineView spec={spec} calc={calc} />;
      case 'plane':
        return <PlaneView spec={spec} calc={calc} />;
    }
  }
  if (spec.distribution === 'image') return <ImageView spec={spec} calc={calc} />;
  return <AxisView spec={spec} calc={calc} />;
}

/**
 * The page's rule at r: E and the enclosed charge (per meter for a line) from the side of R the
 * page is about (`region`), and whether r is on the other side (drawn faded with the reason).
 */
export function gaussRule(
  shape: 'sphere' | 'line',
  o: { k: number; eps0: number },
  Q: number,
  r: number,
  R: number | undefined,
  region?: 'inside' | 'outside',
) {
  const power = shape === 'sphere' ? 3 : 2;
  const inner = R !== undefined && (region === 'inside' || (!region && r < R));
  const enc = inner ? Q * (r / R!) ** power : Q;
  const E =
    shape === 'sphere' ? (r > 0 ? (o.k * enc) / (r * r) : 0) : r > 0 ? (2 * o.k * enc) / r : 0;
  const wrong =
    R !== undefined && ((region === 'inside' && r > R) || (region === 'outside' && r < R));
  return { enc, E, wrong };
}

/** Outward arrows for a + charge, inward for a −, of length len from (x, y) along (ux, uy). */
function Radial({
  x,
  y,
  ux,
  uy,
  len,
  out,
  color,
}: {
  x: number;
  y: number;
  ux: number;
  uy: number;
  len: number;
  out: boolean;
  color: string;
}) {
  return out ? (
    <Vec x1={x} y1={y} x2={x + ux * len} y2={y + uy * len} color={color} width={2.2} head={8} />
  ) : (
    <Vec x1={x + ux * len} y1={y + uy * len} x2={x} y2={y} color={color} width={2.2} head={8} />
  );
}

// ─── A charged ball and a Gaussian sphere ─────────────────────────────────────

function SphereView({ spec, calc }: { spec: ChargesGauss; calc: Calculator }) {
  const c = usePalette();
  const H = useHe2e(calc);
  const paint = usePaintIds('ball');
  const g = spec.gauss;
  const o = electricOf(spec);
  const Q = H.v(g.Q, 1e-6);
  const r = Math.max(1e-12, H.v(g.r, 0.3));
  const hasR = g.R !== undefined;
  const R = hasR ? Math.max(1e-12, H.v(g.R, 0.1)) : undefined;
  const okQ = H.known(g.Q);
  const okr = H.known(g.r);
  const okR = H.known(g.R);
  const ok = okQ && okr && okR;
  const rule = gaussRule('sphere', o, Q, r, R, g.region);
  const wrong = ok && rule.wrong;
  const frozen = useFrozen(Math.max(r, R ?? 0));
  const drag = useScaleDrag(H, calc, spec.fixed ? undefined : g.r, ids(g.Q, g.R));
  const col = Q >= 0 ? c.physPlus : c.physMinus;
  const Esay = H.out(g.E, Math.abs(rule.E), 'N/C', ok);
  const inner = R !== undefined && rule.enc !== Q;
  const capLines = [
    ...(inner
      ? worked(
          ok,
          `Q_enc = Q(r ÷ R)³ = ${n3(Q)} × (${n3(r)} ÷ ${n3(R!)})³ = ${n3(rule.enc)} C`,
        ).map((l) => l.replace('Q_enc', 'Charge inside r'))
      : []),
    ...worked(
      ok,
      `E × 4πr² = Q_enc ÷ ε₀, so E = kQ_enc ÷ r² = ${n3(o.k)} × ${n3(rule.enc)} ÷ ${n3(r)}² = ${n3(Math.abs(rule.E))} N/C`,
    ).map((l) => l.replace(/Q_enc/g, 'Q(inside)')),
    ...(g.flux ? worked(ok, `Φ = Q(inside) ÷ ε₀ = ${n3(rule.enc / o.eps0)} N·m²/C`) : []),
    ...(wrong
      ? [
          g.region === 'inside'
            ? 'r is outside the ball (r > R): this rule is for inside it.'
            : 'r is inside the ball (r < R): this rule is for outside it.',
        ]
      : []),
  ];
  return (
    <View>
      <Canvas aspect={hasR ? 1.1 : 0.8}>
        {({ w, h }) => {
          const topH = hasR ? h * 0.64 : h;
          const C = { x: w * 0.4, y: topH * 0.5 };
          const Rp = Math.min(w * 0.3, topH * 0.36);
          const s = Rp / frozen.value;
          const rp = r * s;
          const Rpx = R !== undefined ? R * s : 9;
          const arrows = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 + Math.PI / 8);
          const ra = -Math.PI / 8 + Math.PI / 4; // the r line, between two arrows
          const dragAt = drag(rp);
          const tip = {
            x: C.x + Math.cos(arrows[0]!) * (rp + 34),
            y: C.y - Math.sin(arrows[0]!) * (rp + 34),
          };
          return (
            <View>
              <Svg width={w} height={h} opacity={wrong ? 0.45 : 1}>
                <Defs>
                  <Ball id={paint.ball} color={col} />
                </Defs>
                {/* The charged ball (light, so the surface inside reads) and Q_enc shaded. */}
                {okR ? (
                  <Circle
                    cx={C.x}
                    cy={C.y}
                    r={Rpx}
                    fill={url(paint.ball)}
                    opacity={R !== undefined ? 0.35 : 1}
                  />
                ) : null}
                {okr && okR && inner ? (
                  <Circle cx={C.x} cy={C.y} r={rp} fill={c.he2eEnclosed} opacity={0.85} />
                ) : null}
                {okr ? (
                  <G>
                    <Circle
                      cx={C.x}
                      cy={C.y}
                      r={rp}
                      stroke={c.he2eSurface}
                      strokeWidth={1.8}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                    <Ellipse
                      cx={C.x}
                      cy={C.y}
                      rx={rp}
                      ry={rp * 0.25}
                      stroke={c.he2eSurface}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                    <Line
                      x1={C.x}
                      y1={C.y}
                      x2={C.x + Math.cos(-ra) * rp}
                      y2={C.y - Math.sin(-ra) * rp}
                      stroke={c.chartMuted}
                      strokeWidth={1.2}
                    />
                  </G>
                ) : null}
                {ok && Q !== 0
                  ? arrows.map((a) => (
                      <Radial
                        key={a}
                        x={C.x + Math.cos(a) * rp}
                        y={C.y - Math.sin(a) * rp}
                        ux={Math.cos(a)}
                        uy={-Math.sin(a)}
                        len={30}
                        out={Q > 0}
                        color={c.physField}
                      />
                    ))
                  : null}
                {R !== undefined && okR ? (
                  <G>
                    <Line
                      x1={C.x}
                      y1={C.y}
                      x2={C.x - Rpx}
                      y2={C.y}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                    <Lab
                      x={C.x - Rpx / 2}
                      y={C.y - 6}
                      sym="R"
                      value={H.say(g.R, R, 'm')}
                      anchor="middle"
                    />
                  </G>
                ) : null}
                <Lab
                  x={C.x}
                  y={C.y - Math.max(rp, Rpx) - 40 < 12 ? 12 : C.y - Math.max(rp, Rpx) - 40}
                  sym="Q"
                  value={H.say(g.Q, Q, 'C')}
                  anchor="middle"
                />
                {okr ? (
                  <Lab
                    x={C.x + Math.cos(-ra) * rp * 0.55}
                    y={C.y - Math.sin(-ra) * rp * 0.55 + 16}
                    sym="r"
                    value={H.say(g.r, r, 'm')}
                    anchor="middle"
                  />
                ) : null}
                {okr ? (
                  <Lab
                    x={inside(tip.x + 4, labW('E', Esay), w)}
                    y={tip.y - 6}
                    sym="E"
                    value={Esay}
                    bold
                  />
                ) : null}
                {R !== undefined ? (
                  <ProfileGraph
                    yName="E"
                    aName="R"
                    color={col}
                    x0={34}
                    y0={topH + 10}
                    x1={w - 14}
                    y1={h - 22}
                    a={R}
                    r={okr ? r : undefined}
                    shape={(x) => gaussRule('sphere', o, 1, x, R).E}
                  />
                ) : null}
              </Svg>
              {dragAt && okr ? (
                <DragHandle
                  testID="drag-r"
                  x={C.x + Math.cos(-ra) * rp}
                  y={C.y - Math.sin(-ra) * rp}
                  label="radius r"
                  onStart={() => {
                    frozen.freeze();
                    dragAt.onStart();
                  }}
                  onEnd={frozen.release}
                  onMove={(dx) => dragAt.onMove(dx)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A line charge and a Gaussian cylinder ────────────────────────────────────

function LineView({ spec, calc }: { spec: ChargesGauss; calc: Calculator }) {
  const c = usePalette();
  const H = useHe2e(calc);
  const paint = usePaintIds('rod');
  const g = spec.gauss;
  const o = electricOf(spec);
  const lam = H.v(g.Q, 1e-9);
  const r = Math.max(1e-12, H.v(g.r, 0.1));
  const R = g.R === undefined ? undefined : Math.max(1e-12, H.v(g.R, 0.01));
  const okQ = H.known(g.Q);
  const okr = H.known(g.r);
  const okR = H.known(g.R);
  const ok = okQ && okr && okR;
  const rule = gaussRule('line', o, lam, r, R, g.region);
  const wrong = ok && rule.wrong;
  const frozen = useFrozen(Math.max(r, R ?? 0));
  const drag = useScaleDrag(H, calc, spec.fixed ? undefined : g.r, ids(g.Q, g.R));
  const Esay = H.out(g.E, Math.abs(rule.E), 'N/C', ok);
  const withK = spec.eps0 === undefined;
  const capLines = [
    ...worked(
      ok,
      withK
        ? `E × 2πrℓ = λℓ ÷ ε₀, so E = 2kλ ÷ r = 2 × ${n3(o.k)} × ${n3(rule.enc)} ÷ ${n3(r)} = ${n3(Math.abs(rule.E))} N/C`
        : `E × 2πrℓ = λℓ ÷ ε₀, so E = λ ÷ (2πε₀r) = ${n3(rule.enc)} ÷ (2π × ${n3(o.eps0)} × ${n3(r)}) = ${n3(Math.abs(rule.E))} N/C`,
    ),
    'No flux leaves through the cylinder’s flat ends: E is square to the rod.',
    ...(wrong
      ? [
          g.region === 'inside'
            ? 'r is outside the charged cylinder (r > R): this rule is for inside it.'
            : 'r is inside the charged cylinder (r < R): this rule is for outside it.',
        ]
      : []),
  ];
  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w, h }) => {
          const C = { x: w * 0.5, y: h * 0.5 };
          const rpMax = h * 0.3;
          const s = rpMax / frozen.value;
          const rp = r * s;
          const Rp = R !== undefined ? Math.max(3, R * s) : 3;
          const [x0, x1] = [w * 0.26, w * 0.74];
          const ex = rp * 0.28;
          const dragAt = drag(rp);
          const out = lam >= 0;
          return (
            <View>
              <Svg width={w} height={h} opacity={wrong ? 0.45 : 1}>
                <Defs>
                  <Sheen id={paint.rod} vertical />
                </Defs>
                {/* The charged rod, + (or −) along it. */}
                {okR ? (
                  <G>
                    <Rect
                      x={6}
                      y={C.y - Rp}
                      width={w - 12}
                      height={2 * Rp}
                      fill={out ? c.physPlus : c.physMinus}
                      opacity={0.35}
                    />
                    <Rect x={6} y={C.y - Rp} width={w - 12} height={2 * Rp} fill={url(paint.rod)} />
                  </G>
                ) : null}
                {okQ && okr && okR ? (
                  <Rect
                    x={x0}
                    y={C.y - Math.min(Rp, rp)}
                    width={x1 - x0}
                    height={2 * Math.min(Rp, rp)}
                    fill={c.he2eEnclosed}
                    opacity={0.9}
                  />
                ) : null}
                {okQ
                  ? Array.from({ length: Math.floor((w - 24) / 22) }, (_, i) => 18 + i * 22).map(
                      (x) => (
                        <ChartText
                          key={x}
                          x={x}
                          y={C.y + 4}
                          fontSize={chart.small}
                          textAnchor="middle"
                          fill={out ? c.physPlus : c.physMinus}
                          fontWeight="700"
                        >
                          {out ? '+' : '−'}
                        </ChartText>
                      ),
                    )
                  : null}
                {/* The Gaussian cylinder, length ℓ, radius r. */}
                {okr ? (
                  <G>
                    {[C.y - rp, C.y + rp].map((y) => (
                      <Line
                        key={y}
                        x1={x0}
                        y1={y}
                        x2={x1}
                        y2={y}
                        stroke={c.he2eSurface}
                        strokeWidth={1.8}
                        strokeDasharray={chart.dash}
                      />
                    ))}
                    {[x0, x1].map((x) => (
                      <Ellipse
                        key={x}
                        cx={x}
                        cy={C.y}
                        rx={ex}
                        ry={rp}
                        stroke={c.he2eSurface}
                        strokeWidth={1.8}
                        strokeDasharray={chart.dash}
                        fill="none"
                      />
                    ))}
                    <Line
                      x1={x0 + 18}
                      y1={C.y}
                      x2={x0 + 18}
                      y2={C.y - rp}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                    <Lab x={x0 + 24} y={C.y - rp / 2 + 2} sym="r" value={H.say(g.r, r, 'm')} />
                    <Lab x={x1 + ex + 6} y={C.y - rp + 4} sym="ℓ" />
                  </G>
                ) : null}
                {ok && lam !== 0
                  ? [0.42, 0.58, 0.74].flatMap((t) =>
                      [-1, 1].map((sg) => (
                        <Radial
                          key={`${t}${sg}`}
                          x={x0 + (x1 - x0) * (t - 0.08)}
                          y={C.y + sg * rp}
                          ux={0}
                          uy={sg}
                          len={Math.min(30, C.y - rp - 6)}
                          out={out}
                          color={c.physField}
                        />
                      )),
                    )
                  : null}
                <Lab x={8} y={C.y - Rp - 8} sym="λ" value={H.say(g.Q, lam, 'C/m')} />
                {R !== undefined && okR ? (
                  <Lab x={8} y={C.y + Rp + 18} sym="R" value={H.say(g.R, R, 'm')} />
                ) : null}
                {okr ? (
                  <Lab
                    x={inside(x0 + (x1 - x0) * 0.66 + 6, labW('E', Esay), w)}
                    y={Math.max(14, C.y - rp - 22)}
                    sym="E"
                    value={Esay}
                    bold
                  />
                ) : null}
              </Svg>
              {dragAt && okr ? (
                <DragHandle
                  testID="drag-r"
                  x={x0 + 18}
                  y={C.y - rp}
                  label="radius r"
                  onStart={() => {
                    frozen.freeze();
                    dragAt.onStart();
                  }}
                  onEnd={frozen.release}
                  onMove={(_, dy) => dragAt.onMove(-dy)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A charged sheet and a pillbox ────────────────────────────────────────────

function PlaneView({ spec, calc }: { spec: ChargesGauss; calc: Calculator }) {
  const c = usePalette();
  const H = useHe2e(calc);
  const g = spec.gauss;
  const o = electricOf(spec);
  const sig = H.v(g.Q, 1e-9);
  const ok = H.known(g.Q);
  const p = gaussOf('plane', o, sig, 1);
  const E = Math.abs(p.E);
  const Esay = H.out(g.E, E, 'N/C', ok);
  const Bsay = H.out(g.between, Math.abs(sig) / o.eps0, 'N/C', ok);
  const two = g.between !== undefined;
  const out = sig >= 0;
  const col = out ? c.physPlus : c.physMinus;
  const capLines = [
    ...worked(
      ok,
      `E × 2A = σA ÷ ε₀, so E = σ ÷ (2ε₀) = ${n3(sig)} ÷ (2 × ${n3(o.eps0)}) = ${n3(E)} N/C`,
    ),
    'E is the same at every distance from the sheet.',
    ...(two
      ? worked(
          ok,
          `Between opposite sheets the fields add: E = σ ÷ ε₀ = ${n3(Math.abs(sig) / o.eps0)} N/C, and 0 outside`,
        )
      : []),
  ];
  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const C = { x: w * (two ? 0.38 : 0.46), y: h * 0.5 };
          const half = w * (two ? 0.3 : 0.38);
          const sheet = [
            [C.x - half, C.y + 20],
            [C.x + half - 30, C.y + 20],
            [C.x + half, C.y - 20],
            [C.x - half + 30, C.y - 20],
          ];
          const [rx, ry, hh] = [34, 10, h * 0.24];
          return (
            <Svg width={w} height={h}>
              {/* The sheet in perspective. */}
              <Polygon
                points={sheet.map((q) => q.join(',')).join(' ')}
                fill={col}
                opacity={ok ? 0.28 : 0.12}
                stroke={col}
              />
              {ok
                ? [-0.75, -0.45, 0.45, 0.75].map((k) => (
                    <ChartText
                      key={k}
                      x={C.x + k * half}
                      y={C.y + 4}
                      fontSize={chart.small}
                      textAnchor="middle"
                      fill={col}
                      fontWeight="700"
                    >
                      {out ? '+' : '−'}
                    </ChartText>
                  ))
                : null}
              {/* The charge the pillbox takes in, and the pillbox through the sheet. */}
              <Ellipse cx={C.x} cy={C.y} rx={rx} ry={ry} fill={c.he2eEnclosed} opacity={0.9} />
              {[C.y - hh, C.y + hh].map((y) => (
                <Ellipse
                  key={y}
                  cx={C.x}
                  cy={y}
                  rx={rx}
                  ry={ry}
                  stroke={c.he2eSurface}
                  strokeWidth={1.8}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
              ))}
              {[-rx, rx].map((dx) => (
                <Line
                  key={dx}
                  x1={C.x + dx}
                  y1={C.y - hh}
                  x2={C.x + dx}
                  y2={C.y + hh}
                  stroke={c.he2eSurface}
                  strokeWidth={1.8}
                  strokeDasharray={chart.dash}
                />
              ))}
              {/* E out of both faces, and the same elsewhere at other distances. */}
              {ok && sig !== 0
                ? [
                    [C.x, C.y - hh, -1],
                    [C.x, C.y + hh, 1],
                    [C.x - half * 0.7, C.y - 30, -1],
                    [C.x - half * 0.7, C.y + 30, 1],
                    [C.x + half * 0.7, C.y - hh - 10, -1],
                    [C.x + half * 0.7, C.y + hh - 34, 1],
                  ].map(([x, y, sg]) => (
                    <Radial
                      key={`${x},${y}`}
                      x={x!}
                      y={y!}
                      ux={0}
                      uy={sg!}
                      len={30}
                      out={out}
                      color={c.physField}
                    />
                  ))
                : null}
              <Lab x={C.x - half} y={C.y + 40} sym="σ" value={H.say(g.Q, sig, 'C/m²')} />
              <Lab x={C.x + rx + 6} y={C.y - hh - 16} sym="E" value={Esay} bold />
              {two ? (
                <G>
                  {/* Two opposite sheets edge-on: σ/ε₀ between, 0 outside. */}
                  {[
                    [C.y - 44, out],
                    [C.y + 44, !out],
                  ].map(([y, plus]) => (
                    <G key={String(y)}>
                      <Line
                        x1={w * 0.8}
                        y1={y as number}
                        x2={w - 10}
                        y2={y as number}
                        stroke={plus ? c.physPlus : c.physMinus}
                        strokeWidth={4}
                      />
                      <ChartText
                        x={w * 0.8 - 6}
                        y={(y as number) + 4}
                        textAnchor="end"
                        fill={plus ? c.physPlus : c.physMinus}
                        fontWeight="700"
                      >
                        {plus ? '+σ' : '−σ'}
                      </ChartText>
                    </G>
                  ))}
                  {ok && sig !== 0
                    ? [w * 0.84, w * 0.92].map((x) => (
                        <Vec
                          key={x}
                          x1={x}
                          y1={C.y - 38}
                          x2={x}
                          y2={C.y + 38}
                          color={c.physField}
                          width={2.2}
                          head={8}
                        />
                      ))
                    : null}
                  <Lab x={(w * 0.8 + w - 10) / 2} y={C.y - 56} sym="E" value="0" anchor="middle" />
                  <Lab x={(w * 0.8 + w - 10) / 2} y={C.y + 66} sym="E" value="0" anchor="middle" />
                  <Lab x={w - 8} y={h - 8} sym="E" value={`${Bsay} between`} anchor="end" bold />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A ring or a disk, and a point on its axis ────────────────────────────────

function AxisView({ spec, calc }: { spec: ChargesDistribution; calc: Calculator }) {
  const c = usePalette();
  const H = useHe2e(calc);
  const paint = usePaintIds('disk');
  const o = electricOf(spec);
  const disk = spec.distribution === 'disk';
  const q = H.v(spec.charge, 1e-9);
  const R = Math.max(1e-12, H.v(spec.radius, 0.3));
  const z = H.v(spec.z, 0.4);
  const okQ = H.known(spec.charge);
  const okR = H.known(spec.radius);
  const okZ = H.known(spec.z);
  const ok = okQ && okR && okZ;
  const ring = ringOf(o.k, q, R, z);
  const dk = diskOf(o.k, q, R, Math.abs(z));
  const E = disk ? dk.E : ring.E;
  const drag = useScaleDrag(
    H,
    calc,
    spec.fixed ? undefined : spec.z,
    ids(spec.charge, spec.radius),
  );
  const Esay = H.out(spec.field, Math.abs(E), 'N/C', ok);
  const out = q >= 0;
  const col = out ? c.physPlus : c.physMinus;
  const capLines = disk
    ? [
        ...worked(okQ, `The sheet’s field 2πkσ = ${n3(dk.sheet)} N/C`),
        ...worked(
          ok,
          `Adding rings from the center to R: E = 2πkσ(1 − z ÷ √(z² + R²)) = ${n3(dk.sheet)} × (1 − ${n3(z)} ÷ ${n3(Math.hypot(z, R))}) = ${n3(E)} N/C`,
        ),
        'Close to the disk E nears the sheet’s field; far away the disk acts as a point charge.',
      ]
    : [
        ...worked(
          ok,
          `V = kQ ÷ √(z² + R²) = ${n3(o.k)} × ${n3(q)} ÷ ${n3(Math.hypot(z, R))} = ${n3(ring.V)} V`,
        ),
        ...worked(
          ok,
          `On the axis E = kQz ÷ (z² + R²)^(3/2) = ${n3(o.k)} × ${n3(q)} × ${n3(z)} ÷ ${n3(Math.hypot(z, R))}³ = ${n3(E)} N/C`,
        ),
        'The sideways parts of dE from opposite pieces cancel; the parts along the axis add.',
      ];
  return (
    <View>
      <Canvas aspect={0.74}>
        {({ w, h }) => {
          const C = { x: w * 0.26, y: h * 0.47 };
          const Rpx = Math.min(h * 0.33, w * 0.2);
          const zMax = (w - 60 - C.x) / Rpx;
          const zMin = -(C.x - 16) / Rpx;
          const zr = z / R;
          const zd = Math.max(zMin, Math.min(zMax, zr));
          const far = zr > zMax || zr < zMin;
          const P = { x: C.x + zd * Rpx, y: C.y };
          const dir = Math.sign(z || 1) * (out ? 1 : -1);
          // Two opposite pieces: the ring's top and bottom (a ring inside the disk).
          const pr = disk ? 0.65 : 1;
          const pieces = [-1, 1].map((sg) => ({ x: C.x, y: C.y + sg * pr * Rpx }));
          const dragAt = drag(Math.abs(P.x - C.x));
          const Ld = 44;
          return (
            <View>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={paint.disk} vertical />
                </Defs>
                {/* The axis. */}
                <Line
                  x1={8}
                  y1={C.y}
                  x2={w - 8}
                  y2={C.y}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                {okR ? (
                  disk ? (
                    <G>
                      <Ellipse
                        cx={C.x}
                        cy={C.y}
                        rx={Rpx * 0.25}
                        ry={Rpx}
                        fill={col}
                        opacity={okQ ? 0.35 : 0.12}
                        stroke={col}
                      />
                      <Ellipse cx={C.x} cy={C.y} rx={Rpx * 0.25} ry={Rpx} fill={url(paint.disk)} />
                    </G>
                  ) : (
                    <Ellipse
                      cx={C.x}
                      cy={C.y}
                      rx={Rpx * 0.25}
                      ry={Rpx}
                      stroke={col}
                      strokeWidth={4}
                      fill="none"
                    />
                  )
                ) : null}
                {okQ && okR
                  ? pieces.map((pc) => (
                      <Circle key={pc.y} cx={pc.x} cy={pc.y} r={5} fill={col} stroke={c.card} />
                    ))
                  : null}
                {/* dE from each piece at P, split into the part along the axis and sideways. */}
                {ok && q !== 0 && okZ
                  ? pieces.map((pc) => {
                      const dx = P.x - pc.x;
                      const dy = P.y - pc.y;
                      const d = Math.hypot(dx, dy) || 1;
                      const ux = (dx / d) * (out ? 1 : -1);
                      const uy = (dy / d) * (out ? 1 : -1);
                      return (
                        <G key={pc.y}>
                          <Line
                            x1={pc.x}
                            y1={pc.y}
                            x2={P.x}
                            y2={P.y}
                            stroke={c.chartGrid}
                            strokeWidth={1}
                          />
                          <Vec
                            x1={P.x}
                            y1={P.y}
                            x2={P.x + ux * Ld}
                            y2={P.y + uy * Ld}
                            color={c.physField}
                            width={2}
                            head={7}
                          />
                          <Vec
                            x1={P.x + ux * Ld}
                            y1={P.y}
                            x2={P.x + ux * Ld}
                            y2={P.y + uy * Ld}
                            color={c.physField}
                            width={1.4}
                            head={6}
                            dash={chart.dashFine}
                          />
                        </G>
                      );
                    })
                  : null}
                {ok && E !== 0 ? (
                  <Vec
                    x1={P.x}
                    y1={P.y}
                    x2={
                      P.x +
                      dir *
                        Math.min(
                          56,
                          disk
                            ? (56 * Math.abs(E)) / Math.abs(dk.sheet)
                            : (2 * Ld * Math.abs(P.x - C.x)) / Math.hypot(P.x - C.x, pr * Rpx),
                        )
                    }
                    y2={P.y}
                    color={c.chartInk}
                    width={3}
                  />
                ) : null}
                {disk && ok && q !== 0 ? (
                  <G>
                    <Vec
                      x1={P.x}
                      y1={P.y + 22}
                      x2={P.x + dir * 56}
                      y2={P.y + 22}
                      color={c.chartMuted}
                      width={1.6}
                      dash={chart.dash}
                    />
                    <Lab
                      x={P.x + dir * 60}
                      y={P.y + 26}
                      sym="2πkσ"
                      anchor={dir > 0 ? 'start' : 'end'}
                    />
                  </G>
                ) : null}
                {okZ ? <Circle cx={P.x} cy={P.y} r={3.5} fill={c.he2eSurface} /> : null}
                {okR ? (
                  <Lab
                    x={C.x - Rpx * 0.25 - 4}
                    y={C.y - Rpx * 0.5}
                    sym="R"
                    value={H.say(spec.radius, R, 'm')}
                    anchor={
                      C.x - Rpx * 0.25 - 4 - labW('R', H.say(spec.radius, R, 'm')) < 4
                        ? 'start'
                        : 'end'
                    }
                  />
                ) : null}
                <Lab
                  x={C.x}
                  y={Math.max(12, C.y - Rpx - 10)}
                  sym={disk ? 'σ' : 'Q'}
                  value={H.say(spec.charge, q, disk ? 'C/m²' : 'C')}
                  anchor="start"
                />
                {okZ ? (
                  <G>
                    <Line
                      x1={C.x}
                      y1={C.y + Rpx + 14}
                      x2={P.x}
                      y2={C.y + Rpx + 14}
                      stroke={c.chartMuted}
                    />
                    <Lab
                      x={(C.x + P.x) / 2}
                      y={C.y + Rpx + 30}
                      sym="z"
                      value={`${H.say(spec.z, z, 'm')}${far ? ' (drawn closer)' : ''}`}
                      anchor="middle"
                    />
                  </G>
                ) : null}
                {okZ ? (
                  <Lab
                    x={inside(P.x - 10, labW('E_z', Esay), w)}
                    y={C.y - 52}
                    sym="E_z"
                    value={Esay}
                    bold
                  />
                ) : null}
              </Svg>
              {dragAt && okZ ? (
                <DragHandle
                  testID="drag-z"
                  x={P.x}
                  y={P.y}
                  label="axial distance z"
                  onStart={dragAt.onStart}
                  onMove={(dx) => dragAt.onMove(z >= 0 ? dx : -dx)}
                />
              ) : null}
            </View>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}

// ─── A charge over a grounded plane, and its image ────────────────────────────

function ImageView({ spec, calc }: { spec: ChargesDistribution; calc: Calculator }) {
  const c = usePalette();
  const H = useHe2e(calc);
  const paint = usePaintIds('q', 'plate');
  const o = electricOf(spec);
  const q = H.v(spec.charge, 1e-9);
  const d = Math.max(1e-12, H.v(spec.z, 0.05));
  const okQ = H.known(spec.charge);
  const okD = H.known(spec.z);
  const ok = okQ && okD;
  const im = imageOf(o.k, q, d);
  const out = q >= 0;
  const col = out ? c.physPlus : c.physMinus;
  const anti = out ? c.physMinus : c.physPlus;
  const Fsay = H.out(spec.force, im.F, 'N', ok);
  const capLines = [
    'The grounded plane stays at V = 0: the charge and an image −q at −d below give V = 0 all over it.',
    ...worked(
      ok,
      `F = kq² ÷ (2d)² = ${n3(o.k)} × (${n3(q)})² ÷ (2 × ${n3(d)})² = ${n3(im.F)} N, toward the plane`,
    ),
    ...worked(ok, `Under the charge σ₀ = −q ÷ (2πd²) = ${n3(im.sigma0)} C/m²`),
    'The induced charge adds to −q.',
  ];
  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const yP = h * 0.6;
          const X = w * 0.46;
          const dp = Math.min(h * 0.34, w * 0.3);
          const yq = yP - dp;
          const yi = yP + dp;
          const poles: Pole[] = [
            { x: X, y: yq, q: out ? 1 : -1 },
            { x: X, y: yi, q: out ? -1 : 1 },
          ];
          const box = { x0: 0, y0: 0, x1: w, y1: yP - 6 };
          const starts = Array.from({ length: 12 }, (_, i) => ((i + 0.5) / 12) * 2 * Math.PI);
          const lines = ok
            ? starts.map((a) =>
                traceLine(
                  poles,
                  X + 12 * Math.cos(a),
                  yq + 12 * Math.sin(a),
                  box,
                  [],
                  2,
                  6,
                  900,
                  out ? 1 : -1,
                ),
              )
            : [];
          // The induced charge's density along the plane, shaded by its size.
          const slices = Array.from({ length: 40 }, (_, i) => (i / 40) * w);
          const unit = dp / d;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={paint.q} color={col} />
                <Sheen id={paint.plate} vertical />
              </Defs>
              {lines.map((pts, i) => {
                const at = arrowAt(pts, 0.4);
                return (
                  <G key={i}>
                    <Path d={pathOf(pts)} stroke={c.physField} strokeWidth={1.3} fill="none" />
                    {at ? (
                      <Path
                        d={arrowHead(
                          at.x,
                          at.y,
                          Math.cos((at.angle * Math.PI) / 180) * (out ? 1 : -1),
                          Math.sin((at.angle * Math.PI) / 180) * (out ? 1 : -1),
                          7,
                        )}
                        fill={c.physField}
                      />
                    ) : null}
                  </G>
                );
              })}
              {/* The grounded metal plane, its induced charge shaded on top. */}
              <Rect x={4} y={yP} width={w - 8} height={10} fill={c.metal} stroke={c.metalDark} />
              <Rect x={4} y={yP} width={w - 8} height={10} fill={url(paint.plate)} />
              {ok
                ? slices.map((x) => {
                    const k = Math.abs(im.sigmaAt((x + w / 80 - X) / unit) / im.sigma0);
                    return (
                      <Rect
                        key={x}
                        x={x}
                        y={yP - 4}
                        width={w / 40 + 0.5}
                        height={5}
                        fill={anti}
                        opacity={0.9 * k}
                      />
                    );
                  })
                : null}
              {/* Ground. */}
              <Line x1={w - 24} y1={yP + 10} x2={w - 24} y2={yP + 22} stroke={c.chartInk} />
              {[14, 9, 4].map((half, i) => (
                <Line
                  key={half}
                  x1={w - 24 - half}
                  y1={yP + 22 + i * 4}
                  x2={w - 24 + half}
                  y2={yP + 22 + i * 4}
                  stroke={c.chartInk}
                />
              ))}
              {/* The image, dashed, below. */}
              {okD ? (
                <G>
                  <Line
                    x1={X}
                    y1={yq}
                    x2={X}
                    y2={yi}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dashFine}
                  />
                  <Circle
                    cx={X}
                    cy={yi}
                    r={11}
                    stroke={anti}
                    strokeWidth={1.6}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <ChartText x={X} y={yi + 4} textAnchor="middle" fill={anti} fontWeight="700">
                    {out ? '−' : '+'}
                  </ChartText>
                  <Lab x={X + 16} y={yi + 4} sym="−q (image)" />
                  <Lab
                    x={X - 8}
                    y={(yq + yP) / 2 + 4}
                    sym="d"
                    value={H.say(spec.z, d, 'm')}
                    anchor="end"
                  />
                  <Lab x={X - 8} y={(yi + yP) / 2 + 10} sym="d" anchor="end" />
                </G>
              ) : null}
              <Circle cx={X} cy={yq} r={11} fill={url(paint.q)} />
              <ChartText x={X} y={yq + 4} textAnchor="middle" fill={c.card} fontWeight="700">
                {out ? '+' : '−'}
              </ChartText>
              <Lab
                x={X}
                y={Math.max(12, yq - 18)}
                sym="q"
                value={H.say(spec.charge, q, 'C')}
                anchor="middle"
              />
              {ok && q !== 0 ? (
                <G>
                  <Vec
                    x1={X + 22}
                    y1={yq - 6}
                    x2={X + 22}
                    y2={yq + 34}
                    color={c.forceApplied}
                    width={2.6}
                  />
                  <Lab
                    x={inside(X + 30, labW('F', Fsay), w)}
                    y={yq + 22}
                    sym="F"
                    value={Fsay}
                    bold
                    color={c.forceApplied}
                  />
                </G>
              ) : null}
              <Lab x={10} y={yP - 10} sym="σ" />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{capLines.join(' · ')}</Caption>
    </View>
  );
}
