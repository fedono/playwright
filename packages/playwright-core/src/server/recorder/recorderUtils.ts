import type { CallMetadata } from '../instrumentation';
import type { CallLog, CallLogStatus } from '@recorder/recorderTypes';

export function metadataToCallLog(metadata: CallMetadata, status: CallLogStatus): CallLog {
  let title = metadata.apiName || metadata.method;
  if (metadata.method === 'waitForEventInfo')
    title += `(${metadata.params.info.event})`;
  title = title.replace('object.expect', 'expect');
  if (metadata.error)
    status = 'error';
  const params = {
    url: metadata.params?.url,
    selector: metadata.params?.selector,
  };
  let duration = metadata.endTime ? metadata.endTime - metadata.startTime : undefined;
  if (typeof duration === 'number' && metadata.pauseStartTime && metadata.pauseEndTime) {
    duration -= (metadata.pauseEndTime - metadata.pauseStartTime);
    duration = Math.max(duration, 0);
  }
  const callLog: CallLog = {
    id: metadata.id,
    messages: metadata.log,
    title,
    status,
    error: metadata.error?.error?.message,
    params,
    duration,
  };
  return callLog;
}
