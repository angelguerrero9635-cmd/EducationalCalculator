import Head from 'expo-router/head';

import { SITE_NAME } from '@/config/site';

/**
 * The page's <title> and description for browsers, search engines and link previews. On web
 * these are written into each pre-rendered HTML page; on iOS they have no effect.
 */
export function PageMeta({ title, description }: { title: string; description: string }) {
  const full = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
    </Head>
  );
}
