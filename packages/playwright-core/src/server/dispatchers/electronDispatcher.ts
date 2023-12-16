import type { RootDispatcher } from './dispatcher';
import { Dispatcher } from './dispatcher';
import type { Electron } from '../electron/electron';
import { ElectronApplication } from '../electron/electron';
import type * as channels from '@protocol/channels';
import { BrowserContextDispatcher } from './browserContextDispatcher';
import type { PageDispatcher } from './pageDispatcher';
import { parseArgument, serializeResult } from './jsHandleDispatcher';
import { ElementHandleDispatcher } from './elementHandlerDispatcher';

export class ElectronDispatcher extends Dispatcher<Electron, channels.ElectronChannel, RootDispatcher> implements channels.ElectronChannel {
  _type_Electron = true;

  constructor(scope: RootDispatcher, electron: Electron) {
    super(scope, electron, 'Electron', {});
  }

  async launch(params: channels.ElectronLaunchParams): Promise<channels.ElectronLaunchResult> {
    const electronApplication = await this._object.launch(params);
    return { electronApplication: new ElectronApplicationDispatcher(this, electronApplication) };
  }
}

export class ElectronApplicationDispatcher extends Dispatcher<ElectronApplication, channels.ElectronApplicationChannel, ElectronDispatcher> implements channels.ElectronApplicationChannel {
  _type_EventTarget = true;
  _type_ElectronApplication = true;

  constructor(scope: ElectronDispatcher, electronApplication: ElectronApplication) {
    super(scope, electronApplication, 'ElectronApplication', {
      context: new BrowserContextDispatcher(scope, electronApplication.context())
    });
    this.addObjectListener(ElectronApplication.Events.Close, () => {
      this._dispatchEvent('close');
      this._dispose();
    });
  }

  async browserWindow(params: channels.ElectronApplicationBrowserWindowParams): Promise<channels.ElectronApplicationBrowserWindowResult> {
    const handle = await this._object.browserWindow((params.page as PageDispatcher).page());
    return { handle: ElementHandleDispatcher.fromJSHandle(this, handle) };
  }

  async evaluateExpression(params: channels.ElectronApplicationEvaluateExpressionParams): Promise<channels.ElectronApplicationEvaluateExpressionResult> {
    const handle = await this._object._nodeElectronHandlePromise;
    return { value: serializeResult(await handle.evaluateExpression(params.expression, { isFunction: params.isFunction }, parseArgument(params.arg))) };
  }

  async evaluateExpressionHandle(params: channels.ElectronApplicationEvaluateExpressionHandleParams): Promise<channels.ElectronApplicationEvaluateExpressionHandleResult> {
    const handle = await this._object._nodeElectronHandlePromise;
    const result = await handle.evaluateExpressionHandle(params.expression, { isFunction: params.isFunction }, parseArgument(params.arg));
    return { handle: ElementHandleDispatcher.fromJSHandle(this, result) };
  }

  async close(): Promise<void> {
    await this._object.close();
  }
}
