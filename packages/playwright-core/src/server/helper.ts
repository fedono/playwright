import type { EventEmitter } from 'events';
import type * as types from './types';
import type { Progress } from './progress';
import { debugLogger } from '../common/debugLogger';
import type { RegisteredListener } from '../utils/eventsHelper';
import { eventsHelper } from '../utils/eventsHelper';

const MAX_LOG_LENGTH = process.env.MAX_LOG_LENGTH ? +process.env.MAX_LOG_LENGTH : Infinity;

class Helper {
  static completeUserURL(urlString: string): string {
    if (urlString.startsWith('localhost') || urlString.startsWith('127.0.0.1'))
      urlString = 'http://' + urlString;
    return urlString;
  }

  static enclosingIntRect(rect: types.Rect): types.Rect {
    const x = Math.floor(rect.x + 1e-3);
    const y = Math.floor(rect.y + 1e-3);
    const x2 = Math.ceil(rect.x + rect.width - 1e-3);
    const y2 = Math.ceil(rect.y + rect.height - 1e-3);
    return { x, y, width: x2 - x, height: y2 - y };
  }

  static enclosingIntSize(size: types.Size): types.Size {
    return { width: Math.floor(size.width + 1e-3), height: Math.floor(size.height + 1e-3) };
  }

  static getViewportSizeFromWindowFeatures(features: string[]): types.Size | null {
    const widthString = features.find(f => f.startsWith('width='));
    const heightString = features.find(f => f.startsWith('height='));
    const width = widthString ? parseInt(widthString.substring(6), 10) : NaN;
    const height = heightString ? parseInt(heightString.substring(7), 10) : NaN;
    if (!Number.isNaN(width) && !Number.isNaN(height))
      return { width, height };
    return null;
  }

  static waitForEvent(progress: Progress | null, emitter: EventEmitter, event: string | symbol, predicate?: Function): { promise: Promise<any>, dispose: () => void } {
    const listeners: RegisteredListener[] = [];
    const promise = new Promise((resolve, reject) => {
      listeners.push(eventsHelper.addEventListener(emitter, event, eventArg => {
        try {
          if (predicate && !predicate(eventArg))
            return;
          eventsHelper.removeEventListeners(listeners);
          resolve(eventArg);
        } catch (e) {
          eventsHelper.removeEventListeners(listeners);
          reject(e);
        }
      }));
    });
    const dispose = () => eventsHelper.removeEventListeners(listeners);
    if (progress)
      progress.cleanupWhenAborted(dispose);
    return { promise, dispose };
  }

  static secondsToRoundishMillis(value: number): number {
    return ((value * 1000000) | 0) / 1000;
  }

  static millisToRoundishMillis(value: number): number {
    return ((value * 1000) | 0) / 1000;
  }

  static debugProtocolLogger(protocolLogger?: types.ProtocolLogger): types.ProtocolLogger {
    return (direction: 'send' | 'receive', message: object) => {
      if (protocolLogger)
        protocolLogger(direction, message);
      if (debugLogger.isEnabled('protocol')) {
        let text = JSON.stringify(message);
        if (text.length > MAX_LOG_LENGTH)
          text = text.substring(0, MAX_LOG_LENGTH / 2) + ' <<<<<( LOG TRUNCATED )>>>>> ' + text.substring(text.length - MAX_LOG_LENGTH / 2);
        debugLogger.log('protocol', (direction === 'send' ? 'SEND ► ' : '◀ RECV ') + text);
      }
    };
  }

  static formatBrowserLogs(logs: string[]) {
    if (!logs.length)
      return '';
    return '\n' + logs.join('\n');
  }
}

export const helper = Helper;
