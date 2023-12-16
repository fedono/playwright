import type { TestCaseSummary } from './types';

export function escapeRegExp(string: string) {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExpChar = RegExp(reRegExpChar.source);

  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : (string || '');
}

export function testCaseLabels(test: TestCaseSummary): string[] {
  const tags = matchTags(test.path.join(' ') + ' ' + test.title).sort((a, b) => a.localeCompare(b));
  if (test.reportName)
    tags.unshift(test.reportName);
  return tags;
}

// match all tags in test title
function matchTags(title: string): string[] {
  return title.match(/@([\S]+)/g) || [];
}

// hash string to integer in range [0, 6] for color index, to get same color for same tag
export function hashStringToInt(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 8) - hash);
  return Math.abs(hash % 6);
}
