import type { StackFrame } from '@protocol/channels';
import type { BrowserContext } from './browserContext';
import type { APIRequestContext } from './fetch';

export interface ClientInstrumentation {
  addListener(listener: ClientInstrumentationListener): void;
  removeListener(listener: ClientInstrumentationListener): void;
  removeAllListeners(): void;
  onApiCallBegin(apiCall: string, params: Record<string, any>, frames: StackFrame[], wallTime: number, userData: any): void;
  onApiCallEnd(userData: any, error?: Error): void;
  onDidCreateBrowserContext(context: BrowserContext): Promise<void>;
  onDidCreateRequestContext(context: APIRequestContext): Promise<void>;
  onWillPause(): void;
  onWillCloseBrowserContext(context: BrowserContext): Promise<void>;
  onWillCloseRequestContext(context: APIRequestContext): Promise<void>;
}

export interface ClientInstrumentationListener {
  onApiCallBegin?(apiName: string, params: Record<string, any>, frames: StackFrame[], wallTime: number, userData: any): void;
  onApiCallEnd?(userData: any, error?: Error): void;
  onDidCreateBrowserContext?(context: BrowserContext): Promise<void>;
  onDidCreateRequestContext?(context: APIRequestContext): Promise<void>;
  onWillPause?(): void;
  onWillCloseBrowserContext?(context: BrowserContext): Promise<void>;
  onWillCloseRequestContext?(context: APIRequestContext): Promise<void>;
}

export function createInstrumentation(): ClientInstrumentation {
  const listeners: ClientInstrumentationListener[] = [];
  return new Proxy({}, {
    get: (obj: any, prop: string | symbol) => {
      if (typeof prop !== 'string')
        return obj[prop];
      if (prop === 'addListener')
        return (listener: ClientInstrumentationListener) => listeners.push(listener);
      if (prop === 'removeListener')
        return (listener: ClientInstrumentationListener) => listeners.splice(listeners.indexOf(listener), 1);
      if (prop === 'removeAllListeners')
        return () => listeners.splice(0, listeners.length);
      if (!prop.startsWith('on'))
        return obj[prop];
      return async (...params: any[]) => {
        for (const listener of listeners)
          await (listener as any)[prop]?.(...params);
      };
    },
  });
}
