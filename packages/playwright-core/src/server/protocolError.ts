import { rewriteErrorMessage } from '../utils/stackTrace';

export class ProtocolError extends Error {
  type: 'error' | 'closed' | 'crashed';
  method: string | undefined;
  logs: string | undefined;

  constructor(type: 'error' | 'closed' | 'crashed', method?: string, logs?: string) {
    super();
    this.type = type;
    this.method = method;
    this.logs = logs;
  }

  setMessage(message: string) {
    rewriteErrorMessage(this, `Protocol error (${this.method}): ${message}`);
  }

  browserLogMessage() {
    return this.logs ? '\nBrowser logs:\n' + this.logs : '';
  }
}

export function isProtocolError(e: Error): e is ProtocolError {
  return e instanceof ProtocolError;
}

export function isSessionClosedError(e: Error): e is ProtocolError {
  return e instanceof ProtocolError && (e.type === 'closed' || e.type === 'crashed');
}
