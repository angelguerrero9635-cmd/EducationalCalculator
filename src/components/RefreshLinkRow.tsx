import type { RefreshRow } from '@/data/selectors';

import { ListRow } from './ListRow';

/** A tappable "Refresh: Grade X" link back to where a prerequisite was taught. */
export function RefreshLinkRow({ link }: { link: RefreshRow }) {
  return <ListRow overline={link.label} title={link.title} route={link.route} />;
}
