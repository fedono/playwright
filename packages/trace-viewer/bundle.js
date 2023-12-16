/**
 * @returns {import('vite').Plugin}
 */
export function bundle() {
  let config;
  return {
    name: 'playwright-bundle',
    config(c) {
      config = c;
    },
    transformIndexHtml: {
      transform(html, ctx) {
        if (!ctx || !ctx.bundle)
          return html;
        // Workaround vite issue that we cannot exclude some scripts from preprocessing.
        return html.replace(/(?=<!--)([\s\S]*?)-->/, '').replace('<!-- <script src="stall.js"></script> -->', '<script src="stall.js"></script>');
      },
    },
  }
}
