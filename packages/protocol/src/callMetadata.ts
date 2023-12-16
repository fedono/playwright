import type { Point, SerializedError } from './channels';

export type CallMetadata = {
  id: string;
  startTime: number;
  endTime: number;
  pauseStartTime?: number;
  pauseEndTime?: number;
  type: string;
  method: string;
  params: any;
  apiName?: string;
  // Client is making an internal call that should not show up in
  // the inspector or trace.
  internal?: boolean;
  // Service-side is making a call to itself, this metadata does not go
  // through the dispatcher, so is always excluded from inspector / tracing.
  isServerSide?: boolean;
  // Client wall time.
  wallTime: number;
  location?: { file: string, line?: number, column?: number };
  log: string[];
  error?: SerializedError;
  result?: any;
  point?: Point;
  objectId?: string;
  pageId?: string;
  frameId?: string;
};
