import type * as channels from '@protocol/channels';
import type { Tracing } from '../trace/recorder/tracing';
import { ArtifactDispatcher } from './artifactDispatcher';
import { Dispatcher, existingDispatcher } from './dispatcher';
import type { BrowserContextDispatcher } from './browserContextDispatcher';
import type { APIRequestContextDispatcher } from './networkDispatchers';

export class TracingDispatcher extends Dispatcher<Tracing, channels.TracingChannel, BrowserContextDispatcher | APIRequestContextDispatcher> implements channels.TracingChannel {
  _type_Tracing = true;

  static from(scope: BrowserContextDispatcher | APIRequestContextDispatcher, tracing: Tracing): TracingDispatcher {
    const result = existingDispatcher<TracingDispatcher>(tracing);
    return result || new TracingDispatcher(scope, tracing);
  }

  constructor(scope: BrowserContextDispatcher | APIRequestContextDispatcher, tracing: Tracing) {
    super(scope, tracing, 'Tracing', {});
  }

  async tracingStart(params: channels.TracingTracingStartParams): Promise<channels.TracingTracingStartResult> {
    await this._object.start(params);
  }

  async tracingStartChunk(params: channels.TracingTracingStartChunkParams): Promise<channels.TracingTracingStartChunkResult> {
    return await this._object.startChunk(params);
  }

  async tracingStopChunk(params: channels.TracingTracingStopChunkParams): Promise<channels.TracingTracingStopChunkResult> {
    const { artifact, entries } = await this._object.stopChunk(params);
    return { artifact: artifact ? ArtifactDispatcher.from(this, artifact) : undefined, entries };
  }

  async tracingStop(params: channels.TracingTracingStopParams): Promise<channels.TracingTracingStopResult> {
    await this._object.stop();
  }

}
