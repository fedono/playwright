export class PortTransport {
  private _lastId = 0;
  private _port: MessagePort;
  private _callbacks = new Map<number, (result: any) => void>();

  constructor(port: MessagePort, handler: (method: string, params: any) => Promise<any>) {
    this._port = port;
    port.onmessage = async event => {
      const message = event.data;
      const { id, ackId, method, params, result } = message;
      if (id) {
        const result = await handler(method, params);
        this._port.postMessage({ ackId: id, result });
        return;
      }

      if (ackId) {
        const callback = this._callbacks.get(ackId);
        this._callbacks.delete(ackId);
        callback?.(result);
        return;
      }
    };
  }

  async send(method: string, params: any) {
    return await new Promise<any>(f => {
      const id = ++this._lastId;
      this._callbacks.set(id, f);
      this._port.postMessage({ id, method, params });
    });
  }
}
