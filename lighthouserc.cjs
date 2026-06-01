const { buildUrls } = require('./lhci/resolve-urls.cjs');

module.exports = async () => ({
  ci: {
    collect: {
      url: await buildUrls(),
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
        'https://realworld-angular-lhci-server-production.up.railway.app/',
      token: process.env.LHCI_BUILD_TOKEN,
    },
  },
});
