const fs = require('node:fs');
const path = require('node:path');

const URLS_PATH = path.join(__dirname, '.lhci', 'urls.json');

function loadUrls() {
  if (!fs.existsSync(URLS_PATH)) {
    throw new Error(
      `Missing ${URLS_PATH}. Run "pnpm lhci:prepare" (or "node lhci/prepare-config.cjs") before collect/autorun.`,
    );
  }
  return JSON.parse(fs.readFileSync(URLS_PATH, 'utf8'));
}

/** Synchronous config — required for `lhci autorun` to detect URL mode. */
module.exports = {
  ci: {
    collect: {
      url: loadUrls(),
      numberOfRuns: Number(process.env.LHCI_NUMBER_OF_RUNS ?? 3),
      puppeteerScript: './lhci/puppeteer-auth.js',
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      settings: {
        preset: 'desktop',
        skipAudits: ['bf-cache'],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl:
        process.env.LHCI_SERVER_BASE_URL ??
        'https://realworld-angular-lhci-server-production.up.railway.app/',
      token: process.env.LHCI_BUILD_TOKEN,
    },
  },
};
