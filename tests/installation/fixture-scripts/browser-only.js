const requireName = process.argv[2];
const pkg = require(requireName);

for (const key of ['chromium', 'firefox', 'webkit', 'test', 'devices']) {
  if (pkg[key] !== undefined) {
    console.error(`Package ${requireName} should not export ${key}`);
    process.exit(1);
  }
}

console.log(`${requireName} SUCCESS`);
