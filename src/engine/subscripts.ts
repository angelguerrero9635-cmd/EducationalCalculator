/**
 * Subscripts written with an underscore in the data (v_y, F_net, t_h, T_c), drawn lowered and
 * small wherever text is shown: a raw "v_y" never reaches the screen. A subscript whose every
 * character has a Unicode subscript (ₐ ₑ ₕ ᵢ … ₓ ᵧ, digits) becomes those characters; any
 * other (T_c, F_N) is drawn by the text component as a small lowered run.
 */

/**
 * A symbol (one to three letters) then "_" then its subscript (letters or digits, Greek too:
 * μ_ΣX, σ_ΣX are drawn lowered, never raw).
 */
export const SUBSCRIPT =
  /(?<![\p{L}\d_.])(\p{L}[′']?(?:\p{L}[′']?){0,2})_([\p{L}\d]{1,6})(?![\p{L}\d_])/gu;

const SUBS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
  // The app's y subscript (vᵧ, Dᵧ): Unicode has no Latin one.
  y: 'ᵧ',
};

/** The subscript as Unicode characters, or undefined when one has none (c, w, N). */
export const unicodeSubscript = (s: string) =>
  [...s].every((ch) => SUBS[ch]) ? [...s].map((ch) => SUBS[ch]).join('') : undefined;

/** Text and subscript runs: "v_y = 3 and T_c" → "vᵧ = 3 and T", sub "c". */
export function subscriptRuns(text: string): { s: string; sub?: boolean }[] {
  if (!text.includes('_')) return [{ s: text }];
  const runs: { s: string; sub?: boolean }[] = [];
  let plain = '';
  let last = 0;
  for (const m of text.matchAll(SUBSCRIPT)) {
    plain += text.slice(last, m.index) + m[1]!;
    const uni = unicodeSubscript(m[2]!);
    if (uni) plain += uni;
    else {
      runs.push({ s: plain });
      runs.push({ s: m[2]!, sub: true });
      plain = '';
    }
    last = m.index! + m[0].length;
  }
  plain += text.slice(last);
  if (plain) runs.push({ s: plain });
  return runs.filter((r) => r.s !== '');
}

/** The text with every subscript Unicode where it can be (for labels drawn as one string). */
export const withUnicodeSubscripts = (text: string) =>
  text.includes('_')
    ? text.replace(SUBSCRIPT, (all, base: string, sub: string) => {
        const uni = unicodeSubscript(sub);
        return uni ? base + uni : all;
      })
    : text;
