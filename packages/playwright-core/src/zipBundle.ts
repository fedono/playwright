export const yazl: typeof import('../bundles/zip/node_modules/@types/yazl') = require('./zipBundleImpl').yazl;
export type { ZipFile } from '../bundles/zip/node_modules/@types/yazl';
export const yauzl: typeof import('../bundles/zip/node_modules/@types/yauzl') = require('./zipBundleImpl').yauzl;
export type { ZipFile as UnzipFile, Entry } from '../bundles/zip/node_modules/@types/yauzl';
export const extract: typeof import('../bundles/zip/node_modules/extract-zip') = require('./zipBundleImpl').extract;
