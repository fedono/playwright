import { expectTypes, callLogText } from '../util';
import { matcherHint } from './matcherHint';
import type { MatcherResult } from './matcherHint';
import { currentExpectTimeout } from '../common/globals';
import type { ExpectMatcherContext } from './expect';
import type { Locator } from 'playwright-core';

// Omit colon and one or more spaces, so can call getLabelPrinter.
const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

// The optional property of matcher context is true if undefined.
const isExpand = (expand?: boolean): boolean => expand !== false;

export async function toEqual<T>(
  this: ExpectMatcherContext,
  matcherName: string,
  receiver: Locator,
  receiverType: string,
  query: (isNot: boolean, timeout: number) => Promise<{ matches: boolean, received?: any, log?: string[], timedOut?: boolean }>,
  expected: T,
  options: { timeout?: number, contains?: boolean } = {},
): Promise<MatcherResult<any, any>> {
  expectTypes(receiver, [receiverType], matcherName);

  const matcherOptions = {
    comment: options.contains ? '' : 'deep equality',
    isNot: this.isNot,
    promise: this.promise,
  };

  const timeout = currentExpectTimeout(options);

  const { matches: pass, received, log, timedOut } = await query(!!this.isNot, timeout);

  const message = pass
    ? () =>
      matcherHint(this, receiver, matcherName, 'locator', undefined, matcherOptions, timedOut ? timeout : undefined) +
      `Expected: not ${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(received)}` + callLogText(log)
    : () =>
      matcherHint(this, receiver, matcherName, 'locator', undefined, matcherOptions, timedOut ? timeout : undefined) +
      this.utils.printDiffOrStringify(
          expected,
          received,
          EXPECTED_LABEL,
          RECEIVED_LABEL,
          isExpand(this.expand),
      ) + callLogText(log);

  // Passing the actual and expected objects so that a custom reporter
  // could access them, for example in order to display a custom visual diff,
  // or create a different error message
  return {
    actual: received,
    expected, message,
    name: matcherName,
    pass,
    log,
    timeout: timedOut ? timeout : undefined,
  };
}
