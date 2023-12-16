import fs, { existsSync } from 'fs';
import path from 'path';
import type { Plugin, UserConfig } from 'vite';

export function bundle(): Plugin {
  let config: UserConfig;
  return {
    name: 'playwright-bundle',
    config(c) {
      config = c;
    },
    transformIndexHtml: {
      transform(html, ctx) {
        if (!ctx || !ctx.bundle)
          return html;
        html = html.replace(/(?=<!--)([\s\S]*?)-->/, '');
        for (const [name, value] of Object.entries(ctx.bundle) as any) {
          if (name.endsWith('.map'))
            continue;
          if (value.code)
            html = html.replace(/<script type="module".*<\/script>/, () => `<script type="module">${value.code}</script>`);
          else
            html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style type='text/css'>${value.source}</style>`);
        }
        return html;
      },
    },
    closeBundle: () => {
      if (existsSync(path.join(config.build!.outDir!, 'index.html'))) {
        const targetDir = path.join(__dirname, '..', 'playwright-core', 'lib', 'vite', 'htmlReport');
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(
            path.join(config.build!.outDir!, 'index.html'),
            path.join(targetDir, 'index.html'));
      }
    },
  };
}
