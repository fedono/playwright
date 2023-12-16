// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
const escapedChars = new Set(['$', '^', '+', '.', '*', '(', ')', '|', '\\', '?', '{', '}', '[', ']']);

export function globToRegex(glob: string): RegExp {
  const tokens = ['^'];
  let inGroup = false;
  for (let i = 0; i < glob.length; ++i) {
    const c = glob[i];
    if (c === '\\' && i + 1 < glob.length) {
      const char = glob[++i];
      tokens.push(escapedChars.has(char) ? '\\' + char : char);
      continue;
    }
    if (c === '*') {
      const beforeDeep = glob[i - 1];
      let starCount = 1;
      while (glob[i + 1] === '*') {
        starCount++;
        i++;
      }
      const afterDeep = glob[i + 1];
      const isDeep = starCount > 1 &&
          (beforeDeep === '/' || beforeDeep === undefined) &&
          (afterDeep === '/' || afterDeep === undefined);
      if (isDeep) {
        tokens.push('((?:[^/]*(?:\/|$))*)');
        i++;
      } else {
        tokens.push('([^/]*)');
      }
      continue;
    }

    switch (c) {
      case '?':
        tokens.push('.');
        break;
      case '[':
        tokens.push('[');
        break;
      case ']':
        tokens.push(']');
        break;
      case '{':
        inGroup = true;
        tokens.push('(');
        break;
      case '}':
        inGroup = false;
        tokens.push(')');
        break;
      case ',':
        if (inGroup) {
          tokens.push('|');
          break;
        }
        tokens.push('\\' + c);
        break;
      default:
        tokens.push(escapedChars.has(c) ? '\\' + c : c);
    }
  }
  tokens.push('$');
  return new RegExp(tokens.join(''));
}
