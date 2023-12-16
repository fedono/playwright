import crypto from 'crypto';

export function createGuid(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function calculateSha1(buffer: Buffer | string): string {
  const hash = crypto.createHash('sha1');
  hash.update(buffer);
  return hash.digest('hex');
}
