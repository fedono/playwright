import { getFromENV } from './env';

export function assert(value: any, message?: string): asserts value {
  if (!value)
    throw new Error(message || 'Assertion error');
}

export function debugAssert(value: any, message?: string): asserts value {
  if (isUnderTest() && !value)
    throw new Error(message);
}

const debugEnv = getFromENV('PWDEBUG') || '';
export function debugMode() {
  if (debugEnv === 'console')
    return 'console';
  if (debugEnv === '0' || debugEnv === 'false')
    return '';
  return debugEnv ? 'inspector' : '';
}

let _isUnderTest = !!process.env.PWTEST_UNDER_TEST;
export function setUnderTest() {
  _isUnderTest = true;
}

export function isUnderTest(): boolean {
  return _isUnderTest;
}
