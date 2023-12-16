export function wrapInASCIIBox(text: string, padding = 0): string {
  const lines = text.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  return [
    '╔' + '═'.repeat(maxLength + padding * 2) + '╗',
    ...lines.map(line => '║' + ' '.repeat(padding) + line + ' '.repeat(maxLength - line.length + padding) + '║'),
    '╚' + '═'.repeat(maxLength + padding * 2) + '╝',
  ].join('\n');
}

export function jsonStringifyForceASCII(object: any): string {
  return JSON.stringify(object).replace(
      /[\u007f-\uffff]/g,
      c => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
  );
}
