/**
 * Pictures requested for college pages (ids HC1–HC191), merged from the eight college direction
 * plans (docs/plans/he.*.md) in docs/RENDERINGS_HE.md, which gives each one's spec. Each round's
 * groups keep their entries in a file of their own. Spread into PICTURE_REQUESTS.
 */
import type { PictureRequest } from './pictureRequests';
import { HE1A_REQUESTS } from './pictureRequestsHe1a';
import { HE1B_REQUESTS } from './pictureRequestsHe1b';
import { HE1C_REQUESTS } from './pictureRequestsHe1c';
import { HE1D_REQUESTS } from './pictureRequestsHe1d';
import { HE1E_REQUESTS } from './pictureRequestsHe1e';
import { HE1F_REQUESTS } from './pictureRequestsHe1f';
import { HE1G_REQUESTS } from './pictureRequestsHe1g';
import { HE1H_REQUESTS } from './pictureRequestsHe1h';
import { HE1I_REQUESTS } from './pictureRequestsHe1i';

export const HE_PICTURE_REQUESTS: PictureRequest[] = [
  ...HE1A_REQUESTS,
  ...HE1B_REQUESTS,
  ...HE1C_REQUESTS,
  ...HE1D_REQUESTS,
  ...HE1E_REQUESTS,
  ...HE1F_REQUESTS,
  ...HE1G_REQUESTS,
  ...HE1H_REQUESTS,
  ...HE1I_REQUESTS,
];
