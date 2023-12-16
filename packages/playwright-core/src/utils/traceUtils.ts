import type { ClientSideCallMetadata } from '@protocol/channels';
import type { SerializedClientSideCallMetadata, SerializedStack, SerializedStackFrame } from './isomorphic/traceUtils';

export function serializeClientSideCallMetadata(metadatas: ClientSideCallMetadata[]): SerializedClientSideCallMetadata {
  const fileNames = new Map<string, number>();
  const stacks: SerializedStack[] = [];
  for (const m of metadatas) {
    if (!m.stack || !m.stack.length)
      continue;
    const stack: SerializedStackFrame[] = [];
    for (const frame of m.stack) {
      let ordinal = fileNames.get(frame.file);
      if (typeof ordinal !== 'number') {
        ordinal = fileNames.size;
        fileNames.set(frame.file, ordinal);
      }
      const stackFrame: SerializedStackFrame = [ordinal, frame.line || 0, frame.column || 0, frame.function || ''];
      stack.push(stackFrame);
    }
    stacks.push([m.id, stack]);
  }
  return { files: [...fileNames.keys()], stacks };
}
