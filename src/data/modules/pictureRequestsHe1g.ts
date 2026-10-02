/**
 * College pictures, round 1, group G (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages (full ids), status `requested` until drawn. */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const FM = 'he.engineering.fluid-mechanics';
const HH = 'he.engineering.hydraulics-hydrology';

export const HE1G_REQUESTS: PictureRequest[] = [
  ask(
    'HC6',
    'fluidSystem',
    'Fluid systems: a tank, manometer, gate, float, venturi, pitot tube, jet on a vane, pipe grade lines, pipe networks, a full sewer, a boundary layer and a model',
    [
      `${FM}#0`,
      `${FM}#0~manometer`,
      `${FM}#0~gate`,
      `${FM}#0~buoyancy`,
      `${FM}#1`,
      `${FM}#1~pitot`,
      `${FM}#2`,
      `${FM}#2~pump`,
      `${FM}#3`,
      `${FM}#4`,
      `${FM}#5`,
      `${HH}#1`,
      `${HH}#1~hazen-williams`,
      `${HH}#1~parallel`,
      `${HH}#1~hardy-cross`,
      `${HH}#3`,
    ],
    'From HE-mechanical-P12 and HE-aero-civil-chemical-P20 (pipeNetwork, merged here).',
  ),
];
