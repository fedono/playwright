import fs from 'fs';
import path from 'path';

export const existsAsync = (path: string): Promise<boolean> => new Promise(resolve => fs.stat(path, err => resolve(!err)));

export async function mkdirIfNeeded(filePath: string) {
  // This will harmlessly throw on windows if the dirname is the root directory.
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
}

export async function removeFolders(dirs: string[]): Promise<Error[]> {
  return await Promise.all(dirs.map((dir: string) =>
    fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 10 })
  )).catch(e => e);
}

export function canAccessFile(file: string) {
  if (!file)
    return false;

  try {
    fs.accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

export async function copyFileAndMakeWritable(from: string, to: string) {
  await fs.promises.copyFile(from, to);
  await fs.promises.chmod(to, 0o664);
}

export function sanitizeForFilePath(s: string) {
  return s.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
}
