/**
 * Which pages the web export pre-renders. Every page by default; a review build sets
 * PRERENDER_PREFIX (comma-separated id prefixes) so only the pages in scope are rendered, which
 * is most of the export's time. Read only at export time, in generateStaticParams.
 */
export function prerenderIds(ids: readonly string[]): string[] {
  const env: string | undefined =
    typeof process === 'undefined' ? undefined : process.env?.PRERENDER_PREFIX;
  if (!env) return [...ids];
  const prefixes = env.split(',').filter(Boolean);
  return ids.filter((id) => prefixes.some((p) => id === p || id.startsWith(p)));
}
