import type { Point } from '../../common/types';

export type ActionName =
  'check' |
  'click' |
  'closePage' |
  'fill' |
  'navigate' |
  'openPage' |
  'press' |
  'select' |
  'uncheck' |
  'setInputFiles' |
  'assertText';

export type ActionBase = {
  name: ActionName,
  signals: Signal[],
};

export type ClickAction = ActionBase & {
  name: 'click',
  selector: string,
  button: 'left' | 'middle' | 'right',
  modifiers: number,
  clickCount: number,
  position?: Point,
};

export type CheckAction = ActionBase & {
  name: 'check',
  selector: string,
};

export type UncheckAction = ActionBase & {
  name: 'uncheck',
  selector: string,
};

export type FillAction = ActionBase & {
  name: 'fill',
  selector: string,
  text: string,
};

export type NavigateAction = ActionBase & {
  name: 'navigate',
  url: string,
};

export type OpenPageAction = ActionBase & {
  name: 'openPage',
  url: string,
};

export type ClosesPageAction = ActionBase & {
  name: 'closePage',
};

export type PressAction = ActionBase & {
  name: 'press',
  selector: string,
  key: string,
  modifiers: number,
};

export type SelectAction = ActionBase & {
  name: 'select',
  selector: string,
  options: string[],
};

export type SetInputFilesAction = ActionBase & {
  name: 'setInputFiles',
  selector: string,
  files: string[],
};

export type AssertTextAction = ActionBase & {
  name: 'assertText',
  selector: string,
  text: string,
  substring: boolean,
};

// imp 这里应该就是 playwright 模拟的全部用户行为了
export type Action = ClickAction | CheckAction | ClosesPageAction | OpenPageAction | UncheckAction | FillAction | NavigateAction | PressAction | SelectAction | SetInputFilesAction | AssertTextAction;

// Signals.

export type BaseSignal = {
};

export type NavigationSignal = BaseSignal & {
  name: 'navigation',
  url: string,
};

export type PopupSignal = BaseSignal & {
  name: 'popup',
  popupAlias: string,
};

export type DownloadSignal = BaseSignal & {
  name: 'download',
  downloadAlias: string,
};

export type DialogSignal = BaseSignal & {
  name: 'dialog',
  dialogAlias: string,
};
// imp 这些用户行为就更好了 navigation/popup/download/dialog
export type Signal = NavigationSignal | PopupSignal | DownloadSignal | DialogSignal;

type FrameDescriptionMainFrame = {
  isMainFrame: true;
};

type FrameDescriptionChildFrame = {
  isMainFrame: false;
  selectorsChain: string[];
};

export type FrameDescription = { pageAlias: string } & (FrameDescriptionMainFrame | FrameDescriptionChildFrame);
