import { router, type Href } from 'expo-router';

import type { RouteTarget } from '@/data/selectors';

/** Adapts selector routes to expo-router's Href type. */
export const toHref = (route: RouteTarget): Href => route as Href;

export const push = (route: RouteTarget) => router.push(toHref(route));
