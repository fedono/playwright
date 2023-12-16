export function isString(obj: any): obj is string {
  return typeof obj === 'string' || obj instanceof String;
}

export function isRegExp(obj: any): obj is RegExp {
  return obj instanceof RegExp || Object.prototype.toString.call(obj) === '[object RegExp]';
}

export function isObject(obj: any): obj is NonNullable<object> {
  return typeof obj === 'object' && obj !== null;
}

export function isError(obj: any): obj is Error {
  return obj instanceof Error || (obj && Object.getPrototypeOf(obj)?.name === 'Error');
}

export const isLikelyNpxGlobal = () => process.argv.length >= 2 && process.argv[1].includes('_npx');
