import { serializeAsCallArgument, parseEvaluationResultValue } from '../isomorphic/utilityScriptSerializers';

export class UtilityScript {
  serializeAsCallArgument = serializeAsCallArgument;
  parseEvaluationResultValue = parseEvaluationResultValue;

  evaluate(isFunction: boolean | undefined, returnByValue: boolean, exposeUtilityScript: boolean | undefined, expression: string, argCount: number, ...argsAndHandles: any[]) {
    const args = argsAndHandles.slice(0, argCount);
    const handles = argsAndHandles.slice(argCount);
    const parameters = [];
    for (let i = 0; i < args.length; i++)
      parameters[i] = this.parseEvaluationResultValue(args[i], handles);
    if (exposeUtilityScript)
      parameters.unshift(this);

    // eslint-disable-next-line no-restricted-globals
    let result = globalThis.eval(expression);
    if (isFunction === true) {
      result = result(...parameters);
    } else if (isFunction === false) {
      result = result;
    } else {
      // auto detect.
      if (typeof result === 'function')
        result = result(...parameters);
    }
    return returnByValue ? this._promiseAwareJsonValueNoThrow(result) : result;
  }

  jsonValue(returnByValue: true, value: any) {
    // Special handling of undefined to work-around multi-step returnByValue handling in WebKit.
    if (Object.is(value, undefined))
      return undefined;
    return serializeAsCallArgument(value, (value: any) => ({ fallThrough: value }));
  }

  private _promiseAwareJsonValueNoThrow(value: any) {
    const safeJson = (value: any) => {
      try {
        return this.jsonValue(true, value);
      } catch (e) {
        return undefined;
      }
    };

    if (value && typeof value === 'object' && typeof value.then === 'function') {
      return (async () => {
        // By using async function we ensure that return value is a native Promise,
        // and not some overridden Promise in the page.
        // This makes Firefox and WebKit debugging protocols recognize it as a Promise,
        // properly await and return the value.
        const promiseValue = await value;
        return safeJson(promiseValue);
      })();
    }
    return safeJson(value);
  }
}
