import type { Frame } from '../frames';
import type * as actions from './recorderActions';

export type MouseClickOptions = Parameters<Frame['click']>[2];

export function toClickOptions(action: actions.ClickAction): { method: 'click' | 'dblclick', options: MouseClickOptions } {
  let method: 'click' | 'dblclick' = 'click';
  if (action.clickCount === 2)
    method = 'dblclick';
  // imp 这里把 modifiers 转换成了对应的 key，然后到时候直接按 key 就好
  const modifiers = toModifiers(action.modifiers);
  const options: MouseClickOptions = {};
  if (action.button !== 'left')
    options.button = action.button;
  if (modifiers.length)
    options.modifiers = modifiers;
  if (action.clickCount > 2)
    options.clickCount = action.clickCount;
  if (action.position)
    options.position = action.position;
  return { method, options };
}

export function toModifiers(modifiers: number): ('Alt' | 'Control' | 'Meta' | 'Shift')[] {
  const result: ('Alt' | 'Control' | 'Meta' | 'Shift')[] = [];
  if (modifiers & 1)
    result.push('Alt');
  if (modifiers & 2)
    result.push('Control');
  if (modifiers & 4)
    result.push('Meta');
  if (modifiers & 8)
    result.push('Shift');
  return result;
}
