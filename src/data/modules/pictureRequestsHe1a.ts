/**
 * College pictures, round 1, group A (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ME = 'he.engineering.';

export const HE1A_REQUESTS: PictureRequest[] = [
  {
    id: 'HC1',
    kind: 'beam',
    what: 'A beam to scale on its supports: loads, reactions, shear and moment diagrams, the bent shape; axial bars, columns, panels, plates',
    pages: [
      // Mechanical (ME-P1)
      `${ME}statics#0~reactions`,
      `${ME}statics#2~distributed`,
      `${ME}mechanics-of-materials#0`,
      `${ME}mechanics-of-materials#1`,
      `${ME}mechanics-of-materials#1~thermal`,
      `${ME}mechanics-of-materials#3~diagrams`,
      `${ME}mechanics-of-materials#4`,
      `${ME}mechanics-of-materials#4~udl`,
      `${ME}mechanics-of-materials#4~superpose`,
      `${ME}mechanics-of-materials#4~curve`,
      `${ME}mechanics-of-materials#5`,
      `${ME}advanced-solid-mechanics#2`,
      `${ME}advanced-solid-mechanics#4`,
      // Aero, civil (ACC-P14, ACC-P7)
      `${ME}structural-analysis#0`,
      `${ME}structural-analysis#0~udl`,
      `${ME}structural-analysis#0~cantilever`,
      `${ME}structural-analysis#1`,
      `${ME}structural-analysis#1~shear`,
      `${ME}structural-analysis#1~muller-breslau`,
      `${ME}structural-analysis#2`,
      `${ME}structural-analysis#2~fixed-end`,
      `${ME}structural-analysis#2~moment-distribution`,
      `${ME}steel-design#2`,
      `${ME}steel-design#2~deflection`,
      `${ME}concrete-design#1`,
      `${ME}concrete-design#3~slab-thickness`,
      `${ME}aerospace-structures#2`,
      `${ME}aerospace-structures#2~plate`,
      `${ME}aerospace-structures#2~johnson`,
      `${ME}steel-design#1`,
      `${ME}concrete-design#2~slenderness`,
    ],
    status: 'requested',
    gallery: [],
    notes: 'From ME-P1, ACC-P14 (its matrix-methods bar chain is HC41 elementChain), ACC-P7.',
  },
];
