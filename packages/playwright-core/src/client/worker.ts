import { Events } from './events';
import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';
import { assertMaxArguments, JSHandle, parseResult, serializeArgument } from './jsHandle';
import type { Page } from './page';
import type { BrowserContext } from './browserContext';
import type * as api from '../../types/types';
import type * as structs from '../../types/structs';
import { LongStandingScope } from '../utils';
import { TargetClosedError } from './errors';

export class Worker extends ChannelOwner<channels.WorkerChannel> implements api.Worker {
  _page: Page | undefined;  // Set for web workers.
  _context: BrowserContext | undefined;  // Set for service workers.
  readonly _closedScope = new LongStandingScope();

  static from(worker: channels.WorkerChannel): Worker {
    return (worker as any)._object;
  }

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.WorkerInitializer) {
    super(parent, type, guid, initializer);
    this._channel.on('close', () => {
      if (this._page)
        this._page._workers.delete(this);
      if (this._context)
        this._context._serviceWorkers.delete(this);
      this.emit(Events.Worker.Close, this);
    });
    this.once(Events.Worker.Close, () => this._closedScope.close(this._page?._closeErrorWithReason() || new TargetClosedError()));
  }

  url(): string {
    return this._initializer.url;
  }

  async evaluate<R, Arg>(pageFunction: structs.PageFunction<Arg, R>, arg?: Arg): Promise<R> {
    assertMaxArguments(arguments.length, 2);
    const result = await this._channel.evaluateExpression({ expression: String(pageFunction), isFunction: typeof pageFunction === 'function', arg: serializeArgument(arg) });
    return parseResult(result.value);
  }

  async evaluateHandle<R, Arg>(pageFunction: structs.PageFunction<Arg, R>, arg?: Arg): Promise<structs.SmartHandle<R>> {
    assertMaxArguments(arguments.length, 2);
    const result = await this._channel.evaluateExpressionHandle({ expression: String(pageFunction), isFunction: typeof pageFunction === 'function', arg: serializeArgument(arg) });
    return JSHandle.from(result.handle) as any as structs.SmartHandle<R>;
  }
}
