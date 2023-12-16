import type * as channels from '@protocol/channels';
import type { ElementHandle } from './elementHandle';
import type * as api from '../../types/types';

type SerializedAXNode = Omit<channels.AXNode, 'valueString' | 'valueNumber' | 'children' | 'checked' | 'pressed'> & {
  value?: string|number,
  checked?: boolean | 'mixed',
  pressed?: boolean | 'mixed',
  children?: SerializedAXNode[]
};

function axNodeFromProtocol(axNode: channels.AXNode): SerializedAXNode {
  const result: SerializedAXNode = {
    ...axNode,
    value: axNode.valueNumber !== undefined ? axNode.valueNumber : axNode.valueString,
    checked: axNode.checked === 'checked' ? true : axNode.checked === 'unchecked' ? false : axNode.checked,
    pressed: axNode.pressed === 'pressed' ? true : axNode.pressed === 'released' ? false : axNode.pressed,
    children: axNode.children ? axNode.children.map(axNodeFromProtocol) : undefined,
  };
  delete (result as any).valueNumber;
  delete (result as any).valueString;
  return result;
}

export class Accessibility implements api.Accessibility {
  private _channel: channels.PageChannel;

  constructor(channel: channels.PageChannel) {
    this._channel = channel;
  }

  async snapshot(options: { interestingOnly?: boolean; root?: ElementHandle } = {}): Promise<SerializedAXNode | null> {
    const root = options.root ? options.root._elementChannel : undefined;
    const result = await this._channel.accessibilitySnapshot({ interestingOnly: options.interestingOnly, root });
    return result.rootAXNode ? axNodeFromProtocol(result.rootAXNode) : null;
  }
}
