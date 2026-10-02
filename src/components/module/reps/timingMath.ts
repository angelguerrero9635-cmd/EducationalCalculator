/**
 * HC49 timing diagrams: the arithmetic the picture and the harness share (a UART frame's bits,
 * unit factors to seconds and hertz).
 */
import { TIME_UNITS } from './he3dTime';

/** One bit cell of a UART frame. */
export interface UartCell {
  group: 'start' | 'data' | 'parity' | 'stop';
  /** "b0" for a data bit, else the group's letter. */
  name: string;
  bit: 0 | 1;
}

/** A UART frame: a start bit low, the data bits LSB first, even parity, stop bits high. */
export function uartFrame(dataBits: number, parityBits: number, stopBits: number, byte: number) {
  const cells: UartCell[] = [{ group: 'start', name: 'S', bit: 0 }];
  let ones = 0;
  for (let i = 0; i < dataBits; i++) {
    const bit = ((byte >> i) & 1) as 0 | 1;
    ones += bit;
    cells.push({ group: 'data', name: `b${i}`, bit });
  }
  if (parityBits > 0) cells.push({ group: 'parity', name: 'P', bit: (ones % 2) as 0 | 1 });
  for (let i = 0; i < stopBits; i++) cells.push({ group: 'stop', name: 'E', bit: 1 });
  return cells;
}

/** Seconds per unit of a time, or undefined for a unit that isn't one. */
export const secondsPer = (unit: string | undefined) =>
  unit === undefined ? undefined : TIME_UNITS[unit];

/** Hertz per unit of a frequency or a rate (Hz, kHz, MHz, GHz; b/s, kb/s, Mb/s, Gb/s; baud). */
export const HERTZ: Record<string, number> = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
  GHz: 1e9,
  'b/s': 1,
  'kb/s': 1e3,
  'Mb/s': 1e6,
  'Gb/s': 1e9,
  baud: 1,
  'bits/s': 1,
};

/** Metres per unit of a length (m, km). */
export const METRES: Record<string, number> = { m: 1, km: 1000 };
