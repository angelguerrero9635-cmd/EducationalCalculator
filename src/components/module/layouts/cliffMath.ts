/**
 * HC120 (b): the dated cliff as a sequence page's header figure (CliffHeader in typesHe4f.ts):
 * its geometry, the order of events it shows, and the events a stage's text names, shared by the
 * figure and the layout check (the sequence's right order must agree with the figure).
 */
import type { CliffHeader } from '@/data/modules/typesHe4f';

/** The drawing's box. */
export const CLIFF = { w: 360, x0: 16, x1: 344, ground: 26, bottom: 196, bed: 26 };

export interface CliffGeometry {
  /** Beds above the unconformity (or every bed, with none): [top, bottom] y, bottom up. */
  flat: { bed: number; y0: number; y1: number }[];
  /** The unconformity's level (beds under it are tilted), or none. */
  unconformity?: number;
  /** The tilted beds' boundaries between bed i − 1 and i: y at the middle, and the slope. */
  boundaries: { between: number; y: number }[];
  slope: number;
  /** The dike's top (y) and its x, or none. */
  dike?: { x: number; top: number };
}

/** The beds under the unconformity (all of them when there is none). */
export const underCount = (h: CliffHeader) => h.unconformity ?? h.beds.length;

export function cliffGeometry(h: CliffHeader): CliffGeometry {
  const n = h.beds.length;
  const k = underCount(h);
  const { ground, bottom } = CLIFF;
  const flat: CliffGeometry['flat'] = [];
  const hasU = h.unconformity !== undefined;
  // The flat beds stack down from the ground: the youngest (last) on top.
  const above = hasU ? n - k : n;
  const thick = hasU ? CLIFF.bed : (bottom - ground) / n;
  for (let j = 0; j < above; j++) {
    const bed = n - 1 - j;
    flat.push({ bed, y0: ground + thick * j, y1: ground + thick * (j + 1) });
  }
  const u = hasU ? ground + thick * above : undefined;
  const boundaries: CliffGeometry['boundaries'] = [];
  if (hasU)
    for (let i = 1; i < k; i++)
      boundaries.push({ between: i, y: u! + ((bottom - u!) * (k - i)) / k });
  const slope = hasU ? Math.tan(((h.tilt ?? 0) * Math.PI) / 180) : 0;
  let dike: CliffGeometry['dike'];
  if (h.intrusion) {
    const top = h.intrusion.top ?? n - 1;
    // A dike in the tilted beds stops at the unconformity; one above it reaches its top bed's top.
    const yTop = top < k && hasU ? u! : (flat.find((f) => f.bed === top)?.y0 ?? ground);
    dike = { x: CLIFF.x0 + (CLIFF.x1 - CLIFF.x0) * 0.68, top: yTop };
  }
  return { flat, unconformity: u, boundaries, slope, dike };
}

/** The events the cliff shows, oldest first: "deposit:shale", "tilt", "erode", "intrude". */
export function cliffEvents(h: CliffHeader): string[] {
  const n = h.beds.length;
  const k = underCount(h);
  const top = h.intrusion ? (h.intrusion.top ?? n - 1) : undefined;
  const out: string[] = [];
  for (let i = 0; i < k; i++) out.push(`deposit:${h.beds[i]}`);
  if (h.unconformity !== undefined) {
    if (h.tilt) out.push('tilt');
    if (top !== undefined && top < k) out.push('intrude');
    out.push('erode');
    for (let i = k; i < n; i++) out.push(`deposit:${h.beds[i]}`);
  }
  if (top !== undefined && (h.unconformity === undefined || top >= k)) out.push('intrude');
  if (h.surface) out.push('erode');
  return out;
}

/** The events a stage's text names, in its order. */
export function stageEvents(label: string, rocks: string[]): string[] {
  const t = label.toLowerCase();
  if (/dike|intru|sill|magma/.test(t)) return ['intrude'];
  if (/tilt|fold/.test(t)) return ['tilt'];
  if (/erosion|erode|weather/.test(t)) return ['erode'];
  return rocks
    .map((r) => ({ r, at: t.indexOf(r) }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((x) => `deposit:${x.r}`);
}

/** What is wrong with a sequence's cliff header (the layout check). */
export function cliffIssues(h: CliffHeader, stages: string[]): string[] {
  const out: string[] = [];
  const n = h.beds.length;
  const k = underCount(h);
  if (n < 2) out.push('cliff: fewer than 2 beds');
  if (h.unconformity !== undefined && (k < 1 || k >= n))
    out.push(`cliff: the unconformity sits over ${k} of ${n} beds`);
  if (h.tilt && h.unconformity === undefined)
    out.push('cliff: tilted beds need an unconformity above them');
  const g = cliffGeometry(h);
  // Tilted beds lie only under the unconformity; the flat ones above it.
  if (g.unconformity !== undefined && g.flat.some((f) => f.y1 > g.unconformity! + 1e-9))
    out.push('cliff: a flat bed reaches under the unconformity');
  if (h.intrusion && g.dike) {
    const top = h.intrusion.top ?? n - 1;
    if (top < 0 || top >= n) out.push(`cliff: the dike's top bed ${top} is not a bed`);
    // The dike cuts every bed it reaches: from the bottom to its top bed's top.
    const tb = g.flat.find((f) => f.bed === top);
    if (tb && Math.abs(g.dike.top - tb.y0) > 1e-9)
      out.push('cliff: the dike stops inside its top bed');
    if (top < k && h.unconformity !== undefined && g.dike.top !== g.unconformity)
      out.push('cliff: a dike in the tilted beds must stop at the unconformity');
  }
  const want = cliffEvents(h);
  const rocks = [...new Set(h.beds)];
  const got = stages.flatMap((s) => stageEvents(s, rocks));
  if (want.join(' ') !== got.join(' '))
    out.push(`cliff: the stages read ${got.join(', ')}; the figure shows ${want.join(', ')}`);
  return out;
}
