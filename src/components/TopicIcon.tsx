import Svg, { Circle, G, Path } from 'react-native-svg';

import type { TopicIconName } from '@/data/icons';

/**
 * Drawings for the icons on Browse boxes, on a 24 × 24 grid. Each is a list of parts separated
 * by "|": a path ("M…"), a filled path ("F:M…"), a circle ("c:x,y,r"), a filled circle
 * ("C:x,y,r"), or any of these turned about the center ("R60:M…").
 */
const DRAWINGS: Record<TopicIconName, string> = {
  // Numbers and operations
  count: 'C:6,8,1.7|C:12,8,1.7|C:18,8,1.7|C:6,16,1.7|C:12,16,1.7|c:18,16,1.7',
  tally: 'M5 5v14M9 5v14M13 5v14M17 5v14M3 16.5 20 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  steps: 'c:6,12,3|c:18,12,3|M9 12h6M13 10l2 2-2 2',
  book: 'M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13',
  addsub: 'M8 4v8M4 8h8M13 17h7M18 4 6 20',
  times: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  divide: 'M5 12h14|C:12,6.5,1.7|C:12,17.5,1.7',
  equals: 'M5 9h14M5 15h14',
  compare: 'M10 6 4 12l6 6M14 6l6 6-6 6',
  tenframe:
    'M3 7h18v10H3zM6.6 7v10M10.2 7v10M13.8 7v10M17.4 7v10M3 12h18|C:4.8,9.5,1.1|C:8.4,9.5,1.1|C:12,9.5,1.1|C:15.6,9.5,1.1',
  blocks:
    'M3 5h8v8H3zM3 9h8M7 5v8|M13.5 4h3v16h-3zM13.5 8h3M13.5 12h3M13.5 16h3|M18.5 17h2.5v3h-2.5z|M3 16h2.5v3H3zM7 16h2.5v3H7z',
  numberline: 'M3 17h18M5 15v4M9.5 15v4M14 15v4M18.5 15v4|M5 13c1-5 8-5 9 0|M12.3 11.8 14 13l1-1.8',
  hops: 'M3 18h18|M4 16c1-5 6-5 7 0M11 16c1-5 6-5 7 0|M16.5 14.8 18 16l.8-1.7',
  evenodd: 'C:6,8,1.8|C:6,14.5,1.8|C:12,8,1.8|C:12,14.5,1.8|C:18,8,1.8|c:18,14.5,1.8',
  array:
    'C:6,6,1.6|C:12,6,1.6|C:18,6,1.6|C:6,12,1.6|C:12,12,1.6|C:18,12,1.6|C:6,18,1.6|C:12,18,1.6|C:18,18,1.6',
  fraction: 'c:12,12,8.5|M12 3.5v17M3.5 12h17|F:M12 12V3.5a8.5 8.5 0 0 1 8.5 8.5z',
  decimal: 'M4 4h16v16H4zM8 4v16M12 4v16M16 4v16|F:M4 4h4v16H4z',
  percent: 'M18.5 5.5 5.5 18.5|c:7.5,7.5,2.5|c:16.5,16.5,2.5',
  ratio: 'M3 5h6v5H3zM9 5h6v5H9z|M3 14h6v5H3zM9 14h6v5H9zM15 14h6v5h-6z',
  coin: 'c:12,12,8.5|M14.6 9.3c-.6-.9-1.6-1.3-2.6-1.3-1.5 0-2.7.8-2.7 2 0 2.7 5.5 1.5 5.5 4.1 0 1.2-1.2 2-2.8 2-1.1 0-2.2-.4-2.8-1.3M12 6.3v11.4',
  sqrt: 'M3 13h2.5l3 7 5-16H21',
  power: 'M4 10l8 10M12 10l-8 10|M15 5.2a2 2 0 0 1 4 .3c0 1.7-4 3.3-4 5.5h4',
  xeq: 'M4 8l6 8M10 8l-6 8|M14 10h6M14 14h6',
  ineq: 'M17 4 6 9.5 17 15|M6 19.5h11',
  sequence: 'C:4.5,18,1.6|C:9.5,14,1.6|C:14.5,10,1.6|C:19.5,6,1.6|M3 21.5h18',
  pi: 'M4 7h16M8.5 7v13M15.5 7v9.5c0 2 1 3 3 3',
  sigma: 'M18 5H6l6.5 7L6 19h12',
  integral: 'M16.5 4c-1.5-1-4.5-.8-4.5 2.5v11c0 3.3-3 3.5-4.5 2.5',
  infinity:
    'M12 12c-2-3-4-4.5-6-4.5a4.5 4.5 0 0 0 0 9c2 0 4-1.5 6-4.5s4-4.5 6-4.5a4.5 4.5 0 0 1 0 9c-2 0-4-1.5-6-4.5z',
  matrix: 'M7 4H5v16h2M17 4h2v16h-2|C:9.5,9,1.3|C:14.5,9,1.3|C:9.5,15,1.3|C:14.5,15,1.3',
  vector: 'M4 20 18 6M12 6h6v6|M4 20h14v-8',
  proof: 'C:12,6,1.9|C:6,17,1.9|C:18,17,1.9',
  // Measurement
  clock: 'c:12,12,8.5|M12 7v5l3.5 2',
  ruler: 'M3.5 15.5 15.5 3.5l5 5-12 12zM7.5 11.5l2 2M10.5 8.5l1.5 1.5M13.5 5.5l2 2',
  balance: 'M12 4v15M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z',
  cup: 'M6 4h12l-1.5 16h-9zM6.7 11h10.6',
  thermometer: 'M12 3a2 2 0 0 0-2 2v9.5a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z|C:12,17.5,1.8|M12 9v7',
  // Data and chance
  bars: 'M5 20v-6h3v6M10.5 20V7h3v13M16 20v-9h3v9M3 20h18',
  lineplot:
    'M3 18h18|C:7,14.5,1.4|C:12,14.5,1.4|C:12,10.5,1.4|C:12,6.5,1.4|C:17,14.5,1.4|C:17,10.5,1.4',
  scatter:
    'M4 4v16h16|C:8,15.5,1.2|C:10.5,12,1.2|C:13,13.5,1.2|C:15.5,9,1.2|C:18,7.5,1.2|M6 17.5 20 6',
  bell: 'M3 19h18M3 18.5c4 0 5-12 9-12s5 12 9 12|M12 6.5V19',
  dice: 'M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z|C:8.5,8.5,1.4|C:12,12,1.4|C:15.5,15.5,1.4',
  // Geometry and graphs
  shapes: 'M7 3 11.5 10.5h-9z|c:17,7,3.6|M8.5 13.5h7v7h-7z',
  cube: 'M12 3 20 7.5v9L12 21l-8-4.5v-9zM4 7.5 12 12l8-4.5M12 12v9',
  angle: 'M4 19h16M4 19 15 5|M10 19a6 6 0 0 0-2.3-4.7',
  lines: 'M3 6h18M3 11h18M12 11v10|M12 14h3v-3',
  area: 'M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16|F:M4 4h5.3v5.3H4z|F:M9.3 4h5.3v5.3H9.3z',
  perimeter: 'M4 6h16v12H4z|C:4,6,1.7|C:20,6,1.7|C:20,18,1.7|C:4,18,1.7',
  coords: 'M5 3v17h16|C:15,9,1.9|M15 11v9M5 9h8',
  curve: 'M4 3v17h17|M5 17c4 0 5-10 9-10s3 4 6 4',
  linear: 'M4 3v17h17|M5 18 19 6|C:9,14.6,1.4|C:15,9.4,1.4',
  parabola: 'M4 3v17h17|M6.5 5c2 13 10 13 12 0',
  expo: 'M4 3v17h17|M5 18.5c7 0 10-3 13.5-14',
  sine: 'M2 12q3.75-9 7.5 0t7.5 0t7.5 0',
  righttri: 'M5 19V5l14 14zM5 15h4v4',
  circle: 'c:12,12,8.5|M12 12h8.5|C:12,12,1.4',
  compass: 'C:12,5,1.6|M12 6.6 6.5 20M12 6.6l5.5 13.4M8.3 15.5h7.4|M12 2v1.4',
  mirror: 'M12 3v18|M9.5 7 4 17h5.5zM14.5 7 20 17h-5.5z',
  tangent: 'M4 3v17h17|M5 18c4.5 0 7-4 8.5-7S17 6 20 6|M7.5 17 19.5 7.5|C:13.5,11,1.4',
  polar: 'c:12,12,8.5|c:12,12,4.5|M3.5 12h17M12 3.5v17|M12 12l6-6',
  // Life, Earth and space
  sun: 'c:12,12,4|M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
  sprout:
    'M12 21v-9|M12 12c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5z|M12 14.5c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z|M7 21h10',
  leaf: 'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z|M5 19 13 11',
  paw: 'C:6.5,9,1.8|C:10,5.5,1.8|C:14,5.5,1.8|C:17.5,9,1.8|F:M12 11c-3 0-6 4-6 6.5 0 2 1.7 2.5 3 2.5s2-.6 3-.6 1.7.6 3 .6 3-.5 3-2.5C18 15 15 11 12 11z',
  cloud:
    'M7 16h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 7a4.5 4.5 0 0 0 0 9z|M8 19l-1 2M12 19l-1 2M16 19l-1 2',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z|M17 3v3M15.5 4.5h3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  planet:
    'c:12,12,5|M3.5 16.5c-1-1.8 2.6-4.9 7.5-7.2s9.5-2.9 10.5-1.2-2.6 4.9-7.5 7.2-9.5 2.9-10.5 1.2z',
  globe:
    'c:12,12,8.5|M3.5 12h17|M12 3.5c-2.5 2.3-3.8 5.2-3.8 8.5s1.3 6.2 3.8 8.5c2.5-2.3 3.8-5.2 3.8-8.5S14.5 5.8 12 3.5z',
  mountain: 'M2.5 19 9 8l4 6.5 2.5-3.5 6 8z|M7.3 11 9 12.5l1.7-1.6',
  layers: 'M3 4h18v4H3zM3 10h18v4H3zM3 16h18v4H3z|C:7,6,.9|C:15,12,.9|C:10,18,.9',
  drop: 'M12 3.5s-6 6.6-6 10.5a6 6 0 0 0 12 0c0-3.9-6-10.5-6-10.5z|M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
  flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z',
  cycle: 'M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9|M18.5 3.5v3.8h-3.8M5.5 20.5v-3.8h3.8',
  dna: 'M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9|M8.5 6.5h7M8.5 17.5h7',
  fossil:
    'M12 12a1.5 1.5 0 1 1 1.5 1.5 3 3 0 0 1-3-3A4.5 4.5 0 0 1 15 6a6 6 0 0 1 6 6 7.5 7.5 0 0 1-7.5 7.5A9 9 0 0 1 4.5 10.5',
  cell: 'M12 3.5c5 0 8.5 3.6 8.5 8.5s-3.5 8.5-8.5 8.5S3.5 17 3.5 12 7 3.5 12 3.5z|c:13,11,3|C:7.5,15,1|C:16,16.5,1|C:8,8,1',
  heart:
    'M12 20s-8-5-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20z|M4.5 12.5h4l1.5-2.5 2 5 1.5-2.5h6',
  people: 'c:9,8,3|M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6|c:17,9,2.5|M15.5 14.2c3 .2 5.5 2.3 5.5 5.8',
  map: 'M3 6l6-2.5 6 2.5 6-2.5v14.5l-6 2.5-6-2.5-6 2.5z|M9 3.5v14.5M15 6v14.5',
  satellite:
    'M10 10l4 4|M8.5 3.5 3.5 8.5l3 3 5-5zM17.5 12.5l-5 5 3 3 5-5z|M10.2 13.8 8 16|C:7,17,1.2',
  // Physical science
  push: 'M13 7h7v10h-7z|M3 12h7M7 9l3 3-3 3',
  speaker: 'M4 9h4l5-4v14l-5-4H4z|M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
  bulb: 'M9 17h6M10 20h4|M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v2h5v-2c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z|c:12,12,3',
  wave: 'M2 9q2.5-4 5 0t5 0t5 0t5 0|M2 15q2.5-4 5 0t5 0t5 0t5 0',
  magnet: 'M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z|M6 8h4M14 8h4',
  bolt: 'M13 2.5 5 13.5h6l-1 8 8-11h-6z',
  atom: 'C:12,12,1.6|M3 12a9 3.6 0 1 0 18 0a9 3.6 0 1 0-18 0z|R60:M3 12a9 3.6 0 1 0 18 0a9 3.6 0 1 0-18 0z|R120:M3 12a9 3.6 0 1 0 18 0a9 3.6 0 1 0-18 0z',
  molecule: 'c:7,8,2.5|c:17,8,2.5|c:12,17,2.5|M9.3 9.2l1.6 5.6M14.7 9.2l-1.6 5.6M9.5 8h5',
  flask: 'M9 3h6M10 3v6l-5 9.5A1.7 1.7 0 0 0 6.5 21h11a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9',
  periodic:
    'M3 4h4v16H3zM17 4h4v16h-4zM7 12h10v8H7zM3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4M10.3 12v8M13.7 12v8M7 16h10',
  balloon:
    'M12 3a6 6 0 0 0-6 6c0 4 3.5 7 6 8 2.5-1 6-4 6-8a6 6 0 0 0-6-6z|M11 17h2l-1 1.5zM12 18.5c0 1.5-1.5 2-1 3.5',
  speed: 'M4 17a8 8 0 1 1 16 0|M12 17l4-5|C:12,17,1.4|M4 17h2M18 17h2M12 9v2',
  rocket:
    'M12 3c3 2 4.5 5 4.5 9v4h-9v-4c0-4 1.5-7 4.5-9z|c:12,10,1.5|M7.5 13l-2.5 3v3l2.5-1.5M16.5 13l2.5 3v3l-2.5-1.5|M10.5 18.5 12 21l1.5-2.5',
  circuit: 'M3 12h4l1.5-4 2 8 2-8 2 8 1.5-4H21',
  // Engineering and computing
  gear: 'M12 3.5l1.6 2.2 2.7-.4.6 2.6 2.4 1.3-1 2.5 1 2.5-2.4 1.3-.6 2.6-2.7-.4L12 20.5l-1.6-2.3-2.7.4-.6-2.6-2.4-1.3 1-2.5-1-2.5 2.4-1.3.6-2.6 2.7.4z|c:12,12,2.8',
  bridge: 'M2 17h20|M2 17c3-7 17-7 20 0|M6 12.3V17M10 10.9V17M14 10.9V17M18 12.3V17',
  plane:
    'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
  chip: 'M7 7h10v10H7z|M10 10h4v4h-4z|M9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  network: 'c:12,5,2|c:5,18,2|c:19,18,2|M11 6.8 6 16.2M13 6.8l5 9.4M7 18h10',
  spring: 'M12 2.5V5l5 1.5-10 3 10 3-10 3 10 3L12 19v2.5',
  building: 'M4 21V5l8-2v18M12 8h8v13|M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2M2 21h20',
  wrench:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
  factory: 'M3 21V11l5 3v-3l5 3v-3l5 3V4h3v17z|M3 21h18',
  antenna:
    'M12 10v11M8 21h8|C:12,9,1.5|M8.5 5.5a5 5 0 0 0 0 7M15.5 5.5a5 5 0 0 1 0 7M6 3a8.5 8.5 0 0 0 0 12M18 3a8.5 8.5 0 0 1 0 12',
  road: 'M8 3 4 21M16 3l4 18|M12 4v3M12 10v3M12 16v4',
  pencil: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3',
};

const num = (s: string) => s.split(',').map(Number) as [number, number, number];

/** One of the Browse icons, drawn in `color`. */
export function TopicIcon({
  name,
  size = 26,
  color,
}: {
  name: TopicIconName;
  size?: number;
  color: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const part = (spec: string, key: number) => {
    const turn = /^R(\d+):/.exec(spec);
    if (turn) {
      return (
        <G key={key} rotation={Number(turn[1])} origin="12, 12">
          {part(spec.slice(turn[0].length), key)}
        </G>
      );
    }
    if (spec.startsWith('C:') || spec.startsWith('c:')) {
      const [cx, cy, r] = num(spec.slice(2));
      return spec[0] === 'C' ? (
        <Circle key={key} cx={cx} cy={cy} r={r} fill={color} />
      ) : (
        <Circle key={key} cx={cx} cy={cy} r={r} {...stroke} />
      );
    }
    if (spec.startsWith('F:')) return <Path key={key} d={spec.slice(2)} fill={color} />;
    return <Path key={key} d={spec} {...stroke} />;
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {DRAWINGS[name].split('|').map(part)}
    </Svg>
  );
}
