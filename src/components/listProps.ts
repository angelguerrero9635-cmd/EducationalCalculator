import { Platform } from 'react-native';

/**
 * Lists render only their first rows until scrolled. On web, render every row up front so
 * pre-rendered pages (static HTML for crawlers and no-JS readers) contain the whole list; the
 * lists here are at most a few dozen rows.
 */
export const renderAllOnWeb = Platform.OS === 'web' ? { initialNumToRender: 10000 } : {};
