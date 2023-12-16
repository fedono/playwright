import type { BabelFileResult } from '../../bundles/babel/node_modules/@types/babel__core';
export const codeFrameColumns: typeof import('../../bundles/babel/node_modules/@types/babel__code-frame').codeFrameColumns = require('./babelBundleImpl').codeFrameColumns;
export const declare: typeof import('../../bundles/babel/node_modules/@types/babel__helper-plugin-utils').declare = require('./babelBundleImpl').declare;
export const types: typeof import('../../bundles/babel/node_modules/@types/babel__core').types = require('./babelBundleImpl').types;
export const parse: typeof import('../../bundles/babel/node_modules/@babel/parser/typings/babel-parser').parse = require('./babelBundleImpl').parse;
export const traverse: typeof import('../../bundles/babel/node_modules/@types/babel__traverse').default = require('./babelBundleImpl').traverse;
export type BabelPlugin = [string, any?];
export type BabelTransformFunction = (code: string, filename: string, isTypeScript: boolean, isModule: boolean, pluginsPrefix: BabelPlugin[], pluginsSuffix: BabelPlugin[]) => BabelFileResult;
export const babelTransform: BabelTransformFunction = require('./babelBundleImpl').babelTransform;
export type { NodePath, types as T, PluginObj } from '../../bundles/babel/node_modules/@types/babel__core';
export type { BabelAPI } from '../../bundles/babel/node_modules/@types/babel__helper-plugin-utils';
