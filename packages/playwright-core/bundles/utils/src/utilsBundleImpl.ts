import colorsLibrary from 'colors/safe';
export const colors = colorsLibrary;

import debugLibrary from 'debug';
export const debug = debugLibrary;

export { getProxyForUrl } from 'proxy-from-env';

export { HttpsProxyAgent } from 'https-proxy-agent';

import jpegLibrary from 'jpeg-js';
export const jpegjs = jpegLibrary;

const lockfileLibrary = require('./third_party/lockfile');
export const lockfile = lockfileLibrary;

import mimeLibrary from 'mime';
export const mime = mimeLibrary;

import minimatchLibrary from 'minimatch';
export const minimatch = minimatchLibrary;

import openLibrary from 'open';
export const open = openLibrary;

export { PNG } from 'pngjs';

export { program } from 'commander';

import progressLibrary from 'progress';
export const progress = progressLibrary;

export { SocksProxyAgent } from 'socks-proxy-agent';

import StackUtilsLibrary from 'stack-utils';
export const StackUtils = StackUtilsLibrary;

// @ts-ignore
import wsLibrary, { WebSocketServer, Receiver, Sender } from 'ws';
export const ws = wsLibrary;
export const wsServer = WebSocketServer;
export const wsReceiver = Receiver;
export const wsSender = Sender;
