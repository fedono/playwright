import type { SerializedValue } from '@protocol/channels';

export function parseSerializedValue(value: SerializedValue, handles: any[] | undefined): any {
  return innerParseSerializedValue(value, handles, new Map());
}

function innerParseSerializedValue(value: SerializedValue, handles: any[] | undefined, refs: Map<number, object>): any {
  if (value.ref !== undefined)
    return refs.get(value.ref);
  if (value.n !== undefined)
    return value.n;
  if (value.s !== undefined)
    return value.s;
  if (value.b !== undefined)
    return value.b;
  if (value.v !== undefined) {
    if (value.v === 'undefined')
      return undefined;
    if (value.v === 'null')
      return null;
    if (value.v === 'NaN')
      return NaN;
    if (value.v === 'Infinity')
      return Infinity;
    if (value.v === '-Infinity')
      return -Infinity;
    if (value.v === '-0')
      return -0;
  }
  if (value.d !== undefined)
    return new Date(value.d);
  if (value.u !== undefined)
    return new URL(value.u);
  if (value.bi !== undefined)
    return BigInt(value.bi);
  if (value.r !== undefined)
    return new RegExp(value.r.p, value.r.f);

  if (value.a !== undefined) {
    const result: any[] = [];
    refs.set(value.id!, result);
    for (const v of value.a)
      result.push(innerParseSerializedValue(v, handles, refs));
    return result;
  }
  if (value.o !== undefined) {
    const result: any = {};
    refs.set(value.id!, result);
    for (const { k, v } of value.o)
      result[k] = innerParseSerializedValue(v, handles, refs);
    return result;
  }
  if (value.h !== undefined) {
    if (handles === undefined)
      throw new Error('Unexpected handle');
    return handles[value.h];
  }
  throw new Error('Unexpected value');
}

export type HandleOrValue = { h: number } | { fallThrough: any };
type VisitorInfo = {
  visited: Map<object, number>;
  lastId: number;
};

export function serializeValue(value: any, handleSerializer: (value: any) => HandleOrValue): SerializedValue {
  return innerSerializeValue(value, handleSerializer, { lastId: 0, visited: new Map() });
}

function innerSerializeValue(value: any, handleSerializer: (value: any) => HandleOrValue, visitorInfo: VisitorInfo): SerializedValue {
  const handle = handleSerializer(value);
  if ('fallThrough' in handle)
    value = handle.fallThrough;
  else
    return handle;

  if (typeof value === 'symbol')
    return { v: 'undefined' };
  if (Object.is(value, undefined))
    return { v: 'undefined' };
  if (Object.is(value, null))
    return { v: 'null' };
  if (Object.is(value, NaN))
    return { v: 'NaN' };
  if (Object.is(value, Infinity))
    return { v: 'Infinity' };
  if (Object.is(value, -Infinity))
    return { v: '-Infinity' };
  if (Object.is(value, -0))
    return { v: '-0' };
  if (typeof value === 'boolean')
    return { b: value };
  if (typeof value === 'number')
    return { n: value };
  if (typeof value === 'string')
    return { s: value };
  if (typeof value === 'bigint')
    return { bi: value.toString() };
  if (isError(value)) {
    const error = value;
    if ('captureStackTrace' in globalThis.Error) {
      // v8
      return { s: error.stack || '' };
    }
    return { s: `${error.name}: ${error.message}\n${error.stack}` };
  }
  if (isDate(value))
    return { d: value.toJSON() };
  if (isURL(value))
    return { u: value.toJSON() };
  if (isRegExp(value))
    return { r: { p: value.source, f: value.flags } };

  const id = visitorInfo.visited.get(value);
  if (id)
    return { ref: id };

  if (Array.isArray(value)) {
    const a = [];
    const id = ++visitorInfo.lastId;
    visitorInfo.visited.set(value, id);
    for (let i = 0; i < value.length; ++i)
      a.push(innerSerializeValue(value[i], handleSerializer, visitorInfo));
    return { a, id };
  }
  if (typeof value === 'object') {
    const o: { k: string, v: SerializedValue }[] = [];
    const id = ++visitorInfo.lastId;
    visitorInfo.visited.set(value, id);
    for (const name of Object.keys(value))
      o.push({ k: name, v: innerSerializeValue(value[name], handleSerializer, visitorInfo) });
    return { o, id };
  }
  throw new Error('Unexpected value');
}

function isRegExp(obj: any): obj is RegExp {
  return obj instanceof RegExp || Object.prototype.toString.call(obj) === '[object RegExp]';
}

function isDate(obj: any): obj is Date {
  return obj instanceof Date || Object.prototype.toString.call(obj) === '[object Date]';
}

function isURL(obj: any): obj is URL {
  return obj instanceof URL || Object.prototype.toString.call(obj) === '[object URL]';
}

function isError(obj: any): obj is Error {
  const proto = obj ? Object.getPrototypeOf(obj) : null;
  return obj instanceof Error || proto?.name === 'Error' || (proto && isError(proto));
}
