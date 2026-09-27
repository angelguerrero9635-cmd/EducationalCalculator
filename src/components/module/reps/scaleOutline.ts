/** Outlines for the scaled-copy picture (ScaleCopy.tsx), shared with the harness. */

/** The outline's corners in grid squares, (0, 0) at the bottom left, y up. */
export function outline(
  shape: 'rectangle' | 'triangle' | 'L' | 'trapezoid' | undefined,
  w: number,
  h: number,
): [number, number][] {
  if (shape === 'rectangle' || ((shape ?? 'L') === 'L' && (w < 2 || h < 2)))
    return [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
  if (shape === 'triangle')
    return [
      [0, 0],
      [w, 0],
      [0, h],
    ];
  if (shape === 'trapezoid') {
    const top = Math.max(1, Math.round(w / 2));
    return [
      [0, 0],
      [w, 0],
      [top, h],
      [0, h],
    ];
  }
  // An L: the notch is the top right, half of each side (in whole squares).
  const a = Math.max(1, Math.floor(h / 2));
  const b = Math.max(1, Math.floor(w / 2));
  return [
    [0, 0],
    [w, 0],
    [w, a],
    [b, a],
    [b, h],
    [0, h],
  ];
}
