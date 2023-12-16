const checker = require('license-checker');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function checkDir(dir) {
  return await new Promise((f, r) => {
    checker.init({
      start: dir,
      production: true,
      customPath: {
        licenseText: '',
      }
    }, function(err, packages) {
      if (err)
        r(err);
      else
        f(packages);
    });
  });
}

(async () => {
  for (const project of ['playwright-core', 'playwright']) {
    const lines = [];
    lines.push(`microsoft/${project}

THIRD-PARTY SOFTWARE NOTICES AND INFORMATION

This project incorporates components from the projects listed below. The original copyright notices and the licenses under which Microsoft received such components are set forth below. Microsoft reserves all rights not expressly granted herein, whether by implication, estoppel or otherwise.
`);

    const allPackages = {};
    const projectDir = path.join(__dirname, '..', 'packages', project);
    const bundlesDir = path.join(projectDir, 'bundles');
    for (const bundle of fs.readdirSync(bundlesDir)) {
      const dir = path.join(bundlesDir, bundle);
      execSync('npm ci', { cwd: dir });
      const packages = await checkDir(dir);
      for (const [key, value] of Object.entries(packages)) {
        if (value.licenseText)
          allPackages[key] = value;
      }
    }

    const packages = await checkDir('node_modules/codemirror');
    for (const [key, value] of Object.entries(packages)) {
      if (value.licenseText)
        allPackages[key] = value;
    }

    // fsevents is a darwin-only dependency that we do not bundle.
    const keys = Object.keys(allPackages).sort().filter(key => !key.startsWith('fsevents@'));
    for (const key of keys)
      lines.push(`-\t${key} (${allPackages[key].repository})`);

    for (const key of keys) {
      lines.push(`\n%% ${key} NOTICES AND INFORMATION BEGIN HERE`);
      lines.push(`=========================================`);
      lines.push(allPackages[key].licenseText);
      lines.push(`=========================================`);
      lines.push(`END OF ${key} AND INFORMATION`);
    }

    lines.push(`\nSUMMARY BEGIN HERE`);
    lines.push(`=========================================`);
    lines.push(`Total Packages: ${keys.length}`);
    lines.push(`=========================================`);
    lines.push(`END OF SUMMARY`);

    fs.writeFileSync(path.join(projectDir, 'ThirdPartyNotices.txt'), lines.join('\n').replace(/\r\n/g, '\n'));
  }
})();
