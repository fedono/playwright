import { expectTypes, callLogText } from '../util';
import { matcherHint } from './matcherHint';
import type { MatcherResult } from './matcherHint';
import { currentExpectTimeout } from '../common/globals';
import type { ExpectMatcherContext } from './expect';
import type { Locator } from 'playwright-core';

export async function toBeTruthy(
  this: ExpectMatcherContext,
  matcherName: string,
  receiver: Locator,
  receiverType: string,
  expected: string,
  unexpected: string,
  arg: string,
  query: (isNot: boolean, timeout: number) => Promise<{ matches: boolean, log?: string[], received?: any, timedOut?: boolean }>,
  options: { timeout?: number } = {},
): Promise<MatcherResult<any, any>> {
  expectTypes(receiver, [receiverType], matcherName);

  const matcherOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };

  const timeout = currentExpectTimeout(options);
  const { matches, log, timedOut } = await query(!!this.isNot, timeout);
  const actual = matches ? expected : unexpected;
  const message = () => {
    const header = matcherHint(this, receiver, matcherName, 'locator', arg, matcherOptions, timedOut ? timeout : undefined);
    const logText = callLogText(log);
    return matches ? `${header}Expected: not ${expected}\nReceived: ${expected}${logText}` :
      `${header}Expected: ${expected}\nReceived: ${unexpected}${logText}`;
  };
  return {
    message,
    pass: matches,
    actual,
    name: matcherName,
    expected,
    log,
    timeout: timedOut ? timeout : undefined,
  };
}
