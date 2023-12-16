import { debug } from '../utilsBundle';
import fs from 'fs';

// imp 本地日志输出
const debugLoggerColorMap = {
  'api': 45, // cyan
  'protocol': 34, // green
  'install': 34, // green
  'download': 34, // green
  'browser': 0, // reset
  'socks': 92, // purple
  'error': 160, // red,
  'channel': 33, // blue
  'server': 45, // cyan
  'server:channel': 34, // green
};
export type LogName = keyof typeof debugLoggerColorMap;

class DebugLogger {
  private _debuggers = new Map<string, debug.IDebugger>();

  constructor() {
    if (process.env.DEBUG_FILE) {
      const ansiRegex = new RegExp([
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
      ].join('|'), 'g');
      const stream = fs.createWriteStream(process.env.DEBUG_FILE);
      (debug as any).log = (data: string) => {
        stream.write(data.replace(ansiRegex, ''));
        stream.write('\n');
      };
    }
  }

  log(name: LogName, message: string | Error | object) {
    let cachedDebugger = this._debuggers.get(name);
    if (!cachedDebugger) {
      cachedDebugger = debug(`pw:${name}`);
      this._debuggers.set(name, cachedDebugger);
      (cachedDebugger as any).color = debugLoggerColorMap[name] || 0;
    }
    cachedDebugger(message);
  }

  isEnabled(name: LogName) {
    return debug.enabled(`pw:${name}`);
  }
}

export const debugLogger = new DebugLogger();

const kLogCount = 150;
export class RecentLogsCollector {
  private _logs: string[] = [];

  log(message: string) {
    this._logs.push(message);
    if (this._logs.length === kLogCount * 2)
      this._logs.splice(0, kLogCount);
  }

  recentLogs(): string[] {
    if (this._logs.length > kLogCount)
      return this._logs.slice(-kLogCount);
    return this._logs;
  }
}
