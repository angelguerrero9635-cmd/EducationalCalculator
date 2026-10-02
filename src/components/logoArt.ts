// Generated from the brand sources (see assets/brand/README.md); do not edit by hand.
// The One Dollar University seal at small sizes. Each shape names the palette token that
// colours it. The full seal (ring lettering) and the outlined wordmark join this file when
// the lettering is outlined.

export type LogoShape = {
  role: 'accent' | 'accentHover' | 'gold' | 'onAccent';
  d?: string;
  circle?: [number, number, number];
  stroke?: number;
};

/** The small seal, 256 x 256: disc, ring, $U and a book, no lettering. From 20 px. */
export const SEAL_SMALL: LogoShape[] = [
  { role: 'accent', circle: [128.0, 128.0, 126.0] },
  { role: 'gold', circle: [128.0, 128.0, 110], stroke: 14 },
  {
    role: 'gold',
    d: 'M115.64 79.38A16.12 16.12 0 1 0 99.51 104.1A16.12 16.12 0 1 1 83.39 128.82',
    stroke: 15.65,
  },
  { role: 'gold', d: 'M99.51 54.65V62.17M99.51 146.02V153.55', stroke: 15.65 },
  {
    role: 'onAccent',
    d: 'M138.21 71.85V119.15A17.2 17.2 0 0 0 172.61 119.15V71.85',
    stroke: 15.65,
  },
  {
    role: 'onAccent',
    d: 'M126.4 178.34C106.3 169.37 84.6 168.59 66 170.54V196.54C84.6 194.59 106.3 195.37 126.4 204.34Z',
  },
  {
    role: 'onAccent',
    d: 'M129.6 178.34C149.7 169.37 171.4 168.59 190 170.54V196.54C171.4 194.59 149.7 195.37 129.6 204.34Z',
  },
];

/** The smallest seal, 256 x 256: disc, ring and $U. Under 20 px. */
export const SEAL_MICRO: LogoShape[] = [
  { role: 'accent', circle: [128.0, 128.0, 126.0] },
  { role: 'gold', circle: [128.0, 128.0, 110], stroke: 14 },
  {
    role: 'gold',
    d: 'M111.04 94.07A22.12 22.12 0 1 0 88.91 128A22.12 22.12 0 1 1 66.79 161.93',
    stroke: 23.01,
  },
  { role: 'gold', d: 'M88.91 60.15V70.47M88.91 185.53V195.85', stroke: 23.01 },
  {
    role: 'onAccent',
    d: 'M142.01 83.75V148.65A23.6 23.6 0 0 0 189.21 148.65V83.75',
    stroke: 23.01,
  },
];
