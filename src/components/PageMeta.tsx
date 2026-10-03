import { usePathname } from 'expo-router';
import Head from 'expo-router/head';

import { SITE_NAME, SITE_URL } from '@/config/site';

/**
 * The page's <title>, description, canonical link and link-preview tags for browsers, search
 * engines and link previews. On web these are written into each pre-rendered HTML page; on iOS
 * they have no effect. `noindex` keeps a page out of search results (onboarding, plans, demos).
 */
export function PageMeta({
  title,
  description,
  noindex,
}: {
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const pathname = usePathname();
  const full = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const url = SITE_URL + (pathname === '/' ? '' : pathname);
  // The link-preview picture: school pages, college pages, or the default.
  const og = /^\/(grade|skill|lessons)(\/|$)/.test(pathname)
    ? 'k12'
    : /^\/(he|course)(\/|$)/.test(pathname)
      ? 'college'
      : 'default';
  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex" /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={`${SITE_URL}/og/${og}.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}
