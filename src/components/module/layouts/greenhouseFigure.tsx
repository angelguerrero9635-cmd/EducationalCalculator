import type { ReactNode } from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { GreenhouseScene } from '@/data/modules/typesHsl';
import { chart, usePalette, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { Ball, Deepen, url, usePaintIds } from '../reps/paint';
import { Board, BOARD_W, HaloText } from './earthKit';

/**
 * Per level: CO₂ molecules drawn, infrared rays sent back down (of four), and the mean surface
 * temperature (°C): about −18 with no greenhouse gases at all, about 14 before 1750, and about
 * 15 today (1.2 °C warmer).
 */
export const GREENHOUSE_LEVELS = {
  none: { molecules: 0, back: 0, temp: -18, label: 'no greenhouse gases' },
  preindustrial: { molecules: 4, back: 2, temp: 14, label: '280 ppm CO₂ (before 1750)' },
  today: { molecules: 6, back: 3, temp: 15.2, label: 'about 420 ppm CO₂ (today)' },
} as const;

/** A wavy infrared ray from (x, y0) to (x, y1), with its head. */
function wavy(c: Palette, x: number, y0: number, y1: number, key: string, color: string) {
  const n = Math.max(2, Math.round(Math.abs(y1 - y0) / 10));
  const dir = y1 > y0 ? 1 : -1;
  let d = `M ${x} ${y0}`;
  for (let i = 0; i < n; i++) {
    const ya = y0 + (dir * (i + 0.5) * Math.abs(y1 - y0)) / n;
    const yb = y0 + (dir * (i + 1) * Math.abs(y1 - y0)) / n;
    d += ` Q ${x + (i % 2 ? -5 : 5)} ${ya} ${x} ${yb}`;
  }
  return (
    <G key={key}>
      <Path d={d} stroke={color} strokeWidth={2.2} fill="none" />
      <Path
        d={`M ${x - 5} ${y1 - dir * 7} L ${x} ${y1} L ${x + 5} ${y1 - dir * 7}`}
        stroke={color}
        strokeWidth={2.2}
        fill="none"
        strokeLinejoin="round"
      />
    </G>
  );
}

/** A straight arrow of sunlight. */
function ray(c: Palette, a: [number, number], b: [number, number], key: string) {
  const t = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <G key={key}>
      <Line
        x1={a[0]}
        y1={a[1]}
        x2={b[0]}
        y2={b[1]}
        stroke={c.sunRay}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d={`M ${b[0] - 8 * Math.cos(t - 0.45)} ${b[1] - 8 * Math.sin(t - 0.45)} L ${b[0]} ${b[1]} L ${b[0] - 8 * Math.cos(t + 0.45)} ${b[1] - 8 * Math.sin(t + 0.45)}`}
        stroke={c.sunRay}
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
      />
    </G>
  );
}

/**
 * The greenhouse effect and climate zones (H77). `energy`: sunlight passes through the air and
 * warms the ground; the ground gives off infrared; greenhouse gases absorb some of it and send it
 * back down, so more CO₂ keeps more heat in (the molecules and returned rays counted by level,
 * and the thermometer at the mean surface temperature). `zones`: Earth at an equinox, lit from the
 * left, with the tropical, temperate and polar zones and the same beam of sunlight spread over
 * a larger area the higher the latitude.
 */
export function GreenhouseFigure({ scene }: { scene: GreenhouseScene }) {
  return scene.view === 'zones' ? (
    <Zones lit={scene.lit} />
  ) : (
    <Energy co2={scene.co2 ?? 'preindustrial'} />
  );
}

const EH = 300;
const AIR_TOP = 62;
const AIR_BOTTOM = 176;
const GROUND = 222;

function Energy({ co2 }: { co2: NonNullable<GreenhouseScene['co2']> }) {
  const c = usePalette();
  const ids = usePaintIds('sun', 'soil', 'c', 'o', 'cloud');
  const level = GREENHOUSE_LEVELS[co2];
  const spots: [number, number][] = [
    [150, 96],
    [250, 120],
    [200, 84],
    [300, 100],
    [120, 140],
    [270, 150],
  ];
  const molecules = spots.slice(0, level.molecules);
  const irX = [160, 205, 250, 295];
  const back = level.back;
  // The rays sent back: absorbed by a molecule above them and re-emitted down.
  const rays: ReactNode[] = irX.map((x, i) => {
    const absorbed = i >= irX.length - back;
    return wavy(c, x, GROUND - 4, absorbed ? 118 : 10, `up${i}`, c.spectrumRed);
  });
  const down: ReactNode[] = irX
    .slice(irX.length - back)
    .map((x, i) => wavy(c, x + 16, 124, GROUND - 4, `down${i}`, c.mercury));
  const tMin = -30;
  const tMax = 30;
  const tY = (t: number) => GROUND + 58 - ((t - tMin) / (tMax - tMin)) * 110;
  return (
    <Board height={EH}>
      <Defs>
        <Ball id={ids.sun} color={c.sunDisk} />
        <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
        <Ball id={ids.c} color={c.atomC} />
        <Ball id={ids.o} color={c.atomO} />
        <Ball id={ids.cloud} color={c.rainCloud} />
      </Defs>
      <Rect x={0} y={0} width={BOARD_W} height={AIR_TOP} fill={c.space} />
      <Rect x={0} y={AIR_TOP} width={BOARD_W} height={GROUND - AIR_TOP} fill={c.airBand} />
      <Rect x={0} y={GROUND} width={BOARD_W} height={EH - GROUND} fill={url(ids.soil)} />
      <Path d={`M 0 ${GROUND} H ${BOARD_W}`} stroke={c.landGrass} strokeWidth={4} />
      <ChartText x={BOARD_W - 6} y={18} fontSize={chart.label} textAnchor="end" fill={c.moonLit}>
        space
      </ChartText>
      <HaloText
        x={BOARD_W - 6}
        y={AIR_TOP + 16}
        text="atmosphere"
        c={c}
        size={chart.label}
        anchor="end"
      />
      {/* The Sun, and sunlight in: most reaches the ground, some bounces off a cloud. */}
      <Circle cx={30} cy={30} r={20} fill={url(ids.sun)} />
      <Ellipse cx={112} cy={96} rx={22} ry={10} fill={url(ids.cloud)} />
      <Ellipse cx={100} cy={90} rx={12} ry={9} fill={url(ids.cloud)} />
      {ray(c, [44, 48], [96, GROUND - 4], 'r1')}
      {ray(c, [50, 42], [130, GROUND - 4], 'r2')}
      {ray(c, [48, 36], [98, 84], 'r3')}
      {ray(c, [100, 82], [150, 12], 'r4')}
      <HaloText
        x={62}
        y={AIR_TOP + 54}
        text="sunlight in"
        c={c}
        size={chart.label}
        bold
        anchor="start"
      />
      {/* Infrared out from the warm ground; some absorbed and sent back down. */}
      {rays}
      {down}
      {molecules.map(([x, y], i) => (
        <G key={i}>
          <Line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke={c.atomBond} strokeWidth={2.5} />
          <Circle cx={x - 10} cy={y} r={5} fill={url(ids.o)} />
          <Circle cx={x} cy={y} r={5.5} fill={url(ids.c)} />
          <Circle cx={x + 10} cy={y} r={5} fill={url(ids.o)} />
        </G>
      ))}
      <HaloText
        x={BOARD_W - 6}
        y={AIR_TOP + 36}
        text={level.label}
        c={c}
        size={chart.label}
        bold
        anchor="end"
      />
      <HaloText
        x={250}
        y={GROUND + 18}
        text="infrared out"
        c={c}
        size={chart.label}
        fill={c.spectrumRed}
        bold
      />
      {back > 0 ? (
        <HaloText
          x={250}
          y={AIR_BOTTOM + 30}
          text="sent back down"
          c={c}
          size={chart.label}
          fill={c.mercury}
          bold
        />
      ) : null}
      {/* The thermometer: the mean surface temperature. */}
      <Rect
        x={22}
        y={GROUND - 54}
        width={12}
        height={114}
        rx={6}
        fill={c.paper}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      <Rect
        x={25}
        y={tY(level.temp)}
        width={6}
        height={GROUND + 58 - tY(level.temp)}
        fill={c.mercury}
      />
      <Circle cx={28} cy={GROUND + 60} r={8} fill={c.mercury} stroke={c.chartInk} strokeWidth={1} />
      <Line x1={34} y1={tY(0)} x2={40} y2={tY(0)} stroke={c.chartInk} strokeWidth={1} />
      <HaloText
        x={44}
        y={tY(level.temp) + 4}
        text={`${level.temp < 0 ? `−${-level.temp}` : level.temp} °C`}
        c={c}
        size={chart.value}
        bold
        anchor="start"
      />
    </Board>
  );
}

const ZH = 260;
const CX = 200;
const CY = 128;
const RR = 104;

/** The part of the globe between latitudes a and b (degrees), as a closed path. */
function band(a: number, b: number) {
  const pts: string[] = [];
  const steps = 24;
  const rad = (d: number) => (d * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const t = rad(a + ((b - a) * i) / steps);
    pts.push(`${(CX + RR * Math.cos(t)).toFixed(1)} ${(CY - RR * Math.sin(t)).toFixed(1)}`);
  }
  for (let i = 0; i <= steps; i++) {
    const t = rad(b + ((a - b) * i) / steps);
    pts.push(`${(CX - RR * Math.cos(t)).toFixed(1)} ${(CY - RR * Math.sin(t)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function Zones({ lit }: { lit?: GreenhouseScene['lit'] }) {
  const c = usePalette();
  const ids = usePaintIds('globe', 'clip');
  const zones: [number, number, string, NonNullable<GreenhouseScene['lit']>][] = [
    [66.5, 90, c.ice, 'polar'],
    [23.5, 66.5, c.landGrass, 'temperate'],
    [-23.5, 23.5, c.zoneTropical, 'tropical'],
    [-66.5, -23.5, c.landGrass, 'temperate'],
    [-90, -66.5, c.ice, 'polar'],
  ];
  const y = (lat: number) => CY - RR * Math.sin((lat * Math.PI) / 180);
  const xl = (lat: number) => CX - RR * Math.cos((lat * Math.PI) / 180);
  // One beam 20 units wide, at the equator and at 50° N: the same light, spread 1 ÷ cos 50°.
  const beam = (lat: number, key: string) => {
    const w = 20;
    const y0 = y(lat) - w / 2;
    const y1 = y(lat) + w / 2;
    const la = (Math.asin((CY - y0) / RR) * 180) / Math.PI;
    const lb = (Math.asin((CY - y1) / RR) * 180) / Math.PI;
    return (
      <G key={key}>
        <Rect x={4} y={y0} width={xl(lat) - 4} height={w} fill={c.sunDisk} opacity={0.35} />
        <Line x1={4} y1={y0} x2={xl(la)} y2={y0} stroke={c.sunRay} strokeWidth={2} />
        <Line x1={4} y1={y1} x2={xl(lb)} y2={y1} stroke={c.sunRay} strokeWidth={2} />
        <Path
          d={`M ${xl(la)} ${y0} A ${RR} ${RR} 0 0 0 ${xl(lb)} ${y1}`}
          stroke={c.chartHighlight}
          strokeWidth={5}
          fill="none"
        />
      </G>
    );
  };
  return (
    <Board height={ZH}>
      <Defs>
        <ClipPath id={ids.clip}>
          <Circle cx={CX} cy={CY} r={RR} />
        </ClipPath>
      </Defs>
      <G clipPath={url(ids.clip)}>
        {zones.map(([a, b, col, name]) => (
          <Path key={`${a}`} d={band(a, b)} fill={col} opacity={lit && lit !== name ? 0.35 : 1} />
        ))}
        {/* The night half. */}
        <Rect x={CX} y={CY - RR} width={RR} height={RR * 2} fill={c.shade} opacity={0.3} />
        {[66.5, 23.5, 0, -23.5, -66.5].map((lat) => (
          <Line
            key={lat}
            x1={CX - RR}
            y1={y(lat)}
            x2={CX + RR}
            y2={y(lat)}
            stroke={c.chartInk}
            strokeWidth={lat === 0 ? 1.2 : 0.8}
            strokeDasharray={lat === 0 ? undefined : chart.dashFine}
          />
        ))}
      </G>
      <Circle cx={CX} cy={CY} r={RR} fill="none" stroke={c.chartInk} strokeWidth={1.2} />
      {lit
        ? zones
            .filter(([, , , n]) => n === lit)
            .map(([a, b]) => (
              <Path
                key={`l${a}`}
                d={band(a, b)}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
              />
            ))
        : null}
      {beam(0, 'eq')}
      {beam(50, 'hi')}
      <HaloText
        x={6}
        y={16}
        text="sunlight (equinox)"
        c={c}
        size={chart.label}
        bold
        anchor="start"
      />
      <HaloText
        x={6}
        y={y(0) + 26}
        text="small area: strong"
        c={c}
        size={chart.label}
        anchor="start"
      />
      <HaloText
        x={6}
        y={y(50) + 26}
        text="spread out: weaker"
        c={c}
        size={chart.label}
        anchor="start"
      />
      {[
        [78, 'polar'],
        [45, 'temperate'],
        [8, 'tropical'],
        [-45, 'temperate'],
        [-78, 'polar'],
      ].map(([lat, name]) => (
        <HaloText
          key={`${lat}`}
          x={Math.abs(lat as number) > 70 ? CX : CX + 52}
          y={y(lat as number) + 4}
          text={name as string}
          c={c}
          size={chart.label}
          bold={lit === name}
        />
      ))}
      {[66.5, 23.5, -23.5, -66.5].map((lat) => (
        <ChartText
          key={lat}
          x={CX + Math.sqrt(RR * RR - (y(lat) - CY) ** 2) + 5}
          y={y(lat) + 4}
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`${Math.abs(lat)}° ${lat > 0 ? 'N' : 'S'}`}
        </ChartText>
      ))}
    </Board>
  );
}
