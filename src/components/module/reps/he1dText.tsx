/**
 * Text helpers for the college round 1 group D pictures (HC4, HC9): numbers to 3 figures,
 * labels with italic letters and subscripts, and a width estimate.
 */
import { TSpan } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

/** Three significant figures, as a worked-out value reads in a picture. */
export const fig3 = (x: number) =>
  formatNumber(Number(x.toPrecision(3)), {
    scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
  });

/**
 * Single letters in italic (t, τ, v), words and numbers upright; "v_C" draws C as a subscript
 * (lowered and smaller, upright when it is a word: v_out).
 */
export function Ital({ text, size = chart.label }: { text: string; size?: number }) {
  const parts = text.split(/(_[A-Za-z0-9]+|[A-Za-zα-ωΑ-Ω]+)/).filter((p) => p !== '');
  const drop = size * 0.3;
  const isSub = (i: number) => !!parts[i]?.startsWith('_');
  return (
    <>
      {parts.map((p, i) => {
        const sub = isSub(i);
        const down = isSub(i - 1);
        const dy = sub && !down ? drop : !sub && down ? -drop : 0;
        const body = sub ? p.slice(1) : p;
        const one = /^[A-Za-zα-ωΑ-Ω]$/.test(body);
        return (
          <TSpan
            key={i}
            dy={dy}
            fontSize={sub ? size * 0.75 : size}
            fontStyle={one ? 'italic' : 'normal'}
          >
            {body}
          </TSpan>
        );
      })}
    </>
  );
}

/** A text's width in px at `size` (system font estimate). */
export const textW = (s: string, size: number) => [...s].length * size * 0.56;
