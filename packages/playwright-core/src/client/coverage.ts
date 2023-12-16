import type * as channels from '@protocol/channels';
import type * as api from '../../types/types';

export class Coverage implements api.Coverage {
  private _channel: channels.PageChannel;

  constructor(channel: channels.PageChannel) {
    this._channel = channel;
  }

  async startJSCoverage(options: channels.PageStartJSCoverageOptions = {}) {
    await this._channel.startJSCoverage(options);
  }

  async stopJSCoverage(): Promise<channels.PageStopJSCoverageResult['entries']> {
    return (await this._channel.stopJSCoverage()).entries;
  }

  async startCSSCoverage(options: channels.PageStartCSSCoverageOptions = {}) {
    await this._channel.startCSSCoverage(options);
  }

  async stopCSSCoverage(): Promise<channels.PageStopCSSCoverageResult['entries']> {
    return (await this._channel.stopCSSCoverage()).entries;
  }
}
