/**
 * The group H2F picture kinds of their own (earth and space round 2, H103), one case each, so
 * RepresentationView names them in one place. Each picture is in its own file.
 */
import type { ReactNode } from 'react';

import type { Hs2fKindSpec } from '@/data/modules/typesHs2f';

import type { Calculator } from '../useCalculator';
import { Reserve } from './Reserve';
import { StreamChannel } from './StreamChannel';

export function Hs2fPicture({ spec, calc }: { spec: Hs2fKindSpec; calc: Calculator }): ReactNode {
  switch (spec.kind) {
    case 'streamChannel':
      return <StreamChannel spec={spec} calc={calc} />;
    case 'reserve':
      return <Reserve spec={spec} calc={calc} />;
  }
}
