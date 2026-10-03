/**
 * The college `projection` picture (HC78, EG-P28): a world map on a cylinder (Mercator,
 * cylindrical equal-area or equirectangular) computed from its formulas, the graticule every
 * 15°, rough land shapes written in code, Tissot ellipses (the equator's and φ's lit, with
 * their axes k_E and k_N; faint ones every 30°), and the parallel φ with its height y. Flat, like
 * a diagram. Math in `projectionMath.ts`; paths in `projectionDraw.ts`.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ProjectionSpec } from '@/data/modules/typesHe3m';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle } from './common';
import { HeLabel } from './beamKit';
import { n3, useReader, VDim } from './he3mKit';
import { url, usePaintIds } from './paint';
import { mapPaths } from './projectionDraw';
import {
  RAD,
  jacobian,
  latitudeAt,
  parallelY,
  project,
  scaleFactors,
  tissot,
} from './projectionMath';

const NAMES = {
  mercator: 'Mercator',
  cylindricalEqualArea: 'Cylindrical equal-area',
  equirectangular: 'Equirectangular',
} as const;

/** Where the lit Tissot ellipses sit (the open Pacific) and the faint ones (the Atlantic). */
const LIT_LON = -120;
const FAINT_LON = -35;
/** The Tissot circle's radius on the globe, in globe radii (7°). */
const RHO = 7 * RAD;

export function Projection({ spec, calc }: { spec: ProjectionSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const ids = usePaintIds('map');
  const start = useRef(0);
  const name = spec.projection;
  const latIn = r.get(spec.latitude);
  const R = r.get(spec.radius);
  const merc = name === 'mercator';
  const lat = latIn !== undefined && Math.abs(latIn) < 90 ? latIn : undefined;
  const top = merc ? Math.min(85, Math.max(80, Math.abs(lat ?? 0) + 5)) : 90;
  const yTop = project(name, top, 0)[1];
  const ks = lat !== undefined ? scaleFactors(name, lat) : undefined;
  const y = lat !== undefined && R !== undefined ? parallelY(name, lat, R) : undefined;
  const unit = typeof spec.radius === 'string' ? (r.rep.unit(spec.radius) ?? '') : '';

  const geom = (w: number) => {
    const left = 8;
    const mapW = w - 16;
    const s = mapW / (2 * Math.PI);
    const topPad = 22;
    const mapH = 2 * yTop * s;
    const P = (x: number, yy: number): [number, number] => [
      left + (x + Math.PI) * s,
      topPad + (yTop - yy) * s,
    ];
    return { s, P, mapW, mapH, left, topPad, h: topPad + mapH + 26 };
  };

  const art = (w: number) => {
    const { s, P, mapW, mapH, left, topPad, h } = geom(w);
    const paths = mapPaths(name, P, { every: 15, mercatorTop: top });
    const ellipse = (la: number, lo: number) =>
      `M ${tissot(name, la, lo, RHO)
        .map(([x, yy]) =>
          P(x, yy)
            .map((v) => v.toFixed(1))
            .join(' '),
        )
        .join(' L ')} Z`;
    const faint = [-60, -30, 0, 30, 60].filter((la) => Math.abs(la) < top - 8);
    const eq = P(...project(name, 0, LIT_LON));
    const at = lat !== undefined ? P(...project(name, lat, LIT_LON)) : undefined;
    const yLat = at?.[1];
    const yEq = topPad + yTop * s;
    const xRight = left + mapW;
    return (
      <Svg width={w} height={h}>
        <Defs>
          <ClipPath id={ids.map}>
            <Rect x={left} y={topPad} width={mapW} height={mapH} />
          </ClipPath>
        </Defs>
        <Rect x={left} y={topPad} width={mapW} height={mapH} fill={c.globeSea} />
        <G clipPath={url(ids.map)}>
          {spec.land
            ? paths.land.map((d, i) => (
                <Path key={i} d={d} fill={c.mapLand} stroke={c.mapCoast} strokeWidth={0.8} />
              ))
            : null}
          {paths.parallels.map((p) => (
            <Path
              key={`p${p.lat}`}
              d={p.d}
              stroke={p.lat === 0 ? c.chartMuted : c.chartGrid}
              strokeWidth={p.lat === 0 ? 1.4 : 0.8}
              fill="none"
            />
          ))}
          {paths.meridians.map((m) => (
            <Path key={`m${m.lon}`} d={m.d} stroke={c.chartGrid} strokeWidth={0.8} fill="none" />
          ))}
          {faint.map((la) => (
            <Path
              key={`f${la}`}
              d={ellipse(la, FAINT_LON)}
              fill={c.tissot}
              fillOpacity={0.25}
              stroke={c.tissot}
              strokeWidth={1}
            />
          ))}
          <Path
            d={ellipse(0, LIT_LON)}
            fill={c.tissot}
            fillOpacity={0.45}
            stroke={c.tissot}
            strokeWidth={1.6}
          />
          {at && yLat !== undefined ? (
            <G>
              <Line
                x1={left}
                y1={yLat}
                x2={xRight}
                y2={yLat}
                stroke={c.chartHighlight}
                strokeWidth={2.4}
              />
              <Path
                d={ellipse(lat!, LIT_LON)}
                fill={c.tissot}
                fillOpacity={0.55}
                stroke={c.chartHighlight}
                strokeWidth={1.8}
              />
            </G>
          ) : null}
        </G>
        <Rect
          x={left}
          y={topPad}
          width={mapW}
          height={mapH}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        {/* Latitude numbers on the left edge every 30°. */}
        {[-60, -30, 30, 60].map((la) =>
          // Not on the lit parallel, whose ellipse and labels are there.
          Math.abs(la) < top &&
          (yLat === undefined || Math.abs(P(0, project(name, la, 0)[1])[1] - yLat) > 28) ? (
            <ChartText
              key={la}
              x={left + 3}
              y={P(0, project(name, la, 0)[1])[1] - 2}
              fontSize={chart.tiny}
              fill={c.chartMuted}
            >
              {`${Math.abs(la)}°${la < 0 ? 'S' : 'N'}`}
            </ChartText>
          ) : null,
        )}
        <ChartText x={left} y={h - 8} fontSize={chart.small} fontWeight="700">
          {NAMES[name]}
        </ChartText>
        {at && ks ? (
          <G>
            <HeLabel
              x={at[0]}
              y={Math.max(13, at[1] - jacobian(name, lat!, LIT_LON).kN * RHO * s - 6)}
              text={`${r.sym(spec.kE, 'k_E')} = ${r.text(spec.kE, ks.kE)}`}
              w={w}
              color={c.chartHighlight}
            />
            <HeLabel
              x={at[0] + jacobian(name, lat!, LIT_LON).kE * RHO * s + 6}
              y={at[1] + 4}
              anchor="start"
              text={`${r.sym(spec.kN, 'k_N')} = ${r.text(spec.kN, ks.kN)}`}
              w={w}
              color={c.chartHighlight}
            />
          </G>
        ) : null}
        <ChartText
          x={eq[0]}
          y={eq[1] + RHO * s + 14}
          textAnchor="middle"
          fontSize={chart.tiny}
          fill={c.chartInk}
        >
          k = 1
        </ChartText>
        {yLat !== undefined && Math.abs(yLat - yEq) > 3 ? (
          <VDim
            x={xRight - 10}
            y1={yEq}
            y2={yLat}
            text={y !== undefined ? r.named(spec.y, 'y', y, unit) : 'y'}
            w={w}
            side={-1}
          />
        ) : null}
        {lat !== undefined ? (
          <HeLabel
            x={xRight - 4}
            y={h - 8}
            anchor="end"
            text={`${r.sym(spec.latitude, 'φ')} = ${r.text(spec.latitude, lat, '°')}`}
            w={w}
          />
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (latIn !== undefined && lat === undefined)
    lines.push('A pole never fits a cylinder: φ must be between −90° and 90°.');
  if (lat !== undefined && ks) {
    const phi = r.text(spec.latitude, lat, '°');
    const kE = r.sym(spec.kE, merc ? 'k' : 'k_E');
    if (merc) {
      lines.push(
        `${kE} = 1 ÷ cos ${phi} = ${r.text(spec.kE, ks.kE)}; areas grow × ${kE}² = ${r.text(spec.area, ks.kE ** 2)}.`,
      );
      if (y !== undefined)
        lines.push(
          `${r.sym(spec.y, 'y')} = ${r.sym(spec.radius, 'R')} ln tan(45° + φ ÷ 2) = ${r.bare(spec.radius, R!)} × ln ${n3(Math.tan((45 + lat / 2) * RAD))} = ${r.text(spec.y, y, unit)}.`,
        );
      lines.push(
        'Conformal: each circle stays a circle, growing toward the poles, which never fit.',
      );
    } else if (name === 'cylindricalEqualArea') {
      if (y !== undefined)
        lines.push(
          `${r.sym(spec.y, 'y')} = ${r.sym(spec.radius, 'R')} sin φ = ${r.bare(spec.radius, R!)} × sin ${phi} = ${r.text(spec.y, y, unit)}.`,
        );
      lines.push(
        `k_E = 1 ÷ cos φ = ${r.text(spec.kE, ks.kE)}, k_N = cos φ = ${r.text(spec.kN, ks.kN)}: k_E × k_N = ${r.text(spec.area, ks.kE * ks.kN)}, so areas are true and shapes squashed.`,
      );
    } else {
      if (y !== undefined)
        lines.push(
          `${r.sym(spec.y, 'y')} = ${r.sym(spec.radius, 'R')} × φ in radians = ${r.text(spec.y, y, unit)}.`,
        );
      lines.push(
        `k_E = 1 ÷ cos φ = ${n3(ks.kE)}, k_N = 1: distances along the meridians are true.`,
      );
    }
  }
  return (
    <View>
      <Canvas aspect={(w) => geom(w).h / w}>
        {({ w }) => {
          const { P, s } = geom(w);
          const at = lat !== undefined ? P(...project(name, lat, LIT_LON)) : undefined;
          return (
            <>
              {art(w)}
              {at && typeof spec.latitude === 'string' ? (
                <DragHandle
                  testID="drag-latitude"
                  x={at[0]}
                  y={at[1]}
                  label="the latitude φ"
                  onStart={() => {
                    start.current = project(name, lat!, 0)[1];
                  }}
                  onMove={(_, my) => {
                    const id = spec.latitude as string;
                    const la = latitudeAt(name, start.current - my / s, 1);
                    calc.set({
                      ...r.rep.pinTyped(typeof spec.radius === 'string' ? [spec.radius] : []),
                      [id]: r.rep.snapTo(id, Math.max(-(top - 1), Math.min(top - 1, la))),
                    });
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ') || 'Type a latitude to light its parallel.'}</Caption>
    </View>
  );
}
