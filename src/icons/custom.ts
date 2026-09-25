/**
 * Our own drawings for ideas Tabler has no icon for (ten-frames, base-ten blocks, tally marks,
 * number lines, …), on the same 24 × 24 grid. Parts are separated by "|": a path ("M…"), a
 * filled path ("F:M…"), a circle ("c:x,y,r"), a filled circle ("C:x,y,r"), or any of these
 * turned about the center ("R60:M…").
 */
export const CUSTOM = {
  'dot-count': 'C:6,8,1.7|C:12,8,1.7|C:18,8,1.7|C:6,16,1.7|C:12,16,1.7|c:18,16,1.7',
  'tally-marks': 'M5 5v14M9 5v14M13 5v14M17 5v14M3 16.5 20 7.5',
  'two-step': 'c:6,12,3|c:18,12,3|M9 12h6M13 10l2 2-2 2',
  'add-sub': 'M8 4v8M4 8h8M13 17h7M18 4 6 20',
  'times-sign': 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  'equals-sign': 'M5 9h14M5 15h14',
  'compare-signs': 'M10 6 4 12l6 6M14 6l6 6-6 6',
  'ten-frame':
    'M3 7h18v10H3zM6.6 7v10M10.2 7v10M13.8 7v10M17.4 7v10M3 12h18|C:4.8,9.5,1.1|C:8.4,9.5,1.1|C:12,9.5,1.1|C:15.6,9.5,1.1',
  'base-ten':
    'M3 5h8v8H3zM3 9h8M7 5v8|M13.5 4h3v16h-3zM13.5 8h3M13.5 12h3M13.5 16h3|M18.5 17h2.5v3h-2.5z|M3 16h2.5v3H3zM7 16h2.5v3H7z',
  'number-line':
    'M3 17h18M5 15v4M9.5 15v4M14 15v4M18.5 15v4|M5 13c1-5 8-5 9 0|M12.3 11.8 14 13l1-1.8',
  'number-hops': 'M3 18h18|M4 16c1-5 6-5 7 0M11 16c1-5 6-5 7 0|M16.5 14.8 18 16l.8-1.7',
  'even-odd': 'C:6,8,1.8|C:6,14.5,1.8|C:12,8,1.8|C:12,14.5,1.8|C:18,8,1.8|c:18,14.5,1.8',
  'dot-array':
    'C:6,6,1.6|C:12,6,1.6|C:18,6,1.6|C:6,12,1.6|C:12,12,1.6|C:18,12,1.6|C:6,18,1.6|C:12,18,1.6|C:18,18,1.6',
  'fraction-pie': 'c:12,12,8.5|M12 3.5v17M3.5 12h17|F:M12 12V3.5a8.5 8.5 0 0 1 8.5 8.5z',
  'decimal-grid': 'M4 4h16v16H4zM8 4v16M12 4v16M16 4v16|F:M4 4h4v16H4z',
  'ratio-tape': 'M3 5h6v5H3zM9 5h6v5H9z|M3 14h6v5H3zM9 14h6v5H9zM15 14h6v5h-6z',
  'x-squared': 'M4 10l8 10M12 10l-8 10|M15 5.2a2 2 0 0 1 4 .3c0 1.7-4 3.3-4 5.5h4',
  'x-equals': 'M4 8l6 8M10 8l-6 8|M14 10h6M14 14h6',
  'less-equal': 'M17 4 6 9.5 17 15|M6 19.5h11',
  'growing-dots': 'C:4.5,18,1.6|C:9.5,14,1.6|C:14.5,10,1.6|C:19.5,6,1.6|M3 21.5h18',
  'vector-arrow': 'M4 20 18 6M12 6h6v6|M4 20h14v-8',
  therefore: 'C:12,6,1.9|C:6,17,1.9|C:18,17,1.9',
  'line-plot':
    'M3 18h18|C:7,14.5,1.4|C:12,14.5,1.4|C:12,10.5,1.4|C:12,6.5,1.4|C:17,14.5,1.4|C:17,10.5,1.4',
  'scatter-fit':
    'M4 4v16h16|C:8,15.5,1.2|C:10.5,12,1.2|C:13,13.5,1.2|C:15.5,9,1.2|C:18,7.5,1.2|M6 17.5 20 6',
  'bell-curve': 'M3 19h18M3 18.5c4 0 5-12 9-12s5 12 9 12|M12 6.5V19',
  'parallel-lines': 'M3 6h18M3 11h18M12 11v10|M12 14h3v-3',
  'area-grid':
    'M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16|F:M4 4h5.3v5.3H4z|F:M9.3 4h5.3v5.3H9.3z',
  'perimeter-box': 'M4 6h16v12H4z|C:4,6,1.7|C:20,6,1.7|C:20,18,1.7|C:4,18,1.7',
  'coordinate-point': 'M5 3v17h16|C:15,9,1.9|M15 11v9M5 9h8',
  'function-graph': 'M4 3v17h17|M5 17c4 0 5-10 9-10s3 4 6 4',
  'line-graph': 'M4 3v17h17|M5 18 19 6|C:9,14.6,1.4|C:15,9.4,1.4',
  parabola: 'M4 3v17h17|M6.5 5c2 13 10 13 12 0',
  'exp-curve': 'M4 3v17h17|M5 18.5c7 0 10-3 13.5-14',
  'right-triangle': 'M5 19V5l14 14zM5 15h4v4',
  'circle-radius': 'c:12,12,8.5|M12 12h8.5|C:12,12,1.4',
  'drafting-compass': 'C:12,5,1.6|M12 6.6 6.5 20M12 6.6l5.5 13.4M8.3 15.5h7.4|M12 2v1.4',
  reflect: 'M12 3v18|M9.5 7 4 17h5.5zM14.5 7 20 17h-5.5z',
  'tangent-line': 'M4 3v17h17|M5 18c4.5 0 7-4 8.5-7S17 6 20 6|M7.5 17 19.5 7.5|C:13.5,11,1.4',
  'polar-grid': 'c:12,12,8.5|c:12,12,4.5|M3.5 12h17M12 3.5v17|M12 12l6-6',
  'rock-layers': 'M3 4h18v4H3zM3 10h18v4H3zM3 16h18v4H3z|C:7,6,.9|C:15,12,.9|C:10,18,.9',
  'cycle-arrows':
    'M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9|M18.5 3.5v3.8h-3.8M5.5 20.5v-3.8h3.8',
  'spiral-shell':
    'M12 12a1.5 1.5 0 1 1 1.5 1.5 3 3 0 0 1-3-3A4.5 4.5 0 0 1 15 6a6 6 0 0 1 6 6 7.5 7.5 0 0 1-7.5 7.5A9 9 0 0 1 4.5 10.5',
  'cell-body':
    'M12 3.5c5 0 8.5 3.6 8.5 8.5s-3.5 8.5-8.5 8.5S3.5 17 3.5 12 7 3.5 12 3.5z|c:13,11,3|C:7.5,15,1|C:16,16.5,1|C:8,8,1',
  'push-box': 'M13 7h7v10h-7z|M3 12h7M7 9l3 3-3 3',
  'double-wave': 'M2 9q2.5-4 5 0t5 0t5 0t5 0|M2 15q2.5-4 5 0t5 0t5 0t5 0',
  molecule: 'c:7,8,2.5|c:17,8,2.5|c:12,17,2.5|M9.3 9.2l1.6 5.6M14.7 9.2l-1.6 5.6M9.5 8h5',
  'periodic-table':
    'M3 4h4v16H3zM17 4h4v16h-4zM7 12h10v8H7zM3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4M10.3 12v8M13.7 12v8M7 16h10',
  'coil-spring': 'M12 2.5V5l5 1.5-10 3 10 3-10 3 10 3L12 19v2.5',
  sprout:
    'M12 21v-9|M12 12c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5z|M12 14.5c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z|M7 21h10',
  'pan-balance': 'M12 4v15M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z',
} as const;
