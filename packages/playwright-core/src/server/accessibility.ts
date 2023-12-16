import type * as dom from './dom';
import type * as channels from '@protocol/channels';

export interface AXNode {
    isInteresting(insideControl: boolean): boolean;
    isLeafNode(): boolean;
    isControl(): boolean;
    serialize(): channels.AXNode;
    children(): Iterable<AXNode>;
}

export class Accessibility {
  private _getAXTree:  (needle?: dom.ElementHandle) => Promise<{tree: AXNode, needle: AXNode | null}>;
  constructor(getAXTree: (needle?: dom.ElementHandle) => Promise<{tree: AXNode, needle: AXNode | null}>) {
    this._getAXTree = getAXTree;
  }

  async snapshot(options: {
      interestingOnly?: boolean;
      root?: dom.ElementHandle;
    } = {}): Promise<channels.AXNode | null> {
    const {
      interestingOnly = true,
      root = null,
    } = options;
    const { tree, needle } = await this._getAXTree(root || undefined);
    if (!interestingOnly) {
      if (root)
        return needle && serializeTree(needle)[0];
      return serializeTree(tree)[0];
    }

    const interestingNodes: Set<AXNode> = new Set();
    collectInterestingNodes(interestingNodes, tree, false);
    if (root && (!needle || !interestingNodes.has(needle)))
      return null;
    return serializeTree(needle || tree, interestingNodes)[0];
  }
}

function collectInterestingNodes(collection: Set<AXNode>, node: AXNode, insideControl: boolean) {
  if (node.isInteresting(insideControl))
    collection.add(node);
  if (node.isLeafNode())
    return;
  insideControl = insideControl || node.isControl();
  for (const child of node.children())
    collectInterestingNodes(collection, child, insideControl);
}

function serializeTree(node: AXNode, whitelistedNodes?: Set<AXNode>): channels.AXNode[] {
  const children: channels.AXNode[] = [];
  for (const child of node.children())
    children.push(...serializeTree(child, whitelistedNodes));

  if (whitelistedNodes && !whitelistedNodes.has(node))
    return children;

  const serializedNode = node.serialize();
  if (children.length)
    serializedNode.children = children;
  return [serializedNode];
}
