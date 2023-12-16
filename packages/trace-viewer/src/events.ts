export namespace Disposable {
  export function disposeAll(disposables: Disposable[]): void {
    for (const disposable of disposables.splice(0))
      disposable.dispose();
  }
}

export type Disposable = {
  dispose(): void;
};

export interface Event<T> {
  (listener: (e: T) => any, disposables?: Disposable[]): Disposable;
}

export class EventEmitter<T> {
  public event: Event<T>;

  private _deliveryQueue?: {listener: (e: T) => void, event: T}[];
  private _listeners = new Set<(e: T) => void>();

  constructor() {
    this.event = (listener: (e: T) => any, disposables?: Disposable[]) => {
      this._listeners.add(listener);
      let disposed = false;
      const self = this;
      const result: Disposable = {
        dispose() {
          if (!disposed) {
            disposed = true;
            self._listeners.delete(listener);
          }
        }
      };
      if (disposables)
        disposables.push(result);
      return result;
    };
  }

  fire(event: T): void {
    const dispatch = !this._deliveryQueue;
    if (!this._deliveryQueue)
      this._deliveryQueue = [];
    for (const listener of this._listeners)
      this._deliveryQueue.push({ listener, event });
    if (!dispatch)
      return;
    for (let index = 0; index < this._deliveryQueue.length; index++) {
      const { listener, event } = this._deliveryQueue[index];
      listener.call(null, event);
    }
    this._deliveryQueue = undefined;
  }

  dispose() {
    this._listeners.clear();
    if (this._deliveryQueue)
      this._deliveryQueue = [];
  }
}
