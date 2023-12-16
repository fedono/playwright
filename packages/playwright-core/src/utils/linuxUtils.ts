import fs from 'fs';

let didFailToReadOSRelease = false;
let osRelease: {
  id: string,
  version: string,
} | undefined;

export async function getLinuxDistributionInfo(): Promise<{ id: string, version: string } | undefined> {
  if (process.platform !== 'linux')
    return undefined;
  if (!osRelease && !didFailToReadOSRelease) {
    try {
      // List of /etc/os-release values for different distributions could be
      // found here: https://gist.github.com/aslushnikov/8ceddb8288e4cf9db3039c02e0f4fb75
      const osReleaseText = await fs.promises.readFile('/etc/os-release', 'utf8');
      const fields = parseOSReleaseText(osReleaseText);
      osRelease = {
        id: fields.get('id') ?? '',
        version: fields.get('version_id') ?? '',
      };
    } catch (e) {
      didFailToReadOSRelease = true;
    }
  }
  return osRelease;
}

export function getLinuxDistributionInfoSync(): { id: string, version: string } | undefined {
  if (process.platform !== 'linux')
    return undefined;
  if (!osRelease && !didFailToReadOSRelease) {
    try {
      // List of /etc/os-release values for different distributions could be
      // found here: https://gist.github.com/aslushnikov/8ceddb8288e4cf9db3039c02e0f4fb75
      const osReleaseText = fs.readFileSync('/etc/os-release', 'utf8');
      const fields = parseOSReleaseText(osReleaseText);
      osRelease = {
        id: fields.get('id') ?? '',
        version: fields.get('version_id') ?? '',
      };
    } catch (e) {
      didFailToReadOSRelease = true;
    }
  }
  return osRelease;
}

function parseOSReleaseText(osReleaseText: string): Map<string, string> {
  const fields = new Map();
  for (const line of osReleaseText.split('\n')) {
    const tokens = line.split('=');
    const name = tokens.shift();
    let value = tokens.join('=').trim();
    if (value.startsWith('"') && value.endsWith('"'))
      value = value.substring(1, value.length - 1);
    if (!name)
      continue;
    fields.set(name.toLowerCase(), value);
  }
  return fields;
}

