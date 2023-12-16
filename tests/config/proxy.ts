import type { IncomingMessage, Server } from 'http';
import type { Socket } from 'net';
import createProxy from 'proxy';

export class TestProxy {
  readonly PORT: number;
  readonly URL: string;

  connectHosts: string[] = [];
  requestUrls: string[] = [];

  private readonly _server: Server;
  private readonly _sockets = new Set<Socket>();
  private _handlers: { event: string, handler: (...args: any[]) => void }[] = [];

  static async create(port: number): Promise<TestProxy> {
    const proxy = new TestProxy(port);
    await new Promise<void>(f => proxy._server.listen(port, f));
    return proxy;
  }

  private constructor(port: number) {
    this.PORT = port;
    this.URL = `http://localhost:${port}`;
    this._server = createProxy();
    this._server.on('connection', socket => this._onSocket(socket));
  }

  async stop(): Promise<void> {
    this.reset();
    for (const socket of this._sockets)
      socket.destroy();
    this._sockets.clear();
    await new Promise(x => this._server.close(x));
  }

  forwardTo(port: number, options?: { allowConnectRequests: boolean }) {
    this._prependHandler('request', (req: IncomingMessage) => {
      this.requestUrls.push(req.url);
      const url = new URL(req.url);
      url.host = `localhost:${port}`;
      req.url = url.toString();
    });
    this._prependHandler('connect', (req: IncomingMessage) => {
      if (!options?.allowConnectRequests)
        return;
      this.connectHosts.push(req.url);
      req.url = `localhost:${port}`;
    });
  }

  setAuthHandler(handler: (req: IncomingMessage) => boolean) {
    (this._server as any).authenticate = (req: IncomingMessage, callback) => {
      try {
        callback(null, handler(req));
      } catch (e) {
        callback(e, false);
      }
    };
  }

  reset() {
    this.connectHosts = [];
    this.requestUrls = [];
    for (const { event, handler } of this._handlers)
      this._server.removeListener(event, handler);
    this._handlers = [];
    (this._server as any).authenticate = undefined;
  }

  private _prependHandler(event: string, handler: (...args: any[]) => void) {
    this._handlers.push({ event, handler });
    this._server.prependListener(event, handler);
  }

  private _onSocket(socket: Socket) {
    this._sockets.add(socket);
    // ECONNRESET and HPE_INVALID_EOF_STATE are legit errors given
    // that tab closing aborts outgoing connections to the server.
    socket.on('error', (error: any) => {
      if (error.code !== 'ECONNRESET' && error.code !== 'HPE_INVALID_EOF_STATE')
        throw error;
    });
    socket.once('close', () => this._sockets.delete(socket));
  }

}
