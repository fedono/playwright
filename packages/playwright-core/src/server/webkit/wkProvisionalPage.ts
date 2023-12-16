import type { WKSession } from './wkConnection';
import type { WKPage } from './wkPage';
import type { RegisteredListener } from '../../utils/eventsHelper';
import { eventsHelper } from '../../utils/eventsHelper';
import type { Protocol } from './protocol';
import { assert } from '../../utils';

export class WKProvisionalPage {
  readonly _session: WKSession;
  private readonly _wkPage: WKPage;
  private _sessionListeners: RegisteredListener[] = [];
  private _mainFrameId: string | null = null;
  readonly initializationPromise: Promise<void>;

  constructor(session: WKSession, page: WKPage) {
    this._session = session;
    this._wkPage = page;

    const overrideFrameId = (handler: (p: any) => void) => {
      return (payload: any) => {
        // Pretend that the events happened in the same process.
        if (payload.frameId)
          payload.frameId = this._wkPage._page._frameManager.mainFrame()._id;
        handler(payload);
      };
    };
    const wkPage = this._wkPage;

    this._sessionListeners = [
      eventsHelper.addEventListener(session, 'Network.requestWillBeSent', overrideFrameId(e => wkPage._onRequestWillBeSent(session, e))),
      eventsHelper.addEventListener(session, 'Network.requestIntercepted', overrideFrameId(e => wkPage._onRequestIntercepted(session, e))),
      eventsHelper.addEventListener(session, 'Network.responseReceived', overrideFrameId(e => wkPage._onResponseReceived(e))),
      eventsHelper.addEventListener(session, 'Network.loadingFinished', overrideFrameId(e => wkPage._onLoadingFinished(e))),
      eventsHelper.addEventListener(session, 'Network.loadingFailed', overrideFrameId(e => wkPage._onLoadingFailed(e))),
    ];

    this.initializationPromise = this._wkPage._initializeSession(session, true, ({ frameTree }) => this._handleFrameTree(frameTree));
  }

  dispose() {
    eventsHelper.removeEventListeners(this._sessionListeners);
  }

  commit() {
    assert(this._mainFrameId);
    this._wkPage._onFrameAttached(this._mainFrameId, null);
  }

  private _handleFrameTree(frameTree: Protocol.Page.FrameResourceTree) {
    assert(!frameTree.frame.parentId);
    this._mainFrameId = frameTree.frame.id;
  }
}
