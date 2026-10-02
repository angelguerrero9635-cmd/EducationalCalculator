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
import { HE2A_REQUESTS } from './pictureRequestsHe2a';
import { HE2B_REQUESTS } from './pictureRequestsHe2b';
import { HE2C_REQUESTS } from './pictureRequestsHe2c';
import { HE2D_REQUESTS } from './pictureRequestsHe2d';
import { HE2E_REQUESTS } from './pictureRequestsHe2e';
import { HE2F_REQUESTS } from './pictureRequestsHe2f';
import { HE2G_REQUESTS } from './pictureRequestsHe2g';
import { HE2H_REQUESTS } from './pictureRequestsHe2h';
import { HE2I_REQUESTS } from './pictureRequestsHe2i';
import { HE2J_REQUESTS } from './pictureRequestsHe2j';
import { HE2K_REQUESTS } from './pictureRequestsHe2k';

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
  ...HE2A_REQUESTS,
  ...HE2B_REQUESTS,
  ...HE2C_REQUESTS,
  ...HE2D_REQUESTS,
  ...HE2E_REQUESTS,
  ...HE2F_REQUESTS,
  ...HE2G_REQUESTS,
  ...HE2H_REQUESTS,
  ...HE2I_REQUESTS,
  ...HE2J_REQUESTS,
  ...HE2K_REQUESTS,
];
