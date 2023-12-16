import { Connection } from './client/connection';
import { PipeTransport } from './protocol/transport';
import type { Playwright } from './client/playwright';
import * as childProcess from 'child_process';
import * as path from 'path';
import { ManualPromise } from './utils/manualPromise';

export async function start(env: any = {}): Promise<{ playwright: Playwright, stop: () => Promise<void> }> {
  const client = new PlaywrightClient(env);
  const playwright = await client._playwright;
  (playwright as any).driverProcess = client._driverProcess;
  return { playwright, stop: () => client.stop() };
}

class PlaywrightClient {
  _playwright: Promise<Playwright>;
  _driverProcess: childProcess.ChildProcess;
  private _closePromise = new ManualPromise<void>();

  constructor(env: any) {
    this._driverProcess = childProcess.fork(path.join(__dirname, 'cli', 'cli.js'), ['run-driver'], {
      stdio: 'pipe',
      detached: true,
      env: {
        ...process.env,
        ...env
      },
    });
    this._driverProcess.unref();
    this._driverProcess.stderr!.on('data', data => process.stderr.write(data));

    const connection = new Connection(undefined, undefined);
    connection.markAsRemote();
    const transport = new PipeTransport(this._driverProcess.stdin!, this._driverProcess.stdout!);
    connection.onmessage = message => transport.send(JSON.stringify(message));
    transport.onmessage = message => connection.dispatch(JSON.parse(message));
    transport.onclose = () => this._closePromise.resolve();

    this._playwright = connection.initializePlaywright();
  }

  async stop() {
    this._driverProcess.stdin!.destroy();
    this._driverProcess.stdout!.destroy();
    this._driverProcess.stderr!.destroy();
    await this._closePromise;
  }
}
