import * as fs from 'fs';
import * as path from 'path';

const profileDir = process.env.PWTEST_PROFILE_DIR || '';

let session: import('inspector').Session;

export async function startProfiling() {
  if (!profileDir)
    return;

  session = new (require('inspector').Session)();
  session.connect();
  await new Promise<void>(f => {
    session.post('Profiler.enable', () => {
      session.post('Profiler.start', f);
    });
  });
}

export async function stopProfiling(profileName: string) {
  if (!profileDir)
    return;

  await new Promise<void>(f => session.post('Profiler.stop', (err, { profile }) => {
    if (!err) {
      fs.mkdirSync(profileDir, { recursive: true });
      fs.writeFileSync(path.join(profileDir, profileName + '.json'), JSON.stringify(profile));
    }
    f();
  }));
}
