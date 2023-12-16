import type * as types from './types';
import fs from 'fs';
import { isString } from '../utils';

export function envObjectToArray(env: types.Env): { name: string, value: string }[] {
  const result: { name: string, value: string }[] = [];
  for (const name in env) {
    if (!Object.is(env[name], undefined))
      result.push({ name, value: String(env[name]) });
  }
  return result;
}

export async function evaluationScript(fun: Function | string | { path?: string, content?: string }, arg?: any, addSourceUrl: boolean = true): Promise<string> {
  if (typeof fun === 'function') {
    const source = fun.toString();
    const argString = Object.is(arg, undefined) ? 'undefined' : JSON.stringify(arg);
    return `(${source})(${argString})`;
  }
  if (arg !== undefined)
    throw new Error('Cannot evaluate a string with arguments');
  if (isString(fun))
    return fun;
  if (fun.content !== undefined)
    return fun.content;
  if (fun.path !== undefined) {
    let source = await fs.promises.readFile(fun.path, 'utf8');
    if (addSourceUrl)
      source += '\n//# sourceURL=' + fun.path.replace(/\n/g, '');
    return source;
  }
  throw new Error('Either path or content property must be present');
}
