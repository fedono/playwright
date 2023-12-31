import { EventEmitter } from 'events';
import type * as channels from '@protocol/channels';
import { maybeFindValidator, ValidationError, type ValidatorContext } from '../protocol/validator';
import { debugLogger } from '../common/debugLogger';
import type { ExpectZone } from '../utils/stackTrace';
import { captureRawStack, captureLibraryStackTrace, stringifyStackFrames } from '../utils/stackTrace';
import { isUnderTest } from '../utils';
import { zones } from '../utils/zones';
import type { ClientInstrumentation } from './clientInstrumentation';
import type { Connection } from './connection';
import type { Logger } from './types';

type Listener = (...args: any[]) => void;

// qs 还是没看懂，这个 channel owner 是用来干啥的
export abstract class ChannelOwner<T extends channels.Channel = channels.Channel> extends EventEmitter {
  readonly _connection: Connection;
  private _parent: ChannelOwner | undefined;
  private _objects = new Map<string, ChannelOwner>();

  readonly _type: string;
  readonly _guid: string;
  readonly _channel: T;
  readonly _initializer: channels.InitializerTraits<T>;
  _logger: Logger | undefined;
  readonly _instrumentation: ClientInstrumentation;
  private _eventToSubscriptionMapping: Map<string, string> = new Map();
  _wasCollected: boolean = false;

  constructor(parent: ChannelOwner | Connection, type: string, guid: string, initializer: channels.InitializerTraits<T>) {
    super();
    this.setMaxListeners(0);
    this._connection = parent instanceof ChannelOwner ? parent._connection : parent;
    this._type = type;
    this._guid = guid;
    this._parent = parent instanceof ChannelOwner ? parent : undefined;
    this._instrumentation = this._connection._instrumentation;

    this._connection._objects.set(guid, this);
    if (this._parent) {
      this._parent._objects.set(guid, this);
      this._logger = this._parent._logger;
    }

    // qs 这个 this._channel 的设计真是没看懂，怎么就可以用来监听 click/dblclick 了
    // imp 感觉好像是这个来建立起来 client/server 的，这个 createChannel 会 sendMessageToServer，这样来建立对应的实体的，所以 frame 可以通过 this._channel 来实现 frameDispatcher 的功能
    this._channel = this._createChannel(new EventEmitter());
    this._initializer = initializer;
  }

  _setEventToSubscriptionMapping(mapping: Map<string, string>) {
    this._eventToSubscriptionMapping = mapping;
  }

  private _updateSubscription(event: string | symbol, enabled: boolean) {
    const protocolEvent = this._eventToSubscriptionMapping.get(String(event));
    if (protocolEvent) {
      this._wrapApiCall(async () => {
        await (this._channel as any).updateSubscription({ event: protocolEvent, enabled });
      }, true).catch(() => {});
    }
  }

  // ans 所有的 channel.on 注册的事件，都会在 server / frameDispatcher（也就是对应的 dispatcher） 中使用 this._dispatchEvent 来触发
  override on(event: string | symbol, listener: Listener): this {
    if (!this.listenerCount(event))
      this._updateSubscription(event, true);
    super.on(event, listener);
    return this;
  }

  override addListener(event: string | symbol, listener: Listener): this {
    if (!this.listenerCount(event))
      this._updateSubscription(event, true);
    super.addListener(event, listener);
    return this;
  }

  override prependListener(event: string | symbol, listener: Listener): this {
    if (!this.listenerCount(event))
      this._updateSubscription(event, true);
    super.prependListener(event, listener);
    return this;
  }

  override off(event: string | symbol, listener: Listener): this {
    super.off(event, listener);
    if (!this.listenerCount(event))
      this._updateSubscription(event, false);
    return this;
  }

  override removeListener(event: string | symbol, listener: Listener): this {
    super.removeListener(event, listener);
    if (!this.listenerCount(event))
      this._updateSubscription(event, false);
    return this;
  }

  _adopt(child: ChannelOwner<any>) {
    child._parent!._objects.delete(child._guid);
    this._objects.set(child._guid, child);
    child._parent = this;
  }

  _dispose(reason: 'gc' | undefined) {
    // Clean up from parent and connection.
    if (this._parent)
      this._parent._objects.delete(this._guid);
    this._connection._objects.delete(this._guid);
    this._wasCollected = reason === 'gc';

    // Dispose all children.
    for (const object of [...this._objects.values()])
      object._dispose(reason);
    this._objects.clear();
  }

  _debugScopeState(): any {
    return {
      _guid: this._guid,
      objects: Array.from(this._objects.values()).map(o => o._debugScopeState()),
    };
  }

  // qs _createChannel 一直没有明白这段函数究竟在做什么，等于每次这里都会 sendMessageToServer
  // 怎么这里是 client
  private _createChannel(base: Object): T {
    const channel = new Proxy(base, {
      get: (obj: any, prop: string | symbol) => {
        if (typeof prop === 'string') {
          const validator = maybeFindValidator(this._type, prop, 'Params');
          if (validator) {
            return (params: any) => {
              return this._wrapApiCall(apiZone => {
                const { apiName, frames, csi, callCookie, wallTime } = apiZone.reported ? { apiName: undefined, csi: undefined, callCookie: undefined, frames: [], wallTime: undefined } : apiZone;
                apiZone.reported = true;
                if (csi && apiName)
                  csi.onApiCallBegin(apiName, params, frames, wallTime, callCookie);

                  // client 所有的重点，应该是在这里了
                return this._connection.sendMessageToServer(this, prop, validator(params, '', { tChannelImpl: tChannelImplToWire, binary: this._connection.isRemote() ? 'toBase64' : 'buffer' }), apiName, frames, wallTime);
              });
            };
          }
        }
        return obj[prop];
      },
    });
    (channel as any)._object = this;
    return channel;
  }

  async _wrapApiCall<R>(func: (apiZone: ApiZone) => Promise<R>, isInternal = false): Promise<R> {
    const logger = this._logger;
    const stack = captureRawStack();
    const apiZone = zones.zoneData<ApiZone>('apiZone', stack);
    if (apiZone)
      return func(apiZone);

    const stackTrace = captureLibraryStackTrace(stack);
    let apiName: string | undefined = stackTrace.apiName;
    const frames: channels.StackFrame[] = stackTrace.frames;

    isInternal = isInternal || this._type === 'LocalUtils';
    if (isInternal)
      apiName = undefined;

    // Enclosing zone could have provided the apiName and wallTime.
    const expectZone = zones.zoneData<ExpectZone>('expectZone', stack);
    const wallTime = expectZone ? expectZone.wallTime : Date.now();
    if (!isInternal && expectZone)
      apiName = expectZone.title;

    const csi = isInternal ? undefined : this._instrumentation;
    const callCookie: any = {};

    try {
      logApiCall(logger, `=> ${apiName} started`, isInternal);
      // nt 定义 apiZone
      const apiZone: ApiZone = { apiName, frames, isInternal, reported: false, csi, callCookie, wallTime };
      const result = await zones.run<ApiZone, Promise<R>>('apiZone', apiZone, async () => {
        return await func(apiZone);
      });
      csi?.onApiCallEnd(callCookie);
      logApiCall(logger, `<= ${apiName} succeeded`, isInternal);
      return result;
    } catch (e) {
      const innerError = ((process.env.PWDEBUGIMPL || isUnderTest()) && e.stack) ? '\n<inner error>\n' + e.stack : '';
      if (apiName && !apiName.includes('<anonymous>'))
        e.message = apiName + ': ' + e.message;
      const stackFrames = '\n' + stringifyStackFrames(stackTrace.frames).join('\n') + innerError;
      if (stackFrames.trim())
        e.stack = e.message + stackFrames;
      else
        e.stack = '';
      csi?.onApiCallEnd(callCookie, e);
      logApiCall(logger, `<= ${apiName} failed`, isInternal);
      throw e;
    }
  }

  _toImpl(): any {
    return this._connection.toImpl?.(this);
  }

  private toJSON() {
    // Jest's expect library tries to print objects sometimes.
    // RPC objects can contain links to lots of other objects,
    // which can cause jest to crash. Let's help it out
    // by just returning the important values.
    return {
      _type: this._type,
      _guid: this._guid,
    };
  }
}

function logApiCall(logger: Logger | undefined, message: string, isNested: boolean) {
  if (isNested)
    return;
  if (logger && logger.isEnabled('api', 'info'))
    logger.log('api', 'info', message, [], { color: 'cyan' });
  debugLogger.log('api', message);
}

function tChannelImplToWire(names: '*' | string[], arg: any, path: string, context: ValidatorContext) {
  if (arg._object instanceof ChannelOwner && (names === '*' || names.includes(arg._object._type)))
    return { guid: arg._object._guid };
  throw new ValidationError(`${path}: expected channel ${names.toString()}`);
}

type ApiZone = {
  apiName: string | undefined;
  frames: channels.StackFrame[];
  isInternal: boolean;
  reported: boolean;
  csi: ClientInstrumentation | undefined;
  callCookie: any;
  wallTime: number;
};
